import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorToastArticle = {
  "key": "behaviorToast",
  "section": "framework",
  "path": "/docs/behavior/toast",
  "label": "Toast",
  "title": "Toast Behavior",
  "summary": "createToastController manages a queue of dismissible toast messages with tones and auto-expiry timers.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "queue",
      "title": "Message queue",
      "body": "createToastController manages transient messages without requiring a renderer package. The controller exposes a toasts signal holding active messages, and enqueue({ title, description, tone, timeoutMs }) appends a message, returns the created toast, and schedules auto-dismiss when timeoutMs is greater than zero. The application decides where the toast region lives and how tones map to CSS.",
      "points": [
        "Tones are default, success, warning, and danger.",
        "defaultTimeoutMs (4000) applies when a message omits timeoutMs.",
        "Pass timeoutMs: 0 for a sticky toast that only dismisses on demand."
      ]
    },
    {
      "id": "dismissal",
      "title": "Dismissal",
      "body": "dismiss(id) clears the timer and drops that message from the queue; clear() clears every timer and empties the queue. Provide createId in options for deterministic ids in tests, snapshots, and examples. Timers are owned by the controller, so do not schedule duplicate app timers for the same toast unless the page is deliberately coordinating another side effect.",
      "code": {
        "title": "Enqueue a toast",
        "code": "import { createToastController } from '@vanrot/behavior/toast';\n\nconst toasts = createToastController({ defaultTimeoutMs: 4000 });\nconst toast = toasts.enqueue({ title: 'Saved', tone: 'success' });\n\ntoasts.dismiss(toast.id);"
      }
    },
    {
      "id": "rendering-contract",
      "title": "Rendering contract",
      "body": "A toast renderer should read toasts(), render a live region, and call dismiss(id) from close buttons. The behavior helper does not prescribe markup because app shells often need different placement for dashboards, marketing pages, mobile layouts, and modal-heavy workflows. Keep the queue in TypeScript and keep the visual toast list in the HTML template.",
      "points": [
        "Use success for completed actions, warning for recoverable attention, and danger for destructive or failed operations.",
        "Keep titles short enough to scan inside a stack.",
        "Call clear() when a route transition should drop stale messages."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorToastArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ToastPage {
  title(): string {
    return behaviorToastArticle.title;
  }

  summary(): string {
    return behaviorToastArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorToastArticle.sections[0].body;
  section1Body = behaviorToastArticle.sections[1].body;
  section2Body = behaviorToastArticle.sections[2].body;
  section0Points = behaviorToastArticle.sections[0].points ?? [];
  section2Points = behaviorToastArticle.sections[2].points ?? [];
  section1Code = behaviorToastArticle.sections[1].code?.code ?? '';
}
