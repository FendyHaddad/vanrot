# Phase 27 SEO Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current workspace. Steps use checkbox (`- [x]`) syntax for tracking. Do not use subagents or worktrees in this repository. Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.

**Goal:** Ship `@vanrot/seo` as a complete optional first-party SEO package with config, CLI opt-in, build outputs, diagnostics, generated app utilities, and public docs.

**Architecture:** `@vanrot/seo` owns typed SEO metadata, constants, metadata resolution, structured data, sitemap/robots generation, server tag rendering, client head updates, and SEO diagnostics. `@vanrot/config` owns only the serializable `seo` config domain so `vanrot.config.ts` stays the single control plane. `@vanrot/cli` and `@vanrot/vite-plugin` integrate SEO only when configured or installed; `@vanrot/runtime` must not import SEO.

**Tech Stack:** TypeScript, Vitest, Vite plugin hooks, Vanrot config loader/editor, Vanrot CLI reporter, Vanrot site docs data.

**Source Spec:** `docs/superpowers/specs/Phase-27.md`

---

## File Structure

Create:

- `packages/seo/package.json` - package metadata, exports, scripts.
- `packages/seo/tsconfig.json` - package TypeScript project.
- `packages/seo/src/constants.ts` - string literal source of truth for robots, Open Graph, Twitter/X cards, schema types, sitemap frequency, diagnostics, package name.
- `packages/seo/src/types.ts` - public SEO metadata and config-facing types.
- `packages/seo/src/metadata.ts` - `defineSeo(...)`, `defineDynamicSeo(...)`, static/async normalization.
- `packages/seo/src/ladder.ts` - metadata ladder merge and canonical resolution.
- `packages/seo/src/structured-data.ts` - typed JSON-LD builders and `rawSchema(...)`.
- `packages/seo/src/social.ts` - Open Graph/Twitter helpers and social image validation.
- `packages/seo/src/sitemap.ts` - static and dynamic sitemap model plus XML generation.
- `packages/seo/src/robots.ts` - robots policy model plus text generation.
- `packages/seo/src/render.ts` - SSR-safe HTML tag rendering.
- `packages/seo/src/head.ts` - optional client-side head updater.
- `packages/seo/src/diagnostics.ts` - SEO diagnostic rules shared by build and doctor.
- `packages/seo/src/index.ts` - public root exports.
- `packages/seo/tests/*.test.ts` - package TDD coverage.
- `packages/cli/src/seo/constants.ts` - CLI-owned SEO filenames, snippets, package command labels.
- `packages/cli/src/seo/add-seo.ts` - `vr add seo` install/config/generate flow.
- `packages/cli/src/seo/create-seo.ts` - `vr create` SEO selection and generated file support.
- `packages/cli/src/seo/doctor.ts` - CLI project scanner for SEO.
- `packages/cli/tests/seo-command.test.ts` - `vr add seo` coverage.
- `packages/cli/tests/seo-create.test.ts` - `vr create` SEO opt-in/out coverage.
- `packages/cli/tests/seo-doctor.test.ts` - SEO doctor coverage.
- `packages/vite-plugin/src/seo-build.ts` - build-time sitemap and robots emission.
- `packages/vite-plugin/tests/seo-build.test.ts` - Vite SEO build coverage.

Modify:

- `packages/config/src/constants.ts` - add config domain and SEO constant values.
- `packages/config/src/types.ts` - add `VanrotSeoConfig` and normalized SEO config.
- `packages/config/src/defaults.ts` - normalize SEO config without default residue.
- `packages/config/src/diagnostics.ts` - add `VRCFG014` through `VRCFG020`.
- `packages/config/src/validate.ts` - validate SEO syntax and contracts even when `siteUrl` is missing.
- `packages/config/src/editor.ts` - support generated SEO domain upsert/removal.
- `packages/config/src/index.ts` - export SEO config types/constants.
- `packages/config/tests/validate.test.ts` - SEO config diagnostics.
- `packages/config/tests/defaults.test.ts` - SEO normalization.
- `packages/config/tests/editor.test.ts` - SEO domain merge behavior.
- `packages/cli/src/commands/add.ts` - route `vr add seo` before UI primitive fallback.
- `packages/cli/src/commands/create.ts` - parse SEO flags and pass selection to app writer.
- `packages/cli/src/create/write-app.ts` - include SEO dependency/config/utility only when selected.
- `packages/cli/src/doctor/checks.ts` - include SEO doctor findings.
- `packages/vite-plugin/src/plugin.ts` - call SEO build emitter during `generateBundle`.
- `apps/vanrot-site/src/docs/site-data.json` - add SEO guide article.
- `apps/vanrot-site/src/docs/site-data.ts` - keep generated article types aligned.
- `apps/vanrot-site/src/docs/framework-guides.ts` - add SEO guide key and label.
- `apps/vanrot-site/src/docs/site-navigation.ts` - expose SEO guide in docs navigation.
- `apps/vanrot-site/src/routes.ts` - ensure guide route remains covered by docs article routing.
- `apps/vanrot-site/tests/site-data.test.ts` - assert SEO guide exists.
- `apps/vanrot-site/tests/site-pages.test.ts` - assert SEO route renders.
- `docs/superpowers/feature-maturity.md` - track Phase 27 status.
- `docs/superpowers/final-tdd-inventory.md` - add SEO package, CLI, Vite, docs, generated files.
- `docs/superpowers/future-pipeline.md` - mark SEO as opened under Phase 27 and keep CLI Prompt Roadmap parked.

## Plan Rules

- Keep `@vanrot/runtime` untouched except verification. If any SEO task imports SEO from runtime or runtime from SEO, stop and remove the import.
- Keep `siteUrl` optional. Missing `siteUrl` is a warning, not a config error.
- Social images are validated only. Do not add social image generation APIs, prompts, assets, or build steps.
- Generated app SEO support should default to one file: `src/app/seo.ts`.
- Use package constants and generated app constants instead of repeated string literals.
- Checkpoint steps run status only. Commits belong to the user.

---

### Task 1: Package Shell And Literal Owners

**Files:**

- Create: `packages/seo/package.json`
- Create: `packages/seo/tsconfig.json`
- Create: `packages/seo/src/constants.ts`
- Create: `packages/seo/src/types.ts`
- Create: `packages/seo/src/index.ts`
- Create: `packages/seo/tests/constants.test.ts`

- [x] **Step 1: Write the failing constants test**

```ts
// packages/seo/tests/constants.test.ts
import { describe, expect, it } from 'vitest';
import {
  seoCanonicalPolicy,
  seoDiagnosticCode,
  seoOpenGraphType,
  seoPackageName,
  seoRobotsDirective,
  seoSchemaType,
  seoSitemapChangeFrequency,
  seoTwitterCard,
} from '../src/index.js';

describe('@vanrot/seo constants', () => {
  it('exports stable literal owners for generated apps and diagnostics', () => {
    expect(seoPackageName).toBe('@vanrot/seo');
    expect(seoRobotsDirective.index).toBe('index');
    expect(seoRobotsDirective.noindex).toBe('noindex');
    expect(seoOpenGraphType.website).toBe('website');
    expect(seoTwitterCard.summaryLargeImage).toBe('summary_large_image');
    expect(seoSchemaType.webSite).toBe('WebSite');
    expect(seoCanonicalPolicy.siteUrlRequired).toBe('site-url-required');
    expect(seoSitemapChangeFrequency.weekly).toBe('weekly');
    expect(seoDiagnosticCode.missingTitle).toBe('VRSEO001');
  });
});
```

- [x] **Step 2: Run the failing test**

Run: `pnpm --filter @vanrot/seo test -- constants.test.ts`

Expected: command fails because `@vanrot/seo` package does not exist.

- [x] **Step 3: Create the package manifest**

```json
{
  "name": "@vanrot/seo",
  "type": "module",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [x] **Step 4: Create the package TypeScript config**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"]
}
```

- [x] **Step 5: Create `constants.ts`**

```ts
// packages/seo/src/constants.ts
export const seoPackageName = '@vanrot/seo' as const;

export const seoRobotsDirective = {
  index: 'index',
  noindex: 'noindex',
  follow: 'follow',
  nofollow: 'nofollow',
  noarchive: 'noarchive',
  nosnippet: 'nosnippet',
} as const;

export const seoOpenGraphType = {
  website: 'website',
  article: 'article',
  profile: 'profile',
  product: 'product',
} as const;

export const seoTwitterCard = {
  summary: 'summary',
  summaryLargeImage: 'summary_large_image',
} as const;

export const seoSchemaType = {
  organization: 'Organization',
  webSite: 'WebSite',
  webPage: 'WebPage',
  article: 'Article',
  breadcrumbList: 'BreadcrumbList',
  product: 'Product',
} as const;

export const seoCanonicalPolicy = {
  siteUrlOptional: 'site-url-optional',
  siteUrlRequired: 'site-url-required',
} as const;

export const seoSitemapChangeFrequency = {
  always: 'always',
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
  never: 'never',
} as const;

export const seoDiagnosticCode = {
  missingTitle: 'VRSEO001',
  missingDescription: 'VRSEO002',
  titleTooLong: 'VRSEO003',
  descriptionTooLong: 'VRSEO004',
  missingSiteUrl: 'VRSEO005',
  invalidCanonical: 'VRSEO006',
  invalidSocialImage: 'VRSEO007',
  duplicateTitle: 'VRSEO008',
  duplicateDescription: 'VRSEO009',
  accidentalNoindex: 'VRSEO010',
  invalidSchema: 'VRSEO011',
  strictWarningEscalated: 'VRSEO012',
} as const;
```

- [x] **Step 6: Create `types.ts`**

```ts
// packages/seo/src/types.ts
import type {
  seoCanonicalPolicy,
  seoOpenGraphType,
  seoRobotsDirective,
  seoSchemaType,
  seoSitemapChangeFrequency,
  seoTwitterCard,
} from './constants.js';

export type SeoRobotsDirective = (typeof seoRobotsDirective)[keyof typeof seoRobotsDirective];
export type SeoOpenGraphType = (typeof seoOpenGraphType)[keyof typeof seoOpenGraphType];
export type SeoTwitterCard = (typeof seoTwitterCard)[keyof typeof seoTwitterCard];
export type SeoSchemaType = (typeof seoSchemaType)[keyof typeof seoSchemaType];
export type SeoCanonicalPolicy = (typeof seoCanonicalPolicy)[keyof typeof seoCanonicalPolicy];
export type SeoSitemapChangeFrequency =
  (typeof seoSitemapChangeFrequency)[keyof typeof seoSitemapChangeFrequency];

export interface SeoImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SeoOpenGraph {
  type?: SeoOpenGraphType;
  title?: string;
  description?: string;
  image?: SeoImage;
}

export interface SeoTwitter {
  card?: SeoTwitterCard;
  title?: string;
  description?: string;
  image?: SeoImage;
}

export interface SeoSchema {
  '@type': SeoSchemaType | string;
  [property: string]: unknown;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: readonly SeoRobotsDirective[];
  openGraph?: SeoOpenGraph;
  twitter?: SeoTwitter;
  schema?: readonly SeoSchema[];
}

export interface ResolvedSeoMetadata extends SeoMetadata {
  title: string;
  description: string;
}

export interface SeoResolveContext {
  path?: string;
  siteUrl?: string;
}

export interface SeoDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  nextStep: string;
  filePath?: string;
}

export type SeoMetadataFactory =
  (context: SeoResolveContext) => SeoMetadata | Promise<SeoMetadata>;
```

- [x] **Step 7: Create `index.ts`**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export type * from './types.js';
```

- [x] **Step 8: Run constants test**

Run: `pnpm --filter @vanrot/seo test -- constants.test.ts`

Expected: PASS.

- [x] **Step 9: Checkpoint**

Run: `git status --short -- packages/seo`

Expected: created package files appear as unstaged changes.

---

### Task 2: Static And Async Metadata Contracts

**Files:**

- Create: `packages/seo/src/metadata.ts`
- Create: `packages/seo/tests/metadata.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing metadata tests**

```ts
// packages/seo/tests/metadata.test.ts
import { describe, expect, it } from 'vitest';
import { defineDynamicSeo, defineSeo, resolveSeoInput } from '../src/index.js';

describe('SEO metadata contracts', () => {
  it('returns static metadata without changing it', async () => {
    const seo = defineSeo({
      title: 'Vanrot Docs',
      description: 'Learn Vanrot.',
    });

    await expect(resolveSeoInput(seo, { path: '/docs' })).resolves.toEqual({
      title: 'Vanrot Docs',
      description: 'Learn Vanrot.',
    });
  });

  it('resolves async metadata with context', async () => {
    const seo = defineDynamicSeo(async ({ path }) => ({
      title: `Page ${path}`,
      description: 'Async metadata.',
    }));

    await expect(resolveSeoInput(seo, { path: '/blog' })).resolves.toEqual({
      title: 'Page /blog',
      description: 'Async metadata.',
    });
  });
});
```

- [x] **Step 2: Run failing metadata tests**

Run: `pnpm --filter @vanrot/seo test -- metadata.test.ts`

Expected: FAIL with missing `defineSeo`, `defineDynamicSeo`, or `resolveSeoInput` export.

- [x] **Step 3: Implement metadata contracts**

```ts
// packages/seo/src/metadata.ts
import type { SeoMetadata, SeoMetadataFactory, SeoResolveContext } from './types.js';

export type SeoInput = SeoMetadata | SeoMetadataFactory;

export function defineSeo(input: SeoMetadata): SeoMetadata;
export function defineSeo(input: SeoMetadataFactory): SeoMetadataFactory;
export function defineSeo(input: SeoInput): SeoInput {
  return input;
}

export function defineDynamicSeo(factory: SeoMetadataFactory): SeoMetadataFactory {
  return factory;
}

export async function resolveSeoInput(input: SeoInput, context: SeoResolveContext): Promise<SeoMetadata> {
  if (typeof input !== 'function') {
    return input;
  }

  return input(context);
}
```

- [x] **Step 4: Export metadata contracts**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './metadata.js';
export type * from './types.js';
```

- [x] **Step 5: Run metadata tests**

Run: `pnpm --filter @vanrot/seo test -- metadata.test.ts`

Expected: PASS.

---

### Task 3: Metadata Ladder And Canonical Resolution

**Files:**

- Create: `packages/seo/src/ladder.ts`
- Create: `packages/seo/tests/ladder.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing ladder tests**

```ts
// packages/seo/tests/ladder.test.ts
import { describe, expect, it } from 'vitest';
import { resolveSeoMetadata, seoOpenGraphType } from '../src/index.js';

describe('metadata ladder', () => {
  it('merges config, route, page, and dynamic layers in order', async () => {
    const resolved = await resolveSeoMetadata(
      [
        { title: 'Site', description: 'Global description.', openGraph: { type: seoOpenGraphType.website } },
        { title: 'Docs' },
        { description: 'Page description.' },
        async () => ({ title: 'Final Docs' }),
      ],
      { path: '/docs', siteUrl: 'https://vanrot.vankode.com' },
    );

    expect(resolved).toEqual({
      title: 'Final Docs',
      description: 'Page description.',
      canonical: 'https://vanrot.vankode.com/docs',
      openGraph: { type: 'website' },
    });
  });

  it('does not invent a canonical URL when siteUrl is absent', async () => {
    const resolved = await resolveSeoMetadata([{ title: 'Draft', description: 'No prod URL yet.' }], {
      path: '/draft',
    });

    expect(resolved.canonical).toBeUndefined();
  });
});
```

- [x] **Step 2: Run failing ladder tests**

Run: `pnpm --filter @vanrot/seo test -- ladder.test.ts`

Expected: FAIL with missing `resolveSeoMetadata`.

- [x] **Step 3: Implement ladder resolution**

```ts
// packages/seo/src/ladder.ts
import { resolveSeoInput, type SeoInput } from './metadata.js';
import type { SeoMetadata, SeoResolveContext, ResolvedSeoMetadata } from './types.js';

export type SeoLayer = SeoMetadata | SeoInput;

export async function resolveSeoMetadata(
  layers: readonly SeoLayer[],
  context: SeoResolveContext = {},
): Promise<Partial<ResolvedSeoMetadata>> {
  let resolved: SeoMetadata = {};

  for (const layer of layers) {
    const next = await resolveSeoInput(layer, context);
    resolved = mergeSeoMetadata(resolved, next);
  }

  if (resolved.canonical === undefined && context.siteUrl !== undefined && context.path !== undefined) {
    resolved = { ...resolved, canonical: resolveCanonicalUrl(context.siteUrl, context.path) };
  }

  return resolved;
}

export function resolveCanonicalUrl(siteUrl: string, path: string): string {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  const routePath = path.startsWith('/') ? path.slice(1) : path;
  return new URL(routePath, base).toString();
}

function mergeSeoMetadata(current: SeoMetadata, next: SeoMetadata): SeoMetadata {
  return {
    ...current,
    ...next,
    openGraph: mergeObject(current.openGraph, next.openGraph),
    twitter: mergeObject(current.twitter, next.twitter),
  };
}

function mergeObject<T extends object>(current: T | undefined, next: T | undefined): T | undefined {
  if (current === undefined) {
    return next;
  }

  if (next === undefined) {
    return current;
  }

  return { ...current, ...next };
}
```

- [x] **Step 4: Export ladder APIs**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './ladder.js';
export * from './metadata.js';
export type * from './types.js';
```

- [x] **Step 5: Run ladder tests**

Run: `pnpm --filter @vanrot/seo test -- ladder.test.ts`

Expected: PASS.

---

### Task 4: Structured Data And Social Image Validation

**Files:**

- Create: `packages/seo/src/structured-data.ts`
- Create: `packages/seo/src/social.ts`
- Create: `packages/seo/tests/structured-data.test.ts`
- Create: `packages/seo/tests/social.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing structured data test**

```ts
// packages/seo/tests/structured-data.test.ts
import { describe, expect, it } from 'vitest';
import { breadcrumbListSchema, rawSchema, seoSchemaType, webSiteSchema } from '../src/index.js';

describe('structured data helpers', () => {
  it('builds typed JSON-LD objects', () => {
    expect(webSiteSchema({ name: 'Vanrot', url: 'https://vanrot.vankode.com' })).toEqual({
      '@type': seoSchemaType.webSite,
      name: 'Vanrot',
      url: 'https://vanrot.vankode.com',
    });

    expect(
      breadcrumbListSchema([
        { name: 'Docs', url: 'https://vanrot.vankode.com/docs' },
        { name: 'SEO', url: 'https://vanrot.vankode.com/docs/seo' },
      ]),
    ).toEqual({
      '@type': seoSchemaType.breadcrumbList,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Docs', item: 'https://vanrot.vankode.com/docs' },
        { '@type': 'ListItem', position: 2, name: 'SEO', item: 'https://vanrot.vankode.com/docs/seo' },
      ],
    });
  });

  it('keeps raw schema as an explicit escape hatch', () => {
    expect(rawSchema({ '@type': 'FAQPage', mainEntity: [] })).toEqual({
      '@type': 'FAQPage',
      mainEntity: [],
    });
  });
});
```

- [x] **Step 2: Write failing social test**

```ts
// packages/seo/tests/social.test.ts
import { describe, expect, it } from 'vitest';
import { socialImage, validateSocialImage } from '../src/index.js';

describe('social image validation', () => {
  it('accepts valid image metadata', () => {
    const image = socialImage({
      url: 'https://vanrot.vankode.com/og.png',
      alt: 'Vanrot documentation preview',
      width: 1200,
      height: 630,
    });

    expect(validateSocialImage(image)).toEqual([]);
  });

  it('reports invalid image metadata without generating an image', () => {
    expect(validateSocialImage({ url: '/og.png', alt: '' })).toEqual([
      'Social image URL must be absolute.',
      'Social image alt text is required.',
    ]);
  });
});
```

- [x] **Step 3: Run failing helper tests**

Run: `pnpm --filter @vanrot/seo test -- structured-data.test.ts social.test.ts`

Expected: FAIL with missing helper exports.

- [x] **Step 4: Implement structured data helpers**

```ts
// packages/seo/src/structured-data.ts
import { seoSchemaType } from './constants.js';
import type { SeoSchema } from './types.js';

export interface WebSiteSchemaInput {
  name: string;
  url: string;
}

export interface BreadcrumbItemInput {
  name: string;
  url: string;
}

export function webSiteSchema(input: WebSiteSchemaInput): SeoSchema {
  return {
    '@type': seoSchemaType.webSite,
    name: input.name,
    url: input.url,
  };
}

export function breadcrumbListSchema(items: readonly BreadcrumbItemInput[]): SeoSchema {
  return {
    '@type': seoSchemaType.breadcrumbList,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function rawSchema(schema: SeoSchema): SeoSchema {
  return schema;
}
```

- [x] **Step 5: Implement social image validation**

```ts
// packages/seo/src/social.ts
import type { SeoImage } from './types.js';

export function socialImage(image: SeoImage): SeoImage {
  return image;
}

export function validateSocialImage(image: SeoImage | undefined): string[] {
  if (image === undefined) {
    return [];
  }

  const diagnostics: string[] = [];

  if (!isAbsoluteUrl(image.url)) {
    diagnostics.push('Social image URL must be absolute.');
  }

  if (image.alt.trim() === '') {
    diagnostics.push('Social image alt text is required.');
  }

  if (image.width !== undefined && image.width < 600) {
    diagnostics.push('Social image width should be at least 600 pixels.');
  }

  if (image.height !== undefined && image.height < 315) {
    diagnostics.push('Social image height should be at least 315 pixels.');
  }

  return diagnostics;
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
```

- [x] **Step 6: Export helper APIs**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './ladder.js';
export * from './metadata.js';
export * from './social.js';
export * from './structured-data.js';
export type * from './types.js';
```

- [x] **Step 7: Run helper tests**

Run: `pnpm --filter @vanrot/seo test -- structured-data.test.ts social.test.ts`

Expected: PASS.

---

### Task 5: Sitemap And Robots Outputs

**Files:**

- Create: `packages/seo/src/sitemap.ts`
- Create: `packages/seo/src/robots.ts`
- Create: `packages/seo/tests/sitemap.test.ts`
- Create: `packages/seo/tests/robots.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing sitemap test**

```ts
// packages/seo/tests/sitemap.test.ts
import { describe, expect, it } from 'vitest';
import { generateSitemapXml, seoSitemapChangeFrequency } from '../src/index.js';

describe('sitemap generation', () => {
  it('generates XML for static and explicit dynamic routes', async () => {
    const xml = await generateSitemapXml({
      siteUrl: 'https://vanrot.vankode.com',
      routes: [{ path: '/', changeFrequency: seoSitemapChangeFrequency.weekly }],
      dynamicRoutes: [
        async () => [{ path: '/blog/seo', lastModified: new Date('2026-06-03T00:00:00.000Z') }],
      ],
    });

    expect(xml).toContain('<loc>https://vanrot.vankode.com/</loc>');
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('<loc>https://vanrot.vankode.com/blog/seo</loc>');
    expect(xml).toContain('<lastmod>2026-06-03</lastmod>');
  });
});
```

- [x] **Step 2: Write failing robots test**

```ts
// packages/seo/tests/robots.test.ts
import { describe, expect, it } from 'vitest';
import { generateRobotsTxt } from '../src/index.js';

describe('robots.txt generation', () => {
  it('generates robots text with sitemap URL', () => {
    expect(
      generateRobotsTxt({
        siteUrl: 'https://vanrot.vankode.com',
        rules: [{ userAgent: '*', allow: ['/'], disallow: ['/admin'] }],
      }),
    ).toBe('User-agent: *\\nAllow: /\\nDisallow: /admin\\nSitemap: https://vanrot.vankode.com/sitemap.xml\\n');
  });
});
```

- [x] **Step 3: Run failing output tests**

Run: `pnpm --filter @vanrot/seo test -- sitemap.test.ts robots.test.ts`

Expected: FAIL with missing sitemap and robots exports.

- [x] **Step 4: Implement sitemap generation**

```ts
// packages/seo/src/sitemap.ts
import { resolveCanonicalUrl } from './ladder.js';
import type { SeoSitemapChangeFrequency } from './types.js';

export interface SitemapRoute {
  path: string;
  lastModified?: Date;
  changeFrequency?: SeoSitemapChangeFrequency;
  priority?: number;
}

export type DynamicSitemapProvider = () => SitemapRoute[] | Promise<SitemapRoute[]>;

export interface SitemapInput {
  siteUrl: string;
  routes?: readonly SitemapRoute[];
  dynamicRoutes?: readonly DynamicSitemapProvider[];
}

export async function generateSitemapXml(input: SitemapInput): Promise<string> {
  const dynamicRoutes = await Promise.all((input.dynamicRoutes ?? []).map((provider) => provider()));
  const routes = [...(input.routes ?? []), ...dynamicRoutes.flat()];
  const entries = routes.map((route) => renderSitemapRoute(input.siteUrl, route)).join('');
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">${entries}</urlset>\\n`;
}

function renderSitemapRoute(siteUrl: string, route: SitemapRoute): string {
  const lastModified = route.lastModified === undefined
    ? ''
    : `<lastmod>${route.lastModified.toISOString().slice(0, 10)}</lastmod>`;
  const changeFrequency = route.changeFrequency === undefined
    ? ''
    : `<changefreq>${route.changeFrequency}</changefreq>`;
  const priority = route.priority === undefined ? '' : `<priority>${route.priority.toFixed(1)}</priority>`;
  return `<url><loc>${escapeXml(resolveCanonicalUrl(siteUrl, route.path))}</loc>${lastModified}${changeFrequency}${priority}</url>`;
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;');
}
```

- [x] **Step 5: Implement robots generation**

```ts
// packages/seo/src/robots.ts
export interface RobotsRule {
  userAgent: string;
  allow?: readonly string[];
  disallow?: readonly string[];
}

export interface RobotsInput {
  siteUrl?: string;
  rules?: readonly RobotsRule[];
}

export function generateRobotsTxt(input: RobotsInput = {}): string {
  const rules = input.rules ?? [{ userAgent: '*', allow: ['/'] }];
  const lines = rules.flatMap((rule) => [
    `User-agent: ${rule.userAgent}`,
    ...(rule.allow ?? []).map((path) => `Allow: ${path}`),
    ...(rule.disallow ?? []).map((path) => `Disallow: ${path}`),
  ]);

  if (input.siteUrl !== undefined) {
    const base = input.siteUrl.endsWith('/') ? input.siteUrl.slice(0, -1) : input.siteUrl;
    lines.push(`Sitemap: ${base}/sitemap.xml`);
  }

  return `${lines.join('\\n')}\\n`;
}
```

- [x] **Step 6: Export output APIs**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './ladder.js';
export * from './metadata.js';
export * from './robots.js';
export * from './sitemap.js';
export * from './social.js';
export * from './structured-data.js';
export type * from './types.js';
```

- [x] **Step 7: Run output tests**

Run: `pnpm --filter @vanrot/seo test -- sitemap.test.ts robots.test.ts`

Expected: PASS.

---

### Task 6: SSR Tags And Client Head Updates

**Files:**

- Create: `packages/seo/src/render.ts`
- Create: `packages/seo/src/head.ts`
- Create: `packages/seo/tests/render.test.ts`
- Create: `packages/seo/tests/head.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing render test**

```ts
// packages/seo/tests/render.test.ts
import { describe, expect, it } from 'vitest';
import { renderSeoTags, seoRobotsDirective } from '../src/index.js';

describe('SSR SEO rendering', () => {
  it('renders stable HTML tags', () => {
    expect(
      renderSeoTags({
        title: 'Vanrot',
        description: 'Vanrot framework docs.',
        canonical: 'https://vanrot.vankode.com',
        robots: [seoRobotsDirective.index, seoRobotsDirective.follow],
      }),
    ).toBe(
      '<title>Vanrot</title>\\n<meta name=\"description\" content=\"Vanrot framework docs.\">\\n<link rel=\"canonical\" href=\"https://vanrot.vankode.com\">\\n<meta name=\"robots\" content=\"index, follow\">',
    );
  });
});
```

- [x] **Step 2: Write failing head test**

```ts
// packages/seo/tests/head.test.ts
import { describe, expect, it } from 'vitest';
import { applySeoToHead } from '../src/index.js';

describe('client head updates', () => {
  it('updates document title and managed metadata', () => {
    const document = new DOMParser().parseFromString('<html><head></head><body></body></html>', 'text/html');

    applySeoToHead(document, {
      title: 'Client SEO',
      description: 'Updated from route metadata.',
    });

    expect(document.title).toBe('Client SEO');
    expect(document.head.querySelector('meta[name=\"description\"]')?.getAttribute('content')).toBe(
      'Updated from route metadata.',
    );
  });
});
```

- [x] **Step 3: Run failing render/head tests**

Run: `pnpm --filter @vanrot/seo test -- render.test.ts head.test.ts`

Expected: FAIL with missing render/head exports.

- [x] **Step 4: Implement SSR rendering**

```ts
// packages/seo/src/render.ts
import type { SeoMetadata } from './types.js';

export function renderSeoTags(metadata: SeoMetadata): string {
  const tags: string[] = [];

  if (metadata.title !== undefined) {
    tags.push(`<title>${escapeHtml(metadata.title)}</title>`);
  }

  if (metadata.description !== undefined) {
    tags.push(`<meta name=\"description\" content=\"${escapeHtml(metadata.description)}\">`);
  }

  if (metadata.canonical !== undefined) {
    tags.push(`<link rel=\"canonical\" href=\"${escapeHtml(metadata.canonical)}\">`);
  }

  if (metadata.robots !== undefined) {
    tags.push(`<meta name=\"robots\" content=\"${escapeHtml(metadata.robots.join(', '))}\">`);
  }

  return tags.join('\\n');
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;');
}
```

- [x] **Step 5: Implement client head updater**

```ts
// packages/seo/src/head.ts
import type { SeoMetadata } from './types.js';

export function applySeoToHead(document: Document, metadata: SeoMetadata): void {
  if (metadata.title !== undefined) {
    document.title = metadata.title;
  }

  upsertMeta(document, 'description', metadata.description);
  upsertLink(document, 'canonical', metadata.canonical);
}

function upsertMeta(document: Document, name: string, content: string | undefined): void {
  if (content === undefined) {
    return;
  }

  const selector = `meta[name=\"${name}\"]`;
  const existing = document.head.querySelector(selector);
  const element = existing ?? document.createElement('meta');
  element.setAttribute('name', name);
  element.setAttribute('content', content);

  if (existing === null) {
    document.head.append(element);
  }
}

function upsertLink(document: Document, rel: string, href: string | undefined): void {
  if (href === undefined) {
    return;
  }

  const selector = `link[rel=\"${rel}\"]`;
  const existing = document.head.querySelector(selector);
  const element = existing ?? document.createElement('link');
  element.setAttribute('rel', rel);
  element.setAttribute('href', href);

  if (existing === null) {
    document.head.append(element);
  }
}
```

- [x] **Step 6: Export render/head APIs**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './head.js';
export * from './ladder.js';
export * from './metadata.js';
export * from './render.js';
export * from './robots.js';
export * from './sitemap.js';
export * from './social.js';
export * from './structured-data.js';
export type * from './types.js';
```

- [x] **Step 7: Run render/head tests**

Run: `pnpm --filter @vanrot/seo test -- render.test.ts head.test.ts`

Expected: PASS.

---

### Task 7: SEO Diagnostics

**Files:**

- Create: `packages/seo/src/diagnostics.ts`
- Create: `packages/seo/tests/diagnostics.test.ts`
- Modify: `packages/seo/src/index.ts`

- [x] **Step 1: Write failing diagnostics tests**

```ts
// packages/seo/tests/diagnostics.test.ts
import { describe, expect, it } from 'vitest';
import { diagnoseSeoMetadata, seoDiagnosticCode, seoRobotsDirective } from '../src/index.js';

describe('SEO diagnostics', () => {
  it('reports content quality warnings in balanced mode', () => {
    const findings = diagnoseSeoMetadata(
      {
        title: 'A'.repeat(71),
        description: '',
        robots: [seoRobotsDirective.noindex],
      },
      { diagnosticsMode: 'warn', siteUrl: undefined, production: true },
    );

    expect(findings.map((finding) => finding.code)).toEqual([
      seoDiagnosticCode.missingDescription,
      seoDiagnosticCode.titleTooLong,
      seoDiagnosticCode.missingSiteUrl,
      seoDiagnosticCode.accidentalNoindex,
    ]);
    expect(findings.every((finding) => finding.severity === 'warning')).toBe(true);
  });

  it('escalates warnings in strict mode', () => {
    const findings = diagnoseSeoMetadata({ title: '', description: '' }, { diagnosticsMode: 'strict' });
    expect(findings[0]?.severity).toBe('error');
  });
});
```

- [x] **Step 2: Run failing diagnostics tests**

Run: `pnpm --filter @vanrot/seo test -- diagnostics.test.ts`

Expected: FAIL with missing `diagnoseSeoMetadata`.

- [x] **Step 3: Implement package diagnostics**

```ts
// packages/seo/src/diagnostics.ts
import { seoDiagnosticCode, seoRobotsDirective } from './constants.js';
import type { SeoDiagnostic, SeoMetadata } from './types.js';

export type SeoDiagnosticsMode = 'warn' | 'strict';

export interface SeoDiagnosticsContext {
  diagnosticsMode?: SeoDiagnosticsMode;
  siteUrl?: string;
  production?: boolean;
}

export function diagnoseSeoMetadata(
  metadata: SeoMetadata,
  context: SeoDiagnosticsContext = {},
): SeoDiagnostic[] {
  const severity = context.diagnosticsMode === 'strict' ? 'error' : 'warning';
  const findings: SeoDiagnostic[] = [];

  if (metadata.title === undefined || metadata.title.trim() === '') {
    findings.push(finding(seoDiagnosticCode.missingTitle, severity, 'SEO title is missing.', 'Add a page title.'));
  }

  if (metadata.description === undefined || metadata.description.trim() === '') {
    findings.push(
      finding(seoDiagnosticCode.missingDescription, severity, 'SEO description is missing.', 'Add a meta description.'),
    );
  }

  if (metadata.title !== undefined && metadata.title.length > 60) {
    findings.push(
      finding(seoDiagnosticCode.titleTooLong, severity, 'SEO title is longer than 60 characters.', 'Shorten the title.'),
    );
  }

  if (metadata.description !== undefined && metadata.description.length > 160) {
    findings.push(
      finding(
        seoDiagnosticCode.descriptionTooLong,
        severity,
        'SEO description is longer than 160 characters.',
        'Shorten the description.',
      ),
    );
  }

  if (context.production === true && context.siteUrl === undefined) {
    findings.push(
      finding(seoDiagnosticCode.missingSiteUrl, severity, 'seo.siteUrl is not configured.', 'Set seo.siteUrl before launch.'),
    );
  }

  if (metadata.robots?.includes(seoRobotsDirective.noindex) && context.production === true) {
    findings.push(
      finding(
        seoDiagnosticCode.accidentalNoindex,
        severity,
        'Production metadata includes noindex.',
        'Remove noindex or set diagnostics mode to warn for draft routes.',
      ),
    );
  }

  return findings;
}

function finding(code: string, severity: 'error' | 'warning', message: string, nextStep: string): SeoDiagnostic {
  return { code, severity, message: `${code} ${message}`, nextStep };
}
```

- [x] **Step 4: Export diagnostics API**

```ts
// packages/seo/src/index.ts
export * from './constants.js';
export * from './diagnostics.js';
export * from './head.js';
export * from './ladder.js';
export * from './metadata.js';
export * from './render.js';
export * from './robots.js';
export * from './sitemap.js';
export * from './social.js';
export * from './structured-data.js';
export type * from './types.js';
```

- [x] **Step 5: Run diagnostics tests**

Run: `pnpm --filter @vanrot/seo test -- diagnostics.test.ts`

Expected: PASS.

---

### Task 8: Config Domain And Validation

**Files:**

- Modify: `packages/config/src/constants.ts`
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/diagnostics.ts`
- Modify: `packages/config/src/validate.ts`
- Modify: `packages/config/src/editor.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/config/tests/validate.test.ts`
- Modify: `packages/config/tests/defaults.test.ts`
- Modify: `packages/config/tests/editor.test.ts`

- [x] **Step 1: Write failing config validation tests**

```ts
// packages/config/tests/validate.test.ts
import { describe, expect, it } from 'vitest';
import { configDiagnosticCode, seoDiagnosticsMode, validateVanrotConfig } from '../src/index.js';

describe('SEO config validation', () => {
  it('accepts SEO config without a production site URL', () => {
    expect(
      validateVanrotConfig({
        seo: {
          diagnostics: { mode: seoDiagnosticsMode.warn },
          defaults: {
            title: 'Vanrot',
            description: 'Framework docs.',
          },
        },
      }),
    ).toEqual([]);
  });

  it('reports SEO syntax errors even when siteUrl is absent', () => {
    const diagnostics = validateVanrotConfig({
      seo: {
        siteUrl: 'not a url',
        diagnostics: { mode: 'loud' },
        defaults: {
          title: '',
          robots: ['crawl'],
        },
      },
    } as never);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      configDiagnosticCode.invalidSeoSiteUrl,
      configDiagnosticCode.invalidSeoDiagnosticsMode,
      configDiagnosticCode.invalidSeoDefaults,
      configDiagnosticCode.invalidSeoRobots,
    ]);
  });
});
```

- [x] **Step 2: Write failing defaults test**

```ts
// packages/config/tests/defaults.test.ts
import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig, seoDiagnosticsMode } from '../src/index.js';

describe('SEO config defaults', () => {
  it('normalizes SEO only when configured', () => {
    expect(normalizeVanrotConfig({}).seo).toEqual({
      enabled: false,
      siteUrl: undefined,
      diagnostics: { mode: seoDiagnosticsMode.warn },
      defaults: {},
      sitemap: { enabled: false },
      robots: { enabled: false },
    });
  });
});
```

- [x] **Step 3: Write failing editor test**

```ts
// packages/config/tests/editor.test.ts
import { describe, expect, it } from 'vitest';
import { upsertVanrotConfigDomain } from '../src/index.js';

describe('SEO config editor', () => {
  it('can insert generated SEO domain without removing user config', () => {
    const source = "import { defineConfig } from '@vanrot/config';\\n\\nexport default defineConfig({\\n  devServer: { port: 1964 },\\n});\\n";
    const result = upsertVanrotConfigDomain(
      source,
      'seo',
      "{ enabled: true, diagnostics: { mode: 'warn' }, defaults: { title: 'Vanrot', description: 'Vanrot app.' }, sitemap: { enabled: true }, robots: { enabled: true } }",
    );

    expect(result).toContain('seo: { enabled: true');
    expect(result).toContain('devServer: { port: 1964 }');
  });
});
```

- [x] **Step 4: Run failing config tests**

Run: `pnpm --filter @vanrot/config test -- validate.test.ts defaults.test.ts editor.test.ts`

Expected: FAIL with missing SEO types/constants/diagnostics.

- [x] **Step 5: Add config constants and diagnostics**

```ts
// packages/config/src/constants.ts
export const configDomain = {
  source: 'source',
  devServer: 'devServer',
  router: 'router',
  ui: 'ui',
  behavior: 'behavior',
  ai: 'ai',
  seo: 'seo',
} as const;

export const seoDiagnosticsMode = {
  warn: 'warn',
  strict: 'strict',
} as const;

export const seoRobotsDirective = {
  index: 'index',
  noindex: 'noindex',
  follow: 'follow',
  nofollow: 'nofollow',
  noarchive: 'noarchive',
  nosnippet: 'nosnippet',
} as const;
```

```ts
// packages/config/src/diagnostics.ts
export const configDiagnosticCode = {
  loadFailed: 'VRCFG001',
  unknownTopLevelKey: 'VRCFG002',
  invalidPort: 'VRCFG003',
  migrationSuggested: 'VRCFG004',
  recoverAmbiguous: 'VRCFG005',
  invalidUiFlavor: 'VRCFG006',
  invalidUiStyleMode: 'VRCFG007',
  invalidUiPrefix: 'VRCFG008',
  invalidRouterNavigationPolish: 'VRCFG009',
  invalidRouterDiagnosticLevel: 'VRCFG010',
  invalidAiRuleSection: 'VRCFG011',
  invalidAiRuleCustomSection: 'VRCFG012',
  invalidBehavior: 'VRCFG013',
  invalidSeoSiteUrl: 'VRCFG014',
  invalidSeoDiagnosticsMode: 'VRCFG015',
  invalidSeoDefaults: 'VRCFG016',
  invalidSeoRobots: 'VRCFG017',
  invalidSeoSitemap: 'VRCFG018',
  invalidSeoRobotsPolicy: 'VRCFG019',
  invalidSeoSocialImage: 'VRCFG020',
} as const;
```

- [x] **Step 6: Add SEO config types**

```ts
// packages/config/src/types.ts
import type { seoDiagnosticsMode, seoRobotsDirective } from './constants.js';

export type VanrotSeoDiagnosticsMode = (typeof seoDiagnosticsMode)[keyof typeof seoDiagnosticsMode];
export type VanrotSeoRobotsDirective = (typeof seoRobotsDirective)[keyof typeof seoRobotsDirective];

export interface VanrotSeoMetadataDefaults {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: VanrotSeoRobotsDirective[];
  image?: string;
}

export interface VanrotSeoDiagnosticsConfig {
  mode?: VanrotSeoDiagnosticsMode;
}

export interface VanrotSeoBuildOutputConfig {
  enabled?: boolean;
}

export interface VanrotSeoConfig {
  enabled?: boolean;
  siteUrl?: string;
  diagnostics?: VanrotSeoDiagnosticsConfig;
  defaults?: VanrotSeoMetadataDefaults;
  sitemap?: VanrotSeoBuildOutputConfig;
  robots?: VanrotSeoBuildOutputConfig;
}

export interface NormalizedVanrotSeoConfig {
  enabled: boolean;
  siteUrl: string | undefined;
  diagnostics: { mode: VanrotSeoDiagnosticsMode };
  defaults: VanrotSeoMetadataDefaults;
  sitemap: { enabled: boolean };
  robots: { enabled: boolean };
}

export interface VanrotConfig {
  seo?: VanrotSeoConfig;
}

export interface NormalizedVanrotConfig {
  seo: NormalizedVanrotSeoConfig;
}
```

- [x] **Step 7: Add SEO normalization**

```ts
// packages/config/src/defaults.ts
import {
  configSchemaVersion,
  defaultDevServerPort,
  defaultSourceRoot,
  seoDiagnosticsMode,
} from './constants.js';

export function normalizeVanrotConfig(config: VanrotConfig = {}): NormalizedVanrotConfig {
  return {
    ...config,
    schemaVersion: config.schemaVersion ?? configSchemaVersion,
    source: {
      root: config.source?.root ?? defaultSourceRoot,
    },
    devServer: {
      port: config.devServer?.port ?? defaultDevServerPort,
    },
    router: {
      navigationPolish: {
        title: config.router?.navigationPolish?.title ?? true,
        meta: config.router?.navigationPolish?.meta ?? true,
        scroll: config.router?.navigationPolish?.scroll ?? true,
        focus: config.router?.navigationPolish?.focus ?? true,
      },
      diagnostics: {
        missingTitle: config.router?.diagnostics?.missingTitle ?? vanrotRouterDiagnosticLevel.warn,
        missingMetaDescription:
          config.router?.diagnostics?.missingMetaDescription ?? vanrotRouterDiagnosticLevel.off,
      },
    },
    ui: {
      flavor: config.ui?.flavor ?? vanrotUiFlavor.october,
      styles: config.ui?.styles ?? vanrotUiStyleMode.vanrotstyles,
      prefix: config.ui?.prefix ?? 'ui',
    },
    behavior: {
      enabled: config.behavior?.enabled ?? [],
    },
    ai: {
      enabled: config.ai?.enabled ?? true,
      rules: {
        enabledSections: config.ai?.rules?.enabledSections ?? [
          vanrotAiRuleSection.projectRules,
          vanrotAiRuleSection.commands,
          vanrotAiRuleSection.fileConventions,
        ],
        customSections: config.ai?.rules?.customSections ?? [],
      },
    },
    seo: {
      enabled: config.seo?.enabled ?? false,
      siteUrl: config.seo?.siteUrl,
      diagnostics: {
        mode: config.seo?.diagnostics?.mode ?? seoDiagnosticsMode.warn,
      },
      defaults: config.seo?.defaults ?? {},
      sitemap: {
        enabled: config.seo?.sitemap?.enabled ?? false,
      },
      robots: {
        enabled: config.seo?.robots?.enabled ?? false,
      },
    },
  };
}
```

- [x] **Step 8: Add SEO validation**

```ts
// packages/config/src/validate.ts
const knownSeoDiagnosticsModes = new Set<string>(Object.values(seoDiagnosticsMode));
const knownSeoRobotsDirectives = new Set<string>(Object.values(seoRobotsDirective));

function validateSeoConfig(config: VanrotConfig, diagnostics: ConfigDiagnostic[]): void {
  const seo = config.seo as VanrotSeoConfig | undefined;

  if (seo === undefined) {
    return;
  }

  if (seo.siteUrl !== undefined && !isAbsoluteUrl(seo.siteUrl)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoSiteUrl,
      severity: 'error',
      message: `Invalid seo.siteUrl: ${String(seo.siteUrl)}`,
      suggestion: 'Use an absolute URL such as https://example.com, or omit siteUrl until production URL is known.',
    });
  }

  const mode = seo.diagnostics?.mode;
  if (mode !== undefined && !knownSeoDiagnosticsModes.has(String(mode))) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoDiagnosticsMode,
      severity: 'error',
      message: `Invalid seo.diagnostics.mode: ${String(mode)}`,
      suggestion: 'Use warn or strict.',
    });
  }

  if (seo.defaults?.title !== undefined && seo.defaults.title.trim() === '') {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoDefaults,
      severity: 'error',
      message: 'Invalid seo.defaults.title: title cannot be empty.',
      suggestion: 'Set a non-empty default title or remove the title field.',
    });
  }

  for (const directive of seo.defaults?.robots ?? []) {
    if (knownSeoRobotsDirectives.has(String(directive))) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidSeoRobots,
      severity: 'error',
      message: `Invalid seo.defaults.robots entry: ${String(directive)}`,
      suggestion: 'Use exported SEO robots directives such as index, follow, noindex, or nofollow.',
    });
  }
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
```

- [x] **Step 9: Run config tests**

Run: `pnpm --filter @vanrot/config test -- validate.test.ts defaults.test.ts editor.test.ts`

Expected: PASS.

---

### Task 9: CLI Create And Add SEO Flows

**Files:**

- Create: `packages/cli/src/seo/constants.ts`
- Create: `packages/cli/src/seo/create-seo.ts`
- Create: `packages/cli/src/seo/add-seo.ts`
- Modify: `packages/cli/src/commands/add.ts`
- Modify: `packages/cli/src/commands/create.ts`
- Modify: `packages/cli/src/create/write-app.ts`
- Create: `packages/cli/tests/seo-command.test.ts`
- Create: `packages/cli/tests/seo-create.test.ts`

- [x] **Step 1: Write failing `vr add seo` test**

```ts
// packages/cli/tests/seo-command.test.ts
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { addCommand } from '../src/commands/add.js';
import { createTestCommandContext } from './test-utils.js';

describe('vr add seo', () => {
  it('adds dependency, config, and app SEO utility without overwriting user files', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-add-'));
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ dependencies: {} }, null, 2));
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "import { defineConfig } from '@vanrot/config';\\n\\nexport default defineConfig({\\n  devServer: { port: 1964 },\\n});\\n",
    );

    const result = await addCommand(['seo', '--site-url', 'https://vanrot.vankode.com'], createTestCommandContext(cwd));

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src/app/seo.ts'), 'utf8')).resolves.toContain('defineSeo');
    await expect(readFile(join(cwd, 'vanrot.config.ts'), 'utf8')).resolves.toContain('seo: {');
    await expect(readFile(join(cwd, 'package.json'), 'utf8')).resolves.toContain('@vanrot/seo');
  });
});
```

- [x] **Step 2: Write failing create opt-in/out tests**

```ts
// packages/cli/tests/seo-create.test.ts
import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { createCommand } from '../src/commands/create.js';
import { createTestCommandContext } from './test-utils.js';

describe('vr create SEO selection', () => {
  it('writes SEO files when selected', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-create-'));
    const result = await createCommand(
      ['seo-app', '--seo', '--seo-site-url', 'https://vanrot.vankode.com'],
      createTestCommandContext(cwd),
    );

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'seo-app/src/app/seo.ts'), 'utf8')).resolves.toContain('siteName');
    await expect(readFile(join(cwd, 'seo-app/vanrot.config.ts'), 'utf8')).resolves.toContain('seo: {');
  });

  it('leaves no SEO residue when skipped', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-skip-'));
    const result = await createCommand(['plain-app', '--no-seo'], createTestCommandContext(cwd));

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'plain-app/package.json'), 'utf8')).resolves.not.toContain('@vanrot/seo');
    await expect(readFile(join(cwd, 'plain-app/vanrot.config.ts'), 'utf8')).resolves.not.toContain('seo:');
  });
});
```

- [x] **Step 3: Run failing CLI flow tests**

Run: `pnpm --filter @vanrot/cli test -- seo-command.test.ts seo-create.test.ts`

Expected: FAIL with missing SEO CLI handling.

- [x] **Step 4: Add SEO CLI constants**

```ts
// packages/cli/src/seo/constants.ts
export const seoCommandName = 'seo' as const;
export const seoPackageName = '@vanrot/seo' as const;
export const seoUtilityPath = 'src/app/seo.ts' as const;
export const generatedSeoConfigSource =
  "{ enabled: true, diagnostics: { mode: 'warn' }, defaults: { title: 'Vanrot app', description: 'Built with Vanrot.' }, sitemap: { enabled: true }, robots: { enabled: true } }" as const;
```

- [x] **Step 5: Add generated app SEO utility writer**

```ts
// packages/cli/src/seo/create-seo.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { seoUtilityPath } from './constants.js';

export interface SeoSelection {
  enabled: boolean;
  siteUrl?: string;
}

export function resolveSeoSelection(args: readonly string[]): SeoSelection {
  if (args.includes('--no-seo')) {
    return { enabled: false };
  }

  if (!args.includes('--seo')) {
    return { enabled: false };
  }

  const siteUrlIndex = args.indexOf('--seo-site-url');
  const siteUrl = siteUrlIndex === -1 ? undefined : args[siteUrlIndex + 1];
  return { enabled: true, siteUrl };
}

export async function writeSeoUtility(appRoot: string, selection: SeoSelection): Promise<void> {
  if (!selection.enabled) {
    return;
  }

  const target = join(appRoot, seoUtilityPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, seoUtilitySource(selection));
}

export function seoUtilitySource(selection: SeoSelection): string {
  const siteUrlLine = selection.siteUrl === undefined ? '' : `export const siteUrl = '${selection.siteUrl}' as const;\\n`;
  return `import { defineSeo, seoOpenGraphType, seoTwitterCard } from '@vanrot/seo';\\n\\nexport const siteName = 'Vanrot app' as const;\\n${siteUrlLine}export const defaultSocialImage = '/og.png' as const;\\n\\nexport const appSeo = defineSeo({\\n  title: siteName,\\n  description: 'Built with Vanrot.',\\n  openGraph: { type: seoOpenGraphType.website },\\n  twitter: { card: seoTwitterCard.summaryLargeImage },\\n});\\n`;
}
```

- [x] **Step 6: Add `vr add seo` command flow**

```ts
// packages/cli/src/seo/add-seo.ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { upsertVanrotConfigDomain } from '@vanrot/config';
import type { CommandContext, CommandResult } from '../types.js';
import { generatedSeoConfigSource, seoPackageName, seoUtilityPath } from './constants.js';
import { seoUtilitySource } from './create-seo.js';

export async function addSeo(args: string[], context: CommandContext): Promise<CommandResult> {
  const siteUrlIndex = args.indexOf('--site-url');
  const siteUrl = siteUrlIndex === -1 ? undefined : args[siteUrlIndex + 1];

  await upsertPackageDependency(context.cwd, seoPackageName);
  await upsertSeoConfig(context.cwd, siteUrl);
  await writeGeneratedSeoUtility(context.cwd, siteUrl);

  context.reporter.success('SEO package configured');
  context.reporter.nextSteps(['Run vr doctor to review SEO warnings.']);
  return { exitCode: 0 };
}

async function upsertPackageDependency(cwd: string, packageName: string): Promise<void> {
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  packageJson.dependencies = { ...packageJson.dependencies, [packageName]: 'file:../packages/seo' };
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\\n`);
}

async function upsertSeoConfig(cwd: string, siteUrl: string | undefined): Promise<void> {
  const configPath = join(cwd, 'vanrot.config.ts');
  const source = await readFile(configPath, 'utf8');
  const configSource = siteUrl === undefined
    ? generatedSeoConfigSource
    : generatedSeoConfigSource.replace('enabled: true,', `enabled: true, siteUrl: '${siteUrl}',`);
  await writeFile(configPath, upsertVanrotConfigDomain(source, 'seo', configSource));
}

async function writeGeneratedSeoUtility(cwd: string, siteUrl: string | undefined): Promise<void> {
  const target = join(cwd, seoUtilityPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, seoUtilitySource({ enabled: true, siteUrl }));
}
```

- [x] **Step 7: Route `vr add seo`**

```ts
// packages/cli/src/commands/add.ts
import { addUiPrimitive } from '../add/add-ui.js';
import { addSeo } from '../seo/add-seo.js';
import { seoCommandName } from '../seo/constants.js';
import type { CommandContext, CommandResult } from '../types.js';

export async function addCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  if (args[0] === seoCommandName) {
    return addSeo(args.slice(1), context);
  }

  return addUiPrimitive(args, context);
}
```

- [x] **Step 8: Wire create flow**

```ts
// packages/cli/src/commands/create.ts
import { resolveSeoSelection } from '../seo/create-seo.js';

const seo = resolveSeoSelection(args);
const result = await writeApp({
  name,
  targetDirectory,
  behavior,
  seo,
});
```

```ts
// packages/cli/src/create/write-app.ts
import type { SeoSelection } from '../seo/create-seo.js';
import { writeSeoUtility } from '../seo/create-seo.js';
import { generatedSeoConfigSource, seoPackageName } from '../seo/constants.js';

export interface WriteAppOptions {
  seo: SeoSelection;
}

if (options.seo.enabled) {
  packageJson.dependencies[seoPackageName] = 'file:../packages/seo';
}

const seoConfig = options.seo.enabled ? `\\n  seo: ${generatedSeoConfigSource},` : '';
const configSource = `import { defineConfig } from '@vanrot/config';\\n\\nexport default defineConfig({\\n  devServer: { port: 1964 },${seoConfig}\\n});\\n`;

await writeSeoUtility(appRoot, options.seo);
```

- [x] **Step 9: Run CLI flow tests**

Run: `pnpm --filter @vanrot/cli test -- seo-command.test.ts seo-create.test.ts`

Expected: PASS.

---

### Task 10: Doctor SEO Project Scanner

**Files:**

- Create: `packages/cli/src/seo/doctor.ts`
- Modify: `packages/cli/src/doctor/checks.ts`
- Create: `packages/cli/tests/seo-doctor.test.ts`

- [x] **Step 1: Write failing SEO doctor tests**

```ts
// packages/cli/tests/seo-doctor.test.ts
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { checkSeoProject } from '../src/seo/doctor.js';

describe('SEO doctor', () => {
  it('warns when SEO is configured without a production URL', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-doctor-'));
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { seo: { enabled: true, defaults: { title: 'Vanrot', description: 'Docs.' } } };",
    );
    await mkdir(join(cwd, 'src/app'), { recursive: true });
    await writeFile(join(cwd, 'src/app/seo.ts'), "import { defineSeo } from '@vanrot/seo';\\nexport const appSeo = defineSeo({ title: 'Vanrot', description: 'Docs.' });\\n");

    const findings = await checkSeoProject(cwd);

    expect(findings).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        code: 'VRSEO005',
      }),
    );
  });

  it('errors on invalid SEO config syntax even without siteUrl', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-doctor-invalid-'));
    await writeFile(join(cwd, 'vanrot.config.ts'), "export default { seo: { enabled: true, defaults: { robots: ['crawl'] } } };");

    const findings = await checkSeoProject(cwd);

    expect(findings).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'VRCFG017',
      }),
    );
  });
});
```

- [x] **Step 2: Run failing SEO doctor tests**

Run: `pnpm --filter @vanrot/cli test -- seo-doctor.test.ts`

Expected: FAIL with missing `checkSeoProject`.

- [x] **Step 3: Implement SEO doctor scanner**

```ts
// packages/cli/src/seo/doctor.ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import type { DoctorFinding } from '../doctor/checks.js';

export async function checkSeoProject(cwd: string): Promise<DoctorFinding[]> {
  const loaded = await loadVanrotProjectConfig(cwd);
  const configFindings = loaded.diagnostics
    .filter((diagnostic) => diagnostic.code.startsWith('VRCFG01'))
    .map<DoctorFinding>((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      filePath: diagnostic.filePath ?? join(cwd, 'vanrot.config.ts'),
      message: formatConfigDiagnostic(diagnostic),
      nextStep: diagnostic.suggestion,
    }));

  if (!loaded.config.seo.enabled) {
    return configFindings;
  }

  const readinessFindings: DoctorFinding[] = [];
  if (loaded.config.seo.siteUrl === undefined) {
    readinessFindings.push({
      severity: loaded.config.seo.diagnostics.mode === 'strict' ? 'error' : 'warning',
      code: 'VRSEO005',
      filePath: join(cwd, 'vanrot.config.ts'),
      message: 'VRSEO005 seo.siteUrl is not configured.',
      nextStep: 'Set seo.siteUrl before production launch, or keep warn mode while the URL is unknown.',
    });
  }

  const seoUtility = await readOptional(join(cwd, 'src/app/seo.ts'));
  if (seoUtility === '') {
    readinessFindings.push({
      severity: 'warning',
      code: 'VRSEO013',
      filePath: join(cwd, 'src/app/seo.ts'),
      message: 'VRSEO013 Generated app SEO utility is missing.',
      nextStep: 'Run vr add seo to regenerate missing SEO support files.',
    });
  }

  return [...configFindings, ...readinessFindings];
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}
```

- [x] **Step 4: Add SEO scanner to doctor checks**

```ts
// packages/cli/src/doctor/checks.ts
import { checkBehaviorUsage } from './behavior.js';
import { checkProjectHealth } from './project-health.js';
import { checkVanrotRules } from './vanrot-rules.js';
import { checkSeoProject } from '../seo/doctor.js';

export async function runDoctorChecks(cwd: string): Promise<DoctorFinding[]> {
  return [
    ...(await checkProjectHealth(cwd)),
    ...(await checkVanrotRules(cwd)),
    ...(await checkBehaviorUsage(cwd)),
    ...(await checkSeoProject(cwd)),
  ];
}
```

- [x] **Step 5: Run SEO doctor tests**

Run: `pnpm --filter @vanrot/cli test -- seo-doctor.test.ts`

Expected: PASS.

---

### Task 11: Vite Build Sitemap And Robots Integration

**Files:**

- Create: `packages/vite-plugin/src/seo-build.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Create: `packages/vite-plugin/tests/seo-build.test.ts`

- [x] **Step 1: Write failing Vite SEO build test**

```ts
// packages/vite-plugin/tests/seo-build.test.ts
import { describe, expect, it } from 'vitest';
import { createSeoBuildArtifacts } from '../src/seo-build.js';

describe('SEO build artifacts', () => {
  it('emits sitemap and robots only when SEO outputs are enabled', async () => {
    const artifacts = await createSeoBuildArtifacts({
      siteUrl: 'https://vanrot.vankode.com',
      sitemap: { enabled: true },
      robots: { enabled: true },
      routes: [{ path: '/' }, { path: '/docs/seo' }],
    });

    expect(artifacts.map((artifact) => artifact.fileName)).toEqual(['sitemap.xml', 'robots.txt']);
    expect(artifacts[0]?.source).toContain('https://vanrot.vankode.com/docs/seo');
    expect(artifacts[1]?.source).toContain('Sitemap: https://vanrot.vankode.com/sitemap.xml');
  });
});
```

- [x] **Step 2: Run failing Vite SEO test**

Run: `pnpm --filter @vanrot/vite-plugin test -- seo-build.test.ts`

Expected: FAIL with missing `seo-build`.

- [x] **Step 3: Implement build artifact helper**

```ts
// packages/vite-plugin/src/seo-build.ts
import { generateRobotsTxt, generateSitemapXml, type SitemapRoute } from '@vanrot/seo';

export interface SeoBuildConfig {
  siteUrl?: string;
  sitemap?: { enabled: boolean };
  robots?: { enabled: boolean };
  routes?: readonly SitemapRoute[];
}

export interface SeoBuildArtifact {
  fileName: string;
  source: string;
}

export async function createSeoBuildArtifacts(config: SeoBuildConfig): Promise<SeoBuildArtifact[]> {
  if (config.siteUrl === undefined) {
    return [];
  }

  const artifacts: SeoBuildArtifact[] = [];

  if (config.sitemap?.enabled) {
    artifacts.push({
      fileName: 'sitemap.xml',
      source: await generateSitemapXml({ siteUrl: config.siteUrl, routes: config.routes ?? [] }),
    });
  }

  if (config.robots?.enabled) {
    artifacts.push({
      fileName: 'robots.txt',
      source: generateRobotsTxt({ siteUrl: config.siteUrl }),
    });
  }

  return artifacts;
}
```

- [x] **Step 4: Emit artifacts from Vite plugin**

```ts
// packages/vite-plugin/src/plugin.ts
import { createSeoBuildArtifacts } from './seo-build.js';

async generateBundle() {
  const loaded = await loadVanrotProjectConfig(resolvedConfig.root);
  const artifacts = await createSeoBuildArtifacts({
    siteUrl: loaded.config.seo.siteUrl,
    sitemap: loaded.config.seo.sitemap,
    robots: loaded.config.seo.robots,
    routes: [],
  });

  for (const artifact of artifacts) {
    this.emitFile({
      type: 'asset',
      fileName: artifact.fileName,
      source: artifact.source,
    });
  }
}
```

- [x] **Step 5: Add package dependency for Vite plugin**

```json
{
  "dependencies": {
    "@vanrot/compiler": "file:../compiler",
    "@vanrot/config": "file:../config",
    "@vanrot/router": "file:../router",
    "@vanrot/seo": "file:../seo"
  }
}
```

- [x] **Step 6: Run Vite SEO test**

Run: `pnpm --filter @vanrot/vite-plugin test -- seo-build.test.ts`

Expected: PASS.

---

### Task 12: Site Docs And SEO Ladder Explanation

**Files:**

- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/framework-guides.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Write failing site data assertions**

```ts
// apps/vanrot-site/tests/site-data.test.ts
import { describe, expect, it } from 'vitest';
import { getSiteArticle, siteArticleKey } from '../src/docs/site-data.ts';

describe('SEO docs article', () => {
  it('documents the SEO metadata ladder and CLI opt-in flows', () => {
    const article = getSiteArticle(siteArticleKey.seo);

    expect(article.path).toBe('/docs/seo');
    expect(article.sections.map((section) => section.heading)).toContain('Metadata Ladder');
    expect(JSON.stringify(article)).toContain('config defaults');
    expect(JSON.stringify(article)).toContain('route overrides');
    expect(JSON.stringify(article)).toContain('page overrides');
    expect(JSON.stringify(article)).toContain('dynamic overrides');
    expect(JSON.stringify(article)).toContain('vr add seo');
  });
});
```

- [x] **Step 2: Run failing site docs test**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts`

Expected: FAIL with missing `siteArticleKey.seo`.

- [x] **Step 3: Add SEO article data**

```json
{
  "key": "seo",
  "path": "/docs/seo",
  "label": "SEO",
  "title": "SEO",
  "description": "Use @vanrot/seo for metadata, canonical URLs, social previews, sitemap, robots, and doctor diagnostics.",
  "sections": [
    {
      "heading": "Install",
      "body": "Choose SEO during vr create, or run vr add seo after a project already exists. If you do not know the production URL yet, skip siteUrl and add it later in vanrot.config.ts."
    },
    {
      "heading": "Metadata Ladder",
      "body": "Vanrot resolves SEO metadata in this order: config defaults, route overrides, page overrides, then dynamic overrides. Later layers win while earlier layers provide safe defaults."
    },
    {
      "heading": "Generated Utility",
      "body": "The generated src/app/seo.ts file centralizes siteName, defaultSocialImage, and appSeo so app code avoids repeated SEO string literals."
    },
    {
      "heading": "Doctor",
      "body": "vr doctor validates SEO config syntax even without siteUrl. Missing production URL, weak content, duplicate metadata, invalid social images, and accidental noindex are warnings in warn mode and errors in strict mode."
    }
  ]
}
```

- [x] **Step 4: Add SEO article key and guide label**

```ts
// apps/vanrot-site/src/docs/site-data.ts
export const siteArticleKey = {
  runtime: 'runtime',
  seo: 'seo',
} as const;
```

```ts
// apps/vanrot-site/src/docs/framework-guides.ts
export const frameworkGuideArticleKeys = [
  siteArticleKey.runtime,
  siteArticleKey.seo,
] as const satisfies readonly SiteArticleKey[];

export const frameworkGuideLabels = {
  [siteArticleKey.runtime]: 'Runtime',
  [siteArticleKey.seo]: 'SEO',
} as const satisfies Record<(typeof frameworkGuideArticleKeys)[number], string>;
```

- [x] **Step 5: Run site docs tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts site-pages.test.ts`

Expected: PASS.

- [x] **Step 6: Restart site server after docs implementation**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: server starts on `http://localhost:1964`.

---

### Task 13: Phase Ledgers, Inventory, And Future Pipeline

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/future-pipeline.md`

- [x] **Step 1: Write failing inventory/phase assertions**

```ts
// scripts/verify-final-tdd-inventory.test.mjs
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('final TDD inventory SEO coverage', () => {
  it('tracks Phase 27 SEO surfaces', () => {
    const inventory = readFileSync('docs/superpowers/final-tdd-inventory.md', 'utf8');
    expect(inventory).toContain('@vanrot/seo');
    expect(inventory).toContain('vr add seo');
    expect(inventory).toContain('src/app/seo.ts');
    expect(inventory).toContain('sitemap.xml');
    expect(inventory).toContain('robots.txt');
  });
});
```

- [x] **Step 2: Run failing phase docs checks**

Run: `pnpm verify:phase-docs`

Expected: FAIL until Phase 27 tracking and plan task statuses are aligned.

- [x] **Step 3: Update final TDD inventory**

Add this entry to `docs/superpowers/final-tdd-inventory.md`:

```md
## Phase 27: First-party SEO Package

- Package: `@vanrot/seo`
- APIs: `defineSeo`, `defineDynamicSeo`, `resolveSeoMetadata`, `renderSeoTags`, `applySeoToHead`, `generateSitemapXml`, `generateRobotsTxt`, structured data helpers, social image validation
- Config: `seo.enabled`, `seo.siteUrl`, `seo.diagnostics.mode`, `seo.defaults`, `seo.sitemap.enabled`, `seo.robots.enabled`
- CLI: `vr create --seo`, `vr create --no-seo`, `vr add seo`, `vr doctor` SEO diagnostics
- Generated files: `src/app/seo.ts`
- Build outputs: `sitemap.xml`, `robots.txt`
- Docs: `/docs/seo`
- Required tests: package API tests, config validation tests, CLI create/add tests, doctor tests, Vite build artifact tests, site docs tests, runtime size verification
```

- [x] **Step 4: Update future pipeline SEO status**

Replace the first paragraph under `## vanrot/seo` in `docs/superpowers/future-pipeline.md` with:

```md
`vanrot/seo` moved from parked future candidate to active Phase 27 planning. The package remains opt-in and must not move metadata behavior into the core runtime.
```

- [x] **Step 5: Keep CLI Prompt Roadmap parked**

Keep this sentence under `## CLI Prompt Roadmap`:

```md
This roadmap stays parked until the final project juncture, after the first-party packages and major features are implemented.
```

- [x] **Step 6: Run phase docs verification**

Run: `pnpm verify:phase-docs`

Expected: PASS.

---

### Task 14: Final Verification

**Files:**

- Verify all files changed by Tasks 1 through 13.

- [x] **Step 1: Run package tests**

Run:

```sh
pnpm --filter @vanrot/seo test
pnpm --filter @vanrot/config test
pnpm --filter @vanrot/cli test
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vanrot-site test
```

Expected: all commands PASS.

- [x] **Step 2: Run typecheck and build**

Run:

```sh
pnpm --filter @vanrot/seo typecheck
pnpm --filter @vanrot/seo build
pnpm typecheck
pnpm build
```

Expected: all commands PASS.

- [x] **Step 3: Verify runtime size stayed clean**

Run: `pnpm verify:size`

Expected: PASS and `@vanrot/runtime` remains below `1.98 KB` gzipped.

- [x] **Step 4: Run full verification**

Run: `pnpm verify`

Expected: PASS.

- [x] **Step 5: Inspect git status**

Run: `git status --short --branch`

Expected: SEO implementation files, docs, and ledger changes appear as unstaged changes unless the user asked for git staging.

---

## Self-Review

Spec coverage:

- Optional package and no runtime bloat: Tasks 1, 11, 14.
- `vr create` SEO opt-in and opt-out: Task 9.
- `vr add seo` later setup: Task 9.
- Rich `vanrot.config.ts` SEO settings: Task 8.
- Missing production URL allowed: Tasks 3, 8, 10, 12.
- Wrong SEO syntax detected without site URL: Tasks 8 and 10.
- Metadata ladder documented and implemented: Tasks 3 and 12.
- App SEO utility to avoid repeated literals: Task 9.
- Generated files included on opt-in: Task 9.
- Social images validated, not generated: Task 4.
- Sitemap and robots outputs: Tasks 5 and 11.
- Doctor warnings/errors and strict mode: Tasks 7 and 10.
- CLI Prompt Roadmap stays future work: Task 13.

Placeholder scan: clean.

Type consistency:

- `SeoMetadata`, `SeoResolveContext`, and `SeoDiagnostic` originate in `packages/seo/src/types.ts`.
- Config diagnostics start at `VRCFG014` after behavior's `VRCFG013`.
- SEO package diagnostics use `VRSEO001` and later.
- Generated app utility path is `src/app/seo.ts` in every CLI task.
