import { describe, expect, it } from 'vitest';
import {
  diagnoseSeo,
  seoDiagnosticCode,
  seoRobotsDirective,
} from '../src/index.js';

describe('@vanrot/seo diagnostics', () => {
  it('warns about launch readiness without requiring siteUrl syntax success', () => {
    const diagnostics = diagnoseSeo({
      title: 'Vanrot',
      description: 'Docs',
      canonical: '/docs',
    });

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: seoDiagnosticCode.missingSiteUrl,
        severity: 'warning',
      }),
    ]);
  });

  it('detects syntax errors and can escalate warnings in strict mode', () => {
    const diagnostics = diagnoseSeo(
      {
        robots: { directives: [seoRobotsDirective.noindex] },
        images: [{ url: 'bad', alt: '' }],
      },
      { mode: 'strict', siteUrl: 'notaurl' },
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      seoDiagnosticCode.missingTitle,
      seoDiagnosticCode.missingDescription,
      seoDiagnosticCode.invalidSiteUrl,
      seoDiagnosticCode.invalidSocialImage,
      seoDiagnosticCode.invalidSocialImage,
      seoDiagnosticCode.strictWarningEscalated,
    ]);
    expect(diagnostics.every((diagnostic) => diagnostic.severity === 'error')).toBe(true);
  });
});
