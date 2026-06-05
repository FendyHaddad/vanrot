import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const runtimeBudgetLimit = '1.98 KB';
const storeCombinedBudgetBytes = 10 * 1024;

async function readRepoFile(path) {
  return readFile(join(repoRoot, path), 'utf8');
}

async function runtimeAndStoreBundleGzipSize() {
  const result = await build({
    stdin: {
      contents: [
        "export * from './packages/runtime/dist/index.js';",
        "export * from './packages/runtime/dist/internal.js';",
        "export * from './packages/store/dist/index.js';",
      ].join('\n'),
      resolveDir: repoRoot,
      sourcefile: 'vanrot-store-size-entry.js',
    },
    bundle: true,
    format: 'esm',
    minify: true,
    platform: 'browser',
    treeShaking: true,
    write: false,
  });

  return gzipSync(result.outputFiles[0].contents).length;
}

describe('runtime size budget policy', () => {
  it('caps @vanrot/runtime as the core browser runtime and documents the escalation rule', async () => {
    const sizeLimit = JSON.parse(await readRepoFile('packages/runtime/.size-limit.json'));
    const agents = await readRepoFile('AGENTS.md');
    const claude = await readRepoFile('CLAUDE.md');

    expect(sizeLimit[0].limit).toBe(runtimeBudgetLimit);
    expect(agents).toContain(runtimeBudgetLimit);
    expect(agents).toContain('Headless UI/application behavior belongs in `@vanrot/behavior`');
    expect(claude).toContain(runtimeBudgetLimit);
    expect(claude).toContain('Headless UI/application behavior belongs in `@vanrot/behavior`');
  });

  it('keeps runtime plus store under the Phase 19 quality budget', async () => {
    const combinedGzipBytes = await runtimeAndStoreBundleGzipSize();

    if (combinedGzipBytes > storeCombinedBudgetBytes) {
      throw new Error(
        `Runtime plus Store bundle gzip size ${combinedGzipBytes} bytes exceeds ${storeCombinedBudgetBytes} bytes.`,
      );
    }

    expect(combinedGzipBytes).toBeLessThanOrEqual(storeCombinedBudgetBytes);
  });
});
