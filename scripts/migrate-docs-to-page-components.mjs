import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, '..');
const siteRoot = join(projectRoot, 'apps/vanrot-site');
const siteDataPath = join(siteRoot, 'src/docs/site-data.json');
const docsPagesRoot = join(siteRoot, 'src/pages/docs');
const pageTreePath = join(siteRoot, 'src/docs/docs-page-tree.ts');
const siteData = JSON.parse(readFileSync(siteDataPath, 'utf8'));
const articles = siteData.articles ?? [];

const sectionFolderByKey = {
  getStarted: 'get-started',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
};

const parentKeyByPath = new Map(articles.map((article) => [article.path, article.key]));
const pageEntries = articles.map(toPageEntry);
const pageEntriesByParent = groupByParent(pageEntries);

for (const entry of pageEntries) {
  writePageFiles(entry);
}

writePageTree(pageEntries, pageEntriesByParent);

function toPageEntry(article) {
  const pathSegments = article.path === '/docs'
    ? ['introduction']
    : article.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
  const sectionFolder = sectionFolderByKey[article.section] ?? 'reference';
  const fileBase = pathSegments[pathSegments.length - 1] ?? 'introduction';
  const parentPath = parentDocsPath(article.path);
  const parentKey = parentPath === undefined ? undefined : parentKeyByPath.get(parentPath);
  const pageFolder = article.key === 'changelog'
    ? 'changelog'
    : [sectionFolder, ...pathSegments].join('/');
  const className = `${pascalCase(fileBase)}Page`;
  const componentImportName = `${camelCase(article.key)}PageComponent`;
  const routeKey = `docs${pascalCase(article.key)}`;
  const articleConstName = `${camelCase(article.key)}Article`;
  const relativeFolder = `src/pages/docs/${pageFolder}`;

  return {
    key: article.key,
    section: article.section,
    parentKey,
    routeKey,
    label: article.label,
    title: article.title,
    summary: article.summary,
    status: article.status,
    path: article.path,
    className,
    componentImportName,
    articleConstName,
    folder: join(docsPagesRoot, pageFolder),
    relativeFolder,
    tsPath: `${relativeFolder}/${fileBase}.page.ts`,
    htmlPath: `${relativeFolder}/${fileBase}.page.html`,
    cssPath: `${relativeFolder}/${fileBase}.page.css`,
    fileBase,
    sections: article.sections ?? [],
    article,
  };
}

function parentDocsPath(path) {
  if (path === '/docs') {
    return undefined;
  }

  const segments = path.split('/').filter(Boolean);

  if (segments.length <= 2) {
    return undefined;
  }

  return `/${segments.slice(0, -1).join('/')}`;
}

function groupByParent(entries) {
  const groups = new Map();

  for (const entry of entries) {
    if (entry.parentKey === undefined) {
      continue;
    }

    const siblings = groups.get(entry.parentKey) ?? [];
    siblings.push(entry);
    groups.set(entry.parentKey, siblings);
  }

  return groups;
}

function writePageFiles(entry) {
  mkdirSync(entry.folder, { recursive: true });
  writeFileSync(join(siteRoot, entry.tsPath), pageTs(entry));
  writeFileSync(join(siteRoot, entry.htmlPath), pageHtml(entry));
  writeFileSync(join(siteRoot, entry.cssPath), '/* Page-specific docs styles only. */\n');
}

function pageTs(entry) {
  const sharedContentImport = relativeTypeScriptImport(
    entry.relativeFolder,
    'src/pages/docs/shared/docs-content.ts',
  );
  const bodyFields = entry.sections
    .map((_section, index) => `  section${index}Body = ${entry.articleConstName}.sections[${index}].body;`)
    .join('\n');
  const pointFields = entry.sections
    .map((section, index) => (Array.isArray(section.points)
      ? `  section${index}Points = ${entry.articleConstName}.sections[${index}].points ?? [];`
      : ''))
    .filter(Boolean)
    .join('\n');
  const codeFields = entry.sections
    .map((section, index) => (section.code?.code !== undefined
      ? `  section${index}Code = ${entry.articleConstName}.sections[${index}].code?.code ?? '';`
      : ''))
    .filter(Boolean)
    .join('\n');
  const noteFields = entry.sections
    .map((section, index) => (section.note !== undefined && section.note.length > 0
      ? `  section${index}Note = ${entry.articleConstName}.sections[${index}].note ?? '';`
      : ''))
    .filter(Boolean)
    .join('\n');
  const fieldBlocks = [bodyFields, pointFields, codeFields, noteFields].filter(Boolean).join('\n');

  return `import type { DocsSectionLink } from '${sharedContentImport}';

export const ${entry.articleConstName} = ${JSON.stringify(entry.article, null, 2)} as const;

const sectionLinks = ${entry.articleConstName}.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ${entry.className} {
  title(): string {
    return ${entry.articleConstName}.title;
  }

  summary(): string {
    return ${entry.articleConstName}.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }
${fieldBlocks.length > 0 ? `\n${fieldBlocks}\n` : ''}}
`;
}

function pageHtml(entry) {
  const sections = entry.sections.map(sectionHtml).join('\n\n');

  return `<docs-article-shell [title]="title()" [summary]="summary()" [sectionLinks]="sectionLinks()">
${sections}
</docs-article-shell>
`;
}

function sectionHtml(section, index) {
  const points = Array.isArray(section.points) && section.points.length > 0
    ? `\n  <docs-points-list [points]="section${index}Points"></docs-points-list>`
    : '';
  const code = section.code?.code !== undefined
    ? `\n  <docs-code-block [title]="'${escapeSingleQuotedBinding(section.code.title)}'" [code]="section${index}Code"></docs-code-block>`
    : '';
  const note = section.note !== undefined && section.note.length > 0
    ? `\n  <docs-note>{{ section${index}Note }}</docs-note>`
    : '';

  return `  <docs-section [sectionId]="sectionLinks()[${index}].id" [title]="sectionLinks()[${index}].title">
    <p>{{ section${index}Body }}</p>${points}${code}${note}
  </docs-section>`;
}

function writePageTree(entries, childrenByParent) {
  const importLines = entries
    .map((entry) => `import { ${entry.className} as ${entry.componentImportName}, ${entry.articleConstName} } from '../${entry.tsPath.replace(/^src\//, '').replace(/\.ts$/, '.ts')}';`)
    .join('\n');
  const rootEntries = entries.filter((entry) => entry.parentKey === undefined);
  const body = `${importLines}

export const docsPageSection = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
} as const;

export type DocsPageSection = (typeof docsPageSection)[keyof typeof docsPageSection];

export interface DocsPageArticleSection {
  id: string;
  title: string;
  body: string;
  points?: readonly string[];
  code?: {
    title: string;
    code: string;
  };
  note?: string;
  date?: string;
  changes?: readonly string[];
}

export interface DocsPageArticle {
  key: string;
  section: DocsPageSection;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  sections: readonly DocsPageArticleSection[];
}

export interface DocsPageTreeItem {
  key: string;
  routeKey: string;
  section: DocsPageSection;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  article: DocsPageArticle;
  componentName: string;
  component: new () => object;
  sourceFiles: {
    ts: string;
    html: string;
    css: string;
  };
  children: readonly DocsPageTreeItem[];
}

export const docsPageTree = [
${rootEntries.map((entry) => treeEntry(entry, childrenByParent, 1)).join(',\n')}
] as const satisfies readonly DocsPageTreeItem[];

export function flattenDocsPageTree(items: readonly DocsPageTreeItem[] = docsPageTree): readonly DocsPageTreeItem[] {
  return items.flatMap((item) => [item, ...flattenDocsPageTree(item.children)]);
}

export const docsPageArticles = Object.fromEntries(
  flattenDocsPageTree().map((page) => [page.key, page.article]),
) as Record<string, DocsPageArticle>;

export const docsPageArticleKeys = flattenDocsPageTree().map((page) => page.key);
`;

  writeFileSync(pageTreePath, body);
}

function treeEntry(entry, childrenByParent, indentLevel) {
  const indent = '  '.repeat(indentLevel);
  const children = childrenByParent.get(entry.key) ?? [];

  return `${indent}{
${indent}  key: ${JSON.stringify(entry.key)},
${indent}  routeKey: ${JSON.stringify(entry.routeKey)},
${indent}  section: docsPageSection.${entry.section},
${indent}  path: ${JSON.stringify(entry.path)},
${indent}  label: ${JSON.stringify(entry.label)},
${indent}  title: ${JSON.stringify(entry.title)},
${indent}  summary: ${JSON.stringify(entry.summary)},
${indent}  status: ${JSON.stringify(entry.status)},
${indent}  article: ${entry.articleConstName},
${indent}  componentName: ${JSON.stringify(entry.className)},
${indent}  component: ${entry.componentImportName},
${indent}  sourceFiles: {
${indent}    ts: ${JSON.stringify(entry.tsPath)},
${indent}    html: ${JSON.stringify(entry.htmlPath)},
${indent}    css: ${JSON.stringify(entry.cssPath)},
${indent}  },
${indent}  children: [
${children.map((child) => treeEntry(child, childrenByParent, indentLevel + 2)).join(',\n')}
${indent}  ],
${indent}}`;
}

function relativeTypeScriptImport(fromFolder, toFile) {
  const fromAbsolute = join(siteRoot, fromFolder);
  const toAbsolute = join(siteRoot, toFile);
  const relativePath = relative(fromAbsolute, toAbsolute).replace(/\\/g, '/');

  if (relativePath.startsWith('../')) {
    return relativePath;
  }

  return `./${relativePath}`;
}

function pascalCase(value) {
  return value
    .replace(/(^|[-_\s])([a-zA-Z0-9])/g, (_, _separator, char) => char.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, '');
}

function camelCase(value) {
  const pascal = pascalCase(value);

  return `${pascal[0].toLowerCase()}${pascal.slice(1)}`;
}

function escapeSingleQuotedBinding(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
