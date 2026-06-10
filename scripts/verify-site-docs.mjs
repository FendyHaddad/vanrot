import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDataPath = join(projectRoot, 'apps/vanrot-site/src/docs/site-data.json');
const siteDataSourcePath = join(projectRoot, 'apps/vanrot-site/src/docs/site-data.ts');
const docsPageTreePath = join(projectRoot, 'apps/vanrot-site/src/docs/docs-page-tree.ts');
const sharedDocsCssPath = join(projectRoot, 'apps/vanrot-site/src/pages/docs/shared/docs.css');
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

export function readDocsPageArticleKeys(docsPageTreeSource) {
  return [
    ...new Set(
      [...docsPageTreeSource.matchAll(/\bkey:\s*"([^"]+)"/g)].map((match) => match[1]),
    ),
  ];
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
  const failures = [];
  const docsByName = new Map(commandDocs.map((command) => [command.name, command]));

  for (const command of requiredCommands) {
    const commandDoc = docsByName.get(command);

    if (commandDoc === undefined) {
      failures.push(`Missing CLI command docs entry: ${command}`);
      continue;
    }

    if (!Array.isArray(commandDoc.examples) || commandDoc.examples.length === 0) {
      failures.push(`Missing CLI command examples: ${command}`);
    }

    if (!Array.isArray(commandDoc.notes) || commandDoc.notes.length === 0) {
      failures.push(`Missing CLI command notes: ${command}`);
    }
  }

  return failures;
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

  if (!homePageSource.includes('<a class="btn-primary" href="/docs">Read the docs</a>')) {
    failures.push('Landing primary CTA must be Read the docs');
  }

  if (!homePageSource.includes('<a class="btn-ghost" href="/docs">$ npm i @vanrot/runtime</a>')) {
    failures.push('Landing install CTA must be the runtime install command');
  }

  if (
    !homePageSource.includes(
      '<vr-badge class="hero-badge">AI-first · Signal-based · Secure by design</vr-badge>',
    )
  ) {
    failures.push('Landing eyebrow must match the homepage redesign contract');
  }

  if (homePageSource.includes('Framework Documentation')) {
    failures.push('Landing primary CTA must not use the old Framework Documentation label');
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
  const requiredClasses = ['docs-search', 'docs-nav-title', 'docs-nav-link'];
  const forbiddenSnippets = [
    { snippet: 'docs-brand', message: 'Docs shell must not duplicate the global Vanrot brand' },
    { snippet: 'docs-topbar-nav', message: 'Docs shell must not duplicate global Docs/Components navigation' },
    { snippet: 'docs-page-actions', message: 'Docs shell must not show duplicate page action buttons' },
    { snippet: 'item of componentItems', message: 'Framework docs sidebar must not list component docs' },
  ];

  for (const className of requiredClasses) {
    if (!layoutHtml.includes(className)) {
      failures.push(`Docs shell missing class: ${className}`);
    }
  }

  for (const forbidden of forbiddenSnippets) {
    if (layoutHtml.includes(forbidden.snippet)) {
      failures.push(forbidden.message);
    }
  }

  if (!layoutCss.includes('grid-template-columns: 240px minmax(0, 1fr)')) {
    failures.push('Docs shell CSS missing 240px sidebar grid');
  }

  if (!layoutCss.includes('top: 56px')) {
    failures.push('Docs shell header/sidebar must stay below the global navbar');
  }

  if (!layoutHtml.includes('class="docs-search-icon"')) {
    failures.push('Docs shell search must use the same icon treatment as component docs');
  }

  if (layoutHtml.includes('Cmd K') || !layoutHtml.includes('⌘K')) {
    failures.push('Docs shell search shortcut must match component docs');
  }

  const requiredSidebarStyleSnippets = [
    {
      snippet: '--docs-sidebar-muted: #a1a1aa',
      message: 'Docs shell sidebar muted color must match component docs',
    },
    {
      snippet: '--docs-sidebar-faint: #71717a',
      message: 'Docs shell sidebar faint color must match component docs',
    },
    {
      snippet: 'font-family: var(--font-sans, var(--vr-font-sans))',
      message: 'Docs shell sidebar font stack must match component docs',
    },
    {
      snippet: 'border-radius: 6px',
      message: 'Docs shell sidebar controls must use the component docs radius',
    },
    {
      snippet: 'font-size: 13px',
      message: 'Docs shell search font size must match component docs',
    },
    {
      snippet: '.docs-nav-title:first-child',
      message: 'Docs shell first nav section must align with component docs spacing',
    },
  ];

  for (const { snippet, message } of requiredSidebarStyleSnippets) {
    if (!layoutCss.includes(snippet)) {
      failures.push(message);
    }
  }

  return failures;
}

export function checkComponentDocsShellVisualContract(appLayoutCss, siteCss, componentHtmlFiles) {
  const failures = [];

  if (appLayoutCss.includes('.site-shell:has(.component-gallery-app) .site-header')) {
    failures.push('Component docs must keep the global navbar visible');
  }

  if (!siteCss.includes('.component-gallery-app .topbar')) {
    failures.push('Component docs missing shared topbar styling');
  }

  if (!siteCss.includes('top: var(--vr-site-header-height) !important')) {
    failures.push('Component docs topbar/sidebar must stay below the global navbar');
  }

  for (const [label, html] of Object.entries(componentHtmlFiles)) {
    if (!html.includes('<span>Design Components</span>')) {
      failures.push(`Component docs missing Design Components header: ${label}`);
    }

    if (html.includes('Vanrot UI')) {
      failures.push(`Component docs must not duplicate the Vanrot brand: ${label}`);
    }

    if (html.includes('topbar-right')) {
      failures.push(`Component docs must not duplicate global top navigation: ${label}`);
    }
  }

  return failures;
}

export function checkDocsPageComponentCoverage(treeSource, root = projectRoot) {
  const failures = [];

  if (!treeSource.includes('export const docsPageTree')) {
    failures.push('Docs page tree must export docsPageTree.');
  }

  if (!treeSource.includes('componentName:')) {
    failures.push('Docs page tree must record componentName metadata.');
  }

  const sourceFileEntries = [...treeSource.matchAll(
    /sourceFiles:\s*\{\s*ts:\s*"([^"]+)",\s*html:\s*"([^"]+)",\s*css:\s*"([^"]+)"/g,
  )];

  if (sourceFileEntries.length === 0) {
    failures.push('Docs page tree must record sourceFiles for page triplets.');
  }

  for (const match of sourceFileEntries) {
    const [, tsPath, htmlPath, cssPath] = match;
    const paths = [
      [tsPath, '.page.ts'],
      [htmlPath, '.page.html'],
      [cssPath, '.page.css'],
    ];

    for (const [filePath, suffix] of paths) {
      if (!filePath.endsWith(suffix)) {
        failures.push(`Docs page source file must end with ${suffix}: ${filePath}`);
      }

      if (!existsSync(join(root, 'apps/vanrot-site', filePath))) {
        failures.push(`Docs page source file is missing: ${filePath}`);
      }
    }
  }

  return failures;
}

export function checkDocsArticleSource(siteDataSource) {
  const failures = [];

  if (!siteDataSource.includes("from './docs-page-tree.ts'")) {
    failures.push('site-data.ts must import narrative docs articles from docs-page-tree.ts.');
  }

  if (!siteDataSource.includes('docsPageArticleKeys.map')) {
    failures.push('site-data.ts must derive narrative article order from docsPageArticleKeys.');
  }

  if (/const\s+rawArticles\s*=\s*siteDataJson\.articles/.test(siteDataSource)) {
    failures.push('site-data.ts must not derive narrative framework articles from site-data.json.');
  }

  return failures;
}

export function checkSharedDocsCssOwnership(sharedDocsCss, siteCss) {
  const failures = [];
  const requiredClasses = [
    'docs-article-layout',
    'docs-article',
    'docs-summary',
    'docs-section-grid',
    'docs-section',
    'code-snippet',
    'docs-code-title',
    'code-block',
    'code-line',
    'code-line-number',
    'code-line-content',
    'docs-note',
    'docs-article-bookmarks',
  ];

  for (const className of requiredClasses) {
    const classPattern = new RegExp(`\\.${escapeRegExp(className)}(?:[^A-Za-z0-9_-]|$)`);

    if (!classPattern.test(sharedDocsCss)) {
      failures.push(`Shared docs CSS missing class: ${className}`);
    }
  }

  if (!siteCss.includes('@import "../pages/docs/shared/docs.css";')) {
    failures.push('Site CSS must import the shared docs stylesheet.');
  }

  return failures;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const primitiveDocs = siteData.primitiveDocs ?? [];
  const workspacePackages = readWorkspacePackageNames();
  const workspaceExports = readWorkspacePublicExports();
  const exampleNames = readExampleWorkspaceNames();
  const existingExamplePaths = new Set(exampleNames.map((name) => `examples/${name}`));
  const homePageSource = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/pages/home/home.page.html'),
    'utf8',
  );
  const siteDataSource = readFileSync(siteDataSourcePath, 'utf8');
  const docsPageTreeSource = readFileSync(docsPageTreePath, 'utf8');
  const articles = [
    ...(siteData.articles ?? []),
    ...readDocsPageArticleKeys(docsPageTreeSource).map((key) => ({ key })),
  ];
  const sharedDocsCss = readFileSync(sharedDocsCssPath, 'utf8');
  const docsLayoutHtml = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.html'),
    'utf8',
  );
  const docsLayoutCss = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.css'),
    'utf8',
  );
  const appLayoutCss = readFileSync(
    join(projectRoot, 'apps/vanrot-site/src/app/app.layout.css'),
    'utf8',
  );
  const siteCss = readFileSync(join(projectRoot, 'apps/vanrot-site/src/styles/site.css'), 'utf8');
  const componentHtmlFiles = {
    gallery: readFileSync(
      join(projectRoot, 'apps/vanrot-site/src/pages/components/component-gallery.page.html'),
      'utf8',
    ),
    button: readFileSync(
      join(projectRoot, 'apps/vanrot-site/src/pages/components/component-button.page.html'),
      'utf8',
    ),
    checkbox: readFileSync(
      join(projectRoot, 'apps/vanrot-site/src/pages/components/component-checkbox.page.html'),
      'utf8',
    ),
  };
  const requiredArticleKeys = [
    'introduction',
    'installation',
    'projectStructure',
    'runtime',
    'compiler',
    'vitePlugin',
    'forge',
    'cli',
    'configuration',
    'routing',
    'uiOctober',
    'theming',
    'vanrotstyles',
    'testing',
    'formatters',
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
      [
        'VR001',
        'VR019',
        'VR020',
        'VR021',
        'VR_PIPE_UNKNOWN',
        'VR_PIPE_UNKNOWN_VARIANT',
        'VR_PIPE_DUPLICATE_NAME',
        'VR_PIPE_DUPLICATE_PRESET',
        'VR_PIPE_INVALID_ARGUMENT',
        'VR_PIPE_INVALID_DEFINITION',
        'VR_PIPE_ASYNC',
      ],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'compiler' || item.family === 'formatters')
        .map((item) => item.code),
      'compiler/formatters',
    ),
    ...checkDiagnosticCoverage(
      [
        'VRCFG001',
        'VRCFG008',
        'VRCFG009',
        'VRCFG010',
        'VRCFG011',
        'VRCFG012',
        'VRCFG021',
        'VRCFG_FORMATTING_LOCALE_EMPTY',
        'VRCFG_FORMATTING_TIMEZONE_EMPTY',
        'VRCFG_FORMATTING_CURRENCY_EMPTY',
      ],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'config')
        .map((item) => item.code),
      'config',
    ),
    ...checkDiagnosticCoverage(
      [
        'VRFORGE001',
        'VRFORGE002',
        'VRFORGE003',
        'VRFORGE004',
        'VRFORGE005',
        'VRFORGE006',
        'VRFORGE007',
      ],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'forge')
        .map((item) => item.code),
      'forge',
    ),
    ...checkDiagnosticCoverage(
      ['VR_CHILD_BEFORE_PARENT'],
      frameworkReference.diagnostics
        .filter((item) => item.family === 'router')
        .map((item) => item.code),
      'router',
    ),
    ...checkGeneratedFileCoverage(
      [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'vanrot.config.ts',
        'src/routes.ts',
        'dist/assets/vanrot-app.js',
        'dist/assets/vanrot-app.css',
        'dist/vanrot-routes.json',
        'dist/vanrot-assets.json',
      ],
      frameworkReference.generatedFiles,
    ),
    ...checkConventionCoverage(
      ['role-suffixes', 'scoped-css', 'signals-for-state', 'route-refs', 'no-ui-markup-in-typescript'],
      frameworkReference.conventions,
    ),
    ...checkExampleRegistration(exampleNames, frameworkReference.examples),
    ...checkExampleFreshness(frameworkReference.examples, existingExamplePaths),
    ...checkCtaLabels(homePageSource),
    ...checkRouteMetadataCoverage(
      ['/', '/docs', '/docs/forge', '/docs/components', '/changelog'],
      frameworkReference.routeMetadata,
    ),
    ...checkDocsShellVisualContract(docsLayoutHtml, docsLayoutCss),
    ...checkComponentDocsShellVisualContract(appLayoutCss, siteCss, componentHtmlFiles),
    ...checkDocsPageComponentCoverage(docsPageTreeSource),
    ...checkDocsArticleSource(siteDataSource),
    ...checkSharedDocsCssOwnership(sharedDocsCss, siteCss),
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
