import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const ignoredDirectories = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.turbo',
  'coverage',
  '.vanrot',
];

const ignoredFiles = new Set(['pnpm-lock.yaml']);

const binaryFilePattern = /\.(?:png|jpe?g|gif|webp|ico|pdf|woff2?)$/i;

const leakPatterns = [
  {
    id: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/,
  },
  {
    id: 'aws-access-key',
    pattern: /AKIA[0-9A-Z]{16}/,
  },
  {
    id: 'github-token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/,
  },
  {
    id: 'openai-key',
    pattern: /sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}/,
  },
  {
    id: 'anthropic-key',
    pattern: /sk-ant-[A-Za-z0-9_-]{20,}/,
  },
  {
    id: 'gemini-key',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
  },
  {
    id: 'generic-secret-assignment',
    pattern:
      /(?:^|[^A-Za-z0-9_])(?:[A-Za-z0-9]+[_-])?(?:api[_-]?key|secret|password|auth[_-]?token|access[_-]?token|refresh[_-]?token)\s*[:=]\s*["'][^"'\n]{12,}["']/i,
  },
];

export function formatSecurityLeakFailures(hits) {
  return [
    'Security leak verification failed.',
    ...hits.map((hit) => `- ${hit.file}:${hit.line} ${hit.type} ${hit.snippet}`),
    'Remove committed secrets or replace them with documented placeholders.',
  ].join('\n');
}

export async function verifySecurityLeaks(root = process.cwd()) {
  const hits = [];

  for (const file of listTextFiles(root)) {
    const source = await readFile(join(root, file), 'utf8');
    hits.push(...scanText(file, source));
  }

  if (hits.length > 0) {
    return { exitCode: 1, message: formatSecurityLeakFailures(hits), hits };
  }

  return { exitCode: 0, message: 'Security leak verification passed.', hits };
}

export function scanText(file, source) {
  const hits = [];
  const lines = source.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    for (const leakPattern of leakPatterns) {
      if (leakPattern.pattern.test(lines[index])) {
        hits.push({
          file,
          line: index + 1,
          type: leakPattern.id,
          snippet: redactSecretLine(lines[index].trim()),
        });
      }
    }
  }

  return hits;
}

export function redactSecretLine(line) {
  return line.replace(/([:=]\s*["'])([^"'\n]{8,})(["'])/g, (_match, start, value, end) => {
    return `${start}${value.slice(0, 8)}...${end}`;
  });
}

function listTextFiles(root) {
  const rgArgs = [
    '--files',
    '--hidden',
    ...ignoredDirectories.flatMap((directory) => ['-g', `!${directory}`, '-g', `!**/${directory}/**`]),
  ];

  return execFileSync('rg', rgArgs, { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((file) => file.length > 0)
    .filter((file) => !ignoredFiles.has(file))
    .filter((file) => !binaryFilePattern.test(file))
    .map((file) => relative(root, join(root, file)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifySecurityLeaks();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
