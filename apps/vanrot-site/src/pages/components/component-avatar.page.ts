import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentAvatarPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.avatar);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Avatar component docs.');
  }
}
