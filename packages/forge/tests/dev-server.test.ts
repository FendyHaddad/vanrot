import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { startForgeDevServer } from '../src/index.js';

const fixtureRoot = join(import.meta.dirname, 'fixtures', 'dev-basic-app');
const activeServers: Array<{ close(): Promise<void> }> = [];

describe('Forge dev server', () => {
  afterEach(async () => {
    await Promise.all(activeServers.map((server) => server.close()));
    activeServers.length = 0;
  });

  it('starts on the requested port and serves the index route', async () => {
    const server = await startForgeDevServer({ cwd: fixtureRoot, host: '127.0.0.1', port: 0 });
    activeServers.push(server);

    const response = await fetch(server.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(server.port).toBeGreaterThan(0);
    expect(html).toContain('/@forge/client');
    expect(html).toContain('/src/main.ts');
  });

  it('does not import or invoke Vite', async () => {
    const source = await readFile(new URL('../src/dev/server.ts', import.meta.url), 'utf8');

    expect(source).not.toContain("from 'vite'");
    expect(source).not.toContain('"vite"');
    expect(source).not.toContain("'vite'");
  });
});
