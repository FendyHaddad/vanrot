import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentFormPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.form);
  }
}
