import { createAiBundleManifest, type AiBundleManifest } from './schema.js';
import { readAiKnowledgeSource, type AiKnowledgeSource, type ReferenceRecord } from './source.js';

export interface BuildAiKnowledgeBundleOptions {
  now?: () => Date;
}

export interface AiBundleIndexEntry {
  id: string;
  title: string;
  summary: string;
  docsPath?: string;
}

export interface AiBundleIndex {
  packages: AiBundleIndexEntry[];
  publicExports: AiBundleIndexEntry[];
  commands: AiBundleIndexEntry[];
  diagnostics: AiBundleIndexEntry[];
  generatedFiles: AiBundleIndexEntry[];
  conventions: AiBundleIndexEntry[];
  examples: AiBundleIndexEntry[];
  docs: AiBundleIndexEntry[];
}

export interface AiBundleDocument {
  path: string;
  content: string;
}

export interface AiKnowledgeBundle {
  manifest: AiBundleManifest;
  index: AiBundleIndex;
  documents: AiBundleDocument[];
  rules: string;
}

const knowledgeSections = [
  { key: 'packages', fileName: 'packages', title: 'Packages' },
  { key: 'commands', fileName: 'commands', title: 'Commands' },
  { key: 'diagnostics', fileName: 'diagnostics', title: 'Diagnostics' },
  { key: 'generatedFiles', fileName: 'generated-files', title: 'Generated Files' },
  { key: 'conventions', fileName: 'conventions', title: 'Conventions' },
  { key: 'examples', fileName: 'examples', title: 'Examples' },
  { key: 'publicExports', fileName: 'public-api', title: 'Public API' },
] as const;

export async function buildAiKnowledgeBundle(
  root: string,
  options: BuildAiKnowledgeBundleOptions = {},
): Promise<AiKnowledgeBundle> {
  return createAiKnowledgeBundle(await readAiKnowledgeSource(root), options);
}

export function createAiKnowledgeBundle(
  source: AiKnowledgeSource,
  options: BuildAiKnowledgeBundleOptions = {},
): AiKnowledgeBundle {
  const now = options.now ?? (() => new Date());
  const index = createBundleIndex(source);
  const manifest = createAiBundleManifest({
    vanrotVersion: source.vanrotVersion,
    generatedAt: now().toISOString(),
    sourceFingerprint: source.sourceFingerprint,
    sources: source.sources,
    counts: {
      packages: index.packages.length,
      publicExports: index.publicExports.length,
      commands: index.commands.length,
      diagnostics: index.diagnostics.length,
      generatedFiles: index.generatedFiles.length,
      conventions: index.conventions.length,
      examples: index.examples.length,
      docs: index.docs.length,
    },
  });

  return {
    manifest,
    index,
    documents: createKnowledgeDocuments(index),
    rules: createProviderNeutralRules(index),
  };
}

function createBundleIndex(source: AiKnowledgeSource): AiBundleIndex {
  return {
    packages: source.frameworkReference.packages.map((item) =>
      entry(`package:${readString(item, 'name')}`, readString(item, 'name'), readString(item, 'summary')),
    ),
    publicExports: source.frameworkReference.publicExports.map((item) =>
      entry(
        `export:${readString(item, 'packageName')}:${readString(item, 'name')}`,
        `${readString(item, 'packageName')} ${readString(item, 'name')}`,
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    commands: source.frameworkReference.commands.map((item) =>
      entry(
        `command:${readString(item, 'name')}`,
        readString(item, 'usage'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    diagnostics: source.frameworkReference.diagnostics.map((item) =>
      entry(
        `diagnostic:${readString(item, 'code')}`,
        readString(item, 'code'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    generatedFiles: source.frameworkReference.generatedFiles.map((item) =>
      entry(
        `generated-file:${readString(item, 'path')}`,
        readString(item, 'path'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    conventions: source.frameworkReference.conventions.map((item) =>
      entry(
        `convention:${readString(item, 'id')}`,
        readString(item, 'title'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    examples: source.frameworkReference.examples.map((item) =>
      entry(
        `example:${readString(item, 'title')}`,
        readString(item, 'title'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    docs: source.siteData.articles.map((item) =>
      entry(
        `doc:${readString(item, 'key')}`,
        readString(item, 'title'),
        readString(item, 'summary'),
        readString(item, 'path'),
      ),
    ),
  };
}

function createKnowledgeDocuments(index: AiBundleIndex): AiBundleDocument[] {
  return knowledgeSections.map((section) =>
    sectionDocument(section.fileName, section.title, index[section.key]),
  );
}

function sectionDocument(
  fileName: string,
  title: string,
  entries: AiBundleIndexEntry[],
): AiBundleDocument {
  const body = entries.length === 0
    ? '- No entries yet.'
    : entries.map((item) => entryMarkdown(item)).join('\n\n');

  return {
    path: `knowledge/${fileName}.md`,
    content: [`# ${title}`, '', body, ''].join('\n'),
  };
}

function entryMarkdown(item: AiBundleIndexEntry): string {
  const lines = [`## ${item.title}`, '', item.summary || 'No summary provided.'];

  if (item.docsPath !== undefined && item.docsPath.length > 0) {
    lines.push('', `Docs: ${item.docsPath}`);
  }

  return lines.join('\n');
}

function createProviderNeutralRules(index: AiBundleIndex): string {
  const commandList = index.commands.map((command) => `- ${command.title}`).join('\n');

  return [
    '# Vanrot AI Rules',
    '',
    '- Use guard clauses instead of nested control flow.',
    '- Use signals for state.',
    '- Never put UI markup in TypeScript.',
    '- Never put application logic in HTML.',
    '- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.',
    '- Use scoped CSS for component styling.',
    '- Avoid reused string literals by keeping shared names in one source of truth.',
    '',
    '## Commands',
    '',
    commandList,
    '',
  ].join('\n');
}

function entry(
  id: string,
  title: string,
  summary: string,
  docsPath?: string,
): AiBundleIndexEntry {
  if (docsPath === undefined || docsPath.length === 0) {
    return { id, title, summary };
  }

  return { id, title, summary, docsPath };
}

function readString(item: ReferenceRecord, key: string): string {
  const value = item[key];

  if (typeof value === 'string') {
    return value;
  }

  return '';
}
