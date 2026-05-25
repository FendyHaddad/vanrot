import { signal, type WritableSignal } from '../reactive/signal.js';

export type SortDirection = 'asc' | 'desc';
export type RowId = string | number;

export interface TableControllerOptions<Row extends Record<string, unknown>> {
  rows: readonly Row[];
  pageSize?: number;
  getRowId?: (row: Row, index: number) => RowId;
}

export interface TableController<Row extends Record<string, unknown>> {
  rows: WritableSignal<readonly Row[]>;
  filteredRows: WritableSignal<readonly Row[]>;
  visibleRows: WritableSignal<readonly Row[]>;
  query: WritableSignal<string>;
  page: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  totalPages: WritableSignal<number>;
  sortKey: WritableSignal<keyof Row | null>;
  sortDirection: WritableSignal<SortDirection>;
  selectedIds: WritableSignal<ReadonlySet<RowId>>;
  loading: WritableSignal<boolean>;
  empty: WritableSignal<boolean>;
  setRows(rows: readonly Row[]): void;
  setFilter(query: string): void;
  sortBy(key: keyof Row): void;
  setPage(page: number): void;
  toggleRow(row: Row, index: number): void;
  clearSelection(): void;
}

export function createTableController<Row extends Record<string, unknown>>(
  options: TableControllerOptions<Row>,
): TableController<Row> {
  const getRowId = options.getRowId ?? ((_: Row, index: number) => index);
  const rows = signal<readonly Row[]>([...options.rows]);
  const filteredRows = signal<readonly Row[]>([...options.rows]);
  const visibleRows = signal<readonly Row[]>([]);
  const query = signal('');
  const page = signal(1);
  const pageSize = signal(options.pageSize ?? 10);
  const totalPages = signal(1);
  const sortKey = signal<keyof Row | null>(null);
  const sortDirection = signal<SortDirection>('asc');
  const selectedIds = signal<ReadonlySet<RowId>>(new Set());
  const loading = signal(false);
  const empty = signal(options.rows.length === 0);

  function refresh(): void {
    const normalizedQuery = query().trim().toLowerCase();
    const sorted = [...rows()].filter((row) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(normalizedQuery),
      );
    });
    const activeSortKey = sortKey();

    if (activeSortKey !== null) {
      sorted.sort((left, right) => {
        const leftValue = String(left[activeSortKey] ?? '');
        const rightValue = String(right[activeSortKey] ?? '');
        const result = leftValue.localeCompare(rightValue, undefined, { numeric: true });

        return sortDirection() === 'asc' ? result : -result;
      });
    }

    const pages = Math.max(1, Math.ceil(sorted.length / pageSize()));
    const nextPage = Math.min(page(), pages);
    const offset = (nextPage - 1) * pageSize();

    page.set(nextPage);
    totalPages.set(pages);
    filteredRows.set(sorted);
    visibleRows.set(sorted.slice(offset, offset + pageSize()));
    empty.set(sorted.length === 0 && !loading());
  }

  const controller: TableController<Row> = {
    rows,
    filteredRows,
    visibleRows,
    query,
    page,
    pageSize,
    totalPages,
    sortKey,
    sortDirection,
    selectedIds,
    loading,
    empty,
    setRows(nextRows) {
      rows.set([...nextRows]);
      page.set(1);
      refresh();
    },
    setFilter(nextQuery) {
      query.set(nextQuery);
      page.set(1);
      refresh();
    },
    sortBy(key) {
      if (sortKey() === key) {
        sortDirection.set(sortDirection() === 'asc' ? 'desc' : 'asc');
      } else {
        sortKey.set(key);
        sortDirection.set('asc');
      }

      refresh();
    },
    setPage(nextPage) {
      page.set(Math.max(1, nextPage));
      refresh();
    },
    toggleRow(row, index) {
      const nextIds = new Set(selectedIds());
      const rowId = getRowId(row, index);

      if (nextIds.has(rowId)) {
        nextIds.delete(rowId);
      } else {
        nextIds.add(rowId);
      }

      selectedIds.set(nextIds);
    },
    clearSelection() {
      selectedIds.set(new Set());
    },
  };

  refresh();

  return controller;
}

export function connectTableFilter(
  element: HTMLInputElement,
  controller: TableController<Record<string, unknown>>,
): () => void {
  const onInput = (): void => {
    controller.setFilter(element.value);
  };

  element.addEventListener('input', onInput);

  return () => {
    element.removeEventListener('input', onInput);
  };
}
