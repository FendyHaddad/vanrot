import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const deploymentArticle = {
  "key": "deployment",
  "section": "reference",
  "path": "/docs/deployment",
  "label": "Deployment",
  "title": "Build And Deployment Preparation",
  "summary": "Prepare a Vanrot site for production hosting without pretending this repository controls DNS, credentials, analytics, or live deployment.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "target-host",
      "title": "Target Host",
      "body": "Phase 24 prepares the public site for vanrot.vankode.com. The documentation describes hosting assumptions, production build commands, and public route expectations, while DNS records, hosting credentials, analytics setup, and live launch remain outside this phase."
    },
    {
      "id": "production-build",
      "title": "Production Build",
      "body": "Use pnpm --filter @vanrot/vanrot-site build to run the site production build through the Vanrot CLI. This verifies the Vite plugin, runtime, router, UI package, and docs data together in the deployment target app."
    },
    {
      "id": "route-readiness",
      "title": "Route Readiness",
      "body": "The public routes must clearly connect the landing page, Framework Documentation, and Design Component surfaces. Route metadata must include titles and descriptions so the site is ready for a hosting layer to expose useful previews."
    }
  ]
} as const;

const sectionLinks = deploymentArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DeploymentPage {
  title(): string {
    return deploymentArticle.title;
  }

  summary(): string {
    return deploymentArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = deploymentArticle.sections[0].body;
  section1Body = deploymentArticle.sections[1].body;
  section2Body = deploymentArticle.sections[2].body;
}
