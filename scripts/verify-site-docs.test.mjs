import { describe, expect, it } from 'vitest';
import {
  checkCommandCoverage,
  checkConventionCoverage,
  checkCtaLabels,
  checkDiagnosticCoverage,
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
      [{ name: 'create', usage: 'vr create <name>' }],
    );

    expect(failures).toEqual(['Missing CLI command docs entry: dev']);
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
      "primaryCta: 'Read the docs', secondaryCta: 'View components'",
    );

    expect(failures).toEqual([
      'Landing primary CTA must be Framework Documentation',
      'Landing secondary CTA must be Design Component',
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
      'Docs shell missing class: docs-brand',
      'Docs shell missing class: docs-search',
      'Docs shell missing class: docs-nav-title',
      'Docs shell missing class: docs-nav-link',
      'Docs shell CSS missing 240px sidebar grid',
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
