import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function projectRoot() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-generate-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  return cwd;
}

describe('vr generate', () => {
  it('generates component files in a feature folder', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'component', 'user-card', '--feature', 'users'], {
      cwd,
      reporter,
    });

    expect(result.exitCode).toBe(0);
    const base = join(cwd, 'src', 'features', 'users', 'components', 'user-card');
    await expect(readFile(join(base, 'user-card.component.ts'), 'utf8')).resolves.toContain(
      'export class UserCardComponent',
    );
    await expect(readFile(join(base, 'user-card.component.html'), 'utf8')).resolves.toContain(
      "{{ t('user-card.title') }}",
    );
    await expect(readFile(join(base, 'user-card.component.css'), 'utf8')).resolves.toContain(
      '.user-card',
    );
    expect(reporter.output()).toContain('Generated component user-card');
  });

  it('generates page files in a feature folder', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'page', 'dashboard', '--feature', 'users'], {
      cwd,
      reporter,
    });

    expect(result.exitCode).toBe(0);
    const base = join(cwd, 'src', 'features', 'users', 'dashboard');
    await expect(readFile(join(base, 'dashboard.page.ts'), 'utf8')).resolves.toContain(
      'export class DashboardPage',
    );
    await expect(readFile(join(base, 'dashboard.page.html'), 'utf8')).resolves.toContain(
      "{{ t('dashboard.title') }}",
    );
    await expect(readFile(join(base, 'dashboard.page.css'), 'utf8')).resolves.toContain(
      '.dashboard',
    );
  });

  it('generates default component and page locations when no feature is supplied', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    await runCli(['generate', 'component', 'status-pill'], { cwd, reporter });
    await runCli(['generate', 'page', 'settings'], { cwd, reporter });

    await expect(
      readFile(join(cwd, 'src', 'components', 'status-pill', 'status-pill.component.ts'), 'utf8'),
    ).resolves.toContain('StatusPillComponent');
    await expect(
      readFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.ts'), 'utf8'),
    ).resolves.toContain('SettingsPage');
  });

  it('rejects non-kebab-case names', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'component', 'UserCard'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Use lowercase kebab-case names.');
  });
});
