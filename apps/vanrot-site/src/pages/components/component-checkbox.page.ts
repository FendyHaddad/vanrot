import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentCheckboxPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.checkbox);
  }
}
