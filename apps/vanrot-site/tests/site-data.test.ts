import { uiPrimitiveOrder } from '@vanrot/ui';
import { describe, expect, it } from 'vitest';
import { componentDocs } from '../src/docs/component-docs.ts';
import { siteNavigationGroups } from '../src/docs/site-navigation.ts';
import {
  cliCommandDocs,
  packageReferenceDocs,
  primitiveDocCopy,
  siteArticleKeys,
  siteArticles,
} from '../src/docs/site-data.ts';

describe('vanrot site docs data', () => {
  it('documents the required framework learning pages', () => {
    expect(siteArticleKeys).toEqual([
      'introduction',
      'installation',
      'projectStructure',
      'runtime',
      'runtimeSignals',
      'runtimeInputs',
      'runtimeForms',
      'runtimeControllers',
      'runtimeDevtoolsGraph',
      'runtimeLifecycle',
      'runtimeMounting',
      'behavior',
      'behaviorForm',
      'behaviorOverlay',
      'behaviorTooltip',
      'behaviorTabs',
      'behaviorTable',
      'behaviorToast',
      'behaviorCommandMenu',
      'behaviorPositionedLayer',
      'seo',
      'seoPackageBoundary',
      'seoMetadataLadder',
      'seoConfigControlPlane',
      'seoCreateAndAddFlows',
      'seoDoctorAndBuildOutput',
      'seoSocialImages',
      'compiler',
      'compilerFileConventions',
      'compilerComponentClass',
      'compilerTemplateSyntax',
      'compilerExpressions',
      'compilerEventBinding',
      'compilerScopedCss',
      'compilerChildComponents',
      'compilerSlots',
      'compilerIfElse',
      'compilerFor',
      'compilerInputs',
      'compilerSourceMaps',
      'compilerCompilationApi',
      'vitePlugin',
      'vitePluginSetup',
      'vitePluginOptions',
      'vitePluginTransform',
      'vitePluginHotReload',
      'vitePluginVirtualModules',
      'vitePluginDiagnostics',
      'vitePluginSourceMaps',
      'vitePluginDevtoolsMetadata',
      'cli',
      'cliCommandSurface',
      'cliProjectCreation',
      'cliRoleGeneration',
      'cliUiPrimitiveAdd',
      'cliConfigMaintenance',
      'cliProjectIntelligence',
      'cliTaskRunners',
      'cliDevServer',
      'cliBuild',
      'cliTest',
      'configuration',
      'configurationFile',
      'configurationDefaults',
      'configurationUi',
      'configurationRouter',
      'configurationAi',
      'configurationMaintenance',
      'routing',
      'routingRouteTable',
      'routingParamsQuery',
      'routingLayoutsRedirects',
      'routingGuards',
      'routingNavigation',
      'routingPreloadingKeepAlive',
      'ssrHydration',
      'uiOctober',
      'theming',
      'vanrotstyles',
      'testing',
      'testingComponent',
      'testingScreen',
      'testingRouting',
      'testingStrategy',
      'forms',
      'devtools',
      'devtoolsProjectMap',
      'devtoolsRuntimeGraph',
      'devtoolsViteMetadata',
      'devtoolsPanelState',
      'devtoolsStaleState',
      'examples',
      'exampleMatrix',
      'webglThreejs',
      'deployment',
      'publicApi',
      'diagnostics',
      'generatedFiles',
      'changelog',
      'octoberShowcase',
      'conventions',
      'conventionsRoleFiles',
      'conventionsTemplatesStyles',
      'conventionsStateLogic',
      'conventionsRoutingStrings',
      'conventionsScopedCss',
      'conventionsAiReadable',
      'limitations',
      'referenceStatus',
    ]);

    for (const key of siteArticleKeys) {
      const article = siteArticles[key];

      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.sections.length).toBeGreaterThan(0);
    }

    expect(siteArticles.testing.summary).toContain('page');
    expect(JSON.stringify(siteArticles.testing)).toContain('testPage');
    expect(JSON.stringify(siteArticles.testingRouting)).toContain('setupRouterTest');
  });

  it('keeps the runtime guide rich enough to teach the runtime boundary', () => {
    type RichArticleSection = {
      id: string;
      body: string;
      points?: readonly string[];
      code?: {
        title: string;
        code: string;
      };
      note?: string;
    };

    const runtimeArticle = siteArticles.runtime;
    const runtimeSections = runtimeArticle.sections as readonly RichArticleSection[];

    expect(runtimeArticle.summary).toContain('@vanrot/runtime');
    expect(runtimeSections.map((section) => section.id)).toEqual([
      'runtime-boundary',
      'signals',
      'effects',
      'inputs',
      'lifecycle',
      'controllers',
      'signals-guide',
    ]);
    expect(runtimeSections.every((section) => section.body.length > 100)).toBe(true);
    expect(runtimeSections.filter((section) => (section.points?.length ?? 0) >= 3)).toHaveLength(7);
    expect(runtimeSections.some((section) => section.code?.code.includes('computed'))).toBe(true);
    expect(runtimeSections.some((section) => section.code?.code.includes('onMount'))).toBe(true);
    expect(runtimeSections.find((section) => section.id === 'signals-guide')?.note).toContain(
      'separate Signals guide',
    );
  });

  it('documents the SEO package ladder and opt-in flows', () => {
    const article = siteArticles.seo;

    expect(article.path).toBe('/docs/seo');
    expect(article.summary).toContain('@vanrot/seo');
    expect(article.sections.map((section) => section.id)).toEqual([
      'package-boundary',
      'metadata-ladder',
      'config-control-plane',
      'create-and-add-flows',
      'doctor-and-build-output',
      'social-images',
    ]);
    expect(article.sections.every((section) => section.body.length > 120)).toBe(true);
    expect(JSON.stringify(article)).toContain('vanrot.config.ts');
    expect(JSON.stringify(article)).toContain('dynamic/async SEO');
    expect(JSON.stringify(article)).not.toContain('generate social images');
  });

  it('documents Behavior as a package parent with focused child guides', () => {
    expect(siteArticles.behavior.path).toBe('/docs/behavior');
    expect(siteArticles.behavior.summary).toContain('@vanrot/behavior');
    expect(siteArticles.behavior.status).toBe('production-ready-through-phase-28');
    expect(JSON.stringify(siteArticles.behavior)).toContain('createAccordionController');
    expect(JSON.stringify(siteArticles.behavior)).toContain('createComboboxController');
    expect(JSON.stringify(siteArticles.behavior)).toContain('createDatePickerController');
    expect(JSON.stringify(siteArticles.behavior)).toContain('createTableResizeController');

    const childKeys = [
      'behaviorForm',
      'behaviorOverlay',
      'behaviorTooltip',
      'behaviorTabs',
      'behaviorTable',
      'behaviorToast',
      'behaviorCommandMenu',
      'behaviorPositionedLayer',
    ] as const;

    expect(childKeys.map((key) => siteArticles[key].path)).toEqual([
      '/docs/behavior/form',
      '/docs/behavior/overlay',
      '/docs/behavior/tooltip',
      '/docs/behavior/tabs',
      '/docs/behavior/table',
      '/docs/behavior/toast',
      '/docs/behavior/command-menu',
      '/docs/behavior/positioned-layer',
    ]);
    expect(childKeys.every((key) => siteArticles[key].sections.length >= 3)).toBe(true);
    expect(
      childKeys.every((key) =>
        siteArticles[key].sections.every((section) => section.body.length > 180),
      ),
    ).toBe(true);
    expect(childKeys.every((key) => siteArticles[key].sections.some((section) => section.code))).toBe(
      true,
    );

    const behaviorJson = JSON.stringify(childKeys.map((key) => siteArticles[key]));
    expect(behaviorJson).toContain('createFormController');
    expect(behaviorJson).toContain('createOverlayController');
    expect(behaviorJson).toContain('@vanrot/behavior/');
    expect(behaviorJson).toContain('positionLayer');
    expect(behaviorJson).toContain('dispose');
  });

  it('documents SEO as a package parent with focused child guides', () => {
    expect(siteArticles.seo.path).toBe('/docs/seo');

    const childKeys = [
      'seoPackageBoundary',
      'seoMetadataLadder',
      'seoConfigControlPlane',
      'seoCreateAndAddFlows',
      'seoDoctorAndBuildOutput',
      'seoSocialImages',
    ] as const;

    expect(childKeys.map((key) => siteArticles[key].path)).toEqual([
      '/docs/seo/package-boundary',
      '/docs/seo/metadata-ladder',
      '/docs/seo/config-control-plane',
      '/docs/seo/create-and-add-flows',
      '/docs/seo/doctor-and-build-output',
      '/docs/seo/social-images',
    ]);
    expect(childKeys.every((key) => siteArticles[key].sections.length >= 2)).toBe(true);
    expect(JSON.stringify(childKeys.map((key) => siteArticles[key]))).toContain('dynamic/async SEO');
    expect(JSON.stringify(childKeys.map((key) => siteArticles[key]))).not.toContain(
      'generate social images',
    );
  });

  it('groups Behavior and SEO child guides below their package parents in the framework sidebar', () => {
    type NestedNavigationItem = {
      key: string;
      href: string;
      label: string;
      children?: readonly NestedNavigationItem[];
    };

    const frameworkGroup = siteNavigationGroups.find((group) => group.label === 'Framework');
    const behaviorItem = frameworkGroup?.items.find((item) => item.key === 'behavior') as
      | NestedNavigationItem
      | undefined;
    const seoItem = frameworkGroup?.items.find((item) => item.key === 'seo') as
      | NestedNavigationItem
      | undefined;

    expect(frameworkGroup?.items.map((item) => item.key).slice(0, 4)).toEqual([
      'runtime',
      'behavior',
      'seo',
      'compiler',
    ]);
    expect(behaviorItem?.children?.map((item) => item.key)).toEqual([
      'behaviorForm',
      'behaviorOverlay',
      'behaviorTooltip',
      'behaviorTabs',
      'behaviorTable',
      'behaviorToast',
      'behaviorCommandMenu',
      'behaviorPositionedLayer',
    ]);
    expect(seoItem?.children?.map((item) => item.key)).toEqual([
      'seoPackageBoundary',
      'seoMetadataLadder',
      'seoConfigControlPlane',
      'seoCreateAndAddFlows',
      'seoDoctorAndBuildOutput',
      'seoSocialImages',
    ]);
  });

  it('keeps the runtime signals guide rich enough to teach signal primitives', () => {
    const article = siteArticles.runtimeSignals;

    expect(article.summary).toContain('signal');
    expect(article.sections.map((section) => section.id)).toEqual([
      'what-is-a-signal',
      'signal',
      'computed',
      'effect',
      'signals-together',
    ]);
    expect(article.sections.map((section) => section.title)).toEqual([
      'What is a signal?',
      'signal()',
      'computed()',
      'effect()',
      'Using signal, computed, and effect together',
    ]);
    expect(article.sections.every((section) => section.body.length > 180)).toBe(true);
    expect(article.sections.every((section) => (section.points?.length ?? 0) >= 3)).toBe(true);
    expect(article.sections.find((section) => section.id === 'what-is-a-signal')?.body).toContain(
      'why Vanrot uses signals',
    );
    expect(article.sections.find((section) => section.id === 'signal')?.code?.code).toContain(
      'count.update',
    );
    expect(article.sections.find((section) => section.id === 'computed')?.code?.code).toContain(
      'computed',
    );
    expect(article.sections.find((section) => section.id === 'effect')?.code?.code).toContain(
      'return () =>',
    );
    expect(article.sections.find((section) => section.id === 'signals-together')?.code?.code).toContain(
      'subtotal',
    );
  });

  it('groups runtime export guides below Runtime in the framework sidebar', () => {
    type NestedNavigationItem = {
      key: string;
      href: string;
      label: string;
      children?: readonly NestedNavigationItem[];
    };

    const frameworkGroup = siteNavigationGroups.find((group) => group.label === 'Framework');
    const runtimeItem = frameworkGroup?.items.find((item) => item.key === 'runtime') as
      | NestedNavigationItem
      | undefined;

    expect(runtimeItem?.href).toBe('/docs/runtime');
    expect(runtimeItem?.children?.map((item) => item.key)).toEqual([
      'runtimeSignals',
      'runtimeInputs',
      'runtimeForms',
      'runtimeControllers',
      'runtimeDevtoolsGraph',
      'runtimeLifecycle',
      'runtimeMounting',
    ]);
    expect(runtimeItem?.children?.map((item) => item.href)).toEqual([
      '/docs/runtime/signals',
      '/docs/runtime/inputs',
      '/docs/runtime/forms',
      '/docs/runtime/controllers',
      '/docs/runtime/devtools-graph',
      '/docs/runtime/lifecycle',
      '/docs/runtime/mounting',
    ]);
  });

  it('keeps the compiler guide rich enough to orient the compiler boundary', () => {
    const article = siteArticles.compiler;

    expect(article.summary).toContain('@vanrot/compiler');
    expect(article.sections.map((section) => section.id)).toEqual([
      'compiler-boundary',
      'compile-pipeline',
      'child-guides',
      'diagnostics-map',
      'production-use',
    ]);
    expect(article.sections.every((section) => section.body.length > 160)).toBe(true);
    expect(article.sections.every((section) => (section.points?.length ?? 0) >= 3)).toBe(true);
    expect(article.sections.some((section) => section.code?.code.includes('compileComponent'))).toBe(
      true,
    );
  });

  it('keeps compiler child guides rich enough to document the exported compiler surface', () => {
    const childKeys = [
      'compilerFileConventions',
      'compilerComponentClass',
      'compilerTemplateSyntax',
      'compilerExpressions',
      'compilerEventBinding',
      'compilerScopedCss',
      'compilerChildComponents',
      'compilerSlots',
      'compilerIfElse',
      'compilerFor',
      'compilerInputs',
      'compilerSourceMaps',
      'compilerCompilationApi',
    ] as const;

    for (const key of childKeys) {
      const article = siteArticles[key];

      expect(article.path).toMatch(/^\/docs\/compiler\//);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.sections.every((section) => section.body.length > 120)).toBe(true);
      expect(article.sections.some((section) => section.code?.code.includes('@vanrot/compiler'))).toBe(
        true,
      );
    }

    expect(siteArticles.compilerCompilationApi.sections.map((section) => section.id)).toEqual([
      'compile-component',
      'compile-from-files',
      'lower-level-exports',
      'diagnostics-and-metadata',
    ]);
    expect(siteArticles.compilerTemplateSyntax.sections.map((section) => section.id)).toContain(
      'template-bindings',
    );
    expect(siteArticles.compilerIfElse.sections.map((section) => section.id)).toEqual([
      'conditional-rendering',
      'else-branch',
      'generated-updates',
      'common-mistakes',
    ]);
    expect(siteArticles.compilerIfElse.sections.some((section) => section.code?.code.includes('@if'))).toBe(
      true,
    );
  });

  it('groups compiler guides below Compiler in the framework sidebar', () => {
    type NestedNavigationItem = {
      key: string;
      href: string;
      label: string;
      children?: readonly NestedNavigationItem[];
    };

    const frameworkGroup = siteNavigationGroups.find((group) => group.label === 'Framework');
    const compilerItem = frameworkGroup?.items.find((item) => item.key === 'compiler') as
      | NestedNavigationItem
      | undefined;

    expect(compilerItem?.href).toBe('/docs/compiler');
    expect(compilerItem?.children?.map((item) => item.key)).toEqual([
      'compilerFileConventions',
      'compilerComponentClass',
      'compilerTemplateSyntax',
      'compilerExpressions',
      'compilerEventBinding',
      'compilerScopedCss',
      'compilerChildComponents',
      'compilerSlots',
      'compilerIfElse',
      'compilerFor',
      'compilerInputs',
      'compilerSourceMaps',
      'compilerCompilationApi',
    ]);
    expect(compilerItem?.children?.map((item) => item.href)).toEqual([
      '/docs/compiler/file-conventions',
      '/docs/compiler/component-class',
      '/docs/compiler/template-syntax',
      '/docs/compiler/expressions',
      '/docs/compiler/event-binding',
      '/docs/compiler/scoped-css',
      '/docs/compiler/child-components',
      '/docs/compiler/slots',
      '/docs/compiler/if-else',
      '/docs/compiler/for',
      '/docs/compiler/inputs',
      '/docs/compiler/source-maps',
      '/docs/compiler/compilation-api',
    ]);
  });

  it('keeps the Vite plugin guide rich enough to orient the integration boundary', () => {
    const article = siteArticles.vitePlugin;

    expect(article.summary).toContain('@vanrot/vite-plugin');
    expect(article.sections.map((section) => section.id)).toEqual([
      'plugin-boundary',
      'compile-flow',
      'child-guides',
      'production-contract',
    ]);
    expect(article.sections.every((section) => section.body.length > 160)).toBe(true);
    expect(article.sections.every((section) => (section.points?.length ?? 0) >= 3)).toBe(true);
    expect(article.sections.some((section) => section.code?.code.includes('@vanrot/vite-plugin'))).toBe(
      true,
    );
  });

  it('keeps Vite plugin child guides rich enough to document the plugin surface', () => {
    const childKeys = [
      'vitePluginSetup',
      'vitePluginOptions',
      'vitePluginTransform',
      'vitePluginHotReload',
      'vitePluginVirtualModules',
      'vitePluginDiagnostics',
      'vitePluginSourceMaps',
      'vitePluginDevtoolsMetadata',
    ] as const;

    for (const key of childKeys) {
      const article = siteArticles[key];

      expect(article.path).toMatch(/^\/docs\/vite-plugin\//);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.sections.every((section) => section.body.length > 120)).toBe(true);
      expect(article.sections.some((section) => (section.code?.code.length ?? 0) > 0)).toBe(true);
    }

    expect(siteArticles.vitePluginOptions.sections.map((section) => section.id)).toEqual([
      'options-shape',
      'default-include',
      'root-and-source-root',
    ]);
    expect(siteArticles.vitePluginVirtualModules.sections.map((section) => section.id)).toEqual([
      'module-purpose',
      'resolve-and-load',
      'asset-queries',
    ]);
  });

  it('groups Vite plugin guides below Vite Plugin in the framework sidebar', () => {
    type NestedNavigationItem = {
      key: string;
      href: string;
      label: string;
      children?: readonly NestedNavigationItem[];
    };

    const frameworkGroup = siteNavigationGroups.find((group) => group.label === 'Framework');
    const vitePluginItem = frameworkGroup?.items.find((item) => item.key === 'vitePlugin') as
      | NestedNavigationItem
      | undefined;

    expect(vitePluginItem?.href).toBe('/docs/vite-plugin');
    expect(vitePluginItem?.children?.map((item) => item.key)).toEqual([
      'vitePluginSetup',
      'vitePluginOptions',
      'vitePluginTransform',
      'vitePluginHotReload',
      'vitePluginVirtualModules',
      'vitePluginDiagnostics',
      'vitePluginSourceMaps',
      'vitePluginDevtoolsMetadata',
    ]);
    expect(vitePluginItem?.children?.map((item) => item.href)).toEqual([
      '/docs/vite-plugin/setup',
      '/docs/vite-plugin/options',
      '/docs/vite-plugin/role-file-transform',
      '/docs/vite-plugin/hot-reload',
      '/docs/vite-plugin/virtual-modules',
      '/docs/vite-plugin/diagnostics',
      '/docs/vite-plugin/source-maps',
      '/docs/vite-plugin/devtools-metadata',
    ]);
  });

  it('splits framework docs into rich parent and child guides', () => {
    const parentGuides = {
      cli: [
        'cliCommandSurface',
        'cliProjectCreation',
        'cliRoleGeneration',
        'cliUiPrimitiveAdd',
        'cliConfigMaintenance',
        'cliProjectIntelligence',
        'cliTaskRunners',
        'cliDevServer',
        'cliBuild',
        'cliTest',
      ],
      configuration: [
        'configurationFile',
        'configurationDefaults',
        'configurationUi',
        'configurationRouter',
        'configurationAi',
        'configurationMaintenance',
      ],
      routing: [
        'routingRouteTable',
        'routingParamsQuery',
        'routingLayoutsRedirects',
        'routingGuards',
        'routingNavigation',
        'routingPreloadingKeepAlive',
      ],
      testing: ['testingComponent', 'testingScreen', 'testingRouting', 'testingStrategy'],
      devtools: [
        'devtoolsProjectMap',
        'devtoolsRuntimeGraph',
        'devtoolsViteMetadata',
        'devtoolsPanelState',
        'devtoolsStaleState',
      ],
      conventions: [
        'conventionsRoleFiles',
        'conventionsTemplatesStyles',
        'conventionsStateLogic',
        'conventionsRoutingStrings',
        'conventionsScopedCss',
        'conventionsAiReadable',
      ],
    } as const;

    const frameworkGroup = siteNavigationGroups.find((group) => group.label === 'Framework');

    for (const [parentKey, childKeys] of Object.entries(parentGuides)) {
      const parent = siteArticles[parentKey as keyof typeof siteArticles];
      const navigationItem = frameworkGroup?.items.find((item) => item.key === parentKey);

      expect(parent.sections.length).toBeGreaterThanOrEqual(4);
      expect(parent.sections.every((section) => section.body.length > 160)).toBe(true);
      expect(parent.sections.every((section) => (section.points?.length ?? 0) >= 3)).toBe(true);
      expect(parent.sections.some((section) => (section.code?.code.length ?? 0) > 0)).toBe(true);
      expect(navigationItem?.children.map((item) => item.key)).toEqual([...childKeys]);

      for (const childKey of childKeys) {
        const childArticle = siteArticles[childKey];

        expect(childArticle.path).toMatch(new RegExp(`^/docs/${parent.path.split('/').at(-1)}/`));
        expect(childArticle.sections.length).toBeGreaterThanOrEqual(3);
        expect(childArticle.sections.every((section) => section.body.length > 120)).toBe(true);
        expect(childArticle.sections.some((section) => (section.code?.code.length ?? 0) > 0)).toBe(
          true,
        );
      }
    }

    expect(siteArticles.cli.summary).toContain('@vanrot/cli');
    expect(siteArticles.configuration.summary).toContain('@vanrot/config');
    expect(siteArticles.routing.summary).toContain('@vanrot/router');
    expect(siteArticles.testing.summary).toContain('@vanrot/testing');
    expect(siteArticles.devtools.summary).toContain('@vanrot/devtools');
    expect(siteArticles.conventions.summary).toContain('role files');
  });

  it('explains every CLI command with command-level sections and deep task runner guides', () => {
    expect(siteArticles.cliCommandSurface.sections.map((section) => section.id)).toEqual([
      'create',
      'generate',
      'add',
      'remove',
      'ui',
      'config',
      'update',
      'upgrade',
      'doctor',
      'cache',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);

    for (const section of siteArticles.cliCommandSurface.sections) {
      expect(section.title).toMatch(/^vr /);
      expect(section.body.length).toBeGreaterThan(180);
      expect(section.points?.length).toBeGreaterThanOrEqual(3);
      expect(section.code?.code).toContain(section.title);
    }

    const taskCommandGuides = [
      {
        key: 'cliDevServer',
        sectionIds: ['what-dev-runs', 'config-handshake', 'hmr-debugging', 'daily-workflow'],
      },
      {
        key: 'cliBuild',
        sectionIds: ['what-build-runs', 'production-contract', 'failure-debugging', 'release-workflow'],
      },
      {
        key: 'cliTest',
        sectionIds: ['what-test-runs', 'testing-scope', 'failure-debugging', 'ci-workflow'],
      },
    ] as const;

    for (const guide of taskCommandGuides) {
      const article = siteArticles[guide.key];

      expect(article.sections.map((section) => section.id)).toEqual([...guide.sectionIds]);
      expect(article.sections.every((section) => section.body.length > 180)).toBe(true);
      expect(article.sections.every((section) => (section.points?.length ?? 0) >= 3)).toBe(true);
      expect(
        article.sections.filter((section) => (section.code?.code.length ?? 0) > 0).length,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('documents every current primitive from @vanrot/ui metadata', () => {
    expect(componentDocs.map((doc) => doc.primitive).sort()).toEqual([...uiPrimitiveOrder].sort());
    expect(componentDocs.map((doc) => doc.title)).toEqual(
      [...componentDocs.map((doc) => doc.title)].sort((left, right) => left.localeCompare(right)),
    );

    for (const doc of componentDocs) {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.usage.length).toBeGreaterThan(0);
      expect(doc.accessibility.length).toBeGreaterThan(0);
      expect(doc.api.length).toBeGreaterThan(0);
    }
  });

  it('keeps raw site primitive docs aligned with @vanrot/ui metadata', () => {
    expect(primitiveDocCopy.map((doc) => doc.primitive).sort()).toEqual(
      [...uiPrimitiveOrder].sort(),
    );
  });

  it('documents current commands and implemented packages', () => {
    expect(cliCommandDocs.map((command) => command.name)).toEqual([
      'create',
      'generate',
      'add',
      'remove',
      'ui',
      'config',
      'update',
      'upgrade',
      'doctor',
      'cache',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);
    expect(packageReferenceDocs.map((item) => item.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/behavior',
      '@vanrot/compiler',
      '@vanrot/config',
      '@vanrot/language-server',
      '@vanrot/router',
      '@vanrot/ssr',
      '@vanrot/vite-plugin',
      '@vanrot/cli',
      '@vanrot/ui',
      '@vanrot/testing',
      '@vanrot/forms',
      '@vanrot/devtools',
      '@vanrot/ai',
      '@vanrot/seo',
    ]);
    expect(packageReferenceDocs.every((item) => item.docsPath.startsWith('/docs'))).toBe(true);
    expect(cliCommandDocs.every((command) => command.docsPath.startsWith('/docs'))).toBe(true);
  });

  it('builds navigation for the whole framework, not only UI', () => {
    expect(siteNavigationGroups.map((group) => group.label)).toEqual([
      'Get Started',
      'Framework',
      'UI',
      'Components',
      'Examples',
      'Reference',
    ]);

    const componentGroup = siteNavigationGroups.find((group) => group.label === 'Components');
    expect(componentGroup?.items.map((item) => item.href)).toEqual(
      componentDocs.map((doc) => doc.href),
    );
    const referenceGroup = siteNavigationGroups.find((group) => group.label === 'Reference');
    expect(referenceGroup?.items.map((item) => item.href)).toContain('/docs/changelog');
  });
});
