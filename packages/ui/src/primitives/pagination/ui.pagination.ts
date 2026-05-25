import { signal } from '@vanrot/runtime';

const paginationCopy = {
  label: 'Pagination',
} as const;

export class UiPagination {
  label = signal(paginationCopy.label);
}
