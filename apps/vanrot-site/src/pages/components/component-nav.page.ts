import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentNavPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.nav);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Navigation component docs.');
  }

  description(): string {
    const doc = this.doc();

    return `${doc.summary} ${doc.accessibility}`;
  }
}
