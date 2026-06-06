import type { DocsSectionLink } from '../shared/docs-content.ts';

export const changelogArticle = {
  "key": "changelog",
  "section": "reference",
  "path": "/docs/changelog",
  "label": "Changelog",
  "title": "Changelog",
  "summary": "Track published Vanrot versions, release notes, and upgrade guidance from the first npm release onward.",
  "status": "available-now",
  "sections": [
    {
      "id": "version-0-2-2",
      "title": "0.2.2",
      "date": "June 5, 2026",
      "body": "Behavior Expansion release for the optional @vanrot/behavior package. Adds the Phase 28 headless interaction suite while keeping browser runtime size unchanged.",
      "changes": [
        "Added collapsible, accordion, disclosure, selection, listbox, select, combobox, multi-selection, menu, context-menu, menubar, navigation-menu, toggle-group, toolbar, scroll-area, portal, focus, calendar, date-picker, drag-drop, and table-resize controllers.",
        "Added subpath exports so apps can import only the behavior family they need.",
        "Updated behavior config validation and vr create behavior scaffolding for the expanded family names.",
        "Updated behavior docs, framework reference metadata, AI-readable docs, the future pipeline checklist, and the final TDD inventory for Phase 28."
      ]
    },
    {
      "id": "version-0-2-0",
      "title": "0.2.0",
      "date": "June 4, 2026",
      "body": "CLI maintenance release for project inspection and generated metadata cleanup. Consolidates inspection into doctor, adds cache cleaning, and updates public documentation for the new command surface.",
      "changes": [
        "Added vr doctor --inspect to include read-only project intelligence in the health report.",
        "Removed standalone vr inspect from the command surface and redirects that mental model to vr doctor --inspect.",
        "Added vr cache clean with --dry-run support for Vanrot-owned generated metadata.",
        "Updated public CLI docs, project intelligence docs, command references, and AI-readable docs for the new maintenance workflow."
      ]
    },
    {
      "id": "version-0-1-1",
      "title": "0.1.1",
      "date": "May 30, 2026",
      "body": "CLI release for project update and upgrade workflows. Adds framework-aware project sync, package upgrade automation, and stable upgrade diagnostics.",
      "changes": [
        "Added vr update to sync generated config, project-map, and AI doorway files without changing package versions.",
        "Added vr upgrade to bump installed @vanrot packages, install dependencies, and run the project sync step.",
        "Added upgrade diagnostics for missing package.json, invalid package.json, missing Vanrot packages, and package-manager install failures.",
        "Added release bump protection so already bumped package manifests are not bumped again before publish."
      ]
    },
    {
      "id": "version-0-1-0",
      "title": "0.1.0",
      "date": "May 29, 2026",
      "body": "The first usable npm release for @vanrot packages. It fixes the broken 0.0.0 first publish, aligns generated app dependencies with the CLI package version, includes current UI and router Web Types metadata, and keeps the release dry-run consumers green before publishing.",
      "changes": [
        "Published the first usable npm release for @vanrot packages.",
        "Aligned generated app dependencies with the CLI package version.",
        "Included current UI and router Web Types metadata.",
        "Kept release dry-run consumers green before publishing."
      ]
    },
    {
      "id": "version-0-0-0",
      "title": "0.0.0",
      "date": "May 29, 2026",
      "body": "The initial npm publish was deprecated because generated projects requested 0.1.0 packages that were not on the registry yet. Use 0.1.0 or latest instead of installing 0.0.0.",
      "changes": [
        "Initial npm publish was deprecated.",
        "Generated projects requested 0.1.0 packages that were not on the registry yet.",
        "Use 0.1.0 or latest instead of installing 0.0.0."
      ]
    }
  ]
} as const;

const sectionLinks = changelogArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ChangelogPage {
  title(): string {
    return changelogArticle.title;
  }

  summary(): string {
    return changelogArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = changelogArticle.sections[0].body;
  section1Body = changelogArticle.sections[1].body;
  section2Body = changelogArticle.sections[2].body;
  section3Body = changelogArticle.sections[3].body;
  section4Body = changelogArticle.sections[4].body;
}
