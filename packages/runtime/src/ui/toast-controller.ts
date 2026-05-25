import { signal, type WritableSignal } from '../reactive/signal.js';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger';

export interface ToastMessageInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  timeoutMs?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface ToastControllerOptions {
  defaultTimeoutMs?: number;
  createId?: () => string;
}

export interface ToastController {
  readonly toasts: WritableSignal<readonly ToastMessage[]>;
  enqueue(input: ToastMessageInput): ToastMessage;
  dismiss(id: string): void;
  clear(): void;
}

let nextToastId = 0;

export function createToastController(options: ToastControllerOptions = {}): ToastController {
  const toasts = signal<readonly ToastMessage[]>([]);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const defaultTimeoutMs = options.defaultTimeoutMs === undefined ? 4000 : options.defaultTimeoutMs;

  function createId(): string {
    if (options.createId !== undefined) {
      return options.createId();
    }

    nextToastId += 1;
    return `toast-${nextToastId}`;
  }

  function dismiss(id: string): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }

    toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  function enqueue(input: ToastMessageInput): ToastMessage {
    const toast: ToastMessage = {
      id: createId(),
      title: input.title,
      tone: input.tone === undefined ? 'default' : input.tone,
    };

    if (input.description !== undefined) {
      toast.description = input.description;
    }

    toasts.update((current) => [...current, toast]);

    const timeoutMs = input.timeoutMs === undefined ? defaultTimeoutMs : input.timeoutMs;
    if (timeoutMs > 0) {
      timers.set(toast.id, setTimeout(() => dismiss(toast.id), timeoutMs));
    }

    return toast;
  }

  return {
    toasts,
    enqueue,
    dismiss,
    clear() {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }

      timers.clear();
      toasts.set([]);
    },
  };
}
