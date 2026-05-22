export const defaultUiPrefix = 'ui';

export const uiPrimitiveType = {
  button: 'button',
} as const;

export type UiPrimitiveType = (typeof uiPrimitiveType)[keyof typeof uiPrimitiveType];

export const uiAppFile = {
  tokens: 'src/styles/vanrot-tokens.css',
  styleEntry: 'src/styles/vanrot-ui.css',
  tokenImport: "import './styles/vanrot-tokens.css';",
  styleEntryImport: "import './styles/vanrot-ui.css';",
} as const;

export const uiPrimitive = {
  button: {
    type: uiPrimitiveType.button,
    directory: 'src/ui/button',
    role: 'button',
    defaultFiles: ['ui.button.ts', 'ui.button.html', 'ui.button.css'],
    selector: 'vr-button',
    nativeTag: 'button',
    baseClass: 'vr-button',
  },
} as const;

export const uiAssetUrl = {
  tokens: new URL('../src/tokens/vanrot-tokens.css', import.meta.url),
  button: {
    typescript: new URL('../src/primitives/button/ui.button.ts', import.meta.url),
    html: new URL('../src/primitives/button/ui.button.html', import.meta.url),
    css: new URL('../src/primitives/button/ui.button.css', import.meta.url),
    test: new URL('../src/primitives/button/ui.button.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/button/usage.home.html', import.meta.url),
  },
} as const;
