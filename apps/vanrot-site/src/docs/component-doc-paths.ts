import { uiPrimitiveType, type UiPrimitiveType } from '@vanrot/ui';

export const componentDocPath = {
  [uiPrimitiveType.alert]: '/docs/components/alerts',
  [uiPrimitiveType.avatar]: '/docs/components/avatars',
  [uiPrimitiveType.badge]: '/docs/components/badges',
  [uiPrimitiveType.breadcrumb]: '/docs/components/breadcrumbs',
  [uiPrimitiveType.button]: '/docs/components/buttons',
  [uiPrimitiveType.card]: '/docs/components/cards',
  [uiPrimitiveType.container]: '/docs/components/containers',
  [uiPrimitiveType.footer]: '/docs/components/footers',
  [uiPrimitiveType.grid]: '/docs/components/grids',
  [uiPrimitiveType.header]: '/docs/components/headers',
  [uiPrimitiveType.img]: '/docs/components/images',
  [uiPrimitiveType.layout]: '/docs/components/layouts',
  [uiPrimitiveType.loader]: '/docs/components/loaders',
  [uiPrimitiveType.nav]: '/docs/components/navigation',
  [uiPrimitiveType.section]: '/docs/components/sections',
  [uiPrimitiveType.separator]: '/docs/components/separators',
  [uiPrimitiveType.sidebar]: '/docs/components/sidebars',
  [uiPrimitiveType.skeleton]: '/docs/components/skeletons',
  [uiPrimitiveType.src]: '/docs/components/sources',
  [uiPrimitiveType.stack]: '/docs/components/stacks',
} as const satisfies Record<UiPrimitiveType, string>;
