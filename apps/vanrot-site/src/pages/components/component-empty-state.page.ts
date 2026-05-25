import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentEmptyStatePage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.emptyState);
  }
}
