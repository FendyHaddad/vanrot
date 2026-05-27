import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  defaultAiBundlePaths,
  verifyAiKnowledgeBundle,
  writeAiKnowledgeBundle,
} from '@vanrot/ai';
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

  if (action === 'build') {
    await writeAiKnowledgeBundle(context.cwd);
    context.reporter.success('AI knowledge bundle generated', defaultAiBundlePaths.manifest);
    context.reporter.nextSteps(['Run vr ai verify before committing docs/ai changes.']);
    return ok();
  }

  if (action === 'verify') {
    const result = await verifyAiKnowledgeBundle(context.cwd);

    if (!result.ok) {
      context.reporter.error('AI docs verification failed');
      for (const failure of result.failures) {
        context.reporter.line(failure);
      }
      context.reporter.nextSteps(['Run vr ai build and review docs/ai changes.']);
      return fail();
    }

    context.reporter.success('AI docs verification passed');
    return ok();
  }

  if (action === 'context') {
    context.reporter.success('wrote AI context', await writeAiContext(context.cwd));
    return ok();
  }

  if (action === 'doctor') {
    const result = await verifyAiKnowledgeBundle(context.cwd);
    context.reporter.success('wrote AI doctor report', await writeAiDoctor(context.cwd));
    context.reporter.heading('AI bundle');
    context.reporter.line(`schema ${result.ok ? 'supported' : 'needs attention'}`);
    context.reporter.line(`source fingerprint ${result.ok ? 'fresh' : 'stale or missing'}`);

    for (const failure of result.failures) {
      context.reporter.line(failure);
    }

    context.reporter.nextSteps(result.ok ? [] : ['Run vr ai build to refresh docs/ai.']);
    return ok();
  }

  if (action === 'mcp') {
    if (args.includes('--help') || args.includes('-h')) {
      context.reporter.line(
        [
          'vr ai mcp',
          '',
          'Runs the local Vanrot MCP server over stdio.',
          '',
          'Setup',
          '  Command: vanrot-mcp',
          '  Transport: stdio',
        ].join('\n'),
      );
      return ok();
    }

    context.reporter.line(
      'Run `vanrot-mcp` from the Vanrot workspace to start the MCP stdio server.',
    );
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

  context.reporter.error(
    'Usage: vr ai <build|verify|doctor|mcp|context|prompt|record|summarize>',
  );
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
