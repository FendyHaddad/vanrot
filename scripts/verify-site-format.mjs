import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

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

  for (const file of listSiteHtmlFiles(root)) {
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

function listSiteHtmlFiles(root) {
  return execFileSync('rg', ['--files', 'apps/vanrot-site/src', '-g', '*.html'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((file) => file.length > 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifySiteFormat();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
