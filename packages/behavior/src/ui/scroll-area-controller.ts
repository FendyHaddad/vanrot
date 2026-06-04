import { signal, type WritableSignal } from '@vanrot/runtime';

export interface ScrollAreaControllerOptions {
  viewportSize: number;
  contentSize: number;
  offset?: number;
  orientation?: 'horizontal' | 'vertical';
}

export interface ScrollAreaController {
  readonly viewportSize: WritableSignal<number>;
  readonly contentSize: WritableSignal<number>;
  readonly offset: WritableSignal<number>;
  readonly orientation: WritableSignal<'horizontal' | 'vertical'>;
  readonly atStart: WritableSignal<boolean>;
  readonly atEnd: WritableSignal<boolean>;
  update(options: Partial<ScrollAreaControllerOptions>): void;
}

export function createScrollAreaController(
  options: ScrollAreaControllerOptions,
): ScrollAreaController {
  const viewportSize = signal(options.viewportSize);
  const contentSize = signal(options.contentSize);
  const offset = signal(options.offset ?? 0);
  const orientation = signal(options.orientation ?? 'vertical');
  const atStart = signal(false);
  const atEnd = signal(false);

  function refresh(): void {
    atStart.set(offset() <= 0);
    atEnd.set(offset() + viewportSize() >= contentSize());
  }

  const controller: ScrollAreaController = {
    viewportSize,
    contentSize,
    offset,
    orientation,
    atStart,
    atEnd,
    update(nextOptions) {
      if (nextOptions.viewportSize !== undefined) {
        viewportSize.set(nextOptions.viewportSize);
      }
      if (nextOptions.contentSize !== undefined) {
        contentSize.set(nextOptions.contentSize);
      }
      if (nextOptions.offset !== undefined) {
        offset.set(nextOptions.offset);
      }
      if (nextOptions.orientation !== undefined) {
        orientation.set(nextOptions.orientation);
      }
      refresh();
    },
  };

  refresh();

  return controller;
}
