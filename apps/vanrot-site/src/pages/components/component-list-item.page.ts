import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentListItemPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.listItem);
  }
}
