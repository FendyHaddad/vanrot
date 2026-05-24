import { describe, expect, it } from 'vitest';
import {
  checkCommandCoverage,
  checkDiagnosticCoverage,
  checkPackageCoverage,
  checkPrimitiveCoverage,
  checkRequiredArticleCoverage,
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
