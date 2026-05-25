import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableRowPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableRow);
  }
}
