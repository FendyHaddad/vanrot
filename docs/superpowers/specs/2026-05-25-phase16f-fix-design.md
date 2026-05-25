# Phase 16F Fix: Interaction Component Doc Pages + CSS

**Date:** 2026-05-25  
**Scope:** 5 interaction primitives — dialog, drawer, dropdown, tabs, toast

---

## Problem

Phase 16F created doc pages and component CSS files for 5 interaction primitives, but both were incomplete:

1. **Doc pages** (`apps/vanrot-site/src/pages/components/component-{dialog,drawer,dropdown,tabs,toast}.page.html`) — missing `<vr-sidebar>` and `<vr-header class="topbar">`. Sidebar disappears when navigating to these pages. Structure doesn't match established pattern.

2. **Component CSS** (`packages/ui/src/primitives/{dialog,drawer,dropdown,tabs,toast}/ui.*.css`) — only contains `color: inherit` stubs. No actual styling; components appear completely unstyled.

---

## Design

### Component CSS (ShadCN-quality, `--vr-*` tokens)

Each file uses only `--vr-*` design tokens from `vanrot-tokens.css`. Motion via `[data-state=open]` / `[data-state=closed]` selectors with `--vr-motion-normal` transitions.

**Dialog (`ui.dialog.css`)**
- `.vr-dialog-backdrop` — fixed full-screen, `--vr-z-overlay`, dark semi-transparent fill
- `.vr-dialog-content` — centered panel, `--vr-surface-popover`, `--vr-shadow-3`, `--vr-radius-lg`, `--vr-z-modal`
- Size variants: `sm`=400px, `md`=512px (default), `lg`=640px max-width
- Motion: `--vr-motion-normal` scale + opacity on open/close
- `.vr-dialog-header`, `.vr-dialog-title`, `.vr-dialog-description`, `.vr-dialog-footer` — layout + typography
- `.vr-dialog-close` — icon button top-right, hover state

**Drawer (`ui.drawer.css`)**
- `.vr-drawer-backdrop` — fixed full-screen, `--vr-z-overlay`
- `.vr-drawer-content` — edge-anchored panel, `--vr-surface-raised`, `--vr-shadow-3`, `--vr-z-modal`
- Placement: `left`/`right` = 320px wide; `top`/`bottom` = 50vh max height
- Motion: slide in/out from edge via `transform: translateX/Y` + `--vr-motion-normal`
- `.vr-drawer-header`, `.vr-drawer-title`, `.vr-drawer-close` — consistent with dialog

**Dropdown (`ui.dropdown.css`)**
- `.vr-dropdown` — `position: relative` container
- `.vr-dropdown-content` — floating panel, `--vr-surface-popover`, `--vr-shadow-2`, `--vr-radius-md`, `--vr-z-dropdown`
- Align variants: `start`/`end`/`center`
- `.vr-dropdown-item` — hover with `--vr-surface-raised`, focus-visible ring
- `.vr-dropdown-label` — muted header, small caps
- `.vr-dropdown-separator` — `--vr-color-line` border
- Motion: `--vr-motion-fast` opacity + slight scale on open/close

**Tabs (`ui.tabs.css`)**
- `.vr-tabs` — flex column container
- `.vr-tabs-list` — flex row, gap
- Variant `line`: active tab gets bottom border in `--vr-color-brand`, inactive muted
- Variant `pill`: active tab gets `--vr-surface-raised` background chip, `--vr-radius-md`
- `.vr-tabs-trigger` — button reset, `--vr-motion-fast` color transition
- `.vr-tabs-content` — padding, animated fade on tab switch

**Toast (`ui.toast.css`)**
- `.vr-toast-viewport` — fixed corner, `--vr-z-toast`, flex column stack, `--vr-space-4` gap
- `.vr-toast` — `--vr-surface-raised`, `--vr-shadow-2`, `--vr-radius-md`, `min-width: 320px`
- Tone variants: left `4px` border accent — `default`=line, `success`=`--vr-color-success`, `warning`=`--vr-color-warning`, `danger`=`--vr-color-danger`, `info`=`--vr-color-info`
- Placement: `top-right`/`top-left`/`bottom-right`/`bottom-left` corner positioning
- Motion: `--vr-motion-normal` slide + opacity from edge

---

### Doc Pages (match established button page pattern)

All 5 pages get identical structural treatment:

**Structure:**
```
<div class="app component-gallery-app">
  <vr-sidebar class="sidebar" placement.left aria-label="...">
    <nav>
      <!-- all component links, active class on current page -->
    </nav>
  </vr-sidebar>
  <vr-header class="topbar">
    <vr-breadcrumb> ... </vr-breadcrumb>
    <vr-nav class="topbar-right"> ... </vr-nav>
  </vr-header>
  <section class="content">
    <h1>{{ doc().title }}</h1>
    <section class="primitive" id="{component}">
      <!-- preview tiles for each variant/state -->
    </section>
    <section class="variant-doc" id="{component}-default">
      <div class="section-head">
        <h2>...</h2>
        <span class="code-chip">...</span>
      </div>
      <div class="variant-example">
        <div class="variant-preview"><!-- live example --></div>
        <div class="code-snippet">
          <pre class="code-block language-html">...</pre>
        </div>
      </div>
    </section>
  </section>
</div>
```

**Sidebar nav** includes all current component links with correct active state per page. Matches the full nav list from `component-button.page.html`.

**Content sections** per component:
- **Dialog**: default open state tile + sections for `size-sm`, `size-md`, `size-lg`, `motion-subtle`
- **Drawer**: placement tiles (left/right/top/bottom) + sections per placement
- **Dropdown**: basic dropdown tile + sections for `align-start`, `align-center`, `align-end`
- **Tabs**: `variant-line` tile + `variant-pill` tile + sections per variant
- **Toast**: tone tiles (default/success/warning/danger/info) + placement sections

---

## Files Changed

**Component CSS (packages/ui):**
- `packages/ui/src/primitives/dialog/ui.dialog.css`
- `packages/ui/src/primitives/drawer/ui.drawer.css`
- `packages/ui/src/primitives/dropdown/ui.dropdown.css`
- `packages/ui/src/primitives/tabs/ui.tabs.css`
- `packages/ui/src/primitives/toast/ui.toast.css`

**Doc pages (apps/vanrot-site):**
- `apps/vanrot-site/src/pages/components/component-dialog.page.html`
- `apps/vanrot-site/src/pages/components/component-drawer.page.html`
- `apps/vanrot-site/src/pages/components/component-dropdown.page.html`
- `apps/vanrot-site/src/pages/components/component-tabs.page.html`
- `apps/vanrot-site/src/pages/components/component-toast.page.html`

---

## Success Criteria

- Navigating to any Phase 16F component page shows sidebar + topbar (no disappearing sidebar)
- Doc pages match visual structure of `component-button.page.html`
- Component CSS uses `--vr-*` tokens exclusively — no hardcoded colors or sizes
- `pnpm verify` passes (typecheck + tests + build + size budget)
