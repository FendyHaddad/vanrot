import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliTaskRunnersArticle = {
  "key": "cliTaskRunners",
  "section": "framework",
  "path": "/docs/cli/task-runners",
  "label": "Task Runners",
  "title": "CLI Task Runners",
  "summary": "Task runner commands let a Vanrot project use familiar vr dev, vr build, and vr test commands while keeping the Vite integration and project config visible.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "dev-build-test",
      "title": "Dev build test",
      "body": "The task runner commands are intentionally plain. dev starts the local Vite workflow, build runs the production build path, and test runs the project test command without hiding the underlying package scripts from the developer.",
      "points": [
        "Use vr dev for the local preview loop.",
        "Use vr build before shipping docs or application changes.",
        "Use vr test for the project test gate when the workspace exposes one."
      ],
      "code": {
        "title": "Task commands",
        "code": "vr dev\\nvr build\\nvr test"
      }
    },
    {
      "id": "vite-relationship",
      "title": "Vite relationship",
      "body": "The CLI does not replace the Vite plugin. It gives users a consistent command entry point, while @vanrot/vite-plugin still transforms role files, loads config, manages virtual modules, and participates in hot reload.",
      "points": [
        "Debug compile failures in the Vite plugin guide after task startup succeeds.",
        "Debug missing config in the configuration guide before changing Vite code.",
        "Keep package scripts readable so teams can still see the underlying toolchain."
      ]
    },
    {
      "id": "automation-use",
      "title": "Automation use",
      "body": "Automation should use quiet or structured modes when output is parsed, and human modes when logs are inspected by developers. This keeps CI logs stable without making local command output sterile.",
      "points": [
        "Use --quiet for routine build logs.",
        "Use --json when a wrapper needs one final command result.",
        "Avoid mixing --json and --jsonl because the CLI reports that conflict directly."
      ]
    }
  ]
} as const;

const sectionLinks = cliTaskRunnersArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TaskRunnersPage {
  title(): string {
    return cliTaskRunnersArticle.title;
  }

  summary(): string {
    return cliTaskRunnersArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliTaskRunnersArticle.sections[0].body;
  section1Body = cliTaskRunnersArticle.sections[1].body;
  section2Body = cliTaskRunnersArticle.sections[2].body;
  section0Points = cliTaskRunnersArticle.sections[0].points ?? [];
  section1Points = cliTaskRunnersArticle.sections[1].points ?? [];
  section2Points = cliTaskRunnersArticle.sections[2].points ?? [];
  section0Code = cliTaskRunnersArticle.sections[0].code?.code ?? '';
}
