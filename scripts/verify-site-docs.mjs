import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDataPath = join(projectRoot, 'apps/vanrot-site/src/docs/site-data.json');

export function checkRequiredArticleCoverage(requiredKeys, articles) {
  const available = new Set(articles.map((article) => article.key));

  return requiredKeys
    .filter((key) => !available.has(key))
    .map((key) => `Missing framework docs article: ${key}`);
}

export function checkPrimitiveCoverage(requiredPrimitives, componentDocs) {
  const failures = [];

  for (const primitive of requiredPrimitives) {
    const doc = componentDocs.find((candidate) => candidate.primitive === primitive);

    if (doc === undefined) {
      failures.push(`Missing UI primitive docs page: ${primitive}`);
      continue;
    }

    if (doc.usage === '') {
      failures.push(`Missing UI primitive usage example: ${primitive}`);
    }

    if (doc.accessibility === '') {
      failures.push(`Missing UI primitive accessibility notes: ${primitive}`);
    }

    if (doc.api === '') {
      failures.push(`Missing UI primitive API notes: ${primitive}`);
    }
  }

  return failures;
}

export function checkCommandCoverage(requiredCommands, commandDocs) {
  const available = new Set(commandDocs.map((command) => command.name));

  return requiredCommands
    .filter((command) => !available.has(command))
    .map((command) => `Missing CLI command docs entry: ${command}`);
}

export function checkPackageCoverage(requiredPackages, packageDocs) {
  const available = new Set(packageDocs.map((item) => item.name));

  return requiredPackages
    .filter((packageName) => !available.has(packageName))
    .map((packageName) => `Missing package reference docs entry: ${packageName}`);
}

export function checkDiagnosticCoverage(requiredCodes, documentedCodes, label) {
  const available = new Set(documentedCodes);

  return requiredCodes
    .filter((code) => !available.has(code))
    .map((code) => `Missing ${label} diagnostic docs entry: ${code}`);
}

async function readSiteData() {
  return JSON.parse(await readFile(siteDataPath, 'utf8'));
}

async function readUiMetadata() {
  const indexPath = join(projectRoot, 'packages/ui/dist/index.js');

  if (!existsSync(indexPath)) {
    throw new Error('packages/ui/dist/index.js is missing. Run pnpm build before pnpm verify:site-docs.');
  }

  return import(pathToFileURL(indexPath).href);
}

async function readCliMetadata() {
  const metadataPath = join(projectRoot, 'packages/cli/dist/commands/metadata.js');

  if (!existsSync(metadataPath)) {
    throw new Error(
      'packages/cli/dist/commands/metadata.js is missing. Run pnpm build before pnpm verify:site-docs.',
    );
  }

  return import(pathToFileURL(metadataPath).href);
}

async function verifySiteDocs() {
  const siteData = await readSiteData();
  const ui = await readUiMetadata();
  const cli = await readCliMetadata();
  const articles = siteData.articles ?? [];
  const primitiveDocs = siteData.primitiveDocs ?? [];
  const commandDocs = siteData.commands ?? [];
  const packageDocs = siteData.packages ?? [];
  const diagnostics = siteData.diagnostics ?? {};
  const requiredArticleKeys = [
    'introduction',
    'installation',
    'projectStructure',
    'runtime',
    'compiler',
    'vitePlugin',
    'cli',
    'configuration',
    'routing',
    'uiOctober',
    'theming',
    'vanrotstyles',
    'testing',
    'examples',
    'conventions',
    'referenceStatus',
  ];
  const requiredPackages = [
    '@vanrot/runtime',
    '@vanrot/compiler',
    '@vanrot/config',
    '@vanrot/router',
    '@vanrot/vite-plugin',
    '@vanrot/cli',
    '@vanrot/ui',
    '@vanrot/testing',
  ];
  const failures = [
    ...checkRequiredArticleCoverage(requiredArticleKeys, articles),
    ...checkPrimitiveCoverage(ui.uiPrimitiveOrder, primitiveDocs),
    ...checkCommandCoverage(cli.cliCommands.map((command) => command.name), commandDocs),
    ...checkPackageCoverage(requiredPackages, packageDocs),
    ...checkDiagnosticCoverage(['VR001', 'VR019'], diagnostics.compiler ?? [], 'compiler'),
    ...checkDiagnosticCoverage(['VRCFG001', 'VRCFG008'], diagnostics.config ?? [], 'config'),
    ...checkDiagnosticCoverage(['VR_CHILD_BEFORE_PARENT'], diagnostics.router ?? [], 'router'),
  ];

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  verifySiteDocs()
    .then(() => {
      console.log('Site documentation verification passed.');
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
