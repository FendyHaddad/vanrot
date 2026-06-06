import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const configurationAiArticle = {
  "key": "configurationAi",
  "section": "framework",
  "path": "/docs/configuration/ai",
  "label": "AI Config",
  "title": "AI Configuration",
  "summary": "AI configuration controls generated AI rule sections and project intelligence behavior without making AI bundles the source of truth.",
  "status": "production-ready-through-phase-25",
  "sections": [
    {
      "id": "ai-domain",
      "title": "AI domain",
      "body": "The AI domain configures how Vanrot writes AI-readable project context. It should point AI consumers back to canonical docs and package data rather than inventing a separate framework description.",
      "points": [
        "Keep AI rules concise and tied to real project conventions.",
        "Regenerate AI context after docs or public APIs change.",
        "Treat AI output as a consumer of config, docs, and project map data."
      ],
      "code": {
        "title": "AI rule section",
        "code": "import { defineVanrotConfig, vanrotAiRuleSection } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  ai: {\\n    rules: { sections: [vanrotAiRuleSection.project] },\\n  },\\n});"
      }
    },
    {
      "id": "freshness-boundary",
      "title": "Freshness boundary",
      "body": "AI configuration is only useful when generated bundles are rebuilt from current docs and project state. If AI output references old APIs, fix the docs or bundle generation path instead of editing an AI-only copy.",
      "points": [
        "Refresh docs bundles after changing site-data.json.",
        "Refresh project maps after moving role files.",
        "Keep generated AI artifacts out of manual source-of-truth decisions."
      ]
    },
    {
      "id": "ai-debugging",
      "title": "Debug AI config",
      "body": "When AI context looks wrong, inspect config, project map freshness, and docs bundle fingerprints. Most AI drift is caused by stale generated data rather than a model misunderstanding the current project.",
      "points": [
        "Run the AI docs build before checking generated bundle content.",
        "Compare AI manifest fingerprints with changed docs files.",
        "Keep rule names stable so downstream consumers can merge updates."
      ]
    }
  ]
} as const;

const sectionLinks = configurationAiArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class AiPage {
  title(): string {
    return configurationAiArticle.title;
  }

  summary(): string {
    return configurationAiArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationAiArticle.sections[0].body;
  section1Body = configurationAiArticle.sections[1].body;
  section2Body = configurationAiArticle.sections[2].body;
  section0Points = configurationAiArticle.sections[0].points ?? [];
  section1Points = configurationAiArticle.sections[1].points ?? [];
  section2Points = configurationAiArticle.sections[2].points ?? [];
  section0Code = configurationAiArticle.sections[0].code?.code ?? '';
}
