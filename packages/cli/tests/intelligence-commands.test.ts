import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-intelligence-command-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'i18n'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
  await writeFile(join(cwd, 'src', 'i18n', 'en.json'), '{}\n');
  return cwd;
}

describe('project intelligence commands', () => {
  it('writes .vanrot/project-map.json with vr map', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['map'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Project Map');
    expect(reporter.output()).toContain('.vanrot/project-map.json');

    const map = JSON.parse(await readFile(join(cwd, '.vanrot', 'project-map.json'), 'utf8')) as {
      roles: { components: Array<{ path: string }> };
      i18n: { locales: string[] };
    };

    expect(map.roles.components).toEqual([
      expect.objectContaining({ path: 'src/counter/counter.component.ts' }),
    ]);
    expect(map.i18n.locales).toEqual(['en']);
  });

  it('writes .vanrot/ai-rules.md with vr init-ai', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['init-ai'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot AI Rules');
    expect(reporter.output()).toContain('.vanrot/ai-rules.md');
    await expect(readFile(join(cwd, '.vanrot', 'ai-rules.md'), 'utf8')).resolves.toContain(
      'Use signals for state.',
    );
  });

  it('fails vr map when package.json is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-intelligence-invalid-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    const reporter = createMemoryReporter();

    const result = await runCli(['map'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Could not write project map');
    expect(reporter.output()).toContain('Missing package.json');
  });
});
