import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDataPath = join(projectRoot, 'apps/vanrot-site/src/docs/site-data.json');
const frameworkReferencePath = join(
  projectRoot,
  'apps/vanrot-site/src/docs/framework-reference.json',
);

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

export function checkPublicExportCoverage(availableExports, docExports) {
  const documented = new Set(docExports.map((item) => `${item.packageName}#${item.name}`));
  const wildcardPackages = new Set(
    docExports.filter((item) => item.name === '*').map((item) => item.packageName),
  );
  const failures = [];

  for (const item of availableExports) {
    const exportKey = `${item.packageName}#${item.name}`;

    if (documented.has(exportKey) || wildcardPackages.has(item.packageName)) {
      continue;
    }

    failures.push(`Missing public export docs entry: ${exportKey}`);
  }

  return failures;
}

export function checkGeneratedFileCoverage(requiredFiles, docFiles) {
  const documented = new Set(docFiles.map((item) => item.path));
  const failures = [];

  for (const filePath of requiredFiles) {
    if (!documented.has(filePath)) {
      failures.push(`Missing generated file docs entry: ${filePath}`);
    }
  }

  return failures;
}

export function checkConventionCoverage(requiredConventions, docConventions) {
  const documented = new Set(docConventions.map((item) => item.id));
  const failures = [];

  for (const convention of requiredConventions) {
    if (!documented.has(convention)) {
      failures.push(`Missing convention docs entry: ${convention}`);
    }
  }

  return failures;
}

export function checkExampleRegistration(exampleNames, docExamples) {
  const documented = new Set(docExamples.map((item) => item.path));
  const failures = [];

  for (const name of exampleNames) {
    const examplePath = `examples/${name}`;

    if (!documented.has(examplePath)) {
      failures.push(`Missing example docs entry: ${examplePath}`);
    }
  }

  return failures;
}

export function checkExampleFreshness(docExamples, existingExamplePaths) {
  const failures = [];

  for (const example of docExamples) {
    if (!existingExamplePaths.has(example.path)) {
      failures.push(`Registered example path does not exist: ${example.path}`);
    }
  }

  return failures;
}

export function checkCtaLabels(homePageSource) {
  const failures = [];

  if (!homePageSource.includes("primaryCta: 'Framework Documentation'")) {
    failures.push('Landing primary CTA must be Framework Documentation');
  }

  if (!homePageSource.includes("secondaryCta: 'Design Component'")) {
    failures.push('Landing secondary CTA must be Design Component');
  }

  return failures;
}

export function checkRouteMetadataCoverage(requiredPaths, routeMetadata) {
  const documented = new Set(routeMetadata.map((item) => item.path));
  const failures = [];

  for (const routePath of requiredPaths) {
    if (!documented.has(routePath)) {
      failures.push(`Missing public route metadata: ${routePath}`);
    }
  }

  return failures;
}

export function checkDocsShellVisualContract(layoutHtml, layoutCss) {
  const failures = [];
  const requiredClasses = ['docs-brand', 'docs-search', 'docs-nav-title', 'docs-nav-link'];

  for (const className of requiredClasses) {
    if (!layoutHtml.includes(className)) {
      failures.push(`Docs shell missing class: ${className}`);
    }
  }

  if (!layoutCss.includes('grid-template-columns: 240px minmax(0, 1fr)')) {
    failures.push('Docs shell CSS missing 240px sidebar grid');
  }

  return failures;
}

export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function readWorkspacePackageNames(packagesRootUrl = new URL('../packages/', import.meta.url)) {
  const packagesRoot = fileURLToPath(packagesRootUrl);

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesRoot, entry.name, 'package.json'))
    .filter((packagePath) => existsSync(packagePath))
    .map((packagePath) => readJsonFile(packagePath).name)
    .filter((name) => typeof name === 'string')
    .sort((left, right) => left.localeCompare(right));
}

export function readPublicExportsFromIndex(packageName, source) {
  const exports = [];

  for (const match of source.matchAll(/export\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s+from/g)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim().split(/\s+as\s+/).at(-1);

      if (name) {
        exports.push({ packageName, name });
      }
    }
  }

  for (const match of source.matchAll(/export\s+(?:const|function|class|interface|type)\s+([A-Za-z0-9_]+)/g)) {
    exports.push({ packageName, name: match[1] });
  }

  if (/export\s+default\s+/m.test(source)) {
    exports.push({ packageName, name: 'default' });
  }

  return exports;
}

export function readWorkspacePublicExports(packagesRootUrl = new URL('../packages/', import.meta.url)) {
  const packagesRoot = fileURLToPath(packagesRootUrl);
  const exports = [];

  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageRoot = join(packagesRoot, entry.name);
    const packageJsonPath = join(packageRoot, 'package.json');
    const indexPath = join(packageRoot, 'src', 'index.ts');

    if (!existsSync(packageJsonPath) || !existsSync(indexPath)) {
      continue;
    }

    const packageName = readJsonFile(packageJsonPath).name;
    const source = readFileSync(indexPath, 'utf8');

    for (const item of readPublicExportsFromIndex(packageName, source)) {
      exports.push(item);
    }
  }

  return exports.sort((left, right) =>
    `${left.packageName}#${left.name}`.localeCompare(`${right.packageName}#${right.name}`),
  );
}

export function readFrameworkReference() {
  return readJsonFile(frameworkReferencePath);
}

export function readExampleWorkspaceNames(examplesRootUrl = new URL('../examples/', import.meta.url)) {
  const examplesRoot = fileURLToPath(examplesRootUrl);

  return readdirSync(examplesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(examplesRoot, entry.name, 'package.json')))
    .map((entry) => basename(entry.name))
    .sort((left, right) => left.localeCompare(right));
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
  const frameworkReference = readFrameworkReference();
  const articles = siteData.articles ?? [];
  const primitiveDocs = siteData.primitiveDocs ?? [];
  const workspacePackages = readWorkspacePackageNames();
  const workspaceExports = readWorkspacePublicExports();
  const exampleNames = readExampleWorkspaceNames();
  const existingExamplePaths = new Set(exampleNames.map((name) => `examples/${name}`));
  const homePageSource = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/pages/home/home.page.ts'),
    'utf8',
  );
  const docsLayoutHtml = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.html'),
    'utf8',
  );
  const docsLayoutCss = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.css'),
    'utf8',
  );
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
    'devtools',
    'examples',
    'exampleMatrix',
    'deployment',
    'publicApi',
    'diagnostics',
    'generatedFiles',
    'conventions',
    'limitations',
    'referenceStatus',
  ];
  const failures = [
    ...checkRequiredArticleCoverage(requiredArticleKeys, articles),
    ...checkPrimitiveCoverage(ui.uiPrimitiveOrder, primitiveDocs),
    ...checkPackageCoverage(workspacePackages, frameworkReference.packages),
    ...checkPublicExportCoverage(workspaceExports, frameworkReference.publicExports),
    ...checkCommandCoverage(cli.cliCommands.map((command) => command.name), frameworkReference.commands),
    ...checkDiagnosticCoverage(
      ['VR001', 'VR019'],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'compiler')
        .map((item) => item.code),
      'compiler',
    ),
    ...checkDiagnosticCoverage(
      ['VRCFG001', 'VRCFG008', 'VRCFG009', 'VRCFG010', 'VRCFG011', 'VRCFG012'],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'config')
        .map((item) => item.code),
      'config',
    ),
    ...checkDiagnosticCoverage(
      ['VR_CHILD_BEFORE_PARENT'],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'router')
        .map((item) => item.code),
      'router',
    ),
    ...checkGeneratedFileCoverage(
      ['package.json', 'tsconfig.json', 'vite.config.ts', 'vanrot.config.ts', 'src/routes.ts'],
      frameworkReference.generatedFiles,
    ),
    ...checkConventionCoverage(
      ['role-suffixes', 'scoped-css', 'signals-for-state', 'route-refs', 'no-ui-markup-in-typescript'],
      frameworkReference.conventions,
    ),
    ...checkExampleRegistration(exampleNames, frameworkReference.examples),
    ...checkExampleFreshness(frameworkReference.examples, existingExamplePaths),
    ...checkCtaLabels(homePageSource),
    ...checkRouteMetadataCoverage(['/', '/docs', '/docs/components'], frameworkReference.routeMetadata),
    ...checkDocsShellVisualContract(docsLayoutHtml, docsLayoutCss),
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
