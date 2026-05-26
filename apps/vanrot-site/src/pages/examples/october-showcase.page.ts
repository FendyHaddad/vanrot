import { uiPrimitive, uiPrimitiveType, type UiPrimitiveType } from '@vanrot/ui';
import { componentDocs } from '../../docs/component-docs.ts';
import { componentDocPath } from '../../docs/component-doc-paths.ts';
import { getSiteArticle, siteArticleKey, type SiteArticle } from '../../docs/site-data.ts';
import {
  setupCommandMenuPreview,
  setupOverlayPreview,
} from '../components/component-interaction-preview.widget.ts';

const octoberPrimitiveTypes = [
  uiPrimitiveType.popover,
  uiPrimitiveType.tooltip,
  uiPrimitiveType.commandMenu,
] as const;

interface OctoberPrimitiveLink {
  href: string;
  key: UiPrimitiveType;
  selector: string;
  summary: string;
  title: string;
}

// October showcase example page.
export class OctoberShowcasePage {
  constructor() {
    setupOverlayPreview();
    setupCommandMenuPreview();
  }

  article(): SiteArticle {
    return getSiteArticle(siteArticleKey.octoberShowcase);
  }

  patterns() {
    return this.article().sections;
  }

  primitives(): OctoberPrimitiveLink[] {
    return octoberPrimitiveTypes.map((primitive) => {
      const doc = componentDocs.find((candidate) => candidate.primitive === primitive);

      return {
        href: componentDocPath[primitive],
        key: primitive,
        selector: uiPrimitive[primitive].selector,
        summary: doc?.summary ?? '',
        title: doc?.title ?? uiPrimitive[primitive].selector,
      };
    });
  }
}
