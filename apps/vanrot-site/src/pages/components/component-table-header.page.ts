import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableHeaderPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableHeader);
  }
}
