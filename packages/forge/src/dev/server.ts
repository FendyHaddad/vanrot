import { readFile } from 'node:fs/promises';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { join, relative } from 'node:path';
import { compileComponentFromFiles, type CompileDiagnostic } from '@vanrot/compiler';
import { createForgeAppGraph } from '../core/app-graph.js';
import type { ForgeRoleFile } from '../core/app-graph.js';
import { forgeDiagnosticCode } from '../diagnostics/codes.js';
import { formatForgeDiagnostic, type ForgeDiagnostic } from '../diagnostics/format.js';

export interface ForgeDevResult {
  exitCode: number;
  server: ForgeDevServer;
}

export interface ForgeDevOptions extends StartForgeDevServerOptions {
  reporter?: ForgeDiagnosticReporter;
  stayOpen?: boolean;
}

export interface StartForgeDevServerOptions {
  cwd: string;
  host?: string;
  port?: number;
}

export interface ForgeDevServer {
  host: string;
  port: number;
  url: string;
  close(): Promise<void>;
}

export interface ForgeDiagnosticReporter {
  error(message: string): void;
  success?(label: string, detail?: string): void;
  warning?(filePath: string, message: string): void;
}

const defaultForgeDevHost = '127.0.0.1';
const defaultForgeDevPort = 1964;
const forgeClientPath = '/@forge/client';
const forgeEventsPath = '/@forge/events';
const htmlContentType = 'text/html; charset=utf-8';
const jsContentType = 'text/javascript; charset=utf-8';

export async function runForgeDev(options: ForgeDevOptions): Promise<ForgeDevResult> {
  const server = await startForgeDevServer(options);
  options.reporter?.success?.('Forge dev server', server.url);

  if (options.stayOpen === true) {
    await waitForShutdown(server);
  }

  return { exitCode: 0, server };
}

export async function startForgeDevServer(
  options: StartForgeDevServerOptions,
): Promise<ForgeDevServer> {
  const host = options.host ?? defaultForgeDevHost;
  const port = options.port ?? defaultForgeDevPort;
  const graph = await createForgeAppGraph(options.cwd);
  const diagnostics = await collectForgeDevDiagnostics(options.cwd);
  const eventClients = new Set<ServerResponse>();
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? '/', `http://${host}`);

    if (requestUrl.pathname === forgeClientPath) {
      sendText(response, 200, jsContentType, forgeDevClientSource());
      return;
    }

    if (requestUrl.pathname === forgeEventsPath) {
      connectEventStream(response, eventClients);
      return;
    }

    if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
      sendText(response, 200, htmlContentType, renderIndexHtml(diagnostics));
      return;
    }

    if (requestUrl.pathname.startsWith('/src/')) {
      await sendSourceFile(options.cwd, requestUrl.pathname, response);
      return;
    }

    sendText(response, 404, 'text/plain; charset=utf-8', 'Not found');
  });

  await listen(server, port, host);
  const address = server.address();
  const resolvedPort = typeof address === 'object' && address !== null ? address.port : port;

  return {
    host,
    port: resolvedPort,
    url: `http://${host}:${resolvedPort}`,
    async close() {
      for (const client of eventClients) {
        client.end();
      }

      await closeServer(server);
    },
  };
}

export async function collectForgeDevDiagnostics(cwd: string): Promise<ForgeDiagnostic[]> {
  const graph = await createForgeAppGraph(cwd);
  const diagnostics = [...graph.diagnostics];

  for (const roleFile of graph.roleFiles) {
    if (!canCompileRole(roleFile)) {
      diagnostics.push({
        code: forgeDiagnosticCode.unsupportedFileRole,
        severity: 'warning',
        message: `Forge dev cannot compile .${roleFile.role}.ts files yet.`,
        filePath: roleFile.path,
        role: roleFile.role,
        suggestion: 'Use .component.ts, .page.ts, or .layout.ts for the current Forge dev MVP.',
        docsPath: '/docs/forge/dev',
      });
      continue;
    }

    const result = await compileComponentFromFiles(join(cwd, roleFile.path));
    diagnostics.push(...result.diagnostics.map((diagnostic) => toForgeCompileDiagnostic(cwd, diagnostic)));
  }

  return diagnostics;
}

function canCompileRole(roleFile: ForgeRoleFile): boolean {
  return roleFile.role === 'component' || roleFile.role === 'page' || roleFile.role === 'layout';
}

function toForgeCompileDiagnostic(cwd: string, diagnostic: CompileDiagnostic): ForgeDiagnostic {
  const forgeDiagnostic: ForgeDiagnostic = {
    code: forgeDiagnosticCode.compileDiagnostic,
    severity: diagnostic.severity,
    message: diagnostic.message,
    suggestion: 'Fix the Vanrot compiler diagnostic before serving with Forge.',
    docsPath: '/docs/forge/dev',
  };

  if (diagnostic.filePath !== undefined) {
    forgeDiagnostic.filePath = toPosixPath(relative(cwd, diagnostic.filePath));
  }

  return forgeDiagnostic;
}

function renderIndexHtml(diagnostics: readonly ForgeDiagnostic[]): string {
  const diagnosticsComment =
    diagnostics.length === 0
      ? ''
      : `\n<!--\n${diagnostics.map(formatForgeDiagnostic).join('\n\n')}\n-->`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vanrot Forge</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${forgeClientPath}"></script>
    <script type="module" src="/src/main.ts"></script>${diagnosticsComment}
  </body>
</html>
`;
}

function forgeDevClientSource(): string {
  return `const forgeEvents = new EventSource('${forgeEventsPath}');
forgeEvents.addEventListener('message', (event) => {
  const plan = JSON.parse(event.data);
  if (plan.action === 'style-patch') {
    location.reload();
    return;
  }
  location.reload();
});
`;
}

function connectEventStream(response: ServerResponse, clients: Set<ServerResponse>): void {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  response.write('\n');
  clients.add(response);
  response.on('close', () => {
    clients.delete(response);
  });
}

async function sendSourceFile(
  cwd: string,
  requestPath: string,
  response: ServerResponse,
): Promise<void> {
  try {
    const filePath = join(cwd, requestPath.slice(1));
    const source = await readFile(filePath, 'utf8');
    sendText(response, 200, jsContentType, source);
  } catch {
    sendText(response, 404, 'text/plain; charset=utf-8', 'Not found');
  }
}

function sendText(response: ServerResponse, status: number, contentType: string, text: string): void {
  response.writeHead(status, { 'Content-Type': contentType });
  response.end(text);
}

function listen(server: Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function waitForShutdown(server: ForgeDevServer): Promise<void> {
  return new Promise((resolve) => {
    const close = async () => {
      await server.close();
      resolve();
    };

    process.once('SIGINT', close);
    process.once('SIGTERM', close);
  });
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
