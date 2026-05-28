export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let handle: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    if (handle !== null) clearTimeout(handle);

    handle = setTimeout(() => {
      handle = null;
      fn(...args);
    }, delayMs);
  };
}
