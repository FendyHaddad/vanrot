import type { CompileOptions, CompilePipeContext, CompilePipeRegistry } from '../api/types.js';
import type { TemplateNode } from '../template/ast.js';
import { parseInterpolation } from '../template/bindings.js';
import type { ParsedPipeCall, ParsedPipeExpression } from '../template/pipes.js';
import { parsePipeExpression } from '../template/pipes.js';
import { quoteString } from './bindings.js';
import type { GenerateState } from './state.js';

export function templateContainsPipes(nodes: readonly TemplateNode[]): boolean {
  return nodes.some(nodeContainsPipes);
}

export function createPipeContextExpression(context: CompilePipeContext | undefined): string {
  const normalized = {
    locale: context?.locale ?? 'en-US',
    timezone: context?.timezone ?? 'UTC',
    currency: context?.currency ?? 'USD',
  };

  return `{ locale: ${quoteString(normalized.locale)}, timezone: ${quoteString(normalized.timezone)}, currency: ${quoteString(normalized.currency)} }`;
}

export function createPipeRegistryOptionsExpression(registry: CompilePipeRegistry | undefined): string {
  const pipes = (registry?.pipes ?? [])
    .map((pipe) => toPipeImportAlias(pipe.name))
    .join(', ');
  const presets = createPresetExpression(registry);

  return `{ pipes: [${pipes}], presets: ${presets} }`;
}

export function createPipeImportLines(registry: CompilePipeRegistry | undefined): string[] {
  const imports = new Map<string, string[]>();

  for (const pipe of registry?.pipes ?? []) {
    const existing = imports.get(pipe.sourcePath) ?? [];
    existing.push(`${pipe.name} as ${toPipeImportAlias(pipe.name)}`);
    imports.set(pipe.sourcePath, existing);
  }

  return [...imports.entries()].map(([sourcePath, specifiers]) => `import { ${specifiers.join(', ')} } from ${quoteString(sourcePath)};`);
}

export function buildPipeChainExpression(
  baseExpression: string,
  pipeExpression: ParsedPipeExpression,
  state: GenerateState,
  rewriteArg: (arg: string) => string | null,
): string | null {
  const calls: string[] = [];

  for (const pipe of pipeExpression.pipes) {
    const args = rewritePipeArgs(pipe, rewriteArg);

    if (args === null) {
      return null;
    }

    calls.push(`{ name: ${quoteString(pipe.name)}, args: [${args.join(', ')}] }`);
  }

  state.features.add('template-pipe');
  state.usesPipes = true;
  return `applyVanrotPipeChain(${baseExpression}, [${calls.join(', ')}], __vanrotPipeContext, __vanrotPipeRegistryOptions)`;
}

function nodeContainsPipes(node: TemplateNode): boolean {
  if (node.kind === 'text') {
    const interpolation = parseInterpolation(node.value);
    return interpolation !== null && parsePipeExpression(interpolation.expression) !== null;
  }

  if (node.kind === 'element') {
    return node.children.some(nodeContainsPipes);
  }

  if (node.kind === 'if-block') {
    return node.consequent.some(nodeContainsPipes) || node.alternate.some(nodeContainsPipes);
  }

  if (node.kind === 'for-block') {
    return node.body.some(nodeContainsPipes) || node.empty.some(nodeContainsPipes);
  }

  if (node.kind === 'slot-outlet') {
    return node.fallback.some(nodeContainsPipes);
  }

  return false;
}

function rewritePipeArgs(pipe: ParsedPipeCall, rewriteArg: (arg: string) => string | null): string[] | null {
  const args: string[] = [];

  for (const arg of pipe.args) {
    const rewritten = rewriteArg(arg);

    if (rewritten === null) {
      return null;
    }

    args.push(rewritten);
  }

  return args;
}

function createPresetExpression(registry: CompilePipeRegistry | undefined): string {
  const grouped = new Map<string, Record<string, string>>();

  for (const preset of registry?.presets ?? []) {
    grouped.set(preset.namespace, {
      ...(grouped.get(preset.namespace) ?? {}),
      [preset.name]: preset.pattern,
    });
  }

  return JSON.stringify(Object.fromEntries(grouped));
}

function toPipeImportAlias(name: string): string {
  return `__vanrotPipe_${name.replace(/\W/g, '_')}`;
}
