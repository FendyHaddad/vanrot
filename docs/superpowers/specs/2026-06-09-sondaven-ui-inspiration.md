# Sondaven UI Inspiration Research

Date: 2026-06-09
Source reviewed: https://sondaven.com/en
Purpose: capture public design and implementation signals that can inspire future Vanrot work without copying Sondaven source, brand assets, videos, fonts, or protected creative material.

## Boundary

This is an inspiration and technical-research note, not a clone spec.

Important fidelity rule:

The goal is not to make something vaguely inspired or visually unrelated. The goal is to preserve the reference's interaction grammar, pacing, visual mechanics, and emotional effect, then express them through original Vanrot-owned subjects and assets.

Do not copy:

- Sondaven source code.
- Sondaven video/image/font assets.
- The sheep character or visual identity.
- Their exact copy, final rendered scenes, brand-specific layouts, or frame-by-frame motion.

Safe Vanrot direction:

- Recreate the observed mechanics closely: two-tone scanline treatment, cinematic empty space, quiet looping character scenes, scroll-triggered reveals, long narrative pacing, split text, and horizontal rails.
- Replace only the owned expression: use original Vanrot content, assets, character subjects, color system, and components.
- Use the observed public stack as a clue for how the experience is assembled.
- Prefer Vanrot-native implementation patterns over importing a full Webflow-style runtime.

Example: an owl version of the sheep should keep the woven vertical-bar texture, low-frame loop, two-tone treatment, placement rhythm, and mythic mascot role. It should change the silhouette, posture, source asset, identity, and story subject. A spider version of a background flying motif should keep the subtle pass-through timing, parallax feeling, and scene-layer behavior while using an original segmented Vanrot form.

## Public Stack Signals

The page appears to be a Webflow-exported marketing/storytelling build with custom animation code layered on top.

Observed script and stylesheet signals:

- Webflow page CSS and Webflow runtime.
- Lenis smooth scrolling.
- GSAP, ScrollTrigger, CustomEase, SplitText, and Flip loaded as public script dependencies.
- Swiper loaded for horizontal/free-mode carousel areas.
- Barba loaded for page-transition capability.
- Finsweet cookie consent.
- Slater-hosted custom script.
- Analytics scripts for GTM, Google Ads, and Meta Pixel.

Observed page classes and behavior signals:

- `section` blocks with ids such as `hero`, `prolog`, `about`, `location`, `seasons`, `commissioning`, `finance`, `developer`, `factoids`, `gallery`, `blog`, `cta`, and `faq`.
- Theme classes such as `theme_on-dark`, `theme_on-color`, `bg-light`, and `clip`.
- Text-splitting wrappers: `split-line`, `split-word`, `split-char`.
- Scene wrappers: `scene`, `hero-w_scene-bg`, `prolog-w_scene`, `seasons-w_scene`, `factoids-s_scene`, and similar.
- Slider/gallery classes: `slider_pag`, `gallery-cms`, `gallery-slide`, `apartments-gallery-cms`, `news-slider-cms`, and Swiper-specific classes on mobile/news sliders.

## Visual System

The design uses a very constrained two-tone visual system:

- Dark ink: approximately `#2c2824`.
- Warm sand: approximately `#a89474`.
- White is used sparingly.

Typography is a large part of the identity. The page uses custom display fonts named in the public CSS as KTF Metro variants. Vanrot should not copy those fonts. If this direction is useful, use an original Vanrot type pairing:

- A sharp technical display face for big editorial labels.
- A readable mono or grotesk for package metadata.
- Tight uppercase tracking only where it serves the system feeling.

The page leans on:

- Giant editorial headings.
- Small machine-like labels.
- Hairline dividers.
- Full-viewport sections.
- Dense but intentional metadata blocks.
- High-contrast image/video layers behind sparse copy.

## Long Scroll Storytelling Model

The strongest reusable idea is the content rhythm:

1. Hero identity.
2. Prologue with animated text reveal.
3. Context/introduction.
4. Location/world map.
5. Seasonal or mode switch.
6. Feature cards.
7. Product/unit gallery.
8. Timeline.
9. Financial/data section.
10. Proof/factoids.
11. Gallery/news.
12. CTA.
13. FAQ/footer.

For Vanrot, the equivalent package-manifest story could become:

1. Vanrot identity and "why packages exist".
2. Manifest philosophy.
3. Package graph and ownership map.
4. Horizontal package rail.
5. Runtime-size and dependency budget.
6. Package maturity/factoids.
7. Generated docs and AI-consumption impact.
8. CLI install/add/remove flow.
9. Release readiness and verification gates.
10. FAQ/footer.

## Sheep Animation Insight

The sheep effect is not a simple CSS icon. The public asset inventory shows multiple video scene assets, including:

- `preloader_sheep.mp4`
- `hero_sheeps-c.mp4`
- `factoids_sheeps-c.mp4`
- `footer_sheeps-c.mp4`

The visible result reads like a low-resolution woven or scanline character because the video/art direction is processed that way. The lesson for Vanrot is not "move away from that effect"; it is to preserve that effect's mechanics while replacing the subject:

- Use an original mascot or symbol rendered as a looping video/canvas scene.
- Keep it monochrome or two-tone so it belongs to the UI system.
- Use it as a narrative anchor at key scroll moments, not as decoration everywhere.
- Treat preloader, section transition, and footer as three separate appearances of the same character/system.
- Preserve the reference's quiet, slightly uncanny, ceremonial feeling instead of turning the mascot into a normal cute illustration.
- Preserve the vertical-bar / woven / scanline construction, but build it from Vanrot-owned geometry or generated assets.

Vanrot-safe candidates:

- A Vanrot package sigil that assembles from vertical bars.
- A manifest "totem" made from package names and route tokens.
- A runtime-size meter that becomes a character-like waveform.
- A small original pet/mascot only if it is created from scratch for Vanrot.

## Text Reveal Model

The page wraps text into lines, words, and characters, then animates opacity and transform. The observed DOM had hundreds of `split-char` nodes and many `split-word` nodes.

For Vanrot, implement this as a small reusable primitive rather than spreading manual markup:

- `vr-split-text` or a docs-local helper can split text at render time.
- Support `line`, `word`, and `char` modes.
- Respect `prefers-reduced-motion`.
- Preserve readable text for copy/paste, SEO, and screen readers.
- Use CSS custom properties for delay, duration, and reveal distance.

Good use cases:

- Manifest hero line reveal.
- Package names entering one by one.
- Verification commands appearing as typed or compiled tokens.
- Changelog/factoid counters.

Avoid using character splitting for long body paragraphs in Vanrot docs. It is expensive and makes accessibility harder.

## Horizontal Scroll / Package Manifest Idea

The Sondaven page uses horizontal movement in multiple ways:

- Swiper/free-mode sliders for mobile-friendly horizontal cards.
- Gallery and apartment rails with pagination counters.
- "Drag to slide" affordances.
- Section-level storytelling where vertical scroll exposes sideways content.

This maps well to a Vanrot package manifest surface.

Recommended Vanrot pattern:

- Use a sticky section with a horizontal package rail on desktop.
- Map vertical scroll progress to rail translation.
- Use native horizontal scroll or Swiper-style free mode on mobile/tablet.
- Show a package counter such as `01 / 10`.
- Each card should expose package name, status, owner surface, runtime impact, docs route, and verification gate.
- Keep keyboard navigation and reduced-motion fallback first-class.

Possible package-card fields:

- Package name: `@vanrot/runtime`, `@vanrot/router`, `@vanrot/forms`, etc.
- Role: runtime, compiler, behavior, docs, CLI.
- Status: planned, production-ready, hardening.
- Budget or size impact.
- Public docs route.
- Key verifier command.

## Mobile and Tablet Notes

Explicit viewport probes showed separate mobile/tablet behavior:

- Mobile viewport tested: `390x844`.
- Tablet viewport tested: `768x1024`.
- Both showed mobile-only blocks and two visible Swiper regions.
- The long scroll remains, but sections compress and mobile swaps in dedicated markup.
- Desktop-only elements were not visible in those probes.

Vanrot should avoid duplicating large content trees for breakpoints. Prefer one semantic content source with responsive presentation layers.

## Implementation Sketch for Vanrot

Recommended first implementation target:

`apps/vanrot-site` package-manifest story page or docs landing section.

Proposed pieces:

- `manifest-story.page.ts/html/css`: page shell and section order.
- `manifest-story-data.ts`: package list, metadata, routes, and verifier labels.
- `story-split-text.component.ts`: accessible split text primitive.
- `story-horizontal-rail.component.ts`: sticky desktop rail plus mobile native-scroll fallback.
- `story-scene.component.ts`: original Vanrot canvas/video/SVG scene slot.

Use signals for scroll state and current package index. Keep DOM content in HTML templates and page-specific styling in scoped CSS or shared docs CSS as appropriate.

## Package Manifest Blueprint

The package-manifest story should use real workspace packages as the content spine. Current packages observed in the workspace:

- `@vanrot/runtime`
- `@vanrot/compiler`
- `@vanrot/router`
- `@vanrot/behavior`
- `@vanrot/forms`
- `@vanrot/store`
- `@vanrot/devtools`
- `@vanrot/cli`
- `@vanrot/config`
- `@vanrot/formatters`
- `@vanrot/language-server`
- `@vanrot/seo`
- `@vanrot/ssr`
- `@vanrot/ai`
- `@vanrot/testing`
- `@vanrot/ui`
- `@vanrot/vite-plugin`

Each manifest card should be generated from one source of truth, not repeated in markup. Suggested card fields:

- package name
- role
- maturity state
- docs route
- public command or verifier
- package owner surface, such as runtime, compiler, docs, CLI, tooling, or AI
- size or dependency budget note when relevant
- one sentence explaining why the package exists

Suggested story sections:

1. Manifest prologue: why Vanrot is package-shaped.
2. Core rail: runtime, compiler, router, behavior, forms, and store.
3. Tooling rail: CLI, config, formatters, testing, vite-plugin, devtools, language-server.
4. Distribution rail: UI, SEO, SSR, AI.
5. Budget section: runtime size, package boundaries, and why behavior stays outside runtime.
6. Docs IA section: parent package pages and real child pages.
7. Verification section: package tests, site docs checks, AI docs checks, and release dry-run.
8. Footer/FAQ: package ownership and how new packages graduate.

The horizontal rail should not be a decorative carousel. It should make package architecture easier to understand.

## Motion Primitive Recipes

These are original Vanrot implementation recipes inspired by observed behavior, not extracted Sondaven code.

### Split Text

Goal: words appear as if the page is writing itself during scroll.

Recommended contract:

- Input text remains in a single semantic element.
- A component or directive creates presentational spans after render.
- The original readable text stays available through `aria-label` or a visually hidden fallback.
- Reduced motion renders plain text with no split wrappers.
- Modes: `line`, `word`, `char`.
- Public options: `mode`, `stagger`, `delay`, `distance`, `once`.

Implementation notes:

- Use `IntersectionObserver` for enter/exit.
- Use CSS custom properties for index and reveal state.
- Use transforms and opacity only.
- Avoid char-splitting long paragraphs.

### Long Scroll Story

Goal: vertical scrolling reveals a coherent product narrative.

Recommended contract:

- Every section is a real semantic section with a stable id.
- Section metadata lives near docs route metadata where possible.
- A small scroll store exposes active section and normalized progress as signals.
- Sticky scenes are presentation only; content must remain readable without motion.
- Reduced motion disables sticky scrub effects and shows sections in normal flow.

Implementation notes:

- Prefer `IntersectionObserver` plus `requestAnimationFrame`.
- Avoid a global animation runtime for the first build.
- Keep per-section animation state local to the page.

### Horizontal Package Rail

Goal: vertical scroll controls a package rail on desktop; mobile/tablet use native horizontal scroll.

Recommended contract:

- Desktop rail lives in a sticky section.
- Vertical progress maps to `translateX`.
- Current package index is derived from rail progress and exposed as a signal.
- Mobile/tablet rail uses `overflow-x`, scroll snap, and visible cards.
- Keyboard users can tab through every package card.
- Counters use real package count, such as `01 / 17`.

Implementation notes:

- Calculate rail distance from `scrollWidth - viewportWidth`.
- Keep package cards fixed-width with responsive constraints.
- Use `scroll-padding` so focused cards are not hidden under sticky chrome.
- Provide a plain list fallback under `prefers-reduced-motion`.

### Original Scene Layer

Goal: capture the memorable animated-sheep feeling with Vanrot-owned visual language.

Recommended contract:

- Scene component accepts an original visual asset or canvas renderer.
- The same symbol can recur in prelude, package rail, budget section, and footer.
- The visual style should be generated from Vanrot tokens: package names, route paths, diagnostic codes, graph edges, or runtime-size bars.
- No Sondaven sheep likeness, source video, or visual identity.
- High-fidelity adaptation is expected: the new scene should be recognizably inspired by the same scanline/video-installation technique, not merely a different mascot placed on the page.

Implementation options:

- CSS/canvas vertical-bar renderer driven by package graph data.
- Generated bitmap/video created specifically for Vanrot.
- SVG made from Vanrot package initials and route tokens.

## Acceptance Criteria for a Future Implementation

A future implementation inspired by this note should be considered complete only when:

- The page uses Vanrot-owned art direction and original assets.
- Package data is generated from a named source of truth.
- The horizontal rail includes all current packages or an explicitly scoped subset.
- Mobile and tablet have intentional native-scroll behavior.
- Reduced motion is supported.
- Split text remains accessible and copyable.
- Docs route/sidebar/AI-doc impact is planned before implementation.
- The route is verified in browser, not only by HTTP status.
- Package/documentation verification commands pass for the changed surface.

## Dependency Options

Recommended:

- Start with native CSS scroll timelines where practical, IntersectionObserver, and a small requestAnimationFrame scroll store.
- Use no new animation dependency for the first prototype.

Alternative:

- Use GSAP ScrollTrigger only if the package-manifest story becomes complex enough to justify the dependency and licensing review.

For horizontal cards:

- Prefer CSS scroll-snap and native overflow first.
- Consider Swiper only if drag inertia, pagination syncing, and breakpoint behavior become meaningfully expensive to maintain.

## Risks

- Over-copying the reference would weaken Vanrot identity.
- Heavy scroll animation can hurt docs usability.
- Character-split text can harm accessibility if implemented carelessly.
- Video scenes can become large and slow.
- A package manifest page must stay useful as documentation, not become a pure marketing page.

## Recommendation

Use Sondaven as close interaction and motion inspiration, not as source material to duplicate.

The best Vanrot-specific adaptation is a long-scroll package-manifest story:

- original Vanrot dark technical art direction,
- animated token/manifest text reveals,
- a horizontal package rail,
- sparse cinematic scene moments,
- real package metadata,
- strong reduced-motion and mobile fallbacks.

This gives Vanrot the storytelling energy the user liked while staying truthful to the framework/docs product.
