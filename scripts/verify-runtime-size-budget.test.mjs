import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const runtimeBudgetLimit = '9.99 KB';

async function readRepoFile(path) {
  return readFile(join(repoRoot, path), 'utf8');
}

describe('runtime size budget policy', () => {
  it('caps @vanrot/runtime below 10kb and documents the escalation rule', async () => {
    const sizeLimit = JSON.parse(await readRepoFile('packages/runtime/.size-limit.json'));
    const agents = await readRepoFile('AGENTS.md');
    const claude = await readRepoFile('CLAUDE.md');

    expect(sizeLimit[0].limit).toBe(runtimeBudgetLimit);
    expect(agents).toContain(runtimeBudgetLimit);
    expect(agents).toContain('ask whether the feature justifies raising the cap');
    expect(claude).toContain(runtimeBudgetLimit);
    expect(claude).toContain('ask whether the feature justifies raising the cap');
  });
});
