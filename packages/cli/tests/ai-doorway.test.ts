import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

async function tempProject() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-ai-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo', private: true }));
  await writeFile(
    join(cwd, 'vanrot.config.ts'),
    "export default { schemaVersion: 1, source: { root: 'src' }, devServer: { port: 1964 }, ai: { enabled: true, directory: '.vanrot/ai', history: true } };\n",
  );
  await writeFile(join(cwd, 'src', 'home.page.ts'), 'export class HomePage {}\n');
  await writeFile(join(cwd, 'src', 'home.page.html'), '<main>{{ title() }}</main>\n');
  await writeFile(join(cwd, 'src', 'home.page.css'), 'main { display: block; }\n');
  return cwd;
}

describe('AI doorway', () => {
  it('initializes .vanrot/ai and gitignores it', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['init-ai'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(await readFile(join(cwd, '.gitignore'), 'utf8')).toContain('.vanrot/ai/');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain(
      '"schemaVersion": 1',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain(
      'Vanrot project context',
    );
  });

  it('writes deterministic context, doctor, and prompt files', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect((await runCli(['ai', 'context'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'doctor'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'prompt'], { cwd, reporter })).exitCode).toBe(0);

    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain(
      '"sourceRoot": "src"',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'doctor.json'), 'utf8')).toContain(
      '"findings"',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain(
      'Run `vr doctor` before changing files.',
    );
  });

  it('records manual history and summarizes unresolved entries first', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect(
      (
        await runCli(
          [
            'ai',
            'record',
            '--code',
            'VR_BUILD_FAILED',
            '--file',
            'src/home.page.ts',
            '--message',
            'build failed',
          ],
          { cwd, reporter },
        )
      ).exitCode,
    ).toBe(0);
    expect((await runCli(['ai', 'summarize'], { cwd, reporter })).exitCode).toBe(0);

    const summary = await readFile(join(cwd, '.vanrot', 'ai', 'summary.md'), 'utf8');
    expect(summary).toContain('# Vanrot AI Summary');
    expect(summary).toContain('## Unresolved');
    expect(summary).toContain('VR_BUILD_FAILED');
    expect(summary).toContain('src/home.page.ts');
  });

  it('fails when AI is disabled in config', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'vanrot.config.ts'), 'export default { ai: { enabled: false } };\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['ai', 'context'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('error     Vanrot AI doorway is disabled');
    expect(reporter.output()).toContain('next      Enable ai.enabled in vanrot.config.ts.');
  });
});
