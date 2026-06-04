import { signal, type WritableSignal } from '@vanrot/runtime';

export interface TableResizeColumn {
  id: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TableResizeController {
  readonly widths: WritableSignal<Record<string, number>>;
  readonly resizingColumn: WritableSignal<string | null>;
  startResize(columnId: string, pointerPosition: number): void;
  updateResize(pointerPosition: number): void;
  endResize(): void;
  setColumnWidth(columnId: string, width: number): void;
  getWidth(columnId: string): number | undefined;
}

export function createTableResizeController(options: {
  columns: readonly TableResizeColumn[];
}): TableResizeController {
  const columnMap = new Map(options.columns.map((column) => [column.id, column]));
  const widths = signal<Record<string, number>>(
    Object.fromEntries(options.columns.map((column) => [column.id, column.width])),
  );
  const resizingColumn = signal<string | null>(null);
  let startPointer = 0;
  let startWidth = 0;

  function setColumnWidth(columnId: string, width: number): void {
    const column = columnMap.get(columnId);
    if (column === undefined) {
      return;
    }

    widths.set({
      ...widths(),
      [columnId]: clamp(width, column.minWidth, column.maxWidth),
    });
  }

  return {
    widths,
    resizingColumn,
    startResize(columnId, pointerPosition) {
      const width = widths()[columnId];
      if (width === undefined) {
        return;
      }

      resizingColumn.set(columnId);
      startPointer = pointerPosition;
      startWidth = width;
    },
    updateResize(pointerPosition) {
      const columnId = resizingColumn();
      if (columnId === null) {
        return;
      }

      setColumnWidth(columnId, startWidth + pointerPosition - startPointer);
    },
    endResize() {
      resizingColumn.set(null);
    },
    setColumnWidth,
    getWidth(columnId) {
      return widths()[columnId];
    },
  };
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  const minWidth = min ?? 40;
  const maxWidth = max ?? Number.POSITIVE_INFINITY;
  return Math.min(maxWidth, Math.max(minWidth, value));
}
