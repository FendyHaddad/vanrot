import { readdir, readFile } from 'node:fs/promises';
import { join, relative as pathRelative } from 'node:path';
import type { DoctorFinding } from './checks.js';

const allowedRoles = ['component', 'page', 'dialog', 'layout', 'widget', 'form'];

export async function checkVanrotRules(cwd: string): Promise<DoctorFinding[]> {
  const srcDir = join(cwd, 'src');

  try {
    const files = await walkFiles(srcDir);
    return [
      ...(await checkRoleSuffixes(cwd, files)),
      ...(await checkRawTemplateText(cwd, files)),
      ...(await checkNestedIfs(cwd, files)),
    ];
  } catch {
    return [];
  }
}

export async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

async function checkRoleSuffixes(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => filePath.endsWith('.ts'))) {
    const relative = pathRelative(cwd, file);
    const role = readRole(file);

    if (role !== undefined && !allowedRoles.includes(role)) {
      findings.push(
        warning(
          'VRT1001',
          relative,
          'Unsupported UI role suffix',
          'Use .component.ts, .page.ts, .dialog.ts, .layout.ts, .widget.ts, or .form.ts.',
        ),
      );
      continue;
    }

    if (isUiFolder(relative) && role === undefined) {
      findings.push(
        warning(
          'VRT1002',
          relative,
          'Component or page file is missing a role-based suffix',
          'Rename the file to include a Vanrot role suffix.',
        ),
      );
    }
  }

  return findings;
}

async function checkRawTemplateText(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => /\.(component|page)\.html$/.test(filePath))) {
    const content = await readFile(file, 'utf8');

    if (!hasRawVisibleText(content)) {
      continue;
    }

    findings.push(
      warning(
        'VRT1101',
        pathRelative(cwd, file),
        'Raw user-facing text found in template',
        "Use an i18n-ready interpolation such as {{ t('common.label') }}.",
      ),
    );
  }

  return findings;
}

async function checkNestedIfs(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => /\.(component|page)\.ts$/.test(filePath))) {
    const content = await readFile(file, 'utf8');

    if (!hasNestedIf(content)) {
      continue;
    }

    findings.push(
      warning(
        'VRT1201',
        pathRelative(cwd, file),
        'Nested if statement can be a guard clause',
        'Prefer early returns before entering deeper logic.',
      ),
    );
  }

  return findings;
}

function readRole(filePath: string): string | undefined {
  const match = filePath.match(/\.([a-z]+)\.ts$/);
  return match?.[1];
}

function hasRawVisibleText(content: string): boolean {
  const withoutInterpolations = content.replace(/\{\{[\s\S]*?\}\}/g, '');
  const textMatches = withoutInterpolations.match(/>([^<>{}][^<>]*)</g) ?? [];
  return textMatches.some((match) => match.slice(1, -1).trim().length > 0);
}

function hasNestedIf(content: string): boolean {
  return /if\s*\([^)]*\)\s*\{[\s\S]*?if\s*\([^)]*\)\s*\{/.test(content);
}

function isUiFolder(relative: string): boolean {
  return /(^|\/)(components|pages|dialogs|layouts|widgets|forms)\//.test(relative);
}

function warning(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'warning', code, filePath, message, nextStep };
}
