import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findBehaviorDefinition } from '../behavior/catalog.js';

export interface RemoveBehaviorOptions {
  cwd: string;
  behaviorName: string;
  removePackage: boolean;
}

export interface RemoveBehaviorResult {
  changedFiles: string[];
}

export async function removeBehavior(options: RemoveBehaviorOptions): Promise<RemoveBehaviorResult> {
  const definition = findBehaviorDefinition(options.behaviorName);
  if (definition === undefined) {
    throw new Error(`Unknown behavior helper: ${options.behaviorName}.`);
  }

  const changedFiles: string[] = [];
  const configPath = join(options.cwd, 'vanrot.config.ts');
  const configSource = await readFile(configPath, 'utf8');
  const nextConfigSource = removeBehaviorFromConfig(configSource, definition.name);

  if (nextConfigSource !== configSource) {
    await writeFile(configPath, nextConfigSource);
    changedFiles.push('vanrot.config.ts');
  }

  if (options.removePackage && !hasBehaviorConfigEntries(nextConfigSource)) {
    const packageJsonPath = join(options.cwd, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    delete packageJson.dependencies?.['@vanrot/behavior'];
    delete packageJson.devDependencies?.['@vanrot/behavior'];
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    changedFiles.push('package.json');
  }

  return { changedFiles };
}

function removeBehaviorFromConfig(source: string, behaviorName: string): string {
  const singleQuoted = `'${behaviorName}'`;
  const doubleQuoted = `"${behaviorName}"`;
  let next = source
    .replace(new RegExp(`\\s*${escapeRegExp(singleQuoted)},?`, 'g'), '')
    .replace(new RegExp(`\\s*${escapeRegExp(doubleQuoted)},?`, 'g'), '');

  next = next.replace(/\s*enabled:\s*\[\s*\],?\n/g, '');
  next = next.replace(/\s*behavior:\s*\{\s*\},?\n/g, '');
  return next;
}

function hasBehaviorConfigEntries(source: string): boolean {
  return /behavior:\s*\{[\s\S]*enabled:\s*\[[^\]]+\]/.test(source);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
