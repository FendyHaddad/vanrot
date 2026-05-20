import { registerMountCallback } from './cleanup-scope.js';
import type { Dispose } from '../reactive/types.js';

export function onMount(fn: () => void | Dispose): void {
  registerMountCallback(fn);
}
