import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(scriptRoot, '..');

const primitiveSourcePattern = /^packages\/ui\/src\/primitives\/([^/]+)\//;
const globalUiSourcePaths = new Set([
  'packages/ui/src/metadata.ts',
  'packages/ui/src/registry/component-registry.ts',
]);

const docsCompanionPaths = [
  'apps/vanrot-site/src/docs/component-docs.ts',
  'apps/vanrot-site/src/docs/component-doc-paths.ts',
  'apps/vanrot-site/src/docs/site-data.json',
  'apps/vanrot-site/src/docs/site-data.ts',
];

const pluginCompanionPaths = [
  'packages/ui/web-types.json',
  'web-types.json',
  'packages/language-server/',
  'editors/intellij/',
];

const aiCompanionPaths = [
  'docs/ai/',
  'packages/ai/',
];

const testCompanionPaths = [
  'scripts/verify-web-types-coverage.test.mjs',
  'scripts/verify-component-cascade.test.mjs',
];

export function verifyComponentCascade(root = defaultRoot, options = {}) {
  const failures = [
    ...verifyComponentInventory(root),
  ];
  const changedFiles = options.changedFiles ?? [];

  if (changedFiles.length > 0) {
    failures.push(...verifyChangedComponentCascade(changedFiles));
  }

  if (failures.length === 0) {
    return { ok: true, failures: [] };
  }

  return { ok: false, failures };
}

export function verifyComponentInventory(root = defaultRoot) {
  const failures = [];
  const primitiveSlugs = readPrimitiveSlugs(root);

  for (const slug of primitiveSlugs) {
    failures.push(...verifyPrimitiveDocs(root, slug));
    failures.push(...verifyPrimitiveWebTypes(root, slug));
    failures.push(...verifyPrimitiveAiDocs(root, slug));
  }

  return failures;
}

export function verifyChangedComponentCascade(changedFiles) {
  const normalizedFiles = changedFiles.map(normalizePath);
  const componentSlugs = findChangedComponentSlugs(normalizedFiles);
  const globalUiChanged = normalizedFiles.some(isGlobalUiSourcePath);

  if (componentSlugs.length === 0 && !globalUiChanged) {
    return [];
  }

  const label = componentSlugs.length === 0
    ? 'UI component registry'
    : componentSlugs.map((slug) => `vr-${slug}`).join(', ');
  const failures = [];

  if (!normalizedFiles.some(isDocsCompanionPath)) {
    failures.push(
      `${label} changed without component docs updates. Update the matching ` +
      'apps/vanrot-site component page or docs registry copy.',
    );
  }

  if (!normalizedFiles.some(isPluginCompanionPath)) {
    failures.push(
      `${label} changed without plugin metadata updates. Update web-types.json, ` +
      'packages/ui/web-types.json, or the language-server/IntelliJ plugin when IDE behavior changes.',
    );
  }

  if (!normalizedFiles.some(isAiCompanionPath)) {
    failures.push(
      `${label} changed without AI-consumption docs. Run \`vr ai build\` and include docs/ai changes.`,
    );
  }

  if (!normalizedFiles.some((file) => isTestCompanionPath(file, componentSlugs))) {
    failures.push(
      `${label} changed without test coverage updates. Update the primitive test or a verifier test.`,
    );
  }

  return failures;
}

export function findChangedComponentSlugs(files) {
  return Array.from(
    new Set(
      files
        .map((file) => primitiveSourcePattern.exec(normalizePath(file))?.[1])
        .filter((slug) => slug !== undefined),
    ),
  ).sort();
}

export function formatComponentCascadeFailures(failures) {
  return [
    'Component cascade verification failed.',
    ...failures.map((failure) => `- ${failure}`),
    'When a component changes, cascade the change through docs, IDE metadata, AI docs, and tests.',
  ].join('\n');
}

export function readStagedFiles(root = defaultRoot) {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMRD'], {
    cwd: root,
    encoding: 'utf8',
  });

  return output.split(/\r?\n/).filter((file) => file.length > 0);
}

function readPrimitiveSlugs(root) {
  const primitivesRoot = join(root, 'packages/ui/src/primitives');

  return readdirSync(primitivesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => existsSync(join(primitivesRoot, slug, `ui.${slug}.ts`)))
    .sort();
}

function verifyPrimitiveDocs(root, slug) {
  const docsRoot = join(root, 'apps/vanrot-site/src/pages/components');

  return ['ts', 'html', 'css']
    .map((extension) => `component-${slug}.page.${extension}`)
    .filter((file) => !existsSync(join(docsRoot, file)))
    .map((file) => `Missing component docs page file for vr-${slug}: ${file}.`);
}

function verifyPrimitiveWebTypes(root, slug) {
  const selector = `vr-${slug}`;
  const webTypesFiles = [
    'packages/ui/web-types.json',
    'web-types.json',
  ];

  return webTypesFiles
    .filter((file) => !webTypesIncludesElement(root, file, selector))
    .map((file) => `Missing ${selector} in ${file}.`);
}

function verifyPrimitiveAiDocs(root, slug) {
  const aiComponentsPath = join(root, 'docs/ai/knowledge/components.md');
  const selector = `vr-${slug}`;

  if (!existsSync(aiComponentsPath)) {
    return ['Missing docs/ai/knowledge/components.md.'];
  }

  const content = readFileSync(aiComponentsPath, 'utf8');

  if (content.includes(selector)) {
    return [];
  }

  return [`Missing ${selector} in docs/ai/knowledge/components.md.`];
}

function webTypesIncludesElement(root, file, selector) {
  const document = JSON.parse(readFileSync(join(root, file), 'utf8'));

  return (document.contributions?.html?.elements ?? []).some((element) => element.name === selector);
}

function isDocsCompanionPath(file) {
  if (docsCompanionPaths.some((path) => file === path)) {
    return true;
  }

  return /^apps\/vanrot-site\/src\/pages\/components\/component-[^/]+\.page\.(css|html|ts)$/.test(file);
}

function isPluginCompanionPath(file) {
  return pluginCompanionPaths.some((path) => file === path || file.startsWith(path));
}

function isAiCompanionPath(file) {
  return aiCompanionPaths.some((path) => file === path || file.startsWith(path));
}

function isTestCompanionPath(file, componentSlugs) {
  if (testCompanionPaths.some((path) => file === path)) {
    return true;
  }

  return componentSlugs.some((slug) => file === `packages/ui/src/primitives/${slug}/ui.${slug}.test.ts`);
}

function isGlobalUiSourcePath(file) {
  if (globalUiSourcePaths.has(file)) {
    return true;
  }

  return file.startsWith('packages/ui/src/registry/');
}

function normalizePath(file) {
  return file.replaceAll('\\', '/');
}

async function main() {
  const staged = process.argv.includes('--staged');
  const root = process.cwd();
  const changedFiles = staged ? readStagedFiles(root) : [];
  const result = verifyComponentCascade(root, { changedFiles });

  if (result.ok) {
    console.log('Component cascade verification passed.');
    return;
  }

  console.error(formatComponentCascadeFailures(result.failures));
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
