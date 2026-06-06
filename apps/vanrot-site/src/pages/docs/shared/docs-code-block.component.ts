import { input } from '@vanrot/runtime';
import { tokenizeDocsCode } from './docs-code-tokenizer.ts';
import type { DocsCodeLine } from './docs-content.ts';

export class DocsCodeBlockComponent {
  title = input.default('');
  code = input.default('');

  codeLines(): readonly DocsCodeLine[] {
    return tokenizeDocsCode(this.code());
  }

  isEmpty(): boolean {
    return this.code().trim().length === 0;
  }
}
