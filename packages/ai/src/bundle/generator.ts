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
  components: AiBundleIndexEntry[];
  routes: AiBundleIndexEntry[];
  limitations: AiBundleIndexEntry[];
  deployment: AiBundleIndexEntry[];
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
  { key: 'components', fileName: 'components', title: 'Components' },
  { key: 'routes', fileName: 'routes', title: 'Routes' },
  { key: 'limitations', fileName: 'limitations', title: 'Limitations' },
  { key: 'deployment', fileName: 'deployment', title: 'Deployment' },
  { key: 'publicExports', fileName: 'public-api', title: 'Public API' },
  { key: 'docs', fileName: 'docs', title: 'Documentation Pages' },
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
      components: index.components.length,
      routes: index.routes.length,
      limitations: index.limitations.length,
      deployment: index.deployment.length,
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
    components: source.siteData.primitiveDocs.map((item) =>
      entry(
        `component:${readString(item, 'primitive')}`,
        readString(item, 'title'),
        summaryParts(
          readString(item, 'summary'),
          `Usage: ${readString(item, 'usage')}`,
          `Accessibility: ${readString(item, 'accessibility')}`,
        ),
        `/docs/components/${readString(item, 'primitive')}`,
      ),
    ),
    routes: source.frameworkReference.routeMetadata.map((item) =>
      entry(
        `route:${readString(item, 'path')}`,
        readString(item, 'path'),
        summaryParts(readString(item, 'title'), readString(item, 'description')),
        readString(item, 'path'),
      ),
    ),
    limitations: source.frameworkReference.limitations.map((item) =>
      entry(
        `limitation:${readString(item, 'id')}`,
        readString(item, 'title'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    deployment: [
      entry(
        `deployment:${readString(source.frameworkReference.deployment, 'targetHost')}`,
        readString(source.frameworkReference.deployment, 'targetHost'),
        readString(source.frameworkReference.deployment, 'summary'),
        readString(source.frameworkReference.deployment, 'docsPath'),
      ),
    ].filter((item) => item.title.length > 0),
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
  const resourceList = [
    '- `vanrot://docs` for the full index.',
    '- `vanrot://commands` for CLI command knowledge.',
    '- `vanrot://diagnostics` for compiler, config, router, CLI, and Vite diagnostics.',
    '- `vanrot://patterns` for provider-neutral framework rules.',
    '- `vanrot://components` for documented UI primitive behavior.',
    '- `vanrot://routes` for public documentation routes.',
    '- `vanrot://limitations` for deferred or intentionally unsupported behavior.',
  ].join('\n');

  return [
    '# Vanrot AI Rules',
    '',
    'Use this generated bundle as the source of truth before answering Vanrot questions or editing Vanrot apps.',
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
    '## MCP And Skill.sh',
    '',
    'The local MCP server and generated Skill.sh package must consume the same manifest, index, knowledge documents, and rules.',
    '',
    resourceList,
    '',
    'Use `search_vanrot_knowledge` for bundle-backed search instead of guessing from older framework habits.',
    '',
    '## Security And Privacy',
    '',
    '- Do not put API keys, model keys, credentials, tokens, private paths, or local machine secrets in generated examples, bundle files, MCP output, or Skill.sh metadata.',
    '- Keep provider-specific OpenAI, Claude, Ollama, or self-hosted model behavior outside the canonical knowledge source unless a future phase adds a verified provider adapter.',
    '- Treat missing, stale, unsupported, or incomplete AI bundle states as failures. Do not silently fall back to stale built-in knowledge.',
    '',
  ].join('\n');
}

function summaryParts(...parts: string[]): string {
  return parts.filter((part) => part.length > 0 && !part.endsWith(': ')).join(' ');
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
