import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableCellPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableCell);
  }
}
