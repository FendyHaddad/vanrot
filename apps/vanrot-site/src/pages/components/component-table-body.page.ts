import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableBodyPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableBody);
  }
}
