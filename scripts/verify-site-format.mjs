import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const htmlTagPattern = /^( *)(<\/([a-z][a-z0-9-]*)>\s*)$/i;

export function formatSiteFormatFailures(failures) {
  return [
    'Site format verification failed.',
    ...failures.map(
      (failure) =>
        `- ${failure.file}:${failure.line} nested </${failure.tag}> closing tags share indent ${failure.indent}.`,
    ),
    'Indent nested closing tags so source-owned examples model readable Vanrot templates.',
  ].join('\n');
}

export async function verifySiteFormat(root = process.cwd()) {
  const failures = [];

  for (const file of await listSiteHtmlFiles(root)) {
    const source = await readFile(join(root, file), 'utf8');
    failures.push(...scanTemplateIndentation(file, source));
  }

  if (failures.length > 0) {
    return { exitCode: 1, message: formatSiteFormatFailures(failures), failures };
  }

  return { exitCode: 0, message: 'Site format verification passed.', failures };
}

export function scanTemplateIndentation(file, source) {
  const failures = [];
  const lines = source.split('\n');

  for (let index = 1; index < lines.length; index += 1) {
    const previousClosingTag = lines[index - 1].match(htmlTagPattern);
    const currentClosingTag = lines[index].match(htmlTagPattern);

    if (previousClosingTag === null || currentClosingTag === null) {
      continue;
    }

    if (
      previousClosingTag[1].length !== currentClosingTag[1].length ||
      previousClosingTag[3] !== currentClosingTag[3]
    ) {
      continue;
    }

    failures.push({
      file,
      line: index + 1,
      tag: currentClosingTag[3],
      indent: currentClosingTag[1].length,
    });
  }

  return failures;
}

async function listSiteHtmlFiles(root) {
  const searchRoot = join(root, 'apps/vanrot-site/src');
  const files = [];

  for (const absolutePath of await walkFiles(searchRoot)) {
    if (!absolutePath.endsWith('.html')) {
      continue;
    }

    files.push(relative(root, absolutePath).split(sep).join('/'));
  }

  return files.sort();
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifySiteFormat();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
