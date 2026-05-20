import { registerCleanup } from './cleanup-scope.js';
import type { Dispose } from '../reactive/types.js';

export function onDestroy(fn: Dispose): void {
  registerCleanup(fn);
}
