import { readFile, writeFile } from 'node:fs/promises';
import type { AiHistoryRecord } from './history.js';
import { ensureAiDirectory } from './paths.js';

export async function summarizeAiHistory(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const source = await readHistory(paths.history);
  const records = source
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AiHistoryRecord)
    .sort((left, right) => statusRank(left.status) - statusRank(right.status));
  const lines = ['# Vanrot AI Summary', '', '## Unresolved', ''];

  for (const record of records.filter((item) => item.status === 'unresolved')) {
    lines.push(
      `- ${record.diagnostic}${record.filePath === undefined ? '' : ` ${record.filePath}`}: ${record.message}`,
    );
  }

  lines.push('', '## Resolved And Notes', '');

  for (const record of records.filter((item) => item.status !== 'unresolved')) {
    lines.push(`- ${record.diagnostic}: ${record.message}`);
  }

  await writeFile(paths.summary, `${lines.join('\n')}\n`);
  return paths.summary;
}

async function readHistory(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

function statusRank(status: AiHistoryRecord['status']): number {
  if (status === 'unresolved') {
    return 0;
  }

  if (status === 'resolved') {
    return 1;
  }

  return 2;
}
