import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTableHeadPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tableHead);
  }
}
