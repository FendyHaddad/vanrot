import {
  runtimeGraphSchemaVersion,
  type RuntimeGraphEdge,
  type RuntimeGraphEvent,
  type RuntimeGraphNode,
} from '@vanrot/devtools';

export type { RuntimeGraphEdge, RuntimeGraphEvent, RuntimeGraphNode };

export interface RuntimeGraphSessionOptions {
  enabled: boolean;
  emit: (event: RuntimeGraphEvent) => void;
}

export interface RuntimeGraphSession {
  schemaVersion: typeof runtimeGraphSchemaVersion;
  recordNode: (node: RuntimeGraphNode) => void;
  recordEdge: (edge: RuntimeGraphEdge) => void;
  dispose: (id?: string) => void;
}

export function createRuntimeGraphSession(
  options: RuntimeGraphSessionOptions,
): RuntimeGraphSession {
  return {
    schemaVersion: runtimeGraphSchemaVersion,
    recordNode(node) {
      if (!options.enabled) {
        return;
      }

      options.emit({ type: 'node', node });
    },
    recordEdge(edge) {
      if (!options.enabled) {
        return;
      }

      options.emit({ type: 'edge', edge });
    },
    dispose(id = 'runtime-session') {
      if (!options.enabled) {
        return;
      }

      options.emit({ type: 'dispose', id });
    },
  };
}
