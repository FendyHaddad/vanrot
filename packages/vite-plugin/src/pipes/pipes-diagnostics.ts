import type { CompileDiagnostic, CompilePipePreset } from '@vanrot/compiler';

export interface PipeDiagnosticMetadata {
  registry: {
    pipes: Array<{ name: string; sourcePath: string; async?: boolean }>;
    presets: CompilePipePreset[];
  };
  usages: Array<{ name: string; templatePath: string; line: number; column: number }>;
}

export function diagnosePipeMetadata(metadata: PipeDiagnosticMetadata): CompileDiagnostic[] {
  return [
    ...diagnoseDuplicatePipes(metadata.registry.pipes),
    ...diagnoseDuplicatePresets(metadata.registry.presets),
    ...diagnoseAsyncPipes(metadata.registry.pipes),
  ];
}

export function formatVitePipeDiagnostic(diagnostic: CompileDiagnostic): string {
  return `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column} ${diagnostic.code} ${diagnostic.message}`;
}

function diagnoseDuplicatePipes(
  pipes: Array<{ name: string; sourcePath: string }>,
): CompileDiagnostic[] {
  const seen = new Map<string, string>();
  const diagnostics: CompileDiagnostic[] = [];

  for (const pipe of pipes) {
    const firstPath = seen.get(pipe.name);

    if (firstPath === undefined) {
      seen.set(pipe.name, pipe.sourcePath);
      continue;
    }

    diagnostics.push(createPipeDiagnostic(
      'VR_PIPE_DUPLICATE_NAME',
      `Duplicate pipe "${pipe.name}" found in ${firstPath} and ${pipe.sourcePath}.`,
      pipe.sourcePath,
    ));
  }

  return diagnostics;
}

function diagnoseDuplicatePresets(presets: CompilePipePreset[]): CompileDiagnostic[] {
  const seen = new Map<string, string>();
  const diagnostics: CompileDiagnostic[] = [];

  for (const preset of presets) {
    const key = `${preset.namespace}.${preset.name}`;
    const firstPath = seen.get(key);

    if (firstPath === undefined) {
      seen.set(key, preset.sourcePath);
      continue;
    }

    diagnostics.push(createPipeDiagnostic(
      'VR_PIPE_DUPLICATE_PRESET',
      `Duplicate pipe preset "${key}" found in ${firstPath} and ${preset.sourcePath}.`,
      preset.sourcePath,
    ));
  }

  return diagnostics;
}

function diagnoseAsyncPipes(
  pipes: Array<{ name: string; sourcePath: string; async?: boolean }>,
): CompileDiagnostic[] {
  return pipes
    .filter((pipe) => pipe.async === true)
    .map((pipe) =>
      createPipeDiagnostic(
        'VR_PIPE_ASYNC',
        `Pipe "${pipe.name}" is async. Template pipes must be pure and synchronous.`,
        pipe.sourcePath,
      ),
    );
}

function createPipeDiagnostic(code: CompileDiagnostic['code'], message: string, filePath: string): CompileDiagnostic {
  return {
    code,
    severity: 'error',
    message,
    filePath,
    line: 1,
    column: 1,
    endLine: 1,
    endColumn: 1,
    sourceText: '',
    codeFrame: '',
    suggestion: '',
    docsPath: '/docs/formatters',
  };
}
