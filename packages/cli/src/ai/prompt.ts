import { writeFile } from 'node:fs/promises';
import { ensureAiDirectory } from './paths.js';

export async function writeAiPrompt(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const prompt = [
    '# Vanrot project context',
    '',
    'Run `vr doctor` before changing files.',
    'Follow AGENTS.md and keep role files separated.',
    'Use guard clauses, signals for state, scoped CSS, and centralized shared strings.',
    '',
  ].join('\n');

  await writeFile(paths.prompt, prompt);
  return paths.prompt;
}
