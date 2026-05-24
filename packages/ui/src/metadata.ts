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
  site: '16C',
  layoutNavigationMedia: '16D',
  formsData: '16E',
  overlaysInteraction: '16F',
} as const;

export type UiComponentPhase = (typeof uiComponentPhase)[keyof typeof uiComponentPhase];

export const uiPrimitiveType = {
  button: 'button',
  card: 'card',
  badge: 'badge',
  avatar: 'avatar',
  alert: 'alert',
  loader: 'loader',
  skeleton: 'skeleton',
  separator: 'separator',
} as const;

export type UiPrimitiveType = (typeof uiPrimitiveType)[keyof typeof uiPrimitiveType];

export const uiPrimitiveOrder = [
  uiPrimitiveType.button,
  uiPrimitiveType.card,
  uiPrimitiveType.badge,
  uiPrimitiveType.avatar,
  uiPrimitiveType.alert,
  uiPrimitiveType.loader,
  uiPrimitiveType.skeleton,
  uiPrimitiveType.separator,
] as const;

export const uiPrimitiveVariant = {
  button: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
  card: ['default', 'muted', 'interactive'],
  badge: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  avatar: ['default', 'soft', 'outline'],
  alert: ['info', 'success', 'warning', 'danger'],
  loader: ['spinner', 'dots', 'bar'],
  skeleton: ['text', 'avatar', 'card', 'block'],
  separator: ['horizontal', 'vertical'],
} as const satisfies Record<UiPrimitiveType, readonly string[]>;

export type UiPrimitiveVariant = (typeof uiPrimitiveVariant)[UiPrimitiveType][number];

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
    introducedPhase: '16A',
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.button,
    docsPath: '/docs/ui/button',
  },
  card: {
    type: uiPrimitiveType.card,
    directory: 'src/ui/card',
    role: 'card',
    defaultFiles: ['ui.card.ts', 'ui.card.html', 'ui.card.css'],
    selector: 'vr-card',
    nativeTag: 'article',
    baseClass: 'vr-card',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.card,
    docsPath: '/docs/ui/card',
  },
  badge: {
    type: uiPrimitiveType.badge,
    directory: 'src/ui/badge',
    role: 'badge',
    defaultFiles: ['ui.badge.ts', 'ui.badge.html', 'ui.badge.css'],
    selector: 'vr-badge',
    nativeTag: 'span',
    baseClass: 'vr-badge',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.badge,
    docsPath: '/docs/ui/badge',
  },
  avatar: {
    type: uiPrimitiveType.avatar,
    directory: 'src/ui/avatar',
    role: 'avatar',
    defaultFiles: ['ui.avatar.ts', 'ui.avatar.html', 'ui.avatar.css'],
    selector: 'vr-avatar',
    nativeTag: 'span',
    baseClass: 'vr-avatar',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.avatar,
    docsPath: '/docs/ui/avatar',
  },
  alert: {
    type: uiPrimitiveType.alert,
    directory: 'src/ui/alert',
    role: 'alert',
    defaultFiles: ['ui.alert.ts', 'ui.alert.html', 'ui.alert.css'],
    selector: 'vr-alert',
    nativeTag: 'section',
    baseClass: 'vr-alert',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.alert,
    docsPath: '/docs/ui/alert',
  },
  loader: {
    type: uiPrimitiveType.loader,
    directory: 'src/ui/loader',
    role: 'loader',
    defaultFiles: ['ui.loader.ts', 'ui.loader.html', 'ui.loader.css'],
    selector: 'vr-loader',
    nativeTag: 'span',
    baseClass: 'vr-loader',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.loader,
    docsPath: '/docs/ui/loader',
  },
  skeleton: {
    type: uiPrimitiveType.skeleton,
    directory: 'src/ui/skeleton',
    role: 'skeleton',
    defaultFiles: ['ui.skeleton.ts', 'ui.skeleton.html', 'ui.skeleton.css'],
    selector: 'vr-skeleton',
    nativeTag: 'span',
    baseClass: 'vr-skeleton',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.skeleton,
    docsPath: '/docs/ui/skeleton',
  },
  separator: {
    type: uiPrimitiveType.separator,
    directory: 'src/ui/separator',
    role: 'separator',
    defaultFiles: ['ui.separator.ts', 'ui.separator.html', 'ui.separator.css'],
    selector: 'vr-separator',
    nativeTag: 'hr',
    baseClass: 'vr-separator',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.separator,
    docsPath: '/docs/ui/separator',
  },
} as const satisfies Record<
  UiPrimitiveType,
  {
    type: UiPrimitiveType;
    directory: string;
    role: string;
    defaultFiles: readonly string[];
    selector: string;
    nativeTag: string;
    baseClass: string;
    introducedPhase: UiComponentPhase;
    productionPhase: UiComponentPhase;
    variants: readonly string[];
    docsPath: string;
  }
>;

export const uiComponentCatalog = {
  button: {
    selector: 'vr-button',
    nativeTag: 'button',
    phase: uiComponentPhase.foundation,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  card: {
    selector: 'vr-card',
    nativeTag: 'article',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  badge: {
    selector: 'vr-badge',
    nativeTag: 'span',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  avatar: {
    selector: 'vr-avatar',
    nativeTag: 'span',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  alert: {
    selector: 'vr-alert',
    nativeTag: 'section',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  loader: {
    selector: 'vr-loader',
    nativeTag: 'span',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  skeleton: {
    selector: 'vr-skeleton',
    nativeTag: 'span',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
  separator: {
    selector: 'vr-separator',
    nativeTag: 'hr',
    phase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    status: 'compiler-lowered',
  },
} as const satisfies Record<
  UiPrimitiveType,
  {
    selector: string;
    nativeTag: string;
    phase: UiComponentPhase;
    productionPhase: UiComponentPhase;
    status: 'compiler-lowered';
  }
>;

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
  card: {
    typescript: new URL('../src/primitives/card/ui.card.ts', import.meta.url),
    html: new URL('../src/primitives/card/ui.card.html', import.meta.url),
    css: new URL('../src/primitives/card/ui.card.css', import.meta.url),
    test: new URL('../src/primitives/card/ui.card.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/card/usage.home.html', import.meta.url),
  },
  badge: {
    typescript: new URL('../src/primitives/badge/ui.badge.ts', import.meta.url),
    html: new URL('../src/primitives/badge/ui.badge.html', import.meta.url),
    css: new URL('../src/primitives/badge/ui.badge.css', import.meta.url),
    test: new URL('../src/primitives/badge/ui.badge.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/badge/usage.home.html', import.meta.url),
  },
  avatar: {
    typescript: new URL('../src/primitives/avatar/ui.avatar.ts', import.meta.url),
    html: new URL('../src/primitives/avatar/ui.avatar.html', import.meta.url),
    css: new URL('../src/primitives/avatar/ui.avatar.css', import.meta.url),
    test: new URL('../src/primitives/avatar/ui.avatar.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/avatar/usage.home.html', import.meta.url),
  },
  alert: {
    typescript: new URL('../src/primitives/alert/ui.alert.ts', import.meta.url),
    html: new URL('../src/primitives/alert/ui.alert.html', import.meta.url),
    css: new URL('../src/primitives/alert/ui.alert.css', import.meta.url),
    test: new URL('../src/primitives/alert/ui.alert.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/alert/usage.home.html', import.meta.url),
  },
  loader: {
    typescript: new URL('../src/primitives/loader/ui.loader.ts', import.meta.url),
    html: new URL('../src/primitives/loader/ui.loader.html', import.meta.url),
    css: new URL('../src/primitives/loader/ui.loader.css', import.meta.url),
    test: new URL('../src/primitives/loader/ui.loader.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/loader/usage.home.html', import.meta.url),
  },
  skeleton: {
    typescript: new URL('../src/primitives/skeleton/ui.skeleton.ts', import.meta.url),
    html: new URL('../src/primitives/skeleton/ui.skeleton.html', import.meta.url),
    css: new URL('../src/primitives/skeleton/ui.skeleton.css', import.meta.url),
    test: new URL('../src/primitives/skeleton/ui.skeleton.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/skeleton/usage.home.html', import.meta.url),
  },
  separator: {
    typescript: new URL('../src/primitives/separator/ui.separator.ts', import.meta.url),
    html: new URL('../src/primitives/separator/ui.separator.html', import.meta.url),
    css: new URL('../src/primitives/separator/ui.separator.css', import.meta.url),
    test: new URL('../src/primitives/separator/ui.separator.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/separator/usage.home.html', import.meta.url),
  },
} as const;
