import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentSectionPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.section);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Section component docs.');
  }

  description(): string {
    const doc = this.doc();

    return `${doc.summary} ${doc.accessibility}`;
  }
}
