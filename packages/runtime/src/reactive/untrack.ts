import { setActiveEffect } from './graph.js';

export function untrack<T>(read: () => T): T {
  const previousEffect = setActiveEffect(null);

  try {
    return read();
  } finally {
    setActiveEffect(previousEffect);
  }
}
