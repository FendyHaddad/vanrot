import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentSelectPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.select);
  }
}
