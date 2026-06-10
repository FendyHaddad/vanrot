import { access, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { commandInvocation, starterScriptCommands } from '../commands/metadata.js';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

const SCAFFOLD_NEXT_STEP = 'Run vr create <name> to scaffold a Vanrot project.';

export async function checkProjectHealth(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];
  const packageJsonPath = join(cwd, 'package.json');
  const hasPackageJson = await exists(packageJsonPath);

  if (!hasPackageJson) {
    findings.push(
      error(
        'VRT0001',
        'package.json',
        'Missing package.json',
        SCAFFOLD_NEXT_STEP,
      ),
    );
  }

  if (hasPackageJson) {
    findings.push(...(await checkPackageScripts(cwd)));
  }

  if (!(await exists(join(cwd, 'src')))) {
    findings.push(
      error(
        'VRT0002',
        'src',
        'Missing src directory',
        SCAFFOLD_NEXT_STEP,
      ),
    );
  }

  findings.push(...(await checkSiblingFiles(cwd)));
  return findings;
}

async function checkPackageScripts(cwd: string): Promise<DoctorFinding[]> {
  const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>;
  };
  const findings: DoctorFinding[] = [];

  for (const script of starterScriptCommands) {
    if (packageJson.scripts?.[script] !== undefined) {
      continue;
    }

    findings.push(
      error(
        'VRT0004',
        'package.json',
        `Missing package script: ${script}`,
        `Add "${script}": "${commandInvocation(script)}".`,
      ),
    );
  }

  return findings;
}

async function checkSiblingFiles(cwd: string): Promise<DoctorFinding[]> {
  if (!(await exists(join(cwd, 'src')))) {
    return [];
  }

  const findings: DoctorFinding[] = [];
  const files = await walkFiles(join(cwd, 'src'));

  for (const file of files.filter((filePath) => isRoleTypeScript(filePath))) {
    const withoutExtension = file.slice(0, -'.ts'.length);
    const htmlFile = `${withoutExtension}.html`;
    const cssFile = `${withoutExtension}.css`;

    if (!(await exists(htmlFile))) {
      findings.push(
        error(
          'VRT0005',
          relative(cwd, htmlFile),
          'Missing sibling template file',
          `Create ${basename(htmlFile)}.`,
        ),
      );
    }

    if (!(await exists(cssFile))) {
      findings.push(
        error(
          'VRT0006',
          relative(cwd, cssFile),
          'Missing sibling style file',
          `Create ${basename(cssFile)}.`,
        ),
      );
    }
  }

  return findings;
}

function isRoleTypeScript(filePath: string): boolean {
  return /\.(component|page)\.ts$/.test(filePath);
}

function error(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'error', code, filePath, message, nextStep };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function relative(cwd: string, filePath: string): string {
  return filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath;
}
