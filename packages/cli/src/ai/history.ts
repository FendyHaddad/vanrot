import { appendFile } from 'node:fs/promises';
import { ensureAiDirectory } from './paths.js';

export interface AiHistoryRecord {
  id: string;
  status: 'unresolved' | 'resolved' | 'note';
  diagnostic: string;
  filePath?: string;
  message: string;
  createdAt: string;
}

export async function recordAiHistory(
  cwd: string,
  record: Omit<AiHistoryRecord, 'id' | 'createdAt'>,
): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const createdAt = new Date().toISOString();
  const id = `${record.diagnostic}-${createdAt}`;
  await appendFile(paths.history, `${JSON.stringify({ id, createdAt, ...record })}\n`);
  return paths.history;
}
