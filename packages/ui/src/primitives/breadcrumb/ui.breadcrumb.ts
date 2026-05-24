import { signal } from '@vanrot/runtime';

const breadcrumbCopy = {
  label: 'Breadcrumb',
} as const;

export class UiBreadcrumb {
  label = signal(breadcrumbCopy.label);
}
