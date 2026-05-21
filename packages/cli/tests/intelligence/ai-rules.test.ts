import { createAiRules } from '@/intelligence/ai-rules.js';
import { writeVanrotFile } from '@/intelligence/write-vanrot-file.js';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('createAiRules', () => {
  it('contains the required Vanrot rules', () => {
    const content = createAiRules();

    expect(content).toContain('# Vanrot AI Rules');
    expect(content).toContain('Use guard clauses instead of nested control flow.');
    expect(content).toContain('Use signals for state.');
    expect(content).toContain('Never put UI markup in TypeScript.');
    expect(content).toContain('Never put application logic in HTML.');
    expect(content).toContain('Use role-based file suffixes');
    expect(content).toContain('Use scoped CSS for component styling.');
    expect(content).toContain('Read `.vanrot/project-map.json` before making broad project changes.');
    expect(content).toContain('Do not assume an AI provider is required for Vanrot projects.');
  });
});

describe('writeVanrotFile', () => {
  it('creates .vanrot and writes a file', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-write-file-'));

    const writtenPath = await writeVanrotFile(cwd, 'ai-rules.md', '# Rules\n');

    expect(writtenPath).toBe('.vanrot/ai-rules.md');
    await expect(stat(join(cwd, '.vanrot'))).resolves.toMatchObject({
      isDirectory: expect.any(Function),
    });
    await expect(readFile(join(cwd, '.vanrot', 'ai-rules.md'), 'utf8')).resolves.toBe('# Rules\n');
  });

  it('surfaces write failures', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-write-failure-'));

    await expect(
      writeVanrotFile(cwd, 'project-map.json', '{}\n', {
        writeTextFile: async () => {
          throw new Error('disk is read-only');
        },
      }),
    ).rejects.toThrow('disk is read-only');
  });
});
