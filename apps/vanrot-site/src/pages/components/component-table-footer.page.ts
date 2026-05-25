import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableFooterPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableFooter);
  }
}
