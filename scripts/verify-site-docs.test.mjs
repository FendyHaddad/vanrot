import { describe, expect, it } from 'vitest';
import {
  checkCommandCoverage,
  checkConventionCoverage,
  checkCtaLabels,
  checkDiagnosticCoverage,
  checkComponentDocsShellVisualContract,
  checkDocsShellVisualContract,
  checkExampleFreshness,
  checkExampleRegistration,
  checkGeneratedFileCoverage,
  checkPackageCoverage,
  checkPrimitiveCoverage,
  checkPublicExportCoverage,
  checkRouteMetadataCoverage,
  checkRequiredArticleCoverage,
  readExampleWorkspaceNames,
  readFrameworkReference,
  readPublicExportsFromIndex,
  readWorkspacePackageNames,
} from './verify-site-docs.mjs';

describe('site docs verification', () => {
  it('fails when a required framework article is missing', () => {
    const failures = checkRequiredArticleCoverage(
      ['runtime', 'compiler'],
      [{ key: 'runtime', path: '/docs/runtime' }],
    );

    expect(failures).toEqual(['Missing framework docs article: compiler']);
  });

  it('fails when a primitive has no docs page', () => {
    const failures = checkPrimitiveCoverage(
      ['button', 'card'],
      [
        {
          primitive: 'button',
          href: '/docs/ui/button',
          usage: '<vr-button></vr-button>',
          accessibility: 'Native button.',
          api: 'Selector vr-button.',
        },
      ],
    );

    expect(failures).toEqual(['Missing UI primitive docs page: card']);
  });

  it('fails when a command is missing from reference docs', () => {
    const failures = checkCommandCoverage(
      ['create', 'dev'],
      [{ name: 'create', usage: 'vr create <name>', examples: ['vr create app'], notes: ['Creates an app.'] }],
    );

    expect(failures).toEqual(['Missing CLI command docs entry: dev']);
  });

  it('fails when a command has no examples or notes', () => {
    const failures = checkCommandCoverage(
      ['create'],
      [{ name: 'create', usage: 'vr create <name>' }],
    );

    expect(failures).toEqual([
      'Missing CLI command examples: create',
      'Missing CLI command notes: create',
    ]);
  });

  it('fails when a package is missing from reference docs', () => {
    const failures = checkPackageCoverage(
      ['@vanrot/runtime', '@vanrot/router'],
      [{ name: '@vanrot/runtime' }],
    );

    expect(failures).toEqual(['Missing package reference docs entry: @vanrot/router']);
  });

  it('fails when a diagnostic code is missing from reference docs', () => {
    const failures = checkDiagnosticCoverage(['VR001', 'VR019'], ['VR001'], 'compiler');

    expect(failures).toEqual(['Missing compiler diagnostic docs entry: VR019']);
  });
});

describe('expanded site docs verification', () => {
  it('fails when a public export has no reference entry', () => {
    const failures = checkPublicExportCoverage(
      [{ packageName: '@vanrot/runtime', name: 'signal' }],
      [{ packageName: '@vanrot/runtime', name: 'computed' }],
    );

    expect(failures).toEqual(['Missing public export docs entry: @vanrot/runtime#signal']);
  });

  it('allows package wildcard public export coverage', () => {
    const failures = checkPublicExportCoverage(
      [{ packageName: '@vanrot/runtime', name: 'signal' }],
      [{ packageName: '@vanrot/runtime', name: '*' }],
    );

    expect(failures).toEqual([]);
  });

  it('fails when a generated file has no docs entry', () => {
    const failures = checkGeneratedFileCoverage(
      ['src/routes.ts', 'vanrot.config.ts'],
      [{ path: 'src/routes.ts' }],
    );

    expect(failures).toEqual(['Missing generated file docs entry: vanrot.config.ts']);
  });

  it('fails when a convention has no docs entry', () => {
    const failures = checkConventionCoverage(
      ['role-suffixes', 'scoped-css'],
      [{ id: 'role-suffixes' }],
    );

    expect(failures).toEqual(['Missing convention docs entry: scoped-css']);
  });

  it('fails when an example workspace has no docs registration', () => {
    const failures = checkExampleRegistration(
      ['counter', 'routing-workflows'],
      [{ path: 'examples/counter' }],
    );

    expect(failures).toEqual(['Missing example docs entry: examples/routing-workflows']);
  });

  it('fails when a registered example path is missing', () => {
    const failures = checkExampleFreshness(
      [{ path: 'examples/missing-example', title: 'Missing Example' }],
      new Set(['examples/counter']),
    );

    expect(failures).toEqual(['Registered example path does not exist: examples/missing-example']);
  });

  it('fails when CTA labels drift', () => {
    const failures = checkCtaLabels(
      "primaryCta: 'Framework Documentation', secondaryCta: 'Design Component'",
    );

    expect(failures).toEqual([
      'Landing primary CTA must be Read the docs',
      'Landing install CTA must be the runtime install command',
      'Landing eyebrow must match the homepage redesign contract',
      'Landing primary CTA must not use the old Framework Documentation label',
    ]);
  });

  it('fails when public route metadata is missing', () => {
    const failures = checkRouteMetadataCoverage(
      ['/', '/docs', '/docs/components'],
      [{ path: '/', title: 'Vanrot', description: 'Vanrot framework documentation for teams.' }],
    );

    expect(failures).toEqual([
      'Missing public route metadata: /docs',
      'Missing public route metadata: /docs/components',
    ]);
  });

  it('fails when required docs shell classes are missing', () => {
    const failures = checkDocsShellVisualContract('<vr-sidebar></vr-sidebar>', '.docs-layout {}');

    expect(failures).toEqual([
      'Docs shell missing class: docs-search',
      'Docs shell missing class: docs-nav-title',
      'Docs shell missing class: docs-nav-link',
      'Docs shell CSS missing 240px sidebar grid',
      'Docs shell header/sidebar must stay below the global navbar',
      'Docs shell search must use the same icon treatment as component docs',
      'Docs shell search shortcut must match component docs',
      'Docs shell sidebar muted color must match component docs',
      'Docs shell sidebar faint color must match component docs',
      'Docs shell sidebar font stack must match component docs',
      'Docs shell sidebar controls must use the component docs radius',
      'Docs shell search font size must match component docs',
      'Docs shell first nav section must align with component docs spacing',
    ]);
  });

  it('fails when docs shell duplicates global navigation or component sidebar links', () => {
    const failures = checkDocsShellVisualContract(
      [
        '<button class="docs-search"></button>',
        '<span class="docs-nav-title"></span>',
        '<a class="docs-nav-link"></a>',
        '<a class="docs-brand"></a>',
        '<vr-nav class="docs-topbar-nav"></vr-nav>',
        '<div class="docs-page-actions"></div>',
        '@for (item of componentItems; track item.key) {}',
      ].join(''),
      '.docs-layout { grid-template-columns: 240px minmax(0, 1fr); }',
    );

    expect(failures).toEqual([
      'Docs shell must not duplicate the global Vanrot brand',
      'Docs shell must not duplicate global Docs/Components navigation',
      'Docs shell must not show duplicate page action buttons',
      'Framework docs sidebar must not list component docs',
      'Docs shell header/sidebar must stay below the global navbar',
      'Docs shell search must use the same icon treatment as component docs',
      'Docs shell search shortcut must match component docs',
      'Docs shell sidebar muted color must match component docs',
      'Docs shell sidebar faint color must match component docs',
      'Docs shell sidebar font stack must match component docs',
      'Docs shell sidebar controls must use the component docs radius',
      'Docs shell search font size must match component docs',
      'Docs shell first nav section must align with component docs spacing',
    ]);
  });

  it('fails when component docs drift away from the shared fixed shell', () => {
    const failures = checkComponentDocsShellVisualContract(
      '.site-shell:has(.component-gallery-app) .site-header { display: none; }',
      '.component-gallery-app {}',
      {
        button: [
          '<div class="brand">Vanrot UI</div>',
          '<vr-header class="topbar">',
          '<vr-nav class="topbar-right"></vr-nav>',
          '</vr-header>',
        ].join(''),
        checkbox: '<h1>Checkbox</h1>',
      },
    );

    expect(failures).toEqual([
      'Component docs must keep the global navbar visible',
      'Component docs missing shared topbar styling',
      'Component docs topbar/sidebar must stay below the global navbar',
      'Component docs missing Design Components header: button',
      'Component docs must not duplicate the Vanrot brand: button',
      'Component docs must not duplicate global top navigation: button',
      'Component docs missing Design Components header: checkbox',
    ]);
  });
});

describe('site docs inventory readers', () => {
  it('reads package names from workspace package files', () => {
    const names = readWorkspacePackageNames(new URL('../packages/', import.meta.url));

    expect(names).toContain('@vanrot/runtime');
    expect(names).toContain('@vanrot/devtools');
  });

  it('reads public export names from package index files', () => {
    const exports = readPublicExportsFromIndex(
      '@fixture/pkg',
      'export { alpha } from "./alpha.js";\nexport type { Beta } from "./beta.js";\nexport default gamma;\n',
    );

    expect(exports).toEqual([
      { packageName: '@fixture/pkg', name: 'alpha' },
      { packageName: '@fixture/pkg', name: 'Beta' },
      { packageName: '@fixture/pkg', name: 'default' },
    ]);
  });

  it('reads the framework reference registry', () => {
    const reference = readFrameworkReference();

    expect(reference.packages.map((item) => item.name)).toContain('@vanrot/runtime');
    expect(reference.deployment.targetHost).toBe('vanrot.vankode.com');
  });

  it('reads example workspace names', () => {
    const names = readExampleWorkspaceNames(new URL('../examples/', import.meta.url));

    expect(names).toContain('counter');
  });
});
