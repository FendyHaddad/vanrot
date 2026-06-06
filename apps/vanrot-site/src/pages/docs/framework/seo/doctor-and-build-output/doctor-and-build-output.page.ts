import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoDoctorAndBuildOutputArticle = {
  "key": "seoDoctorAndBuildOutput",
  "section": "framework",
  "path": "/docs/seo/doctor-and-build-output",
  "label": "Doctor and Build Output",
  "title": "SEO Doctor and Build Output",
  "summary": "SEO diagnostics and build artifacts are tied to config readiness, especially the presence of siteUrl.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "doctor-diagnostics",
      "title": "Doctor diagnostics",
      "body": "vr doctor reports SEO package/config drift plus config syntax diagnostics. Severity is chosen so early projects keep moving while real mistakes block release.",
      "points": [
        "Warning: missing siteUrl, so the app can develop before the origin is known.",
        "Error: malformed site URL or canonical value.",
        "Error: invalid sitemap route syntax or out-of-range priority.",
        "Error: unsupported robots directive or bad default title/description."
      ]
    },
    {
      "id": "build-artifacts",
      "title": "Build artifacts",
      "body": "Once siteUrl is configured, the Vite plugin emits sitemap.xml and robots.txt from the seo config using generateSitemapXml and generateRobotsTxt. Without siteUrl, syntax diagnostics still run, but artifact generation waits until the app knows its production origin.",
      "code": {
        "title": "Emitted artifacts",
        "code": "import { generateSitemapXml, generateRobotsTxt } from '@vanrot/seo';\n\nconst xml = generateSitemapXml({ siteUrl, routes });\nconst robots = generateRobotsTxt(policy);"
      }
    }
  ]
} as const;

const sectionLinks = seoDoctorAndBuildOutputArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DoctorAndBuildOutputPage {
  title(): string {
    return seoDoctorAndBuildOutputArticle.title;
  }

  summary(): string {
    return seoDoctorAndBuildOutputArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoDoctorAndBuildOutputArticle.sections[0].body;
  section1Body = seoDoctorAndBuildOutputArticle.sections[1].body;
  section0Points = seoDoctorAndBuildOutputArticle.sections[0].points ?? [];
  section1Code = seoDoctorAndBuildOutputArticle.sections[1].code?.code ?? '';
}
