import { signal, type WritableSignal } from '@vanrot/runtime';

export interface DragDropController<T> {
  readonly items: WritableSignal<readonly T[]>;
  readonly activeId: WritableSignal<T | null>;
  readonly overId: WritableSignal<T | null>;
  startDrag(id: T): void;
  enterDrop(id: T): void;
  drop(): readonly T[];
  cancel(): void;
}

export function createDragDropController<T>(options: {
  items: readonly T[];
}): DragDropController<T> {
  const items = signal<readonly T[]>([...options.items]);
  const activeId = signal<T | null>(null);
  const overId = signal<T | null>(null);

  return {
    items,
    activeId,
    overId,
    startDrag(id) {
      if (items().includes(id)) {
        activeId.set(id);
      }
    },
    enterDrop(id) {
      if (items().includes(id)) {
        overId.set(id);
      }
    },
    drop() {
      const active = activeId();
      const over = overId();
      if (active === null || over === null) {
        return items();
      }

      const source = items();
      const nextItems = reorderItems(source, source.indexOf(active), source.indexOf(over));
      items.set(nextItems);
      activeId.set(null);
      overId.set(null);
      return nextItems;
    },
    cancel() {
      activeId.set(null);
      overId.set(null);
    },
  };
}

export function reorderItems<T>(items: readonly T[], fromIndex: number, toIndex: number): readonly T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  if (item === undefined) {
    return nextItems;
  }

  nextItems.splice(toIndex, 0, item);
  return nextItems;
}
