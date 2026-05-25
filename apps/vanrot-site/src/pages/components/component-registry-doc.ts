import { getUiComponentRegistryItem, uiPrimitive, type UiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentRegistryDocPage {
  constructor(private readonly primitive: UiPrimitiveType) {}

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === this.primitive);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error(`Vanrot site requires component docs for ${this.primitive}.`);
  }

  selector(): string {
    return uiPrimitive[this.primitive].selector;
  }

  docsPath(): string {
    return getUiComponentRegistryItem(this.primitive)?.docsPath ?? this.doc().href;
  }
}
