import { describe, expect, it } from 'vitest';
import { createTableController } from '../../src/ui/table-controller.js';

interface InvoiceRow {
  id: string;
  status: string;
  amount: number;
}

const rows: readonly InvoiceRow[] = [
  { id: 'a', status: 'Paid', amount: 250 },
  { id: 'b', status: 'Open', amount: 120 },
  { id: 'c', status: 'Void', amount: 70 },
];

describe('createTableController', () => {
  it('filters, sorts, paginates, and reports empty state', () => {
    const table = createTableController<InvoiceRow>({ rows, pageSize: 2 });

    expect(table.visibleRows().map((row) => row.id)).toEqual(['a', 'b']);
    expect(table.totalPages()).toBe(2);

    table.setFilter('open');

    expect(table.filteredRows().map((row) => row.id)).toEqual(['b']);
    expect(table.empty()).toBe(false);

    table.setFilter('missing');

    expect(table.visibleRows()).toEqual([]);
    expect(table.empty()).toBe(true);

    table.setFilter('');
    table.sortBy('amount');

    expect(table.visibleRows().map((row) => row.id)).toEqual(['c', 'b']);

    table.sortBy('amount');

    expect(table.visibleRows().map((row) => row.id)).toEqual(['a', 'b']);
  });

  it('tracks row selection by app-owned row id', () => {
    const table = createTableController<InvoiceRow>({
      rows,
      getRowId: (row) => row.id,
    });

    table.toggleRow(rows[0], 0);
    expect([...table.selectedIds()]).toEqual(['a']);

    table.toggleRow(rows[0], 0);
    expect([...table.selectedIds()]).toEqual([]);
  });
});
