import { signal, type WritableSignal } from '../reactive/signal.js';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface OverlayControllerOptions {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsidePointer?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface OverlayController {
  readonly open: WritableSignal<boolean>;
  registerTrigger(trigger: HTMLElement): () => void;
  registerContent(content: HTMLElement): () => void;
  openOverlay(): void;
  closeOverlay(): void;
  toggleOverlay(): void;
  dispose(): void;
}

export function createOverlayController(options: OverlayControllerOptions = {}): OverlayController {
  const open = signal(options.initialOpen === undefined ? false : options.initialOpen);
  const closeOnEscape = options.closeOnEscape === undefined ? true : options.closeOnEscape;
  const closeOnOutsidePointer =
    options.closeOnOutsidePointer === undefined ? true : options.closeOnOutsidePointer;
  const triggers = new Set<HTMLElement>();
  const contents = new Set<HTMLElement>();
  const disposers = new Set<() => void>();
  let restoreFocusElement: HTMLElement | null = null;

  function notify(nextOpen: boolean): void {
    open.set(nextOpen);

    if (options.onOpenChange === undefined) {
      return;
    }

    options.onOpenChange(nextOpen);
  }

  function openOverlay(): void {
    if (open()) {
      return;
    }

    restoreFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    notify(true);
    focusFirstContentElement(contents);
  }

  function closeOverlay(): void {
    if (!open()) {
      return;
    }

    notify(false);

    if (restoreFocusElement === null) {
      return;
    }

    restoreFocusElement.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!closeOnEscape || event.key !== 'Escape') {
      return;
    }

    closeOverlay();
  }

  function handlePointerdown(event: PointerEvent): void {
    if (!closeOnOutsidePointer || !open()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    for (const content of contents) {
      if (content.contains(target)) {
        return;
      }
    }

    closeOverlay();
  }

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown);
  disposers.add(() => document.removeEventListener('keydown', handleKeydown));
  disposers.add(() => document.removeEventListener('pointerdown', handlePointerdown));

  return {
    open,
    registerTrigger(trigger) {
      triggers.add(trigger);
      const disposeClick = register(trigger, 'click', () => openOverlay());
      disposers.add(disposeClick);

      return () => {
        triggers.delete(trigger);
        disposers.delete(disposeClick);
        disposeClick();
      };
    },
    registerContent(content) {
      contents.add(content);

      return () => {
        contents.delete(content);
      };
    },
    openOverlay,
    closeOverlay,
    toggleOverlay() {
      if (open()) {
        closeOverlay();
        return;
      }

      openOverlay();
    },
    dispose() {
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      triggers.clear();
      contents.clear();
    },
  };
}

function focusFirstContentElement(contents: ReadonlySet<HTMLElement>): void {
  const [content] = contents;
  if (content === undefined) {
    return;
  }

  const focusable = content.querySelector<HTMLElement>(focusableSelector);
  if (focusable !== null) {
    focusable.focus();
    return;
  }

  content.focus();
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
