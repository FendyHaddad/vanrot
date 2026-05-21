import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '..');

describe('cli repository rules', () => {
  it('keeps command and script names in command metadata', async () => {
    const metadataSource = await readSource('src/commands/metadata.ts');
    const cliSource = await readSource('src/cli.ts');
    const projectHealthSource = await readSource('src/doctor/project-health.ts');
    const appTemplateSource = await readSource('src/create/app-template.ts');

    expect(metadataSource).toContain('export const cliCommands');
    expect(metadataSource).toContain('export const starterScriptCommands');
    expect(cliSource).toContain("from './commands/metadata.js'");
    expect(projectHealthSource).toContain("from '../commands/metadata.js'");
    expect(appTemplateSource).toContain("from '../commands/metadata.js'");
    expect(projectHealthSource).not.toContain('requiredScripts');
    expect(appTemplateSource).not.toContain("dev: 'vr dev'");
  });

  it('keeps project health checks in guard-clause style', async () => {
    const projectHealthSource = await readSource('src/doctor/project-health.ts');

    expect(projectHealthSource).not.toContain('} else {');
  });
});

function readSource(path: string): Promise<string> {
  return readFile(resolve(packageRoot, path), 'utf8');
}
