import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeReplayArticle = {
  "key": "storeReplay",
  "section": "framework",
  "path": "/docs/store/replay",
  "label": "Snapshots and replay",
  "title": "Store Snapshots and Replay",
  "summary": "Store snapshots and replay let apps capture review checkpoints, replay action history through the store reducer, and inspect each replay step without exposing reducer internals on the public store instance.",
  "status": "production-ready-through-phase-20",
  "sections": [
    {
      "id": "manual-checkpoints",
      "title": "Manual checkpoints",
      "body": "Snapshots are created automatically around dispatch when inspection is enabled, and apps can also create named manual checkpoints. Manual checkpoints are useful in tests, debug drawers, and future devtools flows where a user wants to replay from a known state.",
      "points": [
        "Call inspector.snapshot(label) before a workflow starts.",
        "Store the snapshot id if the user needs to replay from that exact checkpoint.",
        "Snapshots use deterministic ids with the store inspection snapshot prefix.",
        "Snapshot creation is recorded in the same inspection event history."
      ],
      "code": {
        "title": "Capture checkpoint",
        "code": "const checkpoint = inspector.snapshot('Claims review checkpoint');\n\nstore.action.loadClaims.start({\n  accountId: this.accountId(),\n  filters: this.filters(),\n});"
      }
    },
    {
      "id": "replay-actions",
      "title": "Replay actions",
      "body": "Replay runs the recorded action log through the store reducer from a selected snapshot. The reducer remains hidden behind the inspection controller, so app code gets replay results without reaching into store internals.",
      "points": [
        "Use inspector.replayFrom(snapshot.id) to produce replay steps.",
        "Each step records the input state, action, output state, and changed state keys.",
        "Replay reports ok: false when the requested snapshot is missing.",
        "Replay emits started and completed events so future devtools panels can show replay activity."
      ],
      "code": {
        "title": "Replay from checkpoint",
        "code": "const replay = inspector.replayFrom(checkpoint.id);\n\nif (replay.ok) {\n  const changedKeys = replay.steps.flatMap((step) => step.changedKeys);\n}"
      }
    },
    {
      "id": "effect-hardening",
      "title": "Effect hardening",
      "body": "Phase 20 also records effect lifecycle events for retry, timeout, latest-by cancellation, cancelWhen cancellation, and stale-write prevention. These events make async store behavior inspectable without teaching new users RxJS streams.",
      "points": [
        "effectStarted and effectSucceeded bracket successful async work.",
        "effectRetried records retry attempt and action metadata.",
        "effectTimedOut and effectFailed separate timeout facts from general failure facts.",
        "effectCanceled and staleWritePrevented explain why outdated async results did not write state."
      ]
    }
  ]
} as const;

const sectionLinks = storeReplayArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ReplayPage {
  title(): string {
    return storeReplayArticle.title;
  }

  summary(): string {
    return storeReplayArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeReplayArticle.sections[0].body;
  section1Body = storeReplayArticle.sections[1].body;
  section2Body = storeReplayArticle.sections[2].body;
  section0Points = storeReplayArticle.sections[0].points ?? [];
  section1Points = storeReplayArticle.sections[1].points ?? [];
  section2Points = storeReplayArticle.sections[2].points ?? [];
  section0Code = storeReplayArticle.sections[0].code?.code ?? '';
  section1Code = storeReplayArticle.sections[1].code?.code ?? '';
}
