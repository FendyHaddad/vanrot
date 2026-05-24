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
  layout: 'layout',
  container: 'container',
  section: 'section',
  grid: 'grid',
  stack: 'stack',
  header: 'header',
  footer: 'footer',
  sidebar: 'sidebar',
  nav: 'nav',
  breadcrumb: 'breadcrumb',
  img: 'img',
  src: 'src',
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

export const uiPrimitiveVariant = {
  button: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
  card: ['default', 'muted', 'interactive'],
  badge: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  avatar: ['default', 'soft', 'outline'],
  alert: ['info', 'success', 'warning', 'danger'],
  loader: ['spinner', 'dots', 'bar'],
  skeleton: ['text', 'avatar', 'card', 'block'],
  separator: ['horizontal', 'vertical'],
  layout: [],
  container: [],
  section: [],
  grid: [],
  stack: [],
  header: [],
  footer: [],
  sidebar: [],
  nav: [],
  breadcrumb: [],
  img: [],
  src: [],
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
  layout: {
    type: uiPrimitiveType.layout,
    directory: 'src/ui/layout',
    role: 'layout',
    defaultFiles: ['ui.layout.ts', 'ui.layout.html', 'ui.layout.css'],
    selector: 'vr-layout',
    nativeTag: 'div',
    baseClass: 'vr-layout',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.layout,
    docsPath: '/docs/ui/layout',
  },
  container: {
    type: uiPrimitiveType.container,
    directory: 'src/ui/container',
    role: 'container',
    defaultFiles: ['ui.container.ts', 'ui.container.html', 'ui.container.css'],
    selector: 'vr-container',
    nativeTag: 'div',
    baseClass: 'vr-container',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.container,
    docsPath: '/docs/ui/container',
  },
  section: {
    type: uiPrimitiveType.section,
    directory: 'src/ui/section',
    role: 'section',
    defaultFiles: ['ui.section.ts', 'ui.section.html', 'ui.section.css'],
    selector: 'vr-section',
    nativeTag: 'section',
    baseClass: 'vr-section',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.section,
    docsPath: '/docs/ui/section',
  },
  grid: {
    type: uiPrimitiveType.grid,
    directory: 'src/ui/grid',
    role: 'grid',
    defaultFiles: ['ui.grid.ts', 'ui.grid.html', 'ui.grid.css'],
    selector: 'vr-grid',
    nativeTag: 'div',
    baseClass: 'vr-grid',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.grid,
    docsPath: '/docs/ui/grid',
  },
  stack: {
    type: uiPrimitiveType.stack,
    directory: 'src/ui/stack',
    role: 'stack',
    defaultFiles: ['ui.stack.ts', 'ui.stack.html', 'ui.stack.css'],
    selector: 'vr-stack',
    nativeTag: 'div',
    baseClass: 'vr-stack',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.stack,
    docsPath: '/docs/ui/stack',
  },
  header: {
    type: uiPrimitiveType.header,
    directory: 'src/ui/header',
    role: 'header',
    defaultFiles: ['ui.header.ts', 'ui.header.html', 'ui.header.css'],
    selector: 'vr-header',
    nativeTag: 'header',
    baseClass: 'vr-header',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.header,
    docsPath: '/docs/ui/header',
  },
  footer: {
    type: uiPrimitiveType.footer,
    directory: 'src/ui/footer',
    role: 'footer',
    defaultFiles: ['ui.footer.ts', 'ui.footer.html', 'ui.footer.css'],
    selector: 'vr-footer',
    nativeTag: 'footer',
    baseClass: 'vr-footer',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.footer,
    docsPath: '/docs/ui/footer',
  },
  sidebar: {
    type: uiPrimitiveType.sidebar,
    directory: 'src/ui/sidebar',
    role: 'sidebar',
    defaultFiles: ['ui.sidebar.ts', 'ui.sidebar.html', 'ui.sidebar.css'],
    selector: 'vr-sidebar',
    nativeTag: 'aside',
    baseClass: 'vr-sidebar',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.sidebar,
    docsPath: '/docs/ui/sidebar',
  },
  nav: {
    type: uiPrimitiveType.nav,
    directory: 'src/ui/nav',
    role: 'nav',
    defaultFiles: ['ui.nav.ts', 'ui.nav.html', 'ui.nav.css'],
    selector: 'vr-nav',
    nativeTag: 'nav',
    baseClass: 'vr-nav',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.nav,
    docsPath: '/docs/ui/nav',
  },
  breadcrumb: {
    type: uiPrimitiveType.breadcrumb,
    directory: 'src/ui/breadcrumb',
    role: 'breadcrumb',
    defaultFiles: ['ui.breadcrumb.ts', 'ui.breadcrumb.html', 'ui.breadcrumb.css'],
    selector: 'vr-breadcrumb',
    nativeTag: 'nav',
    baseClass: 'vr-breadcrumb',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.breadcrumb,
    docsPath: '/docs/ui/breadcrumb',
  },
  img: {
    type: uiPrimitiveType.img,
    directory: 'src/ui/img',
    role: 'img',
    defaultFiles: ['ui.img.ts', 'ui.img.html', 'ui.img.css'],
    selector: 'vr-img',
    nativeTag: 'img',
    baseClass: 'vr-img',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.img,
    docsPath: '/docs/ui/img',
  },
  src: {
    type: uiPrimitiveType.src,
    directory: 'src/ui/src',
    role: 'src',
    defaultFiles: ['ui.src.ts', 'ui.src.html', 'ui.src.css'],
    selector: 'vr-src',
    nativeTag: 'source',
    baseClass: 'vr-src',
    introducedPhase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    variants: uiPrimitiveVariant.src,
    docsPath: '/docs/ui/src',
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

export interface UiPrimitiveTokenGroup {
  defaultToken: string;
  tokens: readonly string[];
  classByToken: Readonly<Record<string, string>>;
}

function tokenGroup(
  tokens: readonly string[],
  defaultToken: string,
  classNameForToken: (token: string) => string,
  emitDefaultClass = false,
): UiPrimitiveTokenGroup {
  return {
    defaultToken,
    tokens,
    classByToken: Object.fromEntries(
      tokens.map((token) => [
        token,
        token === defaultToken && !emitDefaultClass ? '' : classNameForToken(token),
      ]),
    ),
  };
}

export const uiPrimitiveTokenGroup = {
  button: {
    variant: tokenGroup(uiPrimitiveVariant.button, 'default', (token) => `vr-button-${token}`),
  },
  card: {
    variant: tokenGroup(uiPrimitiveVariant.card, 'default', (token) => `vr-card-${token}`),
  },
  badge: {
    tone: tokenGroup(uiPrimitiveVariant.badge, 'default', (token) => `vr-badge-${token}`),
  },
  avatar: {
    variant: tokenGroup(uiPrimitiveVariant.avatar, 'default', (token) => `vr-avatar-${token}`),
  },
  alert: {
    tone: tokenGroup(uiPrimitiveVariant.alert, 'info', (token) => `vr-alert-${token}`),
  },
  loader: {
    variant: tokenGroup(uiPrimitiveVariant.loader, 'spinner', (token) => `vr-loader-${token}`),
  },
  skeleton: {
    variant: tokenGroup(uiPrimitiveVariant.skeleton, 'text', (token) => `vr-skeleton-${token}`),
  },
  separator: {
    orientation: tokenGroup(uiPrimitiveVariant.separator, 'horizontal', (token) => `vr-separator-${token}`),
  },
  layout: {},
  container: {
    size: tokenGroup(['sm', 'md', 'lg', 'xl'], 'md', (token) => `vr-container-${token}`, true),
  },
  section: {
    spacing: tokenGroup(['sm', 'md', 'lg'], 'md', (token) => `vr-section-${token}`, true),
  },
  grid: {
    cols: tokenGroup(['1', '2', '3', '4', '6', '12'], '1', (token) => `vr-grid-cols-${token}`, true),
    gap: tokenGroup(['0', '1', '2', '3', '4', '5', '6', '8'], '0', (token) => `vr-grid-gap-${token}`, true),
  },
  stack: {
    gap: tokenGroup(['0', '1', '2', '3', '4', '5', '6', '8'], '0', (token) => `vr-stack-gap-${token}`, true),
  },
  header: {},
  footer: {},
  sidebar: {
    placement: tokenGroup(['left', 'right'], 'left', (token) => `vr-sidebar-${token}`, true),
  },
  nav: {},
  breadcrumb: {},
  img: {},
  src: {},
} as const satisfies Record<UiPrimitiveType, Readonly<Record<string, UiPrimitiveTokenGroup>>>;

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
  layout: {
    selector: 'vr-layout',
    nativeTag: 'div',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  container: {
    selector: 'vr-container',
    nativeTag: 'div',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  section: {
    selector: 'vr-section',
    nativeTag: 'section',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  grid: {
    selector: 'vr-grid',
    nativeTag: 'div',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  stack: {
    selector: 'vr-stack',
    nativeTag: 'div',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  header: {
    selector: 'vr-header',
    nativeTag: 'header',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  footer: {
    selector: 'vr-footer',
    nativeTag: 'footer',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  sidebar: {
    selector: 'vr-sidebar',
    nativeTag: 'aside',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  nav: {
    selector: 'vr-nav',
    nativeTag: 'nav',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  breadcrumb: {
    selector: 'vr-breadcrumb',
    nativeTag: 'nav',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  img: {
    selector: 'vr-img',
    nativeTag: 'img',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
    status: 'compiler-lowered',
  },
  src: {
    selector: 'vr-src',
    nativeTag: 'source',
    phase: uiComponentPhase.layoutNavigationMedia,
    productionPhase: uiComponentPhase.layoutNavigationMedia,
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
  layout: {
    typescript: new URL('../src/primitives/layout/ui.layout.ts', import.meta.url),
    html: new URL('../src/primitives/layout/ui.layout.html', import.meta.url),
    css: new URL('../src/primitives/layout/ui.layout.css', import.meta.url),
    test: new URL('../src/primitives/layout/ui.layout.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/layout/usage.home.html', import.meta.url),
  },
  container: {
    typescript: new URL('../src/primitives/container/ui.container.ts', import.meta.url),
    html: new URL('../src/primitives/container/ui.container.html', import.meta.url),
    css: new URL('../src/primitives/container/ui.container.css', import.meta.url),
    test: new URL('../src/primitives/container/ui.container.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/container/usage.home.html', import.meta.url),
  },
  section: {
    typescript: new URL('../src/primitives/section/ui.section.ts', import.meta.url),
    html: new URL('../src/primitives/section/ui.section.html', import.meta.url),
    css: new URL('../src/primitives/section/ui.section.css', import.meta.url),
    test: new URL('../src/primitives/section/ui.section.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/section/usage.home.html', import.meta.url),
  },
  grid: {
    typescript: new URL('../src/primitives/grid/ui.grid.ts', import.meta.url),
    html: new URL('../src/primitives/grid/ui.grid.html', import.meta.url),
    css: new URL('../src/primitives/grid/ui.grid.css', import.meta.url),
    test: new URL('../src/primitives/grid/ui.grid.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/grid/usage.home.html', import.meta.url),
  },
  stack: {
    typescript: new URL('../src/primitives/stack/ui.stack.ts', import.meta.url),
    html: new URL('../src/primitives/stack/ui.stack.html', import.meta.url),
    css: new URL('../src/primitives/stack/ui.stack.css', import.meta.url),
    test: new URL('../src/primitives/stack/ui.stack.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/stack/usage.home.html', import.meta.url),
  },
  header: {
    typescript: new URL('../src/primitives/header/ui.header.ts', import.meta.url),
    html: new URL('../src/primitives/header/ui.header.html', import.meta.url),
    css: new URL('../src/primitives/header/ui.header.css', import.meta.url),
    test: new URL('../src/primitives/header/ui.header.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/header/usage.home.html', import.meta.url),
  },
  footer: {
    typescript: new URL('../src/primitives/footer/ui.footer.ts', import.meta.url),
    html: new URL('../src/primitives/footer/ui.footer.html', import.meta.url),
    css: new URL('../src/primitives/footer/ui.footer.css', import.meta.url),
    test: new URL('../src/primitives/footer/ui.footer.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/footer/usage.home.html', import.meta.url),
  },
  sidebar: {
    typescript: new URL('../src/primitives/sidebar/ui.sidebar.ts', import.meta.url),
    html: new URL('../src/primitives/sidebar/ui.sidebar.html', import.meta.url),
    css: new URL('../src/primitives/sidebar/ui.sidebar.css', import.meta.url),
    test: new URL('../src/primitives/sidebar/ui.sidebar.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/sidebar/usage.home.html', import.meta.url),
  },
  nav: {
    typescript: new URL('../src/primitives/nav/ui.nav.ts', import.meta.url),
    html: new URL('../src/primitives/nav/ui.nav.html', import.meta.url),
    css: new URL('../src/primitives/nav/ui.nav.css', import.meta.url),
    test: new URL('../src/primitives/nav/ui.nav.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/nav/usage.home.html', import.meta.url),
  },
  breadcrumb: {
    typescript: new URL('../src/primitives/breadcrumb/ui.breadcrumb.ts', import.meta.url),
    html: new URL('../src/primitives/breadcrumb/ui.breadcrumb.html', import.meta.url),
    css: new URL('../src/primitives/breadcrumb/ui.breadcrumb.css', import.meta.url),
    test: new URL('../src/primitives/breadcrumb/ui.breadcrumb.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/breadcrumb/usage.home.html', import.meta.url),
  },
  img: {
    typescript: new URL('../src/primitives/img/ui.img.ts', import.meta.url),
    html: new URL('../src/primitives/img/ui.img.html', import.meta.url),
    css: new URL('../src/primitives/img/ui.img.css', import.meta.url),
    test: new URL('../src/primitives/img/ui.img.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/img/usage.home.html', import.meta.url),
  },
  src: {
    typescript: new URL('../src/primitives/src/ui.src.ts', import.meta.url),
    html: new URL('../src/primitives/src/ui.src.html', import.meta.url),
    css: new URL('../src/primitives/src/ui.src.css', import.meta.url),
    test: new URL('../src/primitives/src/ui.src.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/src/usage.home.html', import.meta.url),
  },
} as const;
