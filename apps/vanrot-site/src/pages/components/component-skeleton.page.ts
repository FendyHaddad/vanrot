import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentSkeletonPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.skeleton);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Skeleton component docs.');
  }
}
