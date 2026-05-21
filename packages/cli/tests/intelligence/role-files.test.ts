import { discoverRoleFiles } from '@/intelligence/role-files.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-role-files-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'pages', 'settings'), { recursive: true });
  await mkdir(join(cwd, 'src', 'forms', 'login'), { recursive: true });
  return cwd;
}

describe('discoverRoleFiles', () => {
  it('discovers role files with sibling template and style paths', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.ts'), 'export class SettingsPage {}\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.html'), '<main>{{ title() }}</main>\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.css'), '.settings { display: block; }\n');
    await writeFile(join(cwd, 'src', 'ignored.ts'), 'export const ignored = true;\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles).toEqual([
      {
        name: 'counter',
        role: 'component',
        path: 'src/counter/counter.component.ts',
        templatePath: 'src/counter/counter.component.html',
        stylePath: 'src/counter/counter.component.css',
      },
      {
        name: 'settings',
        role: 'page',
        path: 'src/pages/settings/settings.page.ts',
        templatePath: 'src/pages/settings/settings.page.html',
        stylePath: 'src/pages/settings/settings.page.css',
      },
    ]);
  });

  it('represents missing sibling files as null', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'forms', 'login', 'login.form.ts'), 'export class LoginForm {}\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles).toEqual([
      {
        name: 'login',
        role: 'form',
        path: 'src/forms/login/login.form.ts',
        templatePath: null,
        stylePath: null,
      },
    ]);
  });

  it('returns role files in deterministic path order', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'zeta.widget.ts'), 'export class ZetaWidget {}\n');
    await writeFile(join(cwd, 'src', 'alpha.dialog.ts'), 'export class AlphaDialog {}\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles.map((role) => role.path)).toEqual(['src/alpha.dialog.ts', 'src/zeta.widget.ts']);
  });
});
