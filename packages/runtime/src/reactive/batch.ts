import { beginBatch, endBatch } from './graph.js';

export function batch<T>(run: () => T): T {
  beginBatch();

  try {
    return run();
  } finally {
    endBatch();
  }
}
