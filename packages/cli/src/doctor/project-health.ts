import { access, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

const requiredScripts = ['dev', 'build', 'test', 'doctor'];

export async function checkProjectHealth(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  if (!(await exists(join(cwd, 'package.json')))) {
    findings.push(
      error(
        'VRT0001',
        'package.json',
        'Missing package.json',
        'Run vr create <name> to create a Vanrot app.',
      ),
    );
  } else {
    findings.push(...(await checkPackageScripts(cwd)));
  }

  if (!(await exists(join(cwd, 'src')))) {
    findings.push(
      error('VRT0002', 'src', 'Missing src directory', 'Create src/ or run vr create <name>.'),
    );
  }

  if (!(await exists(join(cwd, 'vite.config.ts')))) {
    findings.push(
      error(
        'VRT0003',
        'vite.config.ts',
        'Missing vite.config.ts',
        'Add Vite config with @vanrot/vite-plugin.',
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

  for (const script of requiredScripts) {
    if (packageJson.scripts?.[script] !== undefined) {
      continue;
    }

    findings.push(
      error(
        'VRT0004',
        'package.json',
        `Missing package script: ${script}`,
        `Add "${script}": "vr ${script}".`,
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
