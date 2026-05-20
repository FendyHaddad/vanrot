import { registerCleanup } from '../lifecycle/cleanup-scope.js';

export function listen(
  target: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean,
): () => void {
  let listening = true;

  target.addEventListener(type, handler, options);

  const dispose = (): void => {
    if (!listening) {
      return;
    }

    listening = false;
    target.removeEventListener(type, handler, options);
  };

  registerCleanup(dispose);

  return dispose;
}
