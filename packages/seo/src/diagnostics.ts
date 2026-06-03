import { seoDiagnosticCode } from './constants.js';
import { validateSeoImages } from './social.js';
import type { SeoDiagnostic, SeoDiagnosticsOptions, SeoMetadata } from './types.js';

const titlePath = 'title';
const descriptionPath = 'description';
const siteUrlPath = 'siteUrl';

export function diagnoseSeo(
  metadata: SeoMetadata,
  options: SeoDiagnosticsOptions = {},
): SeoDiagnostic[] {
  const diagnostics: SeoDiagnostic[] = [];

  if (!metadata.title?.trim()) {
    diagnostics.push({
      code: seoDiagnosticCode.missingTitle,
      message: 'SEO title is required.',
      severity: 'error',
      path: titlePath,
    });
  }

  if (!metadata.description?.trim()) {
    diagnostics.push({
      code: seoDiagnosticCode.missingDescription,
      message: 'SEO description is required.',
      severity: 'error',
      path: descriptionPath,
    });
  }

  if (options.siteUrl && !isHttpUrl(options.siteUrl)) {
    diagnostics.push({
      code: seoDiagnosticCode.invalidSiteUrl,
      message: 'SEO siteUrl must be an absolute http(s) URL.',
      severity: 'error',
      path: siteUrlPath,
    });
  }

  if (!options.siteUrl && metadata.canonical?.startsWith('/')) {
    diagnostics.push({
      code: seoDiagnosticCode.missingSiteUrl,
      message: 'SEO siteUrl is missing, so production canonical URLs cannot be finalized.',
      severity: 'warning',
      path: siteUrlPath,
    });
  }

  diagnostics.push(...validateSeoImages(metadata.images));
  diagnostics.push(...validateSeoImages(metadata.openGraph?.images));
  diagnostics.push(...validateSeoImages(metadata.twitter?.images));

  return applyStrictMode(diagnostics, options);
}

function applyStrictMode(
  diagnostics: SeoDiagnostic[],
  options: SeoDiagnosticsOptions,
): SeoDiagnostic[] {
  if (options.mode !== 'strict') {
    return diagnostics;
  }

  let escalated = false;
  const strictDiagnostics = diagnostics.map((diagnostic) => {
    if (diagnostic.severity === 'error') {
      return diagnostic;
    }

    escalated = true;
    return {
      ...diagnostic,
      severity: 'error' as const,
    };
  });

  if (!escalated) {
    return strictDiagnostics;
  }

  return [
    ...strictDiagnostics,
    {
      code: seoDiagnosticCode.strictWarningEscalated,
      message: 'SEO diagnostics are running in strict mode, so warnings were escalated.',
      severity: 'error',
    },
  ];
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
