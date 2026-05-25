export const uiSizeToken = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export const uiToneToken = [
  'default',
  'secondary',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
  'outline',
] as const;

export const uiDensityToken = ['comfortable', 'compact', 'dense'] as const;

export const uiInputTypeToken = [
  'text',
  'email',
  'password',
  'number',
  'search',
  'tel',
  'url',
] as const;

export const uiControlShapeToken = ['default', 'pill', 'square'] as const;

export const uiListMarkerToken = ['none', 'disc', 'decimal', 'check'] as const;

export const uiStatAlignToken = ['left', 'center', 'right'] as const;

export const uiPaginationVariantToken = ['default', 'compact', 'numbers'] as const;

export type UiSizeToken = (typeof uiSizeToken)[number];
export type UiToneToken = (typeof uiToneToken)[number];
export type UiDensityToken = (typeof uiDensityToken)[number];
export type UiInputTypeToken = (typeof uiInputTypeToken)[number];
export type UiControlShapeToken = (typeof uiControlShapeToken)[number];
export type UiListMarkerToken = (typeof uiListMarkerToken)[number];
export type UiStatAlignToken = (typeof uiStatAlignToken)[number];
export type UiPaginationVariantToken = (typeof uiPaginationVariantToken)[number];
