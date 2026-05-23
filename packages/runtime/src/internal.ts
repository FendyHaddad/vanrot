// Internal APIs are compiler-facing and are not covered by public semver.

export type { CleanupScope } from './lifecycle/cleanup-scope.js';
export {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  registerCleanup,
  registerMountCallback,
  runWithCleanupScope,
  runWithoutCleanupScope,
} from './lifecycle/cleanup-scope.js';

export { listen } from './events/listen.js';
