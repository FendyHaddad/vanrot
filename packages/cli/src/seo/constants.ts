export const seoCliPackageName = '@vanrot/seo' as const;
export const seoCliConfigDomain = 'seo' as const;
export const seoCliUtilityPath = 'src/app/seo.ts' as const;
export const seoCliCommandName = 'seo' as const;

export const generatedSeoUtilitySource = `import { defineSeo } from '@vanrot/seo';

export const appSeo = {
  siteName: 'Vanrot App',
  defaultTitle: 'Vanrot App',
  defaultDescription: 'A Vanrot application with first-party SEO defaults.',
} as const;

export const homeSeo = defineSeo({
  title: appSeo.defaultTitle,
  description: appSeo.defaultDescription,
});
`;
