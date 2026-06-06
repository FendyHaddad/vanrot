import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeInspectionArticle = {
  "key": "storeInspection",
  "section": "framework",
  "path": "/docs/store/inspection",
  "label": "Inspection",
  "title": "Store Inspection",
  "summary": "inspectStore(store) exposes a Vanrot-native event timeline for actions, reducers, state changes, effects, snapshots, and observer failures without RxJS, Redux, or devtools UI coupling.",
  "status": "production-ready-through-phase-20",
  "sections": [
    {
      "id": "headless-inspector",
      "title": "Headless inspector",
      "body": "Store inspection is opt-in and headless. Calling inspectStore on a useStore instance activates a bounded event history for that store instance. The store package owns the protocol and event shape; the existing devtools package can later render those events without moving UI concerns into @vanrot/store.",
      "points": [
        "Use inspectStore(store) from page code, tests, examples, or future devtools bridges.",
        "Keep the default store path small by leaving inspection disabled until it is requested.",
        "Read history through inspector.history() and subscribe through inspector.observe(observer).",
        "Use the protocol value vanrot.store.inspection.v1 when bridging events outside the store package."
      ],
      "code": {
        "title": "Enable inspection",
        "code": "import { inspectStore, useStore } from '@vanrot/store';\n\nexport class ClaimsPage {\n  private store = useStore(claimsStore);\n  private inspector = inspectStore(this.store, { historyLimit: 24 });\n\n  inspectionEvents() {\n    return this.inspector.history();\n  }\n}"
      }
    },
    {
      "id": "event-kinds",
      "title": "Event kinds",
      "body": "The inspection timeline records named events for dispatch, reducer completion, state changes, skipped actions, effect starts, retries, timeouts, success, failure, cancellation, stale-write prevention, snapshots, replay, history reset, and observer isolation.",
      "points": [
        "Dispatch events include the action type and a summarized payload.",
        "Reducer and state events include previous and next snapshot ids when snapshots are enabled.",
        "Effect events include trace name, concurrency key, retry attempt, timeout, duration, and cancellation reason when available.",
        "Observer failures are captured as inspection events so one observer cannot break store workflows."
      ],
      "code": {
        "title": "Read timeline labels",
        "code": "import { storeInspectionEventKind } from '@vanrot/store';\n\nconst labels = inspector.history().map((event) => event.kind);\n\nif (labels.includes(storeInspectionEventKind.effectRetried)) {\n  showRetryMetadata();\n}"
      }
    },
    {
      "id": "safe-summaries",
      "title": "Safe summaries",
      "body": "Inspection events summarize payloads and state by default so a timeline can explain what changed without requiring UI code to render full application objects. Full state is available through explicit snapshots and replay paths that are created by the inspector.",
      "points": [
        "Primitive values are recorded directly in summaries.",
        "Arrays record their length and object values record their keys.",
        "Changed state keys are captured when previous and next states are objects.",
        "Inspection APIs stay Vanrot-native; applications do not need Observable adapters or Redux middleware."
      ]
    }
  ]
} as const;

const sectionLinks = storeInspectionArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class InspectionPage {
  title(): string {
    return storeInspectionArticle.title;
  }

  summary(): string {
    return storeInspectionArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeInspectionArticle.sections[0].body;
  section1Body = storeInspectionArticle.sections[1].body;
  section2Body = storeInspectionArticle.sections[2].body;
  section0Points = storeInspectionArticle.sections[0].points ?? [];
  section1Points = storeInspectionArticle.sections[1].points ?? [];
  section2Points = storeInspectionArticle.sections[2].points ?? [];
  section0Code = storeInspectionArticle.sections[0].code?.code ?? '';
  section1Code = storeInspectionArticle.sections[1].code?.code ?? '';
}
