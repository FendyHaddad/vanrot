import type { CompileDiagnostic, CompilePipeRegistry } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { InterpolationBinding } from './bindings.js';
import {
  isKnownBuiltInNamespace,
  isKnownPipe,
  suggestPipeName,
  validatePipeArguments,
} from './pipe-registry.js';

export function diagnoseInterpolationPipes(
  binding: InterpolationBinding,
  templatePath: string,
  templateSource: string,
  registry: CompilePipeRegistry | undefined,
): CompileDiagnostic[] {
  if (binding.pipeExpression === null) {
    return [];
  }

  const diagnostics: CompileDiagnostic[] = [];

  for (const pipe of binding.pipeExpression.pipes) {
    if (!isKnownPipe(pipe, registry)) {
      const code = pipe.namespace.length > 0 && isKnownBuiltInNamespace(pipe.namespace)
        ? 'VR_PIPE_UNKNOWN_VARIANT'
        : 'VR_PIPE_UNKNOWN';
      const message = code === 'VR_PIPE_UNKNOWN_VARIANT'
        ? `Pipe variant "${pipe.name}" is not registered.`
        : `Pipe "${pipe.name}" is not registered. ${suggestPipeName(pipe.name)}`;

      diagnostics.push(
        createDiagnostic(code, 'error', message, templatePath, binding.expressionSpan.line, binding.expressionSpan.column, {
          source: templateSource,
          span: binding.expressionSpan,
        }),
      );
      continue;
    }

    for (const invalidArg of validatePipeArguments(pipe, binding.expressionSpan)) {
      diagnostics.push(
        createDiagnostic(invalidArg.code, 'error', invalidArg.message, templatePath, invalidArg.span.line, invalidArg.span.column, {
          source: templateSource,
          span: invalidArg.span,
        }),
      );
    }
  }

  return diagnostics;
}
