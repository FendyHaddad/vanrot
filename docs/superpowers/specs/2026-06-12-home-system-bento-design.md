# Home "System" Bento — Terrain Control Room

Date: 2026-06-12
Status: approved (concept + artwork treatment picked by user)

## Goal

Merge `home-ai`, `home-signals`, `home-anatomy` into one section: `home-system`.
Concept: **Terrain Control Room** — animated ASCII topographic contour canvas behind a
framed instrument panel; bento cells float over the terrain.

## Decisions

- One section replaces three. Numbered cells 01–06.
- Full-section ASCII contour terrain canvas (value-noise elevation, iso-band glyphs,
  slow drift, mouse spotlight brightens contours near cursor). Reduced motion → static frame.
- Instrument chrome: top bar `SYS.VANROT` + live fake coordinates readout driven by pointer;
  bottom status bar with runtime stats + blinking caret.
- Van Gogh artworks converted from color SVG to monochrome ASCII art (keeps brand wink,
  unifies with hacker aesthetic). `home-ai-artwork` component internals swapped.
- Signals cell is live: real `signal`/`computed` in `HomePage`, button calls `count.set()`,
  flow nodes show live values — dogfoods the framework on the homepage.
- Anatomy cell: wide cell with the existing 3-file triptych as mini panes.

## Layout (desktop, 4-col)

- 01 signals (live): col 1–2, row 1–2
- 02 manifest, 03 vr ai, 04 no eval, 05 zero deps: 2×2 right block
- 06 anatomy: full-width row 3

Tablet 2-col, mobile 1-col stacks.

## Files

- `apps/vanrot-site/src/pages/home/home.page.html` — one `home-system` section
- `apps/vanrot-site/src/pages/home/home.page.ts` — demo signal/computed/increment
- `apps/vanrot-site/src/pages/home/home-terrain.widget.ts` — new terrain canvas + coords
- `apps/vanrot-site/src/pages/home/home-interactions.widget.ts` — spotlight retarget + wiring
- `apps/vanrot-site/src/pages/home/home-ai-artwork.component.{html,css}` — ASCII art
- `apps/vanrot-site/src/pages/home/home.page.css` — system styles, remove old section styles
