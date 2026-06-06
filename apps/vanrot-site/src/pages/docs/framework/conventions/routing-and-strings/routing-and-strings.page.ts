import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsRoutingStringsArticle = {
  "key": "conventionsRoutingStrings",
  "section": "framework",
  "path": "/docs/conventions/routing-and-strings",
  "label": "Routing and Strings",
  "title": "Conventions Routing and Strings",
  "summary": "Routing and string conventions prevent docs, routes, diagnostics, command names, labels, generated copy, and file suffixes from drifting.",
  "status": "available-now",
  "sections": [
    {
      "id": "single-source",
      "title": "Single source",
      "body": "Shared strings should live in one named source of truth. Route paths, route labels, command names, diagnostic codes, generated copy, and file suffixes should be referenced from the owning constant or metadata object.",
      "points": [
        "Use route refs instead of repeated path strings.",
        "Use commandName for CLI command names.",
        "Use diagnostic code catalogs for repeated errors."
      ],
      "code": {
        "title": "Route and command refs",
        "code": "import { commandName } from '@vanrot/cli';\\nimport { route } from './routes';\\n\\nconst docsPath = route.docsRuntimeSignals.path;\\nconst generate = commandName.generate;"
      }
    },
    {
      "id": "acceptable-literals",
      "title": "Acceptable literals",
      "body": "String literals are acceptable at the owning source-of-truth boundary or when a standard API requires them. They are not acceptable when the same route, label, diagnostic, or command string is repeated across the project.",
      "points": [
        "Define the string once where the concept is owned.",
        "Reference the constant everywhere else.",
        "Move repeated literals into metadata when they become part of docs or generated output."
      ]
    },
    {
      "id": "drift-debugging",
      "title": "Drift debugging",
      "body": "If navigation, docs, CLI help, or AI output disagrees, search for duplicated literals. Drift usually appears when a route path or command name was copied instead of referenced from the source object.",
      "points": [
        "Check route tests for public path changes.",
        "Check docs data for stale labels.",
        "Check generated AI docs after changing public names."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsRoutingStringsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoutingAndStringsPage {
  title(): string {
    return conventionsRoutingStringsArticle.title;
  }

  summary(): string {
    return conventionsRoutingStringsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsRoutingStringsArticle.sections[0].body;
  section1Body = conventionsRoutingStringsArticle.sections[1].body;
  section2Body = conventionsRoutingStringsArticle.sections[2].body;
  section0Points = conventionsRoutingStringsArticle.sections[0].points ?? [];
  section1Points = conventionsRoutingStringsArticle.sections[1].points ?? [];
  section2Points = conventionsRoutingStringsArticle.sections[2].points ?? [];
  section0Code = conventionsRoutingStringsArticle.sections[0].code?.code ?? '';
}
