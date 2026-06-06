import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersNamedPresetsArticle = {
  "key": "formattersNamedPresets",
  "section": "framework",
  "path": "/docs/formatters/named-presets",
  "label": "Named presets",
  "title": "Named Presets",
  "summary": "Named presets let teams replace repeated string masks and option objects with readable constants.",
  "status": "production-ready",
  "sections": [
    {
      "id": "named-presets",
      "title": "Cleaner shared formats",
      "body": "Enterprise apps often repeat the same date, currency, mask, or number formats everywhere. Named presets keep templates readable while still allowing direct strings for one-off screens.",
      "points": [
        "Use constants for country-specific masks, business identifiers, common dates, and money options.",
        "Allow direct strings for one-off formats so simple apps are not forced into ceremony.",
        "Let the compiler validate preset names and report the exact template line when a preset is missing."
      ],
      "code": {
        "title": "Preset constants",
        "code": "export const BUSINESS_TAX_ID_MASK = defineFormatPreset('99-9999999');\\n\\n{{ vendor.taxId | mask(BUSINESS_TAX_ID_MASK) }}"
      }
    }
  ]
} as const;

const sectionLinks = formattersNamedPresetsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class NamedPresetsPage {
  title(): string {
    return formattersNamedPresetsArticle.title;
  }

  summary(): string {
    return formattersNamedPresetsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersNamedPresetsArticle.sections[0].body;
  section0Points = formattersNamedPresetsArticle.sections[0].points ?? [];
  section0Code = formattersNamedPresetsArticle.sections[0].code?.code ?? '';
}
