import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempProject() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({
      scripts: {
        dev: 'vr dev',
        build: 'vr build',
        test: 'vr test',
        doctor: 'vr doctor',
      },
    }),
  );
  await writeFile(join(cwd, 'vite.config.ts'), "import vanrot from '@vanrot/vite-plugin';\n");
  await writeFile(join(cwd, 'src', 'app.component.ts'), 'export class AppComponent {}\n');
  await writeFile(join(cwd, 'src', 'app.component.html'), '<main>{{ title() }}</main>\n');
  await writeFile(join(cwd, 'src', 'app.component.css'), '.app { display: block; }\n');
  return cwd;
}

describe('vr doctor', () => {
  it('passes a clean starter project', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Doctor');
    expect(reporter.output()).toContain('0 findings');
  });

  it('reports project-health errors', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-empty-'));
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Missing package.json');
    expect(reporter.output()).toContain('Missing src directory');
    expect(reporter.output()).toContain('Missing vite.config.ts');
  });

  it('reports missing component sibling files', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'lonely.component.ts'), 'export class LonelyComponent {}\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Missing sibling template file');
    expect(reporter.output()).toContain('lonely.component.html');
    expect(reporter.output()).toContain('Missing sibling style file');
    expect(reporter.output()).toContain('lonely.component.css');
  });

  it('reports starter Vanrot rule warnings', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'bad.view.ts'), 'export class BadView {}\n');
    await writeFile(join(cwd, 'src', 'raw.component.html'), '<button>Save</button>\n');
    await writeFile(
      join(cwd, 'src', 'nested.component.ts'),
      'export class NestedComponent { save(value: string) { if (value) { if (value.length > 1) { return; } } } }\n',
    );
    await writeFile(join(cwd, 'src', 'nested.component.html'), '<p>{{ title() }}</p>\n');
    await writeFile(join(cwd, 'src', 'nested.component.css'), '.nested { display: block; }\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Unsupported UI role suffix');
    expect(reporter.output()).toContain('Raw user-facing text found in template');
    expect(reporter.output()).toContain('Nested if statement can be a guard clause');
  });
});
