import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentSrcPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.src);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Source component docs.');
  }

  description(): string {
    const doc = this.doc();

    return `${doc.summary} ${doc.accessibility}`;
  }
}
