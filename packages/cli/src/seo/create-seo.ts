import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

export interface CreateSeoSelection {
  enabled: boolean;
  siteUrl?: string;
}

export interface SeoSelectionOptions {
  seoFlag: boolean;
  noSeo: boolean;
  siteUrl: string | undefined;
  interactive: boolean;
}

export async function resolveCreateSeoSelection(
  options: SeoSelectionOptions,
): Promise<CreateSeoSelection> {
  if (options.noSeo) {
    return { enabled: false };
  }

  if (options.seoFlag) {
    return buildSelection(true, options.siteUrl);
  }

  if (!options.interactive) {
    return { enabled: false };
  }

  const reader = createInterface({ input, output });

  try {
    const wantsSeo = await reader.question('Add optional @vanrot/seo package? (y/N) ');
    if (wantsSeo.trim().toLowerCase() !== 'y') {
      return { enabled: false };
    }

    const siteUrl = await reader.question('Production site URL (optional, press enter to skip): ');
    return buildSelection(true, siteUrl);
  } finally {
    reader.close();
  }
}

function buildSelection(enabled: boolean, siteUrl: string | undefined): CreateSeoSelection {
  const trimmedSiteUrl = siteUrl?.trim();

  if (trimmedSiteUrl === undefined || trimmedSiteUrl === '') {
    return { enabled };
  }

  return { enabled, siteUrl: trimmedSiteUrl };
}
