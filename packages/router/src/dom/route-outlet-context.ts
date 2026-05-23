const outletDepthStack: number[] = [];

export function readCurrentOutletDepth(): number {
  return outletDepthStack[outletDepthStack.length - 1] ?? -1;
}

export function runWithOutletDepth<T>(depth: number, callback: () => T): T {
  outletDepthStack.push(depth);

  try {
    return callback();
  } finally {
    outletDepthStack.pop();
  }
}
