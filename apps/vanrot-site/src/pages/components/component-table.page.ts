import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTablePage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.table);
  }
}
