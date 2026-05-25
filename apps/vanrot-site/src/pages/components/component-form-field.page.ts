import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentFormFieldPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.formField);
  }
}
