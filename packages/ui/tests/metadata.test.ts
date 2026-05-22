import { describe, expect, it } from 'vitest';
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiPrimitive,
  uiPrimitiveType,
} from '../src/index.js';

describe('@vanrot/ui metadata', () => {
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
    expect(uiAppFile.styleEntry).toBe('src/styles/vanrot-ui.css');
    expect(uiAppFile.styleEntryImport).toBe("import './styles/vanrot-ui.css';");
    expect(uiAppFile.tokenImport).toBe("import './styles/vanrot-tokens.css';");
  });

  it('exports file-backed package asset URLs', () => {
    expect(uiAssetUrl.tokens.href).toContain('/src/tokens/vanrot-tokens.css');
    expect(uiAssetUrl.button.typescript.href).toContain('/src/primitives/button/ui.button.ts');
    expect(uiAssetUrl.button.html.href).toContain('/src/primitives/button/ui.button.html');
    expect(uiAssetUrl.button.css.href).toContain('/src/primitives/button/ui.button.css');
    expect(uiAssetUrl.button.test.href).toContain('/src/primitives/button/ui.button.test.ts');
    expect(uiAssetUrl.button.homeUsage.href).toContain('/src/primitives/button/usage.home.html');
  });
});
