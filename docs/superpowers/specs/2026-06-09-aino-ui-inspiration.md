# Aino UI Inspiration Research

Date: 2026-06-09
Source reviewed: https://aino.agency/
Purpose: capture public design and interaction signals that can inspire future Vanrot work without copying Aino source, brand assets, fonts, images, videos, project content, or protected creative material.

## Boundary

This is an inspiration and technical-research note, not a clone spec.

Important fidelity rule:

The goal is not to make something vaguely inspired or visually unrelated. The goal is to preserve the reference's interaction grammar, pacing, layout pressure, and emotional effect, then express those mechanics through original Vanrot-owned subjects and assets.

Do not copy:

- Aino source code.
- Aino logos, images, videos, fonts, project names, case-study content, or client imagery.
- Their exact text, route labels beyond generic observation, project ordering, or final rendered layouts.
- The exact animated glyph stream, timing curves, or click-gate copy if it is brand-specific.

Safe Vanrot direction:

- Recreate the observed mechanics closely: click-to-enter gate, fullscreen monospaced glyph field, persistent ASCII-like veil, fixed compact nav, route text scrambling, project-grid rhythm, and abrupt body-state transitions.
- Replace the owned expression: use Vanrot package names, route tokens, diagnostic codes, verifier commands, and original generated/media assets.
- Keep the high-fidelity structure, not the literal Aino skin.
- Prefer Vanrot-native signals and components over importing a mystery animation runtime.

Example: a Vanrot version should not become "a nice dark grid page." It should keep the fullscreen click gate, the feeling that the page is being decoded, the fixed nav sitting above the field, and the grid/list content reveal. The subject should change into a Vanrot manifest, package graph, compiler trace, or release dashboard.

## Browser Review Scope

Reviewed with the in-app browser on:

- Desktop viewport: `1280x720`.
- Mobile viewport: `390x844`.
- Tablet viewport: `768x1024`.

Observed limitations:

- The loader screenshot capture timed out while the animated grid was active.
- Browser asset bundling was blocked by the browser security policy for `https://aino.agency`, so no raw assets or source files were downloaded.
- The desktop click-to-enter flow was confirmed. Mobile/tablet showed the intro gate and simplified nav, but the quick center-tap probe did not advance the page during the observed window.
- I did not find literal `click` text in extracted body text. The click prompt appears to be visual, animated, hidden from the text extraction, or rendered as part of the glyph experience. For Vanrot, treat the click prompt as a designed visual affordance rather than normal body copy.

## Public Stack Signals

The public page appears to be a bundled static/app experience on Vercel infrastructure.

Observed asset signals:

- 2 stylesheets:
  - `https://aino.agency/assets/CT9yiByn.css`
  - `https://aino.agency/assets/CjqTykxV.css`
- 5 scripts:
  - `_vercel/insights/script.js`
  - `https://aino.agency/assets/g7e7Q5yc.js`
  - `https://aino.agency/assets/StvXtB4D.js`
  - `https://aino.agency/assets/Dc28V7Bw.js`
  - `https://aino.agency/assets/V7DbkTI4.js`
- 3 web fonts.
- 32 images.
- 2 videos.
- Vercel image optimizer and Vercel blob media URLs.
- Logo assets such as `aino-agency.svg` and `aino.svg`.

The useful lesson for Vanrot is not the exact stack. The important pattern is a small app shell with hashed assets, route-level content, preloaded media, and a persistent interaction layer above page content.

## Loading Gate

The most important mechanic is the entry gate.

Desktop observed state before click:

- `document.body.className` was `home`.
- Page height was near one viewport: about `737px` at `1280x720`.
- `main#app` filled the viewport.
- `section.gridcontainer` filled the viewport and sat above content at about `z-index: 10`.
- `div.grid.mono` filled the viewport and rendered a dense monospaced character field.
- `nav#nav.hoverchar` sat above the grid at about `z-index: 11`.
- Visible nav labels were present immediately: Aino, Work, Services, About, Play, Settings, Contact.
- The grid text mutated through symbols, digits, punctuation, dots, and zero-like fields.

Desktop click behavior:

- A center click on the loader unlocked the page.
- `document.body.className` changed from `home` to `home ready`.
- Page height expanded from about `737px` to about `5697px`.
- The content did not simply fade in as a normal page. The glyph field stayed present as a persistent veil while the project-grid content appeared underneath it.

Vanrot implementation recipe:

- Build a `manifest-gate` or docs-local `click-gate` shell with three states:
  - `idle`: glyph field is active, content is mounted but visually suppressed.
  - `armed`: prompt is visible or implied, pointer is active, nav is present.
  - `ready`: content layout expands, body/page state changes, glyph field remains as a thin interactive texture.
- Make the gate user-initiated. A first click or tap should feel like unlocking a system, not dismissing a modal.
- Keep the prompt short and embedded in the visual language. Good Vanrot prompt examples:
  - `click to compile`
  - `enter manifest`
  - `tap to resolve graph`
  - `boot package map`
- Preserve accessibility:
  - Use a real button for the gate action.
  - Keep the prompt readable to assistive tech even if the visible prompt is glyph-styled.
  - Support `Enter` and `Space`.
  - Honor `prefers-reduced-motion`.

## Glyph Field

The reference's grid is not decoration after the page starts. It acts like a persistent material layer.

Observed traits:

- Full-viewport monospaced field.
- Mutates continuously.
- Uses digits, symbols, punctuation, dots, and letter fragments.
- Sits above the content but lets the page remain readable by rhythm and contrast.
- Changes apparent density during loading and route changes.

Vanrot-safe glyph vocabulary:

- Package names: `runtime`, `compiler`, `router`, `forms`, `store`.
- Route tokens: `/docs/runtime`, `/docs/forms`, `/docs/store`.
- Diagnostics: `VRCFG013`, `VRROUTE`, `VRSIZE`.
- Verifiers: `pnpm verify`, `verify:size`, `verify:site-docs`.
- State words: `ready`, `planned`, `hardening`, `production`.
- Structural symbols: braces, slashes, colons, arrows, dots, pipes, and zeroes.

The field should be generated from Vanrot data, not copied from Aino's character patterns.

## Page Animation Model

The animation language is restrained but highly specific.

Observed behaviors:

- Before click, the page is mostly a living monospaced field.
- On click, the page unlocks by body-state change rather than normal scrolling.
- The content reveal is spatial: page height expands and sections become available.
- The glyph layer remains, so the page feels decoded rather than loaded.
- Nav hover/route text can scramble. During a desktop click from home to `/work`, the Work label briefly rendered as a scrambled-looking intermediate text before settling.
- The route changed from the home body state to `bodyClass: work` within the observed transition window.

Vanrot animation recipe:

- Use a signal-backed state machine:
  - `gateState = 'idle' | 'armed' | 'entering' | 'ready'`.
  - `routeTransitionState = 'stable' | 'scrambling' | 'swapping' | 'settling'`.
  - `activeSurface = 'grid' | 'list' | 'detail'`.
- Gate transition:
  - Start with content mounted but collapsed or clipped.
  - On click, scramble glyph density for 300-700ms.
  - Expand the content container and reveal first cards.
  - Keep the glyph veil active at lower opacity or lower density.
- Route transition:
  - Scramble only the outgoing nav label and a few glyph cells.
  - Swap page content quickly.
  - Reset scroll to top.
  - Set the new body/page class immediately enough that the route feels crisp.
- Reduced-motion fallback:
  - No continuous glyph mutation.
  - One short opacity/clip change.
  - Same layout and content, no auto-scramble.

## Layout Model

Desktop home route:

- Fixed nav sits across the top in a four-column layout.
- Nav grouping at `1280px` was roughly:
  - left: brand.
  - second column: Work and Services.
  - third column: About and Play.
  - fourth column: Settings and Contact.
- Home content uses repeated full-width sections.
- First visible content after unlock is a pair of large half-width project tiles.
- A text interstitial follows with a short statement and two compact actions.
- Later sections alternate:
  - two-up project rows.
  - a full-width or extra-large project tile.
  - three smaller project cards.
  - footer shortcuts and brand mark.
- Content classes observed included `home-content`, `sections`, repeated `section`, card-like anchors with `col`, `w4`, and `w8`, plus `image` and `video` blocks.

Desktop work route:

- Clicking the Work nav moved to `/work`.
- Body state became `work`.
- The page exposed project controls: `Projects`, `Grid`, and `List`.
- Page height was much shorter than the home story route, about `985px` at desktop.
- The route read as a compact index rather than a long editorial story.

Mobile/tablet intro route:

- At `390x844` and `768x1024`, the gate filled the viewport.
- Only a simplified nav was visible: brand on the left, then `Contact` and `Menu` on the right.
- The full desktop nav links existed in the DOM but had zero visible width/height.
- Content sections were present in the DOM, but measured as collapsed during the gate state.
- The fullscreen grid container matched the viewport size.

Vanrot layout recipe:

- Use a single source of truth for content, then project it into:
  - desktop long-scroll manifest grid.
  - desktop compact work/index route.
  - mobile gate plus menu-first route navigation.
- Do not duplicate content trees for breakpoints.
- Preserve the top nav pressure:
  - desktop: fixed multi-column command strip.
  - mobile/tablet: brand, contact/action, menu.
- Treat content cards as data records:
  - package id.
  - package role.
  - maturity.
  - docs route.
  - verifier command.
  - runtime or build impact.

## Vanrot Page Concept

Recommended first target:

`apps/vanrot-site` package-manifest or framework-surface page.

Possible route:

- `/docs/manifest`
- `/docs/packages`
- `/docs/system-map`

Core idea:

The user lands on a glyph field built from Vanrot packages and verifier tokens. A prompt asks them to click to compile or enter the manifest. On click, the site resolves into a package grid where each card is a real package or subsystem. Route changes between grid, list, and details scramble the nav text and selected glyph cells.

Suggested components:

- `manifest-gate.component.ts/html/css`
- `manifest-glyph-field.component.ts/html/css`
- `manifest-nav.component.ts/html/css`
- `manifest-card-grid.component.ts/html/css`
- `manifest-route-transition.component.ts/html/css`
- `manifest-data.ts`

Use signals for:

- gate state.
- route transition state.
- active package.
- active view mode.
- mobile menu state.
- reduced-motion state.

Keep UI markup in HTML, logic in TypeScript, and styling scoped.

## Exact Inspiration Mapping

High-fidelity Aino mechanic, Vanrot-owned expression:

- Aino click gate -> Vanrot `click to compile` gate.
- Aino glyph stream -> package, route, diagnostic, and verifier token stream.
- Aino project tiles -> Vanrot package cards.
- Aino Work route -> Vanrot grid/list manifest route.
- Aino hover scramble -> command/nav token scramble.
- Aino footer shortcuts -> Vanrot release metadata shortcuts.
- Aino media cards -> original Vanrot-generated package visuals, charts, or code-map thumbnails.
- Aino client/project numbers -> Vanrot phase/package identifiers.

The output should feel close in structure and pacing, but impossible to mistake for Aino because the subject, data, visual assets, copy, and identity are Vanrot's.

## Interaction Acceptance Criteria

A Vanrot implementation inspired by this note should pass these checks:

- Fresh load starts in a real gate state.
- A visible and accessible click/tap prompt exists.
- First click or keyboard activation changes gate state to ready.
- The page height/content availability changes after the gate unlocks.
- A glyph field remains present after unlock at a readable density.
- Desktop nav stays fixed and uses grouped command columns.
- Mobile/tablet nav collapses to brand plus primary actions/menu.
- Route changes include a small text/glyph transition, not a full page blackout.
- Grid and list modes are both available when the content is an index.
- Reduced-motion mode preserves the same information architecture.
- No Aino asset, logo, font, client image, or project content is used.

## Prompt To Reuse

Use this when asking an agent to build from this reference:

```text
Use `docs/superpowers/specs/2026-06-09-aino-ui-inspiration.md` as the reference. Build an original Vanrot-owned experience that preserves Aino's interaction grammar: fullscreen click-to-enter glyph gate, body-state unlock, persistent monospaced ASCII veil, compact fixed nav, route-label scramble, grid/list transition, and editorial project-card rhythm. Do not copy Aino source, assets, fonts, logos, project names, exact text, or final layouts. Replace the subject with Vanrot package, route, diagnostic, verifier, and release metadata. Keep the result high-fidelity to the mechanics, but original in identity and assets.
```

