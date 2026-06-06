import { input } from '@vanrot/runtime';
import type { DocsSectionLink } from './docs-content.ts';

export class DocsArticleShellComponent {
  title = input.default('');
  summary = input.default('');
  sectionLinks = input.default<readonly DocsSectionLink[]>([]);
}
