import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersCompilerDiagnosticsArticle = {
  "key": "formattersCompilerDiagnostics",
  "section": "framework",
  "path": "/docs/formatters/compiler-diagnostics",
  "label": "Compiler diagnostics",
  "title": "Compiler Diagnostics",
  "summary": "The compiler reports invalid pipe names, arguments, variants, presets, duplicate definitions, and bad async handlers with file and line number.",
  "status": "production-ready",
  "sections": [
    {
      "id": "compiler-diagnostics",
      "title": "Terminal errors",
      "body": "Pipe errors should be visible in the terminal and tied to the template source span. Users should know exactly which pipe failed, which argument or preset was invalid, and which file and line need work.",
      "points": [
        "Report unknown pipe names and unknown pipe variants.",
        "Report invalid argument counts and unsupported argument shapes.",
        "Report duplicate custom pipe names and async pipe definitions.",
        "Include file path, line number, column, and a short fix hint."
      ],
      "code": {
        "title": "Diagnostic shape",
        "code": "VRCFG_PIPE_UNKNOWN app/pages/claims.page.html:18:34\\nUnknown pipe \"claimStats\". Did you mean \"claimStatus\"?"
      }
    }
  ]
} as const;

const sectionLinks = formattersCompilerDiagnosticsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CompilerDiagnosticsPage {
  title(): string {
    return formattersCompilerDiagnosticsArticle.title;
  }

  summary(): string {
    return formattersCompilerDiagnosticsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersCompilerDiagnosticsArticle.sections[0].body;
  section0Points = formattersCompilerDiagnosticsArticle.sections[0].points ?? [];
  section0Code = formattersCompilerDiagnosticsArticle.sections[0].code?.code ?? '';
}
