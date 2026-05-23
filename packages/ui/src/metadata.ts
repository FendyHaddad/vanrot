export const defaultUiPrefix = 'ui';

export const uiFlavor = {
  october: 'october',
} as const;

export type UiFlavor = (typeof uiFlavor)[keyof typeof uiFlavor];

export const uiStyleMode = {
  vanrotstyles: 'vanrotstyles',
  tailwind: 'tailwind',
  none: 'none',
} as const;

export type UiStyleMode = (typeof uiStyleMode)[keyof typeof uiStyleMode];

export const uiComponentPhase = {
  foundation: '16A',
  core: '16B',
  layoutData: '16C',
  overlays: '16D',
  shellPatterns: '16E',
} as const;

export type UiComponentPhase = (typeof uiComponentPhase)[keyof typeof uiComponentPhase];

export const uiPrimitiveType = {
  button: 'button',
} as const;

export type UiPrimitiveType = (typeof uiPrimitiveType)[keyof typeof uiPrimitiveType];

export const uiAppFile = {
  tokens: 'src/styles/vanrot-tokens.css',
  vanrotstyles: 'src/styles/vanrotstyles.css',
  styleEntry: 'src/styles/vanrot-ui.css',
  tokenImport: "import './styles/vanrot-tokens.css';",
  vanrotstylesImport: "import './styles/vanrotstyles.css';",
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

export const uiComponentCatalog = {
  button: {
    selector: 'vr-button',
    nativeTag: 'button',
    phase: uiComponentPhase.foundation,
    status: 'compiler-lowered',
  },
  card: {
    selector: 'vr-card',
    nativeTag: 'article',
    phase: uiComponentPhase.core,
    status: 'planned',
  },
  input: {
    selector: 'vr-input',
    nativeTag: 'input',
    phase: uiComponentPhase.core,
    status: 'planned',
  },
  dialog: {
    selector: 'vr-dialog',
    nativeTag: 'dialog',
    phase: uiComponentPhase.overlays,
    status: 'planned',
  },
  table: {
    selector: 'vr-table',
    nativeTag: 'table',
    phase: uiComponentPhase.layoutData,
    status: 'planned',
  },
  shell: {
    selector: 'vr-shell',
    nativeTag: 'div',
    phase: uiComponentPhase.shellPatterns,
    status: 'planned',
  },
} as const;

export const uiPackageInventory = {
  name: '@vanrot/ui',
  flavor: uiFlavor.october,
  stylesheet: 'vanrotstyles.css',
  tokens: 'vanrot-tokens.css',
  ownership: 'developer-owned',
} as const;

export const uiAssetUrl = {
  tokens: new URL('../src/tokens/vanrot-tokens.css', import.meta.url),
  vanrotstyles: new URL('../src/styles/vanrotstyles.css', import.meta.url),
  docs: {
    packageInventory: new URL('../src/docs/package-inventory.md', import.meta.url),
    guidelines: new URL('../src/docs/guidelines.md', import.meta.url),
  },
  button: {
    typescript: new URL('../src/primitives/button/ui.button.ts', import.meta.url),
    html: new URL('../src/primitives/button/ui.button.html', import.meta.url),
    css: new URL('../src/primitives/button/ui.button.css', import.meta.url),
    test: new URL('../src/primitives/button/ui.button.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/button/usage.home.html', import.meta.url),
  },
} as const;
