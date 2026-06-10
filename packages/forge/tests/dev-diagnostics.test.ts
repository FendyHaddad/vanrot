import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  collectForgeDevDiagnostics,
  forgeDiagnosticCode,
  formatForgeDiagnostic,
} from '../src/index.js';

describe('Forge dev diagnostics', () => {
  it('maps compiler diagnostics into Forge diagnostics', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-forge-dev-diagnostics-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"broken-dev","private":true}');
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { engine: 'forge', source: { root: 'src' } };\n",
    );
    await writeFileAt(cwd, 'src/pages/home/home.page.ts', 'export class WrongPage {}\n');
    await writeFileAt(cwd, 'src/pages/home/home.page.html', '<main></main>\n');
    await writeFileAt(cwd, 'src/pages/home/home.page.css', ':host { display: block; }\n');

    const diagnostics = await collectForgeDevDiagnostics(cwd);

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: forgeDiagnosticCode.compileDiagnostic,
        severity: 'error',
        filePath: expect.stringContaining('home.page.ts') as string,
      }),
    ]);
    expect(formatForgeDiagnostic(diagnostics[0]!)).toContain('VRFORGE007 error');
  });
});

async function writeFileAt(cwd: string, path: string, content: string): Promise<void> {
  const filePath = join(cwd, path);
  await mkdir(join(filePath, '..'), { recursive: true });
  await writeFile(filePath, content);
}
