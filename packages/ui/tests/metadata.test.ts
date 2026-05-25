import { describe, expect, it } from 'vitest';
import {
  defaultUiPrefix,
  phase16FormsDataPrimitiveOrder,
  phase16InteractionPrimitiveOrder,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiComponentPhase,
  uiComponentRegistry,
  uiDensityToken,
  uiFlavor,
  uiInputTypeToken,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveTokenGroup,
  uiPrimitiveType,
  uiPrimitiveVariant,
  uiStyleMode,
} from '../src/index.js';

const phase16CorePrimitiveOrder = [
  uiPrimitiveType.button,
  uiPrimitiveType.card,
  uiPrimitiveType.badge,
  uiPrimitiveType.avatar,
  uiPrimitiveType.alert,
  uiPrimitiveType.loader,
  uiPrimitiveType.skeleton,
  uiPrimitiveType.separator,
] as const;

const phase16LayoutNavigationMediaPrimitiveOrder = [
  uiPrimitiveType.layout,
  uiPrimitiveType.container,
  uiPrimitiveType.section,
  uiPrimitiveType.grid,
  uiPrimitiveType.stack,
  uiPrimitiveType.header,
  uiPrimitiveType.footer,
  uiPrimitiveType.sidebar,
  uiPrimitiveType.nav,
  uiPrimitiveType.breadcrumb,
  uiPrimitiveType.img,
  uiPrimitiveType.src,
] as const;

describe('@vanrot/ui metadata', () => {
  it('exports October flavor and style mode metadata', () => {
    expect(uiFlavor.october).toBe('october');
    expect(uiStyleMode.vanrotstyles).toBe('vanrotstyles');
    expect(uiStyleMode.tailwind).toBe('tailwind');
    expect(uiStyleMode.none).toBe('none');
    expect(uiPackageInventory.name).toBe('@vanrot/ui');
    expect(uiPackageInventory.flavor).toBe(uiFlavor.october);
    expect(uiPackageInventory.stylesheet).toBe('vanrotstyles.css');
  });

  it('exports the updated Phase 16 slice map', () => {
    expect(uiComponentPhase.foundation).toBe('16A');
    expect(uiComponentPhase.core).toBe('16B');
    expect(uiComponentPhase.site).toBe('16C');
    expect(uiComponentPhase.layoutNavigationMedia).toBe('16D');
    expect(uiComponentPhase.formsData).toBe('16E');
    expect(uiComponentPhase.overlaysInteraction).toBe('16F');
  });

  it('exports the Phase 9 button primitive metadata', () => {
    expect(defaultUiPrefix).toBe('ui');
    expect(uiPrimitiveType.button).toBe('button');
    expect(uiPrimitive.button.type).toBe(uiPrimitiveType.button);
    expect(uiPrimitive.button.directory).toBe('src/ui/button');
    expect(uiPrimitive.button.role).toBe('button');
    expect(uiPrimitive.button.defaultFiles).toEqual([
      'ui.button.ts',
      'ui.button.html',
      'ui.button.css',
    ]);
  });

  it('exports the Phase 16B core primitive order', () => {
    expect(uiPrimitiveOrder.slice(0, phase16CorePrimitiveOrder.length)).toEqual([
      ...phase16CorePrimitiveOrder,
    ]);
  });

  it('exports the Phase 16D layout, navigation, and media primitive order', () => {
    const layoutStart = phase16CorePrimitiveOrder.length;
    const layoutEnd = layoutStart + phase16LayoutNavigationMediaPrimitiveOrder.length;

    expect(uiPrimitiveOrder.slice(layoutStart, layoutEnd)).toEqual([
      ...phase16LayoutNavigationMediaPrimitiveOrder,
    ]);
  });

  it('exports the Phase 16E forms and data primitive order', () => {
    const formsDataStart =
      phase16CorePrimitiveOrder.length + phase16LayoutNavigationMediaPrimitiveOrder.length;
    const formsDataEnd = formsDataStart + phase16FormsDataPrimitiveOrder.length;

    expect(uiPrimitiveOrder.slice(formsDataStart, formsDataEnd)).toEqual([
      ...phase16FormsDataPrimitiveOrder,
    ]);
  });

  it('exports the Phase 16F interaction primitive order', () => {
    expect(phase16InteractionPrimitiveOrder).toEqual([
      'dialog',
      'drawer',
      'dropdown',
      'tabs',
      'toast',
    ]);

    expect(uiPrimitiveOrder).toEqual(expect.arrayContaining(phase16InteractionPrimitiveOrder));
  });

  it('exports source-of-truth variants for Phase 16B primitives', () => {
    expect(uiPrimitiveVariant.button).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'danger',
      'link',
    ]);
    expect(uiPrimitiveVariant.card).toEqual(['default', 'muted', 'interactive']);
    expect(uiPrimitiveVariant.badge).toEqual([
      'default',
      'secondary',
      'success',
      'warning',
      'danger',
      'outline',
    ]);
    expect(uiPrimitiveVariant.avatar).toEqual(['default', 'soft', 'outline']);
    expect(uiPrimitiveVariant.alert).toEqual(['info', 'success', 'warning', 'danger']);
    expect(uiPrimitiveVariant.loader).toEqual(['spinner', 'dots', 'bar']);
    expect(uiPrimitiveVariant.skeleton).toEqual(['text', 'avatar', 'card', 'block']);
    expect(uiPrimitiveVariant.separator).toEqual(['horizontal', 'vertical']);
  });

  it('exports dotted token groups for Phase 16B and Phase 16D primitives', () => {
    expect(uiPrimitiveTokenGroup.button.variant.tokens).toEqual(uiPrimitiveVariant.button);
    expect(uiPrimitiveTokenGroup.badge.tone.tokens).toEqual(uiPrimitiveVariant.badge);
    expect(uiPrimitiveTokenGroup.alert.tone.tokens).toEqual(uiPrimitiveVariant.alert);
    expect(uiPrimitiveTokenGroup.separator.orientation.tokens).toEqual(
      uiPrimitiveVariant.separator,
    );
    expect(uiPrimitiveTokenGroup.container.size.tokens).toEqual(['sm', 'md', 'lg', 'xl']);
    expect(uiPrimitiveTokenGroup.section.spacing.tokens).toEqual(['sm', 'md', 'lg']);
    expect(uiPrimitiveTokenGroup.grid.cols.tokens).toEqual(['1', '2', '3', '4', '6', '12']);
    expect(uiPrimitiveTokenGroup.grid.gap.tokens).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '8',
    ]);
    expect(uiPrimitiveTokenGroup.stack.gap.tokens).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '8',
    ]);
    expect(uiPrimitiveTokenGroup.sidebar.placement.tokens).toEqual(['left', 'right']);
    expect(uiPrimitiveTokenGroup.grid.cols.classByToken['3']).toBe('vr-grid-cols-3');
    expect(uiPrimitiveTokenGroup.stack.gap.classByToken['3']).toBe('vr-stack-gap-3');
  });

  it('exports app-owned style file paths', () => {
    expect(uiAppFile.tokens).toBe('src/styles/vanrot-tokens.css');
    expect(uiAppFile.vanrotstyles).toBe('src/styles/vanrotstyles.css');
    expect(uiAppFile.styleEntry).toBe('src/styles/vanrot-ui.css');
    expect(uiAppFile.vanrotstylesImport).toBe("import './styles/vanrotstyles.css';");
    expect(uiAppFile.styleEntryImport).toBe("import './styles/vanrot-ui.css';");
    expect(uiAppFile.tokenImport).toBe("import './styles/vanrot-tokens.css';");
  });

  it('exports the Phase 16B component catalog shape', () => {
    for (const primitive of phase16CorePrimitiveOrder) {
      expect(uiPrimitive[primitive].type).toBe(primitive);
      expect(uiPrimitive[primitive].selector).toBe(`vr-${primitive}`);
      expect(uiPrimitive[primitive].directory).toBe(`src/ui/${primitive}`);
      expect(uiPrimitive[primitive].productionPhase).toBe('16B');
      expect(uiPrimitive[primitive].variants).toEqual(uiPrimitiveVariant[primitive]);
      expect(uiComponentCatalog[primitive].selector).toBe(`vr-${primitive}`);
      expect(uiComponentCatalog[primitive].productionPhase).toBe('16B');
    }

    expect(uiPrimitive.button.introducedPhase).toBe('16A');
    expect(uiPrimitive.card.nativeTag).toBe('article');
    expect(uiPrimitive.separator.nativeTag).toBe('hr');
  });

  it('exports the Phase 16D component catalog shape', () => {
    for (const primitive of phase16LayoutNavigationMediaPrimitiveOrder) {
      expect(uiPrimitive[primitive].type).toBe(primitive);
      expect(uiPrimitive[primitive].selector).toBe(`vr-${primitive}`);
      expect(uiPrimitive[primitive].directory).toBe(`src/ui/${primitive}`);
      expect(uiPrimitive[primitive].productionPhase).toBe('16D');
      expect(uiComponentCatalog[primitive].selector).toBe(`vr-${primitive}`);
      expect(uiComponentCatalog[primitive].productionPhase).toBe('16D');
    }

    expect(uiPrimitive.header.nativeTag).toBe('header');
    expect(uiPrimitive.sidebar.nativeTag).toBe('aside');
    expect(uiPrimitive.breadcrumb.nativeTag).toBe('nav');
    expect(uiPrimitive.src.nativeTag).toBe('source');
  });

  it('exports the Phase 16E forms and data component catalog shape', () => {
    for (const primitive of phase16FormsDataPrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const registryItem = uiComponentRegistry[primitive];

      expect(metadata.type).toBe(primitive);
      expect(metadata.selector).toBe(registryItem.selector);
      expect(metadata.directory).toBe(`src/ui/${primitive.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`);
      expect(metadata.productionPhase).toBe('16E');
      expect(metadata.nativeTag).toBe(registryItem.nativeTag);
      expect(metadata.docsPath).toBe(registryItem.docsPath);
      expect(uiComponentCatalog[primitive].selector).toBe(registryItem.selector);
    }

    expect(uiPrimitive.form.nativeTag).toBe('form');
    expect(uiPrimitive.input.nativeTag).toBe('input');
    expect(uiPrimitive.table.nativeTag).toBe('table');
    expect(uiPrimitive.tableHead.nativeTag).toBe('th');
    expect(uiPrimitive.emptyState.nativeTag).toBe('section');
  });

  it('exports rich token scales and registry data for Phase 16E', () => {
    expect(uiInputTypeToken).toEqual(['text', 'email', 'password', 'number', 'search', 'tel', 'url']);
    expect(uiDensityToken).toEqual(['comfortable', 'compact', 'dense']);
    expect(uiComponentRegistry.input.tokens.type.tokens).toEqual(uiInputTypeToken);
    expect(uiComponentRegistry.input.tokens.size.tokens).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(uiComponentRegistry.input.booleans.map((attribute) => attribute.name)).toEqual([
      'required',
      'disabled',
      'readonly',
      'invalid',
    ]);
    expect(uiComponentRegistry.input.openAttributes.map((attribute) => attribute.name)).toContain(
      'placeholder',
    );
    expect(uiComponentRegistry.table.tokens.density.tokens).toEqual(uiDensityToken);
    expect(uiComponentRegistry.table.booleans.map((attribute) => attribute.name)).toEqual([
      'sortable',
      'filterable',
      'paginated',
      'selectable',
      'loading',
    ]);
    expect(uiComponentRegistry.table.examples[0]?.code).toContain('density.compact');
  });

  it('exports rich registry data for Phase 16F interaction primitives', () => {
    expect(uiComponentRegistry.dialog).toMatchObject({
      selector: 'vr-dialog',
      nativeTag: 'div',
      category: 'interaction',
      phase: '16F',
      docsPath: '/docs/components/dialogs',
    });
    expect(uiComponentRegistry.dialog.tokens.size.tokens).toEqual(['sm', 'md', 'lg']);
    expect(uiComponentRegistry.dialog.tokens.motion.tokens).toEqual(['instant', 'subtle']);
    expect(uiComponentRegistry.dialog.anatomy.map((part) => part.selector)).toEqual([
      'vr-dialog-trigger',
      'vr-dialog-content',
      'vr-dialog-header',
      'vr-dialog-title',
      'vr-dialog-description',
      'vr-dialog-footer',
      'vr-dialog-close',
    ]);

    expect(uiComponentRegistry.drawer.tokens.side.tokens).toEqual(['left', 'right', 'top', 'bottom']);
    expect(uiComponentRegistry.dropdown.tokens.align.tokens).toEqual(['start', 'center', 'end']);
    expect(uiComponentRegistry.tabs.tokens.orientation.tokens).toEqual(['horizontal', 'vertical']);
    expect(uiComponentRegistry.toast.tokens.tone.tokens).toEqual([
      'default',
      'success',
      'warning',
      'danger',
    ]);
    expect(uiComponentRegistry.toast.tokens.placement.tokens).toEqual([
      'topright',
      'topleft',
      'bottomright',
      'bottomleft',
    ]);
  });

  it('derives Phase 16E compatibility token groups from the rich registry', () => {
    expect(uiPrimitiveTokenGroup.input.type.tokens).toEqual(uiInputTypeToken);
    expect(uiPrimitiveTokenGroup.input.size.classByToken.lg).toBe('vr-input-size-lg');
    expect(uiPrimitiveTokenGroup.input.tone.classByToken.danger).toBe('vr-input-tone-danger');
    expect(uiPrimitiveTokenGroup.table.density.classByToken.compact).toBe(
      'vr-table-density-compact',
    );
    expect(uiPrimitiveTokenGroup.pagination.variant.classByToken.numbers).toBe(
      'vr-pagination-numbers',
    );
    expect(uiPrimitiveTokenGroup.stat.align.classByToken.right).toBe('vr-stat-align-right');
  });

  it('exports file-backed package asset URLs', () => {
    expect(uiAssetUrl.tokens.href).toContain('/src/tokens/vanrot-tokens.css');

    for (const primitive of uiPrimitiveOrder) {
      const primitiveFileName = primitive.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

      expect(uiAssetUrl[primitive].typescript.href).toContain(
        `/src/primitives/${primitiveFileName}/ui.${primitiveFileName}.ts`,
      );
      expect(uiAssetUrl[primitive].html.href).toContain(
        `/src/primitives/${primitiveFileName}/ui.${primitiveFileName}.html`,
      );
      expect(uiAssetUrl[primitive].css.href).toContain(
        `/src/primitives/${primitiveFileName}/ui.${primitiveFileName}.css`,
      );
      expect(uiAssetUrl[primitive].test.href).toContain(
        `/src/primitives/${primitiveFileName}/ui.${primitiveFileName}.test.ts`,
      );
      expect(uiAssetUrl[primitive].homeUsage.href).toContain(
        `/src/primitives/${primitiveFileName}/usage.home.html`,
      );
    }
  });

  it('exports file-backed documentation and style asset URLs', () => {
    expect(uiAssetUrl.vanrotstyles.href).toContain('/src/styles/vanrotstyles.css');
    expect(uiAssetUrl.docs.packageInventory.href).toContain('/src/docs/package-inventory.md');
    expect(uiAssetUrl.docs.guidelines.href).toContain('/src/docs/guidelines.md');
  });
});
