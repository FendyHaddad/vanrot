#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { get } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const standardHost = '127.0.0.1';
const standardPort = 1964;
const docsBasePath = '/docs';
const defaultSitePath = '';
const serverReadyTimeoutMs = 30_000;
const pollIntervalMs = 500;

export function normalizeSitePath(input = defaultSitePath) {
  const trimmed = input.trim();

  if (trimmed === '') {
    return defaultSitePath;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed === 'docs' || trimmed.startsWith('docs/')) {
    return `/${trimmed}`;
  }

  return `${docsBasePath}/${trimmed}`;
}

export function createSiteUrl({
  host = standardHost,
  port = standardPort,
  sitePath = defaultSitePath,
} = {}) {
  return `http://${host}:${port}${sitePath}`;
}

export function createDevServerCommand() {
  return {
    command: 'pnpm',
    args: [
      '--filter',
      '@vanrot/vanrot-site',
      'dev',
      '--',
      '--host',
      standardHost,
      '--port',
      String(standardPort),
    ],
  };
}

export function createBrowserOpenCommand(platform, url) {
  if (platform === 'darwin') {
    return { command: 'open', args: [url] };
  }

  if (platform === 'win32') {
    return { command: 'cmd', args: ['/c', 'start', '', url] };
  }

  return { command: 'xdg-open', args: [url] };
}

export async function runOpenDocs({
  argv = process.argv.slice(2),
  platform = process.platform,
  stdout = console.log,
  stderr = console.error,
  spawnProcess = spawn,
  repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..'),
} = {}) {
  const sitePath = normalizeSitePath(argv.join('/') || defaultSitePath);
  const url = createSiteUrl({ sitePath });

  if (await isServerReady(url)) {
    await openBrowser({ platform, url, spawnProcess, stderr });
    stdout(`opened ${url}`);
    return 0;
  }

  const server = createDevServerCommand();
  const child = spawnProcess(server.command, server.args, {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });

  const stopServer = () => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  };

  process.once('SIGINT', stopServer);
  process.once('SIGTERM', stopServer);

  try {
    await waitForServer(url);
    await openBrowser({ platform, url, spawnProcess, stderr });
    stdout(`opened ${url}`);
  } catch (error) {
    stderr(error instanceof Error ? error.message : String(error));
    stopServer();
    return 1;
  }

  return new Promise((resolveExitCode) => {
    child.on('exit', (code) => resolveExitCode(code ?? 0));
    child.on('error', (error) => {
      stderr(error.message);
      resolveExitCode(1);
    });
  });
}

async function openBrowser({ platform, url, spawnProcess, stderr }) {
  const opener = createBrowserOpenCommand(platform, url);
  const child = spawnProcess(opener.command, opener.args, {
    detached: true,
    stdio: 'ignore',
  });

  child.on('error', (error) => {
    stderr(`Could not open browser: ${error.message}`);
  });
  child.unref();
}

async function waitForServer(url) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < serverReadyTimeoutMs) {
    if (await isServerReady(url)) {
      return;
    }

    await new Promise((resolveSleep) => setTimeout(resolveSleep, pollIntervalMs));
  }

  throw new Error(`Vanrot docs server did not start at ${url}`);
}

async function isServerReady(url) {
  return new Promise((resolveReady) => {
    const request = get(url, (response) => {
      response.resume();
      resolveReady(response.statusCode !== undefined && response.statusCode < 500);
    });

    request.on('error', () => resolveReady(false));
    request.setTimeout(1_000, () => {
      request.destroy();
      resolveReady(false);
    });
  });
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runOpenDocs().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
