import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeEffectsArticle = {
  "key": "storeEffects",
  "section": "framework",
  "path": "/docs/store/effects",
  "label": "Effects",
  "title": "Store Effects",
  "summary": "Store effects use a fluent stack with run, success, error, latestBy, skipWhen, cancelWhen, timeout, retry, and trace for readable async workflows.",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "id": "full-effect-stack",
      "title": "Full effect stack",
      "body": "Effects start from an action creator and describe the async policy in order. The fluent chain stays readable when it is fully used because each line names one concern: dedupe key, skip rule, cancellation trigger, timeout, retry, async work, success mapping, error mapping, and trace label.",
      "points": [
        "Use latestBy when only the latest request for a key should win.",
        "Use skipWhen when current state makes the request unnecessary.",
        "Use cancelWhen for close, reset, or navigation cancellation actions.",
        "Use success and error mappers to return actions rather than mutating state."
      ],
      "code": {
        "title": "Effect chain",
        "code": "export const claimsEffects = defineEffects({\\n  loadClaims: effect(claimsActions.loadClaims.start)\\n    .latestBy(({ action }) => action.accountId)\\n    .skipWhen(({ state, action }) =>\\n      Boolean((state.loadingByAccount as Record<string, boolean>)[action.accountId])\\n    )\\n    .cancelWhen(claimsActions.closeClaims.start)\\n    .timeout(claimsTimeouts.loadClaims)\\n    .retry(claimsRetry.loadClaims)\\n    .run(({ signal }) => claimsService.list({ signal }))\\n    .success((claims, { action }) =>\\n      claimsActions.loadClaims.success({ accountId: action.accountId, claims })\\n    )\\n    .error((error, { action }) =>\\n      claimsActions.loadClaims.error({ accountId: action.accountId, error: storeError(error) })\\n    )\\n    .trace(claimsTraces.loadClaims),\\n});"
      }
    },
    {
      "id": "policy-order",
      "title": "Policy order",
      "body": "Effect policy should describe intent before work. Put cancellation and dedupe decisions before run(), then keep result mapping after run(). That order makes it easy to scan what can stop the effect and what actions it can dispatch after the service call returns.",
      "points": [
        "Keep service objects outside the template and outside reducer files.",
        "Keep retry policies in a named options file when several effects share them.",
        "Normalize thrown values with storeError before dispatching error actions.",
        "Use trace names as named constants so diagnostics do not repeat labels."
      ],
      "code": {
        "title": "Effect options",
        "code": "export const claimsTimeouts = {\\n  loadClaims: 5000,\\n} as const;\\n\\nexport const claimsTraces = {\\n  loadClaims: traceName('claims.loadClaims'),\\n} as const;"
      }
    }
  ]
} as const;

const sectionLinks = storeEffectsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class EffectsPage {
  title(): string {
    return storeEffectsArticle.title;
  }

  summary(): string {
    return storeEffectsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeEffectsArticle.sections[0].body;
  section1Body = storeEffectsArticle.sections[1].body;
  section0Points = storeEffectsArticle.sections[0].points ?? [];
  section1Points = storeEffectsArticle.sections[1].points ?? [];
  section0Code = storeEffectsArticle.sections[0].code?.code ?? '';
  section1Code = storeEffectsArticle.sections[1].code?.code ?? '';
}
