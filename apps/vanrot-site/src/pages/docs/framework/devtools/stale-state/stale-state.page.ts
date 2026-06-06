import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const devtoolsStaleStateArticle = {
  "key": "devtoolsStaleState",
  "section": "framework",
  "path": "/docs/devtools/stale-state",
  "label": "Stale State",
  "title": "Devtools Stale State",
  "summary": "Stale-state diagnostics explain when project intelligence needs to be regenerated before devtools or AI consumers can trust it.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "stale-purpose",
      "title": "Stale purpose",
      "body": "Stale state is a first-class part of the project graph because generated intelligence can drift. Devtools should tell the developer that data is old rather than rendering outdated structure as if it were current.",
      "points": [
        "Use stale.isStale to decide whether to show a warning.",
        "Use stale reasons to point at the regeneration command.",
        "Do not hide stale data silently in graph views."
      ],
      "code": {
        "title": "Stale state check",
        "code": "if (manifest.stale.isStale) {\\n  for (const reason of manifest.stale.reasons) {\\n    console.warn(reason);\\n  }\\n}"
      }
    },
    {
      "id": "regeneration",
      "title": "Regeneration",
      "body": "The right fix for stale project intelligence is usually regeneration, not manual editing. Rerun the map command after moving role files, changing routes, editing compiler metadata, or updating AI rule configuration.",
      "points": [
        "Run vr map after structural source changes.",
        "Regenerate AI docs after documentation or public API changes.",
        "Restart the dev server when Vite metadata stays old."
      ]
    },
    {
      "id": "stale-debugging",
      "title": "Stale debugging",
      "body": "If stale warnings do not clear, check file timestamps, config root, sourceRoot, and whether the command is running in the same workspace as the dev server. Stale data often means two tools are looking at different roots.",
      "points": [
        "Compare project root paths in the manifest and dev server.",
        "Check sourceRoot before assuming role discovery failed.",
        "Check generatedAt to confirm regeneration actually happened."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsStaleStateArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StaleStatePage {
  title(): string {
    return devtoolsStaleStateArticle.title;
  }

  summary(): string {
    return devtoolsStaleStateArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsStaleStateArticle.sections[0].body;
  section1Body = devtoolsStaleStateArticle.sections[1].body;
  section2Body = devtoolsStaleStateArticle.sections[2].body;
  section0Points = devtoolsStaleStateArticle.sections[0].points ?? [];
  section1Points = devtoolsStaleStateArticle.sections[1].points ?? [];
  section2Points = devtoolsStaleStateArticle.sections[2].points ?? [];
  section0Code = devtoolsStaleStateArticle.sections[0].code?.code ?? '';
}
