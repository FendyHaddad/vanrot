import { describe, expect, it } from 'vitest';
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveType,
  uiPrimitiveVariant,
  uiStyleMode,
} from '../src/index.js';

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
    expect(uiPrimitiveOrder).toEqual([
      uiPrimitiveType.button,
      uiPrimitiveType.card,
      uiPrimitiveType.badge,
      uiPrimitiveType.avatar,
      uiPrimitiveType.alert,
      uiPrimitiveType.loader,
      uiPrimitiveType.skeleton,
      uiPrimitiveType.separator,
    ]);
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

  it('exports app-owned style file paths', () => {
    expect(uiAppFile.tokens).toBe('src/styles/vanrot-tokens.css');
    expect(uiAppFile.vanrotstyles).toBe('src/styles/vanrotstyles.css');
    expect(uiAppFile.styleEntry).toBe('src/styles/vanrot-ui.css');
    expect(uiAppFile.vanrotstylesImport).toBe("import './styles/vanrotstyles.css';");
    expect(uiAppFile.styleEntryImport).toBe("import './styles/vanrot-ui.css';");
    expect(uiAppFile.tokenImport).toBe("import './styles/vanrot-tokens.css';");
  });

  it('exports the Phase 16B component catalog shape', () => {
    for (const primitive of uiPrimitiveOrder) {
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

  it('exports file-backed package asset URLs', () => {
    expect(uiAssetUrl.tokens.href).toContain('/src/tokens/vanrot-tokens.css');

    for (const primitive of uiPrimitiveOrder) {
      expect(uiAssetUrl[primitive].typescript.href).toContain(
        `/src/primitives/${primitive}/ui.${primitive}.ts`,
      );
      expect(uiAssetUrl[primitive].html.href).toContain(
        `/src/primitives/${primitive}/ui.${primitive}.html`,
      );
      expect(uiAssetUrl[primitive].css.href).toContain(
        `/src/primitives/${primitive}/ui.${primitive}.css`,
      );
      expect(uiAssetUrl[primitive].test.href).toContain(
        `/src/primitives/${primitive}/ui.${primitive}.test.ts`,
      );
      expect(uiAssetUrl[primitive].homeUsage.href).toContain(
        `/src/primitives/${primitive}/usage.home.html`,
      );
    }
  });

  it('exports file-backed documentation and style asset URLs', () => {
    expect(uiAssetUrl.vanrotstyles.href).toContain('/src/styles/vanrotstyles.css');
    expect(uiAssetUrl.docs.packageInventory.href).toContain('/src/docs/package-inventory.md');
    expect(uiAssetUrl.docs.guidelines.href).toContain('/src/docs/guidelines.md');
  });
});
