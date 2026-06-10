#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const packageDirectoryName = 'packages';
const sourceDirectoryName = 'src';
const sourceExtensions = ['.ts', '.tsx'];
const sourceIndexFiles = ['index.ts', 'index.tsx'];

export function verifySourceImports(options = {}) {
  const root = resolve(options.root ?? defaultRoot);
  const sourceFiles = options.sourceFiles ?? discoverPackageSourceFiles(root);
  const isIgnored = options.isIgnored ?? createGitIgnoreChecker(root);

  return verifySourceImportsForFiles({ root, sourceFiles, isIgnored });
}

export function verifySourceImportsForFiles({ root, sourceFiles, isIgnored }) {
  const failures = [];

  for (const sourceFilePath of sourceFiles) {
    const sourceText = ts.sys.readFile(sourceFilePath);

    if (sourceText === undefined) {
      continue;
    }

    const sourceFile = ts.createSourceFile(sourceFilePath, sourceText, ts.ScriptTarget.Latest, true);
    const specifiers = collectRelativeJsSpecifiers(sourceFile);

    for (const specifier of specifiers) {
      const resolvedImport = resolveRelativeJsImport(sourceFilePath, specifier.text);

      if (resolvedImport === null) {
        failures.push(createFailure(root, sourceFile, specifier, null, 'missing'));
        continue;
      }

      if (isIgnored(resolvedImport)) {
        failures.push(createFailure(root, sourceFile, specifier, resolvedImport, 'ignored'));
      }
    }
  }

  return failures;
}

export function discoverPackageSourceFiles(root) {
  const packagesRoot = join(root, packageDirectoryName);

  if (!existsSync(packagesRoot)) {
    return [];
  }

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => walkSourceFiles(join(packagesRoot, entry.name, sourceDirectoryName)))
    .sort();
}

export function formatSourceImportFailures(failures) {
  if (failures.length === 0) {
    return 'Source import verification passed.';
  }

  return [
    'Source import verification failed.',
    ...failures.map(formatSourceImportFailure),
    'Track missing source files or fix relative .js imports before CI sees a missing module.',
  ].join('\n');
}

function collectRelativeJsSpecifiers(sourceFile) {
  const specifiers = [];

  visit(sourceFile);
  return specifiers;

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      collectModuleSpecifier(node.moduleSpecifier, node);
    }

    if (ts.isImportTypeNode(node)) {
      const argument = node.argument;

      if (ts.isLiteralTypeNode(argument)) {
        collectModuleSpecifier(argument.literal, node);
      }
    }

    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      collectModuleSpecifier(node.arguments[0], node);
    }

    ts.forEachChild(node, visit);
  }

  function collectModuleSpecifier(moduleSpecifier, node) {
    if (moduleSpecifier === undefined || !ts.isStringLiteralLike(moduleSpecifier)) {
      return;
    }

    if (!moduleSpecifier.text.startsWith('.') || !moduleSpecifier.text.endsWith('.js')) {
      return;
    }

    specifiers.push({ text: moduleSpecifier.text, node });
  }
}

function resolveRelativeJsImport(sourceFilePath, specifier) {
  const withoutJsExtension = specifier.slice(0, -'.js'.length);
  const importBasePath = resolve(dirname(sourceFilePath), withoutJsExtension);
  const candidates = [
    ...sourceExtensions.map((extension) => `${importBasePath}${extension}`),
    ...sourceIndexFiles.map((fileName) => join(importBasePath, fileName)),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function walkSourceFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkSourceFiles(entryPath);
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts')) {
      return [];
    }

    return [entryPath];
  });
}

function createFailure(root, sourceFile, specifier, resolvedImport, reason) {
  const location = sourceFile.getLineAndCharacterOfPosition(specifier.node.getStart(sourceFile));

  return {
    file: toPosixPath(relative(root, sourceFile.fileName)),
    line: location.line + 1,
    specifier: specifier.text,
    resolvedImport: resolvedImport === null ? null : toPosixPath(relative(root, resolvedImport)),
    reason,
  };
}

function formatSourceImportFailure(failure) {
  if (failure.reason === 'missing') {
    return `- ${failure.file}:${failure.line} imports ${failure.specifier}, but no matching source file exists.`;
  }

  return `- ${failure.file}:${failure.line} imports ${failure.specifier}, but ${failure.resolvedImport} is ignored by Git.`;
}

function createGitIgnoreChecker(root) {
  return (filePath) => {
    const relativePath = toPosixPath(relative(root, filePath));
    const result = spawnSync('git', ['check-ignore', '--quiet', '--', relativePath], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    return result.status === 0;
  };
}

function toPosixPath(filePath) {
  return filePath.split(sep).join('/');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const failures = verifySourceImports();

  if (failures.length > 0) {
    console.error(formatSourceImportFailures(failures));
    process.exitCode = 1;
  } else {
    console.log(formatSourceImportFailures(failures));
  }
}
