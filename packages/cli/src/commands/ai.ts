import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadVanrotProjectConfig } from '@vanrot/config';
import { writeAiContext } from '../ai/context.js';
import { writeAiDoctor } from '../ai/doctor.js';
import { recordAiHistory } from '../ai/history.js';
import { writeAiPrompt } from '../ai/prompt.js';
import { summarizeAiHistory } from '../ai/summarize.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function aiCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const disabled = await isAiDisabled(context.cwd);

  if (disabled) {
    context.reporter.error('Vanrot AI doorway is disabled', 'VR_AI_DISABLED');
    context.reporter.nextSteps(['Enable ai.enabled in vanrot.config.ts.']);
    return fail();
  }

  const action = args[0];

  if (action === 'context') {
    context.reporter.success('wrote AI context', await writeAiContext(context.cwd));
    return ok();
  }

  if (action === 'doctor') {
    context.reporter.success('wrote AI doctor report', await writeAiDoctor(context.cwd));
    return ok();
  }

  if (action === 'prompt') {
    context.reporter.success('wrote AI prompt', await writeAiPrompt(context.cwd));
    return ok();
  }

  if (action === 'record') {
    const code = valueAfter(args, '--code') ?? 'VR_MANUAL_NOTE';
    const filePath = valueAfter(args, '--file');
    const message = valueAfter(args, '--message') ?? 'manual note';
    const record = {
      status: 'unresolved',
      diagnostic: code,
      message,
      ...(filePath === undefined ? {} : { filePath }),
    } as const;
    context.reporter.success(
      'wrote AI history',
      await recordAiHistory(context.cwd, record),
    );
    return ok();
  }

  if (action === 'summarize') {
    context.reporter.success('wrote AI summary', await summarizeAiHistory(context.cwd));
    return ok();
  }

  context.reporter.error('Usage: vr ai <context|doctor|prompt|record|summarize>');
  return fail();
}

export async function gitignoreAiDirectory(cwd: string): Promise<void> {
  const gitignore = join(cwd, '.gitignore');
  const entry = '.vanrot/ai/';
  let source = '';

  try {
    source = await readFile(gitignore, 'utf8');
  } catch {
    source = '';
  }

  if (source.split('\n').includes(entry)) {
    return;
  }

  await writeFile(gitignore, `${source}${source.endsWith('\n') || source.length === 0 ? '' : '\n'}${entry}\n`);
}

async function isAiDisabled(cwd: string): Promise<boolean> {
  const loaded = await loadVanrotProjectConfig(cwd);
  const config = loaded.config as { ai?: { enabled?: boolean } };
  return config.ai?.enabled === false;
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
