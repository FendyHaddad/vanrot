# Vanrot Devtools Spec

Status: rough brainstorm capture, not approved for implementation yet.

Source mock: `.superpowers/brainstorm/36381-1780932834/content/devtools-popout-v3.html`

This file is intentionally immature. It captures the current direction so we can leave the brainstorm, think, and revisit it later without losing the shape of the idea.

## Product Direction

Vanrot Devtools should feel like a beefed-up Vue Devtools for Vanrot, not a Redux clone and not a generic dashboard.

The visible product direction is:

- A bottom-center launcher on the inspected app, similar to Vue Devtools.
- Clicking the launcher opens a polished popout panel above the bottom edge.
- The panel uses Vanrot's own UI language: graphite dark surface, hairline borders, dotted preview texture, restrained vermilion accent, compact metadata, code-first layout, and component-doc style copy buttons.
- The first impression should be "this belongs to Vanrot" and "this helps me debug the thing I am looking at."

## Current Assumption

Start with the in-app bottom-center launcher overlay as the primary UX.

The browser extension panel can still exist, but the product should not be designed around a tiny extension-only panel first. The overlay is the user-facing shape we want to reason about.

## Full Suite Goal

The Devtools shell should eventually include these areas:

- Components: rendered component tree, selected node, props, events, ownership metadata.
- HTML: source template for the selected component or page.
- CSS: scoped stylesheet for the selected component or page.
- TypeScript: page/component logic for the selected component or page.
- Generated output: compiler output or source-map-linked generated files when available.
- Store: action timeline, snapshots, state diffs, replay, selector invalidation, effect lifecycle links.
- Signals: signal graph, computed dependencies, updates, subscribers.
- Router: route match, route refs, params, guards, keep-alive/scroll state.
- Effects: queued/running/succeeded/failed effects, cancellation, retry, concurrency keys.
- Forms: field state, validation state, async resources, wizard/array state.
- Diagnostics: framework warnings/errors linked to source.
- Metadata: devtools manifest, schema version, stale/missing/unsupported status.
- Caches: visible cache state and clear/refresh actions.
- AI Context: deterministic copy bundle for prompting an AI assistant.

This is the full-suite ambition. It does not mean every panel is equally ready today.

## Realism Check

Do not promise magic.

### Proven Or Already Grounded

- `@vanrot/devtools` already exists.
- Current devtools can read a project graph manifest from the local metadata endpoint.
- `@vanrot/store` has inspection, snapshots, history, replay, and effect metadata foundations.
- Component/source inspection is plausible because Vanrot already cares about role files and source maps.

### Bridge Work

These are buildable, but need real bridge and metadata work:

- HTML/CSS/TS source blocks for selected components.
- Copy selected source block.
- Store inspection data routed into the devtools shell.
- Source-map links from diagnostics to HTML/CSS/TS.
- Cache state display.
- Refresh metadata and clear known devtools/Vite/source-map caches.
- Copy AI context as a deterministic bundle of known facts.

### Later Or Risky

These should not be treated as MVP promises unless we define exact rules:

- "Repair hints" that explain what is wrong.
- Automatic root-cause diagnosis.
- AI-generated fixes.
- Broad "clear all caches" behavior without visible scope and confirmation.

If repair hints ship, they should be rule-based checks only. Examples:

- Metadata endpoint missing.
- Manifest schema unsupported.
- Graph manifest stale.
- Source map missing.
- Store replay diverged at a known snapshot.
- Vite bridge disconnected.

No vague guesses.

## Launcher UX

The app gets a fixed bottom-center launcher:

- Compact button.
- Vanrot mark.
- Label: `Vanrot Devtools`.
- Secondary text can show active panels, for example `Components / Store / Source / Repair`.
- It should not cover important app UI more than necessary.
- It should be easy to collapse.

Open state:

- A large popout panel appears above the launcher.
- Panel width should support real source inspection.
- Panel should feel like a professional tool, not a modal card.
- It should remember panel size and last selected tab.

## Default View

Current preference from v3 mock:

Open around the selected thing, not a generic stats dashboard.

Default layout:

- Left rail: full-suite panel navigation.
- Center: selected component/source inspector.
- Right drawer: reality-checked tools such as cache state, metadata status, copy context, and known checks.

The Overview command center can exist, but it should not be the only mental model.

## Visual Language

Use the Vanrot component/docs style, not the rough v1/v2 dashboard style.

Important cues:

- Dark graphite paper, not pure black everywhere.
- Hairline borders instead of heavy shadows.
- Compact navigation rail.
- Dotted preview texture where a rendered preview is shown.
- Vermilion for active state, danger, status dot, and one or two priority actions.
- Code panels that resemble existing docs code snippets.
- Icon-style copy buttons.
- Small metadata counters and status labels.
- No big marketing hero layout.
- No rounded blob/cards look.

## AI Context Copy

Rename from "Prompt pack" unless that name feels right later.

More honest names:

- Copy AI context.
- Copy debug context.
- Copy selected evidence.

This feature should not generate an answer. It should copy a structured prompt payload containing only facts Devtools knows.

Possible copied sections:

- Selected component name.
- Route ref/path.
- HTML source block.
- CSS source block.
- TypeScript source block.
- Diagnostic code and source location.
- Store event and snapshot id.
- State diff summary.
- Generated output/source-map reference.
- Current cache and metadata status.

This makes AI prompting easier without pretending Devtools understands everything automatically.

## Cache Controls

Cache clearing should be visible, scoped, and safe.

Possible controls:

- Refresh metadata.
- Reset graph cache.
- Clear source-map cache.
- Reset Store timeline.
- Clear Vite bridge cache.
- Clear all dev caches.

Rules:

- Every destructive cache action needs a confirmation.
- Show what will be cleared before clearing.
- Show success/failure result.
- Avoid clearing user app data unless explicitly designed and confirmed.
- "Clear all" should probably mean "all Vanrot devtools/dev-server caches", not browser storage or application state.

## Store Panel

Store panel should include Redux-style information, but in Vanrot language:

- Action timeline.
- Before/after snapshot ids.
- State diff.
- Selector invalidation.
- Effect lifecycle links.
- Replay from snapshot.
- Bounded history.
- Observer failures.

It should not require Redux or RxJS.

## Source Inspector

The source inspector is central to the product.

For a selected component/page, show:

- Component tree location.
- Owning `.html` file.
- Owning `.css` file.
- Owning `.ts` file.
- Generated output when useful.
- Copy button per source block.
- Linked diagnostics and runtime events.

This should support the user's mental model: "what rendered this, where is it defined, what state changed it, and what exact code do I copy into a prompt?"

## Docs IA When This Becomes A Real Phase

If this becomes a production phase, docs should not be direct-URL-only.

Likely docs pages:

- `/docs/devtools`
- `/docs/devtools/launcher`
- `/docs/devtools/source-inspector`
- `/docs/devtools/store-timeline`
- `/docs/devtools/cache-controls`
- `/docs/devtools/ai-context`

Each visible sidebar child should be a real route/page, not a hash section.

## Testing Ideas

Future implementation should test:

- Launcher renders and opens/closes.
- Popout does not hide the entire app on common viewport sizes.
- Panel navigation works.
- Metadata missing/stale/unsupported states render.
- Source blocks copy exact text.
- Cache actions require confirmation.
- Store timeline consumes inspection events through the devtools bridge.
- No UI is added to `@vanrot/store`.
- Browser extension panel still works or is clearly deferred.

## Open Questions

- Is the overlay first, extension second direction correct?
- Should the default opened view be selected component/source, or last-used panel?
- Which cache scopes are real enough for MVP?
- Should "Copy AI context" ship in MVP, or wait until source inspection is solid?
- Should repair checks exist in MVP as status-only checks?
- How much of Components/Signals/Router/Forms must be real before calling it "full suite"?
- Should this become a numbered phase or stay in the future pipeline until the devtools shell is audited?
