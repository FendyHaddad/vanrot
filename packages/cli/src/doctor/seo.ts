import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { seoCliPackageName } from '../seo/constants.js';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function checkSeoUsage(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];
  const packageJson = await readJson(join(cwd, 'package.json'));
  const configSource = await readOptional(join(cwd, 'vanrot.config.ts'));
  const sourceFiles = await readSourceFiles(cwd);
  const source = sourceFiles.map((file) => file.content).join('\n');
  const installed = hasDependency(packageJson, seoCliPackageName);
  const configured = /\bseo\s*:/.test(configSource);
  const imported = source.includes(seoCliPackageName);

  if (installed && !configured && !imported) {
    findings.push(
      warning(
        'VRTS001',
        'package.json',
        '@vanrot/seo is installed but unused',
        'Run vr add seo to populate vanrot.config.ts and src/app/seo.ts, or remove the package.',
      ),
    );
  }

  if (configured && !installed) {
    findings.push(
      warning(
        'VRTS002',
        'package.json',
        'SEO config exists but @vanrot/seo is not installed',
        'Run vr add seo to install the package and generate support files.',
      ),
    );
  }

  for (const file of sourceFiles) {
    if (!file.content.includes(seoCliPackageName) || installed) {
      continue;
    }

    findings.push(
      warning(
        'VRTS003',
        relative(cwd, file.path),
        '@vanrot/seo is imported but missing from package.json',
        'Run vr add seo.',
      ),
    );
  }

  return findings;
}

function warning(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'warning', code, filePath, message: `${code} ${message}`, nextStep };
}

async function readJson(path: string): Promise<PackageJsonLike> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as PackageJsonLike;
  } catch {
    return {};
  }
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

async function readSourceFiles(cwd: string): Promise<Array<{ path: string; content: string }>> {
  try {
    const srcRoot = join(cwd, 'src');
    const files = await walkFiles(srcRoot);
    const sourceFiles = files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
    return Promise.all(
      sourceFiles.map(async (file) => ({
        path: file,
        content: await readFile(file, 'utf8'),
      })),
    );
  } catch {
    return [];
  }
}

function hasDependency(packageJson: PackageJsonLike, name: string): boolean {
  return packageJson.dependencies?.[name] !== undefined || packageJson.devDependencies?.[name] !== undefined;
}
