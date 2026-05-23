import { describe, expect, it } from 'vitest';
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveType,
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

  it('exports app-owned style file paths', () => {
    expect(uiAppFile.tokens).toBe('src/styles/vanrot-tokens.css');
    expect(uiAppFile.vanrotstyles).toBe('src/styles/vanrotstyles.css');
    expect(uiAppFile.styleEntry).toBe('src/styles/vanrot-ui.css');
    expect(uiAppFile.vanrotstylesImport).toBe("import './styles/vanrotstyles.css';");
    expect(uiAppFile.styleEntryImport).toBe("import './styles/vanrot-ui.css';");
    expect(uiAppFile.tokenImport).toBe("import './styles/vanrot-tokens.css';");
  });

  it('exports the Phase 16A component catalog shape', () => {
    expect(uiComponentCatalog.button.selector).toBe('vr-button');
    expect(uiComponentCatalog.button.phase).toBe('16A');
    expect(uiComponentCatalog.card.selector).toBe('vr-card');
    expect(uiComponentCatalog.card.phase).toBe('16B');
    expect(uiComponentCatalog.dialog.selector).toBe('vr-dialog');
    expect(uiComponentCatalog.dialog.phase).toBe('16D');
  });

  it('exports file-backed package asset URLs', () => {
    expect(uiAssetUrl.tokens.href).toContain('/src/tokens/vanrot-tokens.css');
    expect(uiAssetUrl.button.typescript.href).toContain('/src/primitives/button/ui.button.ts');
    expect(uiAssetUrl.button.html.href).toContain('/src/primitives/button/ui.button.html');
    expect(uiAssetUrl.button.css.href).toContain('/src/primitives/button/ui.button.css');
    expect(uiAssetUrl.button.test.href).toContain('/src/primitives/button/ui.button.test.ts');
    expect(uiAssetUrl.button.homeUsage.href).toContain('/src/primitives/button/usage.home.html');
  });

  it('exports file-backed documentation and style asset URLs', () => {
    expect(uiAssetUrl.vanrotstyles.href).toContain('/src/styles/vanrotstyles.css');
    expect(uiAssetUrl.docs.packageInventory.href).toContain('/src/docs/package-inventory.md');
    expect(uiAssetUrl.docs.guidelines.href).toContain('/src/docs/guidelines.md');
  });
});
