import { input } from '@vanrot/runtime';

export class DocsPointsListComponent {
  points = input.default<readonly string[]>([]);
}
