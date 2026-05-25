import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentTextareaPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.textarea);
  }
}
