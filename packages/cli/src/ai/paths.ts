import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const defaultAiDirectory = '.vanrot/ai';

export interface AiPaths {
  directory: string;
  context: string;
  doctor: string;
  prompt: string;
  history: string;
  summary: string;
}

export async function ensureAiDirectory(
  cwd: string,
  directory = defaultAiDirectory,
): Promise<AiPaths> {
  const root = join(cwd, directory);
  await mkdir(root, { recursive: true });

  return {
    directory: root,
    context: join(root, 'context.json'),
    doctor: join(root, 'doctor.json'),
    prompt: join(root, 'prompt.md'),
    history: join(root, 'history.jsonl'),
    summary: join(root, 'summary.md'),
  };
}
