import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import type { CompileDiagnostic, CompilePipeRegistry } from '@vanrot/compiler';

const PIPE_FILE_SUFFIX = '.pipe.ts';
const SKIPPED_DIRECTORIES = new Set(['.git', 'dist', 'node_modules']);

export interface PipeSourceFile {
  path: string;
  source: string;
}

export interface CollectPipeMetadataInput {
  root: string;
  files?: PipeSourceFile[];
}

export interface PipeMetadataResult {
  registry: CompilePipeRegistry;
  diagnostics: CompileDiagnostic[];
}

interface PipeDefinitionCandidate {
  name: string;
  sourcePath: string;
  async?: boolean;
}

interface PipePresetCandidate {
  namespace: string;
  name: string;
  pattern: string;
  sourcePath: string;
}

type DirectoryEntry = {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
};

export async function collectPipeMetadata(input: CollectPipeMetadataInput): Promise<PipeMetadataResult> {
  const files = input.files ?? await readPipeSourceFiles(input.root);
  const registry: CompilePipeRegistry = {
    pipes: [],
    presets: [],
  };

  for (const file of files) {
    const extracted = extractPipeSourceMetadata(file);
    registry.pipes.push(...extracted.pipes);
    registry.presets.push(...extracted.presets);
  }

  return {
    registry,
    diagnostics: [],
  };
}

export function extractPipeSourceMetadata(file: PipeSourceFile): {
  pipes: PipeDefinitionCandidate[];
  presets: PipePresetCandidate[];
} {
  const pipes: PipeDefinitionCandidate[] = [];
  const presets: PipePresetCandidate[] = [];
  const exportPattern = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);?/gms;
  let match: RegExpExecArray | null;

  while ((match = exportPattern.exec(file.source)) !== null) {
    const exportName = match[1] ?? '';
    const initializer = match[2] ?? '';
    const preset = readPreset(exportName, initializer, file.path);

    if (preset !== null) {
      presets.push(preset);
      continue;
    }

    const pipe = readPipe(exportName, initializer, file.path);

    if (pipe !== null) {
      pipes.push(pipe);
    }
  }

  return { pipes, presets };
}

async function readPipeSourceFiles(root: string): Promise<PipeSourceFile[]> {
  const sourceRoot = resolve(root, 'src');
  const files = await discoverPipeFiles(sourceRoot, root);
  const sources: PipeSourceFile[] = [];

  for (const filePath of files) {
    sources.push({
      path: filePath,
      source: await readFile(filePath, 'utf8'),
    });
  }

  return sources.sort((left, right) => left.path.localeCompare(right.path));
}

async function discoverPipeFiles(directory: string, root: string): Promise<string[]> {
  let entries: DirectoryEntry[];

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        files.push(...(await discoverPipeFiles(entryPath, root)));
      }

      continue;
    }

    if (entry.isFile() && entry.name.endsWith(PIPE_FILE_SUFFIX)) {
      files.push(relative(root, entryPath).split(sep).join('/').startsWith('src/') ? entryPath : resolve(root, entryPath));
    }
  }

  return files;
}

function readPreset(exportName: string, initializer: string, sourcePath: string): PipePresetCandidate | null {
  const helperMatch = /^(datePattern|numberPattern|maskPattern)\s*\(\s*(['"])(.*?)\2\s*\)/s.exec(initializer.trim());

  if (helperMatch === null) {
    return null;
  }

  return {
    namespace: toPresetNamespace(helperMatch[1] ?? ''),
    name: exportName,
    pattern: helperMatch[3] ?? '',
    sourcePath,
  };
}

function readPipe(exportName: string, initializer: string, sourcePath: string): PipeDefinitionCandidate | null {
  const trimmed = initializer.trim();

  if (!trimmed.startsWith('definePipe') && !trimmed.startsWith('enumPipe')) {
    return null;
  }

  const explicitName = /^(?:definePipe|enumPipe)\s*\(\s*(['"])(.*?)\1/s.exec(trimmed)?.[2];

  return {
    name: explicitName ?? exportName,
    sourcePath,
    async: /\basync\b/.test(trimmed),
  };
}

function toPresetNamespace(helperName: string): string {
  if (helperName === 'datePattern') {
    return 'date';
  }

  if (helperName === 'numberPattern') {
    return 'number';
  }

  return 'mask';
}
