import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-intelligence-command-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'i18n'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({
      name: 'demo',
      scripts: {
        dev: 'vr dev',
        build: 'vr build',
        test: 'vr test',
        doctor: 'vr doctor',
      },
    }),
  );
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\n');
  await writeFile(join(cwd, 'vanrot.config.ts'), 'export default {};\n');
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
    expect(reporter.output()).toContain('graph manifest ready');

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

  it('prints project intelligence from vr doctor --inspect', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor', '--inspect'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Doctor');
    expect(reporter.output()).toContain('Project Intelligence');
    expect(reporter.output()).toContain('roles');
    expect(reporter.output()).toContain('components: 1');
    expect(reporter.output()).toContain('graph');
    expect(reporter.output()).toContain('routes: 0');
  });

  it('does not expose vr inspect as a standalone command', async () => {
    const reporter = createMemoryReporter();

    const result = await runCli(['inspect'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown command: inspect');
    expect(reporter.output()).toContain('Run vr doctor --inspect');
  });

  it('previews Vanrot-owned cache paths with vr cache clean --dry-run', async () => {
    const cwd = await tempProject();
    await mkdir(join(cwd, '.vanrot', 'cache'), { recursive: true });
    await writeFile(join(cwd, '.vanrot', 'cache', 'compiler.json'), '{}\n');
    await writeFile(join(cwd, '.vanrot', 'project-map.json'), '{}\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['cache', 'clean', '--dry-run'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Cache');
    expect(reporter.output()).toContain('dry run');
    expect(reporter.output()).toContain('.vanrot/cache');
    expect(reporter.output()).toContain('.vanrot/project-map.json');
    await expect(stat(join(cwd, '.vanrot', 'cache', 'compiler.json'))).resolves.toBeTruthy();
    await expect(stat(join(cwd, '.vanrot', 'project-map.json'))).resolves.toBeTruthy();
  });

  it('removes Vanrot-owned cache paths with vr cache clean', async () => {
    const cwd = await tempProject();
    await mkdir(join(cwd, '.vanrot', 'cache'), { recursive: true });
    await writeFile(join(cwd, '.vanrot', 'cache', 'compiler.json'), '{}\n');
    await writeFile(join(cwd, '.vanrot', 'project-map.json'), '{}\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['cache', 'clean'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Cache');
    expect(reporter.output()).toContain('removed');
    await expect(stat(join(cwd, '.vanrot', 'cache'))).rejects.toThrow();
    await expect(stat(join(cwd, '.vanrot', 'project-map.json'))).rejects.toThrow();
  });
});
