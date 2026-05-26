# Phase 16G Final October Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. This repository forbids subagents, parallel agents, worktrees, `git add`, `git commit`, and `git push` unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the final October showcase slice with `popover`, `tooltip`, and `command-menu` primitives, docs-shell dogfooding, polished component docs, and the admin/dashboard/mobile showcase patterns.

**Architecture:** Extend the existing Phase 16 registry-first UI pipeline: `@vanrot/ui` owns primitive metadata, source templates, token groups, anatomy, asset URLs, and docs paths; the compiler consumes that metadata to lower root and anatomy tags; the CLI copies registry-backed files and prints registry-backed help. Add small runtime helpers for positioned layers, tooltip disclosure, and command-menu keyboard state, then use those helpers from the docs site interaction widgets. Keep admin, dashboard, and mobile as showcase sections built from shipped primitives, not new primitive tags.

**Tech Stack:** TypeScript, Vanrot signals/runtime controllers, DOM APIs, Vitest with jsdom, `@vanrot/ui` registry metadata and source assets, `@vanrot/compiler` code generation, `@vanrot/cli`, `apps/vanrot-site`, local Vite preview on port `1990`, and browser visual QA.

---

## Source Material

- Spec: `docs/superpowers/specs/Phase-16G.md`
- Prior phase pattern: `docs/superpowers/plans/Phase-16F.md`
- Project rules: `AGENTS.md`
- Docs component pattern: local `vanrot-doc-component` skill when implementing docs pages
- Existing interaction helpers: `packages/runtime/src/ui/overlay-controller.ts`, `packages/runtime/src/ui/tabs-controller.ts`, `packages/runtime/src/ui/toast-controller.ts`
- Existing preview widget: `apps/vanrot-site/src/pages/components/component-interaction-preview.widget.ts`

## Implementation Decisions

- Use the primitive keys `popover`, `tooltip`, and `commandMenu`.
- Use selectors `vr-popover`, `vr-tooltip`, and `vr-command-menu`.
- Use source directories `packages/ui/src/primitives/popover`, `packages/ui/src/primitives/tooltip`, and `packages/ui/src/primitives/command-menu`.
- Use docs paths `/docs/components/popovers`, `/docs/components/tooltips`, and `/docs/components/command-menu`.
- Use route keys `componentPopovers`, `componentTooltips`, and `componentCommandMenu`.
- Use compile features `ui-popover`, `ui-tooltip`, and `ui-command-menu`.
- Add `phase16FinalPrimitiveOrder` as the 16G primitive slice constant in `@vanrot/ui`.
- Add runtime helpers as separate small files:
  - `packages/runtime/src/ui/positioned-layer.ts`
  - `packages/runtime/src/ui/tooltip-controller.ts`
  - `packages/runtime/src/ui/command-menu-controller.ts`
- Keep filtering app-owned for command menu in 16G. Runtime owns active item, disabled item skipping, selection, ARIA state, and cleanup.
- Keep the admin, dashboard, and mobile deliverable as three sections in one route: `/docs/examples/october-showcase`.
- Do not mark Phase 16G complete until `pnpm verify`, site restart, route response checks, and browser visual inspection pass.

## File Structure

Create:

- `packages/runtime/src/ui/positioned-layer.ts`: deterministic side/align positioning helper for overlay-like primitives.
- `packages/runtime/src/ui/tooltip-controller.ts`: hover/focus disclosure helper that does not steal focus.
- `packages/runtime/src/ui/command-menu-controller.ts`: keyboard active-descendant and selected-item helper.
- `packages/runtime/tests/ui/positioned-layer.test.ts`: jsdom positioning tests.
- `packages/runtime/tests/ui/tooltip-controller.test.ts`: hover, focus, Escape, and cleanup tests.
- `packages/runtime/tests/ui/command-menu-controller.test.ts`: keyboard movement, disabled skipping, selection, and cleanup tests.
- `packages/ui/src/primitives/popover/ui.popover.ts`
- `packages/ui/src/primitives/popover/ui.popover.html`
- `packages/ui/src/primitives/popover/ui.popover.css`
- `packages/ui/src/primitives/popover/ui.popover.test.ts`
- `packages/ui/src/primitives/popover/usage.home.html`
- `packages/ui/src/primitives/tooltip/ui.tooltip.ts`
- `packages/ui/src/primitives/tooltip/ui.tooltip.html`
- `packages/ui/src/primitives/tooltip/ui.tooltip.css`
- `packages/ui/src/primitives/tooltip/ui.tooltip.test.ts`
- `packages/ui/src/primitives/tooltip/usage.home.html`
- `packages/ui/src/primitives/command-menu/ui.command-menu.ts`
- `packages/ui/src/primitives/command-menu/ui.command-menu.html`
- `packages/ui/src/primitives/command-menu/ui.command-menu.css`
- `packages/ui/src/primitives/command-menu/ui.command-menu.test.ts`
- `packages/ui/src/primitives/command-menu/usage.home.html`
- `apps/vanrot-site/src/pages/components/component-popover.page.ts`
- `apps/vanrot-site/src/pages/components/component-popover.page.html`
- `apps/vanrot-site/src/pages/components/component-popover.page.css`
- `apps/vanrot-site/src/pages/components/component-tooltip.page.ts`
- `apps/vanrot-site/src/pages/components/component-tooltip.page.html`
- `apps/vanrot-site/src/pages/components/component-tooltip.page.css`
- `apps/vanrot-site/src/pages/components/component-command-menu.page.ts`
- `apps/vanrot-site/src/pages/components/component-command-menu.page.html`
- `apps/vanrot-site/src/pages/components/component-command-menu.page.css`
- `apps/vanrot-site/src/pages/examples/october-showcase.page.ts`
- `apps/vanrot-site/src/pages/examples/october-showcase.page.html`
- `apps/vanrot-site/src/pages/examples/october-showcase.page.css`
- `apps/vanrot-site/src/layouts/docs/docs-shell-interactions.widget.ts`: docs shell command palette, popover, and tooltip wiring.

Modify:

- `packages/runtime/src/index.ts`: export new runtime helpers.
- `packages/runtime/src/internal.ts`: export new helpers only if compiler or generated code imports them.
- `packages/runtime/tests/exports/exports.test.ts`: assert public exports.
- `packages/ui/src/registry/component-registry.ts`: add 16G registry type, order, selectors, native tags, docs paths, tokens, anatomy, examples, accessibility notes, and phase support.
- `packages/ui/src/registry/token-scales.ts`: add shared token arrays only for repeated token families.
- `packages/ui/src/metadata.ts`: add primitive type keys, order entries, primitive metadata, token groups, and asset URLs.
- `packages/ui/src/index.ts`: export `phase16FinalPrimitiveOrder` and related types.
- `packages/ui/src/styles/vanrotstyles.css`: add October classes for popover, tooltip, command menu, and their anatomy.
- `packages/ui/tests/metadata.test.ts`: add 16G metadata and registry assertions.
- `packages/ui/tests/assets.test.ts`: add 16G source asset assertions.
- `packages/compiler/src/api/types.ts`: add `ui-popover`, `ui-tooltip`, and `ui-command-menu`.
- `packages/compiler/src/codegen/ui-elements.ts`: add primitive feature map entries.
- `packages/compiler/src/codegen/ui-token-attributes.ts`: verify strict dotted-token behavior still covers 16G token groups.
- `packages/compiler/src/codegen/generate-component.ts`: rely on existing root/anatomy lowering and adjust only if 16G anatomy needs semantic attributes not already covered.
- `packages/compiler/tests/codegen/generate-component.test.ts`: add 16G lowering test.
- `packages/compiler/tests/codegen/ui-token-attributes.test.ts`: add 16G token diagnostics.
- `packages/compiler/tests/integration/compiler-production.test.ts`: include 16G compile features.
- `packages/cli/src/add/add-ui.ts`: accept the 16G primitive names through `uiPrimitiveOrder`.
- `packages/cli/src/add/ui-assets.ts`: copy 16G registry-backed assets.
- `packages/cli/src/commands/ui.ts`: keep anatomy, token, event, and docs-path help printing accurate for 16G.
- `packages/cli/tests/add.test.ts`: add `vr add` tests.
- `packages/cli/tests/ui-command.test.ts`: add `vr ui <component> --help` tests.
- `apps/vanrot-site/src/docs/component-doc-paths.ts`: add docs paths.
- `apps/vanrot-site/src/docs/site-data.json`: add primitive doc copy and the October showcase article.
- `apps/vanrot-site/src/docs/site-data.ts`: add `siteArticleKey.octoberShowcase`.
- `apps/vanrot-site/src/docs/site-navigation.ts`: include October showcase in Examples.
- `apps/vanrot-site/src/routes.ts`: import and route new component pages plus October showcase.
- `apps/vanrot-site/src/layouts/docs/docs.layout.ts`: expose command palette/search data and initialize docs-shell interactions.
- `apps/vanrot-site/src/layouts/docs/docs.layout.html`: dogfood command menu, popover, tooltip, nav/sidebar primitives.
- `apps/vanrot-site/src/layouts/docs/docs.layout.css`: shadcn-like shell polish, overlay blur, responsive shell behavior.
- `apps/vanrot-site/tests/site-pages.test.ts`: assert routes, files, shell dogfooding, and showcase sections.
- `apps/vanrot-site/tests/site-data.test.ts`: assert site data includes 16G docs and showcase article.
- `docs/superpowers/feature-maturity.md`: mark the implemented 16G slice complete after verification passes.
- `docs/superpowers/final-tdd-inventory.md`: add 16G runtime helpers, primitives, CLI, compiler, site pages, and verification evidence.
- `docs/vanrot-presentation.html`: mark 16G complete and Phase 17 active after verification passes.
- `docs/superpowers/plans/Phase-16G.md`: tick tasks as implementation completes.

## Tasks

### Task 1: Runtime Positioned Layer, Tooltip, And Command Menu Controllers

**Files:**
- Create: `packages/runtime/src/ui/positioned-layer.ts`
- Create: `packages/runtime/src/ui/tooltip-controller.ts`
- Create: `packages/runtime/src/ui/command-menu-controller.ts`
- Create: `packages/runtime/tests/ui/positioned-layer.test.ts`
- Create: `packages/runtime/tests/ui/tooltip-controller.test.ts`
- Create: `packages/runtime/tests/ui/command-menu-controller.test.ts`
- Modify: `packages/runtime/src/index.ts`
- Modify: `packages/runtime/src/internal.ts`
- Modify: `packages/runtime/tests/exports/exports.test.ts`

- [ ] **Step 1: Write failing positioned-layer tests**

Create `packages/runtime/tests/ui/positioned-layer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { positionLayer } from '../../src/ui/positioned-layer.js';

describe('positionLayer', () => {
  it('positions bottom/end content with a stable transform origin', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');

    trigger.getBoundingClientRect = () =>
      ({
        x: 120,
        y: 80,
        width: 48,
        height: 32,
        top: 80,
        right: 168,
        bottom: 112,
        left: 120,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    content.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 160,
        height: 120,
        top: 0,
        right: 160,
        bottom: 120,
        left: 0,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    positionLayer(trigger, content, { side: 'bottom', align: 'end', offset: 8 });

    expect(content.style.position).toBe('absolute');
    expect(content.style.left).toBe('8px');
    expect(content.style.top).toBe('120px');
    expect(content.style.transformOrigin).toBe('top right');
    expect(content.dataset.vrSide).toBe('bottom');
    expect(content.dataset.vrAlign).toBe('end');
  });

  it('positions top/center content above the trigger', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');

    trigger.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 200,
        width: 80,
        height: 40,
        top: 200,
        right: 180,
        bottom: 240,
        left: 100,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    content.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 120,
        height: 60,
        top: 0,
        right: 120,
        bottom: 60,
        left: 0,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    positionLayer(trigger, content, { side: 'top', align: 'center', offset: 4 });

    expect(content.style.left).toBe('80px');
    expect(content.style.top).toBe('136px');
    expect(content.style.transformOrigin).toBe('bottom center');
  });
});
```

- [ ] **Step 2: Run positioned-layer test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/positioned-layer.test.ts
```

Expected: FAIL with `Cannot find module '../../src/ui/positioned-layer.js'`.

- [ ] **Step 3: Implement positioned-layer helper**

Create `packages/runtime/src/ui/positioned-layer.ts`:

```ts
export type LayerSide = 'top' | 'right' | 'bottom' | 'left';
export type LayerAlign = 'start' | 'center' | 'end';

export interface PositionLayerOptions {
  side?: LayerSide;
  align?: LayerAlign;
  offset?: number;
}

export function positionLayer(
  trigger: HTMLElement,
  content: HTMLElement,
  options: PositionLayerOptions = {},
): void {
  const side = options.side ?? 'bottom';
  const align = options.align ?? 'center';
  const offset = options.offset ?? 8;
  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const coordinates = layerCoordinates(triggerRect, contentRect, side, align, offset);

  content.style.position = 'absolute';
  content.style.left = `${Math.round(coordinates.left)}px`;
  content.style.top = `${Math.round(coordinates.top)}px`;
  content.style.transformOrigin = transformOrigin(side, align);
  content.dataset.vrSide = side;
  content.dataset.vrAlign = align;
}

function layerCoordinates(
  trigger: DOMRect,
  content: DOMRect,
  side: LayerSide,
  align: LayerAlign,
  offset: number,
): { left: number; top: number } {
  if (side === 'top') {
    return {
      left: alignedX(trigger, content, align),
      top: trigger.top - content.height - offset,
    };
  }

  if (side === 'right') {
    return {
      left: trigger.right + offset,
      top: alignedY(trigger, content, align),
    };
  }

  if (side === 'left') {
    return {
      left: trigger.left - content.width - offset,
      top: alignedY(trigger, content, align),
    };
  }

  return {
    left: alignedX(trigger, content, align),
    top: trigger.bottom + offset,
  };
}

function alignedX(trigger: DOMRect, content: DOMRect, align: LayerAlign): number {
  if (align === 'start') {
    return trigger.left;
  }

  if (align === 'end') {
    return trigger.right - content.width;
  }

  return trigger.left + trigger.width / 2 - content.width / 2;
}

function alignedY(trigger: DOMRect, content: DOMRect, align: LayerAlign): number {
  if (align === 'start') {
    return trigger.top;
  }

  if (align === 'end') {
    return trigger.bottom - content.height;
  }

  return trigger.top + trigger.height / 2 - content.height / 2;
}

function transformOrigin(side: LayerSide, align: LayerAlign): string {
  const crossAxis = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';

  if (side === 'top') {
    return `bottom ${crossAxis}`;
  }

  if (side === 'bottom') {
    return `top ${crossAxis}`;
  }

  const blockAxis = align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
  return side === 'left' ? `right ${blockAxis}` : `left ${blockAxis}`;
}
```

- [ ] **Step 4: Run positioned-layer test and confirm it passes**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/positioned-layer.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing tooltip-controller tests**

Create `packages/runtime/tests/ui/tooltip-controller.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createTooltipController } from '../../src/ui/tooltip-controller.js';

describe('createTooltipController', () => {
  it('opens on hover and closes on pointer leave without moving focus', () => {
    vi.useFakeTimers();
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const controller = createTooltipController({ delayMs: 150 });

    controller.registerTrigger(trigger);
    controller.registerContent(content);
    trigger.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(149);
    expect(controller.open()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(controller.open()).toBe(true);
    expect(trigger.getAttribute('aria-describedby')).toBe(content.id);
    expect(content.hidden).toBe(false);

    trigger.dispatchEvent(new PointerEvent('pointerleave'));
    expect(controller.open()).toBe(false);
    expect(content.hidden).toBe(true);

    controller.dispose();
    vi.useRealTimers();
  });

  it('opens on focus, closes on Escape, and removes stale state on dispose', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const controller = createTooltipController();

    controller.registerTrigger(trigger);
    controller.registerContent(content);
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(controller.open()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(controller.open()).toBe(false);

    controller.dispose();
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    expect(content.hidden).toBe(true);
  });
});
```

- [ ] **Step 6: Run tooltip-controller test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/tooltip-controller.test.ts
```

Expected: FAIL with `Cannot find module '../../src/ui/tooltip-controller.js'`.

- [ ] **Step 7: Implement tooltip-controller helper**

Create `packages/runtime/src/ui/tooltip-controller.ts`:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';

let tooltipId = 0;

export interface TooltipControllerOptions {
  delayMs?: number;
}

export interface TooltipController {
  readonly open: WritableSignal<boolean>;
  registerTrigger(trigger: HTMLElement): () => void;
  registerContent(content: HTMLElement): () => void;
  openTooltip(): void;
  closeTooltip(): void;
  dispose(): void;
}

export function createTooltipController(options: TooltipControllerOptions = {}): TooltipController {
  const open = signal(false);
  const delayMs = options.delayMs ?? 0;
  const triggers = new Set<HTMLElement>();
  const contents = new Set<HTMLElement>();
  const disposers = new Set<() => void>();
  let openTimer: ReturnType<typeof setTimeout> | null = null;

  function sync(): void {
    const [content] = contents;

    for (const item of contents) {
      item.hidden = !open();
      item.setAttribute('role', 'tooltip');
      if (item.id.length === 0) {
        tooltipId += 1;
        item.id = `vr-tooltip-${tooltipId}`;
      }
    }

    for (const trigger of triggers) {
      if (open() && content !== undefined) {
        trigger.setAttribute('aria-describedby', content.id);
        continue;
      }

      trigger.removeAttribute('aria-describedby');
    }
  }

  function clearOpenTimer(): void {
    if (openTimer === null) {
      return;
    }

    clearTimeout(openTimer);
    openTimer = null;
  }

  function openTooltip(): void {
    clearOpenTimer();
    open.set(true);
    sync();
  }

  function closeTooltip(): void {
    clearOpenTimer();
    open.set(false);
    sync();
  }

  function scheduleOpen(): void {
    clearOpenTimer();

    if (delayMs === 0) {
      openTooltip();
      return;
    }

    openTimer = setTimeout(openTooltip, delayMs);
  }

  function handleEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }

    closeTooltip();
  }

  document.addEventListener('keydown', handleEscape);
  disposers.add(() => document.removeEventListener('keydown', handleEscape));

  return {
    open,
    registerTrigger(trigger) {
      triggers.add(trigger);
      const disposePointerEnter = register(trigger, 'pointerenter', scheduleOpen);
      const disposePointerLeave = register(trigger, 'pointerleave', closeTooltip);
      const disposeFocus = register(trigger, 'focus', openTooltip);
      const disposeBlur = register(trigger, 'blur', closeTooltip);
      disposers.add(disposePointerEnter);
      disposers.add(disposePointerLeave);
      disposers.add(disposeFocus);
      disposers.add(disposeBlur);
      sync();

      return () => {
        triggers.delete(trigger);
        disposePointerEnter();
        disposePointerLeave();
        disposeFocus();
        disposeBlur();
        sync();
      };
    },
    registerContent(content) {
      contents.add(content);
      sync();

      return () => {
        contents.delete(content);
        content.hidden = true;
        sync();
      };
    },
    openTooltip,
    closeTooltip,
    dispose() {
      closeTooltip();
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      triggers.clear();
      contents.clear();
    },
  };
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
```

- [ ] **Step 8: Run tooltip-controller test and confirm it passes**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/tooltip-controller.test.ts
```

Expected: PASS.

- [ ] **Step 9: Write failing command-menu-controller tests**

Create `packages/runtime/tests/ui/command-menu-controller.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createCommandMenuController } from '../../src/ui/command-menu-controller.js';

describe('createCommandMenuController', () => {
  it('moves active descendant through enabled items and skips disabled items', () => {
    const input = document.createElement('input');
    const dialog = document.createElement('div');
    const first = commandItem('profile');
    const disabled = commandItem('billing');
    const last = commandItem('settings');
    const selected: string[] = [];
    disabled.setAttribute('aria-disabled', 'true');

    const controller = createCommandMenuController({
      onSelect(value) {
        selected.push(value);
      },
    });

    controller.registerInput(input);
    controller.registerList(dialog);
    controller.registerItem('profile', first);
    controller.registerItem('billing', disabled);
    controller.registerItem('settings', last);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(controller.activeValue()).toBe('profile');
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(controller.activeValue()).toBe('settings');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(selected).toEqual(['settings']);

    controller.dispose();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('supports Home, End, ArrowUp, and item click selection', () => {
    const input = document.createElement('input');
    const list = document.createElement('div');
    const first = commandItem('dialog');
    const last = commandItem('dropdown');
    const selected: string[] = [];
    const controller = createCommandMenuController({
      onSelect(value) {
        selected.push(value);
      },
    });

    controller.registerInput(input);
    controller.registerList(list);
    controller.registerItem('dialog', first);
    controller.registerItem('dropdown', last);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(controller.activeValue()).toBe('dropdown');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(controller.activeValue()).toBe('dialog');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(controller.activeValue()).toBe('dropdown');

    first.click();
    expect(selected).toEqual(['dialog']);
  });
});

function commandItem(value: string): HTMLElement {
  const item = document.createElement('button');
  item.id = `item-${value}`;
  item.textContent = value;

  return item;
}
```

- [ ] **Step 10: Run command-menu-controller test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/command-menu-controller.test.ts
```

Expected: FAIL with `Cannot find module '../../src/ui/command-menu-controller.js'`.

- [ ] **Step 11: Implement command-menu-controller helper**

Create `packages/runtime/src/ui/command-menu-controller.ts`:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';

let commandItemId = 0;

export interface CommandMenuControllerOptions {
  onSelect?: (value: string) => void;
}

export interface CommandMenuController {
  readonly activeValue: WritableSignal<string | null>;
  registerInput(input: HTMLInputElement): () => void;
  registerList(list: HTMLElement): () => void;
  registerItem(value: string, item: HTMLElement): () => void;
  setActiveValue(value: string | null): void;
  dispose(): void;
}

export function createCommandMenuController(
  options: CommandMenuControllerOptions = {},
): CommandMenuController {
  const activeValue = signal<string | null>(null);
  const inputs = new Set<HTMLInputElement>();
  const lists = new Set<HTMLElement>();
  const items = new Map<string, HTMLElement>();
  const disposers = new Set<() => void>();

  function enabledValues(): string[] {
    return [...items.entries()]
      .filter(([, item]) => item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled'))
      .map(([value]) => value);
  }

  function sync(): void {
    const active = activeValue();
    const activeItem = active === null ? undefined : items.get(active);

    for (const input of inputs) {
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      if (activeItem === undefined) {
        input.removeAttribute('aria-activedescendant');
        continue;
      }

      input.setAttribute('aria-activedescendant', activeItem.id);
    }

    for (const list of lists) {
      list.setAttribute('role', 'listbox');
    }

    for (const [value, item] of items) {
      const selected = value === active;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = -1;
      if (item.id.length === 0) {
        commandItemId += 1;
        item.id = `vr-command-menu-item-${commandItemId}`;
      }
    }
  }

  function setActiveValue(value: string | null): void {
    activeValue.set(value);
    sync();
  }

  function move(delta: 1 | -1): void {
    const values = enabledValues();
    if (values.length === 0) {
      setActiveValue(null);
      return;
    }

    const current = activeValue();
    const index = current === null ? -1 : values.indexOf(current);
    const nextIndex = (index + delta + values.length) % values.length;
    setActiveValue(values[nextIndex] ?? null);
  }

  function selectActive(): void {
    const active = activeValue();
    if (active === null) {
      return;
    }

    options.onSelect?.(active);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveValue(enabledValues()[0] ?? null);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      const values = enabledValues();
      setActiveValue(values[values.length - 1] ?? null);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectActive();
    }
  }

  return {
    activeValue,
    registerInput(input) {
      inputs.add(input);
      const dispose = register(input, 'keydown', handleKeydown);
      disposers.add(dispose);
      sync();

      return () => {
        inputs.delete(input);
        input.removeAttribute('aria-activedescendant');
        dispose();
      };
    },
    registerList(list) {
      lists.add(list);
      sync();

      return () => {
        lists.delete(list);
      };
    },
    registerItem(value, item) {
      items.set(value, item);
      const disposeClick = register(item, 'click', () => {
        if (item.getAttribute('aria-disabled') === 'true' || item.hasAttribute('disabled')) {
          return;
        }

        setActiveValue(value);
        options.onSelect?.(value);
      });
      disposers.add(disposeClick);
      sync();

      return () => {
        items.delete(value);
        disposeClick();
        sync();
      };
    },
    setActiveValue,
    dispose() {
      for (const input of inputs) {
        input.removeAttribute('aria-activedescendant');
      }

      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      inputs.clear();
      lists.clear();
      items.clear();
      activeValue.set(null);
    },
  };
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
```

- [ ] **Step 12: Export runtime helpers and verify exports**

Modify `packages/runtime/src/index.ts`:

```ts
export {
  positionLayer,
  type LayerAlign,
  type LayerSide,
  type PositionLayerOptions,
} from './ui/positioned-layer.js';
export {
  createTooltipController,
  type TooltipController,
  type TooltipControllerOptions,
} from './ui/tooltip-controller.js';
export {
  createCommandMenuController,
  type CommandMenuController,
  type CommandMenuControllerOptions,
} from './ui/command-menu-controller.js';
```

Append to the existing export test in `packages/runtime/tests/exports/exports.test.ts`:

```ts
expect(runtime).toHaveProperty('positionLayer');
expect(runtime).toHaveProperty('createTooltipController');
expect(runtime).toHaveProperty('createCommandMenuController');
```

- [ ] **Step 13: Run runtime UI and export tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/positioned-layer.test.ts tests/ui/tooltip-controller.test.ts tests/ui/command-menu-controller.test.ts tests/exports/exports.test.ts
```

Expected: PASS.

### Task 2: UI Registry, Metadata, Source Templates, And Styles

**Files:**
- Create: all three primitive directories under `packages/ui/src/primitives/`
- Modify: `packages/ui/src/registry/component-registry.ts`
- Modify: `packages/ui/src/registry/token-scales.ts`
- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/vanrotstyles.css`
- Modify: `packages/ui/tests/metadata.test.ts`
- Modify: `packages/ui/tests/assets.test.ts`

- [ ] **Step 1: Write failing UI metadata tests**

Append to `packages/ui/tests/metadata.test.ts`:

```ts
it('exports the Phase 16G final primitive order', () => {
  expect(uiComponentPhase.finalOctober).toBe('16G');
  expect(phase16FinalPrimitiveOrder).toEqual(['popover', 'tooltip', 'commandMenu']);
  expect(uiPrimitiveOrder).toEqual(expect.arrayContaining(phase16FinalPrimitiveOrder));
});

it('exports rich registry data for Phase 16G final primitives', () => {
  expect(uiComponentRegistry.popover).toMatchObject({
    selector: 'vr-popover',
    nativeTag: 'div',
    category: 'interaction',
    phase: '16G',
    docsPath: '/docs/components/popovers',
  });
  expect(uiComponentRegistry.popover.tokens.side.tokens).toEqual(['top', 'right', 'bottom', 'left']);
  expect(uiComponentRegistry.popover.tokens.align.tokens).toEqual(['start', 'center', 'end']);
  expect(uiComponentRegistry.popover.anatomy.map((part) => part.selector)).toEqual([
    'vr-popover-trigger',
    'vr-popover-content',
    'vr-popover-title',
    'vr-popover-description',
    'vr-popover-close',
  ]);

  expect(uiComponentRegistry.tooltip).toMatchObject({
    selector: 'vr-tooltip',
    category: 'interaction',
    phase: '16G',
    docsPath: '/docs/components/tooltips',
  });
  expect(uiComponentRegistry.tooltip.tokens.delay.tokens).toEqual(['instant', 'short', 'long']);
  expect(uiComponentRegistry.tooltip.anatomy.map((part) => part.selector)).toEqual([
    'vr-tooltip-trigger',
    'vr-tooltip-content',
  ]);

  expect(uiComponentRegistry.commandMenu).toMatchObject({
    selector: 'vr-command-menu',
    category: 'interaction',
    phase: '16G',
    docsPath: '/docs/components/command-menu',
  });
  expect(uiComponentRegistry.commandMenu.tokens.density.tokens).toEqual(['compact', 'comfortable']);
  expect(uiComponentRegistry.commandMenu.anatomy.map((part) => part.selector)).toEqual([
    'vr-command-menu-input',
    'vr-command-menu-list',
    'vr-command-menu-group',
    'vr-command-menu-item',
    'vr-command-menu-empty',
    'vr-command-menu-shortcut',
  ]);
});
```

Add `phase16FinalPrimitiveOrder` to the imports from `../src/index.js`.

- [ ] **Step 2: Run UI metadata test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/ui test -- --run tests/metadata.test.ts
```

Expected: FAIL with an export error for `phase16FinalPrimitiveOrder`.

- [ ] **Step 3: Add 16G registry constants and registry entries**

Modify `packages/ui/src/registry/component-registry.ts`:

```ts
export const phase16FinalPrimitiveOrder = ['popover', 'tooltip', 'commandMenu'] as const;

export type Phase16FinalPrimitive = (typeof phase16FinalPrimitiveOrder)[number];

type RegistryBackedPrimitive =
  | Phase16FormsDataPrimitive
  | Phase16InteractionPrimitive
  | Phase16FinalPrimitive;
```

Extend `UiComponentRegistryItem['phase']` to include `'16G'`.

Add native tags, selectors, and docs paths:

```ts
const phase16FinalNativeTags = {
  popover: 'div',
  tooltip: 'span',
  commandMenu: 'div',
} as const satisfies Record<Phase16FinalPrimitive, string>;

const phase16FinalSelectors = {
  popover: 'vr-popover',
  tooltip: 'vr-tooltip',
  commandMenu: 'vr-command-menu',
} as const satisfies Record<Phase16FinalPrimitive, string>;

const phase16FinalDocsPathByPrimitive = {
  popover: '/docs/components/popovers',
  tooltip: '/docs/components/tooltips',
  commandMenu: '/docs/components/command-menu',
} as const satisfies Record<Phase16FinalPrimitive, string>;
```

Add registry entries:

```ts
const phase16FinalRegistryEntries = {
  popover: registryEntry('popover', {
    category: 'interaction',
    phase: '16G',
    tokens: {
      side: tokenGroup('side', ['top', 'right', 'bottom', 'left'], 'bottom', (token) => `vr-popover-side-${token}`),
      align: tokenGroup('align', ['start', 'center', 'end'], 'center', (token) => `vr-popover-align-${token}`),
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (token) => `vr-popover-size-${token}`),
      motion: tokenGroup('motion', ['instant', 'subtle'], 'subtle', (token) => `vr-popover-motion-${token}`),
    },
    openAttributes: [
      { name: 'open', description: 'Opens the popover content.' },
    ],
    events: [
      { name: 'openchange', description: 'Emitted when the popover open state changes.' },
      { name: 'close', description: 'Emitted when the popover closes.' },
    ],
    anatomy: [
      { selector: 'vr-popover-trigger', nativeTag: 'button', baseClass: 'vr-popover-trigger', description: 'Registers the element that opens the popover.' },
      { selector: 'vr-popover-content', nativeTag: 'div', baseClass: 'vr-popover-content', role: 'dialog', description: 'Renders the positioned popover surface.' },
      { selector: 'vr-popover-title', nativeTag: 'h3', baseClass: 'vr-popover-title', description: 'Labels the popover content.' },
      { selector: 'vr-popover-description', nativeTag: 'p', baseClass: 'vr-popover-description', description: 'Describes the popover content.' },
      { selector: 'vr-popover-close', nativeTag: 'button', baseClass: 'vr-popover-close', description: 'Closes the popover content.' },
    ],
    examples: [
      {
        label: 'Dimensions popover',
        code: '<vr-popover align.end side.bottom><vr-popover-trigger><vr-button variant.outline>Open</vr-button></vr-popover-trigger><vr-popover-content><vr-popover-title>Dimensions</vr-popover-title><vr-popover-description>Set the dimensions for the layer.</vr-popover-description></vr-popover-content></vr-popover>',
      },
    ],
    accessibility: [
      'Restore focus to the trigger when the popover closes.',
      'Close on Escape and outside pointer interaction.',
      'Honor reduced motion by removing entrance movement.',
    ],
  }),
  tooltip: registryEntry('tooltip', {
    category: 'interaction',
    phase: '16G',
    tokens: {
      side: tokenGroup('side', ['top', 'right', 'bottom', 'left'], 'top', (token) => `vr-tooltip-side-${token}`),
      align: tokenGroup('align', ['start', 'center', 'end'], 'center', (token) => `vr-tooltip-align-${token}`),
      delay: tokenGroup('delay', ['instant', 'short', 'long'], 'short', (token) => `vr-tooltip-delay-${token}`),
      tone: tokenGroup('tone', ['default', 'muted'], 'default', (token) => `vr-tooltip-tone-${token}`),
    },
    anatomy: [
      { selector: 'vr-tooltip-trigger', nativeTag: 'span', baseClass: 'vr-tooltip-trigger', description: 'Wraps the described control.' },
      { selector: 'vr-tooltip-content', nativeTag: 'span', baseClass: 'vr-tooltip-content', role: 'tooltip', description: 'Renders short descriptive text.' },
    ],
    examples: [
      {
        label: 'Icon action tooltip',
        code: '<vr-tooltip side.top align.center><vr-tooltip-trigger><vr-button aria-label="Copy">Copy</vr-button></vr-tooltip-trigger><vr-tooltip-content>Copy page</vr-tooltip-content></vr-tooltip>',
      },
    ],
    accessibility: [
      'The trigger keeps its own accessible name.',
      'Tooltip content opens on hover and focus without stealing focus.',
      'Escape closes the tooltip and cleanup removes aria-describedby.',
    ],
  }),
  commandMenu: registryEntry('commandMenu', {
    category: 'interaction',
    phase: '16G',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (token) => `vr-command-menu-size-${token}`),
      density: tokenGroup('density', ['compact', 'comfortable'], 'comfortable', (token) => `vr-command-menu-density-${token}`),
      tone: tokenGroup('tone', ['default', 'muted'], 'default', (token) => `vr-command-menu-tone-${token}`),
    },
    events: [
      { name: 'select', description: 'Emitted when an enabled command item is selected.' },
    ],
    anatomy: [
      { selector: 'vr-command-menu-input', nativeTag: 'input', baseClass: 'vr-command-menu-input', role: 'combobox', description: 'Filters or controls the command list.' },
      { selector: 'vr-command-menu-list', nativeTag: 'div', baseClass: 'vr-command-menu-list', role: 'listbox', description: 'Contains command groups and items.' },
      { selector: 'vr-command-menu-group', nativeTag: 'div', baseClass: 'vr-command-menu-group', role: 'group', description: 'Groups related command items under a heading.' },
      { selector: 'vr-command-menu-item', nativeTag: 'button', baseClass: 'vr-command-menu-item', role: 'option', description: 'Represents one selectable command.' },
      { selector: 'vr-command-menu-empty', nativeTag: 'p', baseClass: 'vr-command-menu-empty', description: 'Renders empty search state.' },
      { selector: 'vr-command-menu-shortcut', nativeTag: 'span', baseClass: 'vr-command-menu-shortcut', description: 'Displays keyboard shortcut text.' },
    ],
    examples: [
      {
        label: 'Docs command menu',
        code: '<vr-command-menu><vr-command-menu-input aria-label="Search docs"></vr-command-menu-input><vr-command-menu-list><vr-command-menu-group heading="Components"><vr-command-menu-item value.dialog>Dialog</vr-command-menu-item><vr-command-menu-item value.dropdown>Dropdown</vr-command-menu-item></vr-command-menu-group></vr-command-menu-list></vr-command-menu>',
      },
    ],
    accessibility: [
      'Expose active descendants from the input.',
      'Skip disabled items during keyboard navigation.',
      'Keep filtering app-owned while the primitive owns keyboard and selection state.',
    ],
  }),
} as const satisfies Record<Phase16FinalPrimitive, UiComponentRegistryItem>;
```

Add these entries to `uiComponentRegistry` with the existing registry spread pattern.

- [ ] **Step 4: Add metadata primitive types, order, token groups, and asset URLs**

Modify `packages/ui/src/metadata.ts`:

```ts
import {
  phase16FinalPrimitiveOrder,
  phase16FormsDataPrimitiveOrder,
  phase16InteractionPrimitiveOrder,
  uiComponentRegistry,
  type Phase16FinalPrimitive,
  type Phase16FormsDataPrimitive,
  type Phase16InteractionPrimitive,
} from './registry/component-registry.js';
```

Add the 16G phase key:

```ts
finalOctober: '16G',
```

Extend registry-backed primitive order and type:

```ts
const registryBackedPrimitiveOrder = [
  ...phase16FormsDataPrimitiveOrder,
  ...phase16InteractionPrimitiveOrder,
  ...phase16FinalPrimitiveOrder,
] as const;

type RegistryBackedPrimitive =
  | Phase16FormsDataPrimitive
  | Phase16InteractionPrimitive
  | Phase16FinalPrimitive;
```

Add primitive type keys:

```ts
popover: 'popover',
tooltip: 'tooltip',
commandMenu: 'commandMenu',
```

Append to `uiPrimitiveOrder` after `uiPrimitiveType.toast`:

```ts
uiPrimitiveType.popover,
uiPrimitiveType.tooltip,
uiPrimitiveType.commandMenu,
```

Add primitive metadata:

```ts
popover: {
  type: uiPrimitiveType.popover,
  directory: 'src/ui/popover',
  role: 'popover',
  defaultFiles: ['ui.popover.ts', 'ui.popover.html', 'ui.popover.css'],
  selector: 'vr-popover',
  nativeTag: 'div',
  baseClass: 'vr-popover',
  introducedPhase: '16G',
  productionPhase: '16G',
  variants: [],
  docsPath: '/docs/components/popovers',
},
tooltip: {
  type: uiPrimitiveType.tooltip,
  directory: 'src/ui/tooltip',
  role: 'tooltip',
  defaultFiles: ['ui.tooltip.ts', 'ui.tooltip.html', 'ui.tooltip.css'],
  selector: 'vr-tooltip',
  nativeTag: 'span',
  baseClass: 'vr-tooltip',
  introducedPhase: '16G',
  productionPhase: '16G',
  variants: [],
  docsPath: '/docs/components/tooltips',
},
commandMenu: {
  type: uiPrimitiveType.commandMenu,
  directory: 'src/ui/command-menu',
  role: 'command-menu',
  defaultFiles: ['ui.command-menu.ts', 'ui.command-menu.html', 'ui.command-menu.css'],
  selector: 'vr-command-menu',
  nativeTag: 'div',
  baseClass: 'vr-command-menu',
  introducedPhase: '16G',
  productionPhase: '16G',
  variants: [],
  docsPath: '/docs/components/command-menu',
},
```

Add asset URLs:

```ts
popover: {
  typescript: new URL('../src/primitives/popover/ui.popover.ts', import.meta.url),
  html: new URL('../src/primitives/popover/ui.popover.html', import.meta.url),
  css: new URL('../src/primitives/popover/ui.popover.css', import.meta.url),
  test: new URL('../src/primitives/popover/ui.popover.test.ts', import.meta.url),
  homeUsage: new URL('../src/primitives/popover/usage.home.html', import.meta.url),
},
tooltip: {
  typescript: new URL('../src/primitives/tooltip/ui.tooltip.ts', import.meta.url),
  html: new URL('../src/primitives/tooltip/ui.tooltip.html', import.meta.url),
  css: new URL('../src/primitives/tooltip/ui.tooltip.css', import.meta.url),
  test: new URL('../src/primitives/tooltip/ui.tooltip.test.ts', import.meta.url),
  homeUsage: new URL('../src/primitives/tooltip/usage.home.html', import.meta.url),
},
commandMenu: {
  typescript: new URL('../src/primitives/command-menu/ui.command-menu.ts', import.meta.url),
  html: new URL('../src/primitives/command-menu/ui.command-menu.html', import.meta.url),
  css: new URL('../src/primitives/command-menu/ui.command-menu.css', import.meta.url),
  test: new URL('../src/primitives/command-menu/ui.command-menu.test.ts', import.meta.url),
  homeUsage: new URL('../src/primitives/command-menu/usage.home.html', import.meta.url),
},
```

- [ ] **Step 5: Export the 16G order**

Modify `packages/ui/src/index.ts` to export `phase16FinalPrimitiveOrder` from `./registry/component-registry.js`.

- [ ] **Step 6: Create source templates and source tests**

Create `packages/ui/src/primitives/popover/ui.popover.ts`:

```ts
import { signal } from '@vanrot/runtime';

const popoverCopy = {
  label: 'Open',
  title: 'Dimensions',
  description: 'Set the dimensions for the layer.',
} as const;

export class UiPopover {
  label = signal(popoverCopy.label);
  title = signal(popoverCopy.title);
  description = signal(popoverCopy.description);
}
```

Create `packages/ui/src/primitives/tooltip/ui.tooltip.ts`:

```ts
import { signal } from '@vanrot/runtime';

const tooltipCopy = {
  label: 'Copy',
  content: 'Copy page',
} as const;

export class UiTooltip {
  label = signal(tooltipCopy.label);
  content = signal(tooltipCopy.content);
}
```

Create `packages/ui/src/primitives/command-menu/ui.command-menu.ts`:

```ts
import { signal } from '@vanrot/runtime';

const commandMenuCopy = {
  searchLabel: 'Search docs',
  firstGroup: 'Components',
  firstItem: 'Dialog',
  secondItem: 'Dropdown',
} as const;

export class UiCommandMenu {
  searchLabel = signal(commandMenuCopy.searchLabel);
  firstGroup = signal(commandMenuCopy.firstGroup);
  firstItem = signal(commandMenuCopy.firstItem);
  secondItem = signal(commandMenuCopy.secondItem);
}
```

Create HTML source templates with the approved shapes:

```html
<vr-popover align.end side.bottom>
  <vr-popover-trigger>
    <vr-button variant.outline>{{ label() }}</vr-button>
  </vr-popover-trigger>
  <vr-popover-content>
    <vr-popover-title>{{ title() }}</vr-popover-title>
    <vr-popover-description>{{ description() }}</vr-popover-description>
  </vr-popover-content>
</vr-popover>
```

```html
<vr-tooltip side.top align.center>
  <vr-tooltip-trigger>
    <vr-button [aria-label]="label()">{{ label() }}</vr-button>
  </vr-tooltip-trigger>
  <vr-tooltip-content>{{ content() }}</vr-tooltip-content>
</vr-tooltip>
```

```html
<vr-command-menu>
  <vr-command-menu-input [aria-label]="searchLabel()" />
  <vr-command-menu-list>
    <vr-command-menu-group heading="Components">
      <vr-command-menu-item value.dialog>{{ firstItem() }}</vr-command-menu-item>
      <vr-command-menu-item value.dropdown>{{ secondItem() }}</vr-command-menu-item>
    </vr-command-menu-group>
  </vr-command-menu-list>
</vr-command-menu>
```

Create tests matching the existing primitive source-test style:

```ts
import { describe, expect, it } from 'vitest';
import { UiPopover } from './ui.popover.ts';

describe('UiPopover', () => {
  it('exposes stable demo copy', () => {
    const component = new UiPopover();

    expect(component.label()).toBe('Open');
    expect(component.title()).toBe('Dimensions');
    expect(component.description()).toBe('Set the dimensions for the layer.');
  });
});
```

Repeat the same shape for `UiTooltip` and `UiCommandMenu` using their stable copy above.

- [ ] **Step 7: Write failing asset tests**

Append to `packages/ui/tests/assets.test.ts`:

```ts
it('ships Phase 16G final primitive source assets', async () => {
  for (const primitive of ['popover', 'tooltip', 'commandMenu'] as const) {
    const asset = uiAssetUrl[primitive];

    await expect(readFile(asset.typescript, 'utf8')).resolves.toContain('signal');
    await expect(readFile(asset.html, 'utf8')).resolves.toContain(uiPrimitive[primitive].selector);
    await expect(readFile(asset.css, 'utf8')).resolves.toContain(uiPrimitive[primitive].baseClass);
    await expect(readFile(asset.test, 'utf8')).resolves.toContain('exposes stable demo copy');
    await expect(readFile(asset.homeUsage, 'utf8')).resolves.toContain(uiPrimitive[primitive].selector);
  }
});
```

- [ ] **Step 8: Add CSS classes for 16G primitives**

Append to `packages/ui/src/styles/vanrotstyles.css` and mirror the scoped primitive CSS files:

```css
.vr-popover,
.vr-tooltip,
.vr-command-menu {
  color: var(--vr-color-text);
  font-family: var(--vr-font-sans);
}

.vr-popover-content,
.vr-command-menu,
.vr-tooltip-content {
  background: var(--vr-surface-popover);
  border: 1px solid var(--vr-color-line);
  box-shadow: var(--vr-shadow-2);
}

.vr-popover-content {
  border-radius: var(--vr-radius-md);
  min-width: 18rem;
  padding: var(--vr-space-4);
  z-index: var(--vr-z-popover);
}

.vr-tooltip-content {
  border-radius: var(--vr-radius-sm);
  font: 500 var(--vr-text-xs) / 1 var(--vr-font-sans);
  padding: var(--vr-space-1) var(--vr-space-2);
  z-index: var(--vr-z-tooltip);
}

.vr-command-menu {
  border-radius: var(--vr-radius-md);
  overflow: hidden;
}

.vr-command-menu-input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--vr-color-line);
  color: var(--vr-color-text);
  min-height: 2.75rem;
  outline: none;
  padding: 0 var(--vr-space-3);
  width: 100%;
}

.vr-command-menu-list {
  display: grid;
  gap: var(--vr-space-1);
  padding: var(--vr-space-2);
}

.vr-command-menu-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--vr-radius-sm);
  color: var(--vr-color-text);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  min-height: 2rem;
  padding: 0 var(--vr-space-2);
  text-align: left;
}

.vr-command-menu-item[aria-selected='true'],
.vr-command-menu-item:hover {
  background: var(--vr-surface-muted);
}
```

- [ ] **Step 9: Run UI tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- --run tests/metadata.test.ts tests/assets.test.ts
```

Expected: PASS.

### Task 3: Compiler Lowering And Dotted Token Diagnostics

**Files:**
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/ui-token-attributes.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`
- Modify: `packages/compiler/tests/codegen/ui-token-attributes.test.ts`
- Modify: `packages/compiler/tests/integration/compiler-production.test.ts`

- [ ] **Step 1: Write failing 16G lowering test**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('lowers Phase 16G final primitives and anatomy to semantic DOM', () => {
  const templateSource = [
    '<vr-popover align.end side.bottom>',
    '  <vr-popover-trigger><vr-button>Open</vr-button></vr-popover-trigger>',
    '  <vr-popover-content>',
    '    <vr-popover-title>Dimensions</vr-popover-title>',
    '    <vr-popover-description>Set the dimensions.</vr-popover-description>',
    '  </vr-popover-content>',
    '</vr-popover>',
    '<vr-tooltip side.top align.center>',
    '  <vr-tooltip-trigger><vr-button aria-label="Copy">Copy</vr-button></vr-tooltip-trigger>',
    '  <vr-tooltip-content>Copy page</vr-tooltip-content>',
    '</vr-tooltip>',
    '<vr-command-menu density.compact>',
    '  <vr-command-menu-input aria-label="Search docs" />',
    '  <vr-command-menu-list>',
    '    <vr-command-menu-group heading="Components">',
    '      <vr-command-menu-item value.dialog>Dialog</vr-command-menu-item>',
    '    </vr-command-menu-group>',
    '  </vr-command-menu-list>',
    '</vr-command-menu>',
  ].join('');

  const result = generateComponent({
    metadata,
    nodes: parseNodes(templateSource),
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'counter.component.html',
    templateSource,
  });

  expect(result.js).toContain("createElement('div')");
  expect(result.js).toContain("setAttribute('class', 'vr-popover vr-popover-align-end vr-popover-side-bottom')");
  expect(result.js).toContain("setAttribute('class', 'vr-tooltip vr-tooltip-side-top vr-tooltip-align-center')");
  expect(result.js).toContain("setAttribute('class', 'vr-command-menu vr-command-menu-density-compact')");
  expect(result.js).toContain("setAttribute('role', 'tooltip')");
  expect(result.js).toContain("setAttribute('role', 'listbox')");
  expect(result.features).toEqual(
    expect.arrayContaining(['ui-popover', 'ui-tooltip', 'ui-command-menu']),
  );
});
```

- [ ] **Step 2: Run lowering test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/compiler test -- --run tests/codegen/generate-component.test.ts -t "Phase 16G"
```

Expected: FAIL with unsupported compile features or missing `uiPrimitiveFeature` entries.

- [ ] **Step 3: Add compile feature union entries**

Modify `packages/compiler/src/api/types.ts`:

```ts
| 'ui-popover'
| 'ui-tooltip'
| 'ui-command-menu'
```

Place the entries after `| 'ui-toast'` and before `| 'slot'`.

- [ ] **Step 4: Add compiler feature map entries**

Modify `packages/compiler/src/codegen/ui-elements.ts`:

```ts
popover: 'ui-popover',
tooltip: 'ui-tooltip',
commandMenu: 'ui-command-menu',
```

Expected type result: `uiPrimitiveFeature` still satisfies `Record<UiPrimitiveType, CompileFeature>`.

- [ ] **Step 5: Write failing dotted-token diagnostics test**

Append to `packages/compiler/tests/codegen/ui-token-attributes.test.ts`:

```ts
it('accepts Phase 16G dotted tokens and rejects duplicates', () => {
  const result = compileTemplate(`
    <vr-popover side.bottom align.end></vr-popover>
    <vr-tooltip delay.short tone.muted></vr-tooltip>
    <vr-command-menu density.compact density.comfortable></vr-command-menu>
  `);

  expect(result.diagnostics).toEqual([
    expect.objectContaining({
      code: 'VR020',
      severity: 'error',
      message:
        'Duplicate density token for <vr-command-menu>. Use only one of: density.compact, density.comfortable.',
    }),
  ]);
  expect(result.js).toContain('vr-popover-side-bottom');
  expect(result.js).toContain('vr-tooltip-delay-short');
  expect(result.js).toContain('vr-command-menu-density-compact');
});
```

- [ ] **Step 6: Run token diagnostics test and make metadata-driven code pass**

Run:

```bash
pnpm --filter @vanrot/compiler test -- --run tests/codegen/ui-token-attributes.test.ts -t "Phase 16G"
```

Expected after metadata and feature-map updates: PASS without changing the token parser unless the parser has hardcoded primitive allowlists.

- [ ] **Step 7: Add production feature reporting coverage**

Append to `packages/compiler/tests/integration/compiler-production.test.ts`:

```ts
it('reports Phase 16G UI features in production output', async () => {
  const result = compileComponent({
    componentPath: '/app/overlay-showcase.component.ts',
    componentSource: 'export class OverlayShowcaseComponent {}',
    templatePath: '/app/overlay-showcase.component.html',
    templateSource: [
      '<vr-popover><vr-popover-content>Filters</vr-popover-content></vr-popover>',
      '<vr-tooltip><vr-tooltip-content>Copy</vr-tooltip-content></vr-tooltip>',
      '<vr-command-menu><vr-command-menu-list></vr-command-menu-list></vr-command-menu>',
    ].join(''),
    stylePath: '/app/overlay-showcase.component.css',
    styleSource: '',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.metadata.features).toEqual(
    expect.arrayContaining(['ui-popover', 'ui-tooltip', 'ui-command-menu']),
  );
});
```

- [ ] **Step 8: Run compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- --run tests/codegen/generate-component.test.ts tests/codegen/ui-token-attributes.test.ts tests/integration/compiler-production.test.ts
```

Expected: PASS.

### Task 4: CLI Add And Component Help

**Files:**
- Modify: `packages/cli/src/add/add-ui.ts`
- Modify: `packages/cli/src/add/ui-assets.ts`
- Modify: `packages/cli/src/commands/ui.ts`
- Modify: `packages/cli/tests/add.test.ts`
- Modify: `packages/cli/tests/ui-command.test.ts`

- [ ] **Step 1: Write failing `vr add` tests**

Append to `packages/cli/tests/add.test.ts`:

```ts
it('adds Phase 16G final primitives from registry-backed assets', async () => {
  const expectedFiles = {
    popover: 'ui.popover.html',
    tooltip: 'ui.tooltip.html',
    commandMenu: 'ui.command-menu.html',
  } as const;

  for (const primitive of ['popover', 'tooltip', 'commandMenu'] as const) {
    const cwd = await createTempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', primitive], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(
      readFile(join(cwd, 'src', 'ui', uiPrimitive[primitive].role, expectedFiles[primitive]), 'utf8'),
    ).resolves.toContain(uiPrimitive[primitive].selector);
    expect(reporter.output()).toContain(`Added ${primitive}`);
  }
});
```

Add `uiPrimitive` to imports from `@vanrot/ui` if it is not already imported.

- [ ] **Step 2: Run `vr add` test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/cli test -- --run tests/add.test.ts -t "Phase 16G"
```

Expected: FAIL until `commandMenu` asset URLs and accepted names are wired.

- [ ] **Step 3: Ensure `add-ui` and `ui-assets` read from registry metadata**

Inspect `packages/cli/src/add/add-ui.ts` and `packages/cli/src/add/ui-assets.ts`.

If either file has a hardcoded allowlist, extend it with:

```ts
'popover',
'tooltip',
'commandMenu',
```

If the file already loops over `uiPrimitiveOrder` and `uiAssetUrl`, keep the implementation unchanged and let the metadata additions satisfy the test.

- [ ] **Step 4: Write failing component help tests**

Append to `packages/cli/tests/ui-command.test.ts`:

```ts
it('prints Phase 16G final primitive help from the rich registry', async () => {
  const reporter = createMemoryReporter();

  const result = await runCli(['ui', 'commandMenu', '--help'], { reporter });

  expect(result.exitCode).toBe(0);
  const output = reporter.output();
  expect(output).toContain('vr-command-menu');
  expect(output).toContain('Docs: /docs/components/command-menu');
  expect(output).toContain('Dotted tokens');
  expect(output).toContain('density: compact, comfortable');
  expect(output).toContain('Anatomy');
  expect(output).toContain('vr-command-menu-input: Filters or controls the command list.');
  expect(output).toContain('Events');
  expect(output).toContain('select: Emitted when an enabled command item is selected.');
  expect(output).toContain('<vr-command-menu>');
});
```

- [ ] **Step 5: Run CLI help test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/cli test -- --run tests/ui-command.test.ts -t "Phase 16G"
```

Expected: FAIL until registry data is present and command name parsing accepts `commandMenu`.

- [ ] **Step 6: Normalize CLI component name lookup**

Modify `packages/cli/src/commands/ui.ts` only if `command-menu` cannot be resolved.

Add a local resolver near existing UI component lookup:

```ts
function normalizeUiPrimitiveName(input: string): string {
  return input.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
```

Use it when resolving `ui command-menu --help` and keep `ui commandMenu --help` working.

- [ ] **Step 7: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- --run tests/add.test.ts tests/ui-command.test.ts
```

Expected: PASS.

### Task 5: Component Docs Pages For Popover, Tooltip, And Command Menu

**Files:**
- Create: `apps/vanrot-site/src/pages/components/component-popover.page.ts`
- Create: `apps/vanrot-site/src/pages/components/component-popover.page.html`
- Create: `apps/vanrot-site/src/pages/components/component-popover.page.css`
- Create: `apps/vanrot-site/src/pages/components/component-tooltip.page.ts`
- Create: `apps/vanrot-site/src/pages/components/component-tooltip.page.html`
- Create: `apps/vanrot-site/src/pages/components/component-tooltip.page.css`
- Create: `apps/vanrot-site/src/pages/components/component-command-menu.page.ts`
- Create: `apps/vanrot-site/src/pages/components/component-command-menu.page.html`
- Create: `apps/vanrot-site/src/pages/components/component-command-menu.page.css`
- Modify: `apps/vanrot-site/src/docs/component-doc-paths.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`

- [ ] **Step 1: Use the local docs-component skill instructions before editing pages**

Read:

```bash
sed -n '1,220p' /Users/user/.codex/skills/vanrot-doc-component/SKILL.md
```

Apply its approved Button docs pattern while implementing the three pages: title only at the top, no old eyebrow/lead/generic usage/top selector chip, variants overview card, dedicated variant sections, dotted preview backgrounds, shadcn-style code snippets, icon-only copy buttons, and mobile-ready CSS.

- [ ] **Step 2: Write failing route and page tests**

Append these entries to `phase16InteractionDocPages` in `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
{ routeKey: 'componentPopovers', path: '/docs/components/popovers', fileBase: 'component-popover', primitive: 'popover', title: 'Popover', tokenSnippet: 'align.end' },
{ routeKey: 'componentTooltips', path: '/docs/components/tooltips', fileBase: 'component-tooltip', primitive: 'tooltip', title: 'Tooltip', tokenSnippet: 'delay.short' },
{ routeKey: 'componentCommandMenu', path: '/docs/components/command-menu', fileBase: 'component-command-menu', primitive: 'commandMenu', title: 'Command Menu', tokenSnippet: 'density.compact' },
```

Add a page-shape test:

```ts
it('renders Phase 16G docs with shadcn-style preview and copy affordances', async () => {
  for (const page of [
    { fileBase: 'component-popover', selector: 'vr-popover', section: 'popover-default' },
    { fileBase: 'component-tooltip', selector: 'vr-tooltip', section: 'tooltip-default' },
    { fileBase: 'component-command-menu', selector: 'vr-command-menu', section: 'command-menu-default' },
  ]) {
    const html = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);

    expect(html).toContain(page.selector);
    expect(html).toContain('class="variant-doc"');
    expect(html).toContain(`id="${page.section}"`);
    expect(html).toContain('aria-label="Copy code"');
    expect(html).toContain('class="variant-preview"');
  }
});
```

- [ ] **Step 3: Run site page tests and confirm they fail**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts -t "Phase 16G"
```

Expected: FAIL with missing route keys or missing page files.

- [ ] **Step 4: Add docs path source-of-truth entries**

Modify `apps/vanrot-site/src/docs/component-doc-paths.ts`:

```ts
[uiPrimitiveType.popover]: '/docs/components/popovers',
[uiPrimitiveType.tooltip]: '/docs/components/tooltips',
[uiPrimitiveType.commandMenu]: '/docs/components/command-menu',
```

- [ ] **Step 5: Add primitive doc copy**

Append these objects to `primitiveDocs` in `apps/vanrot-site/src/docs/site-data.json`:

```json
{
  "primitive": "popover",
  "title": "Popover",
  "summary": "Displays positioned content triggered by a button without leaving the current page.",
  "usage": "<vr-popover align.end side.bottom><vr-popover-trigger><vr-button variant.outline>Open</vr-button></vr-popover-trigger><vr-popover-content><vr-popover-title>Dimensions</vr-popover-title><vr-popover-description>Set the dimensions for the layer.</vr-popover-description></vr-popover-content></vr-popover>",
  "accessibility": "Popover content closes on Escape and outside pointer interaction, restores focus to the trigger, and keeps title and description text close to the content."
}
```

```json
{
  "primitive": "tooltip",
  "title": "Tooltip",
  "summary": "Adds short hover and focus help to compact controls without changing the control name.",
  "usage": "<vr-tooltip side.top align.center><vr-tooltip-trigger><vr-button aria-label=\"Copy\">Copy</vr-button></vr-tooltip-trigger><vr-tooltip-content>Copy page</vr-tooltip-content></vr-tooltip>",
  "accessibility": "Tooltip triggers keep their own accessible name, content is descriptive only, and Escape closes the layer without moving focus."
}
```

```json
{
  "primitive": "commandMenu",
  "title": "Command Menu",
  "summary": "Provides a keyboard-first command palette surface for navigation, actions, and compact search.",
  "usage": "<vr-command-menu><vr-command-menu-input aria-label=\"Search docs\" /><vr-command-menu-list><vr-command-menu-group heading=\"Components\"><vr-command-menu-item value.dialog>Dialog</vr-command-menu-item><vr-command-menu-item value.dropdown>Dropdown</vr-command-menu-item></vr-command-menu-group></vr-command-menu-list></vr-command-menu>",
  "accessibility": "Command menu input exposes active descendant state, disabled items are skipped by keyboard navigation, and enabled commands emit selection events."
}
```

- [ ] **Step 6: Create page TypeScript files**

Create `component-popover.page.ts`, `component-tooltip.page.ts`, and `component-command-menu.page.ts` using this pattern:

```ts
import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';
import {
  setupCommandMenuPreview,
  setupOverlayPreview,
  setupTooltipPreview,
} from './component-interaction-preview.widget.ts';

export class ComponentPopoverPage {
  constructor() {
    setupOverlayPreview();
  }

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.popover);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Popover component docs.');
  }
}
```

For `ComponentTooltipPage`, call `setupTooltipPreview()` and use `uiPrimitiveType.tooltip`.

For `ComponentCommandMenuPage`, call `setupCommandMenuPreview()` and use `uiPrimitiveType.commandMenu`.

- [ ] **Step 7: Extend component interaction preview widget**

Modify `apps/vanrot-site/src/pages/components/component-interaction-preview.widget.ts` imports:

```ts
import {
  createCommandMenuController,
  createOverlayController,
  createTabsController,
  createToastController,
  createTooltipController,
  effect,
  onMount,
  positionLayer,
  type Dispose,
  type ToastMessage,
} from '@vanrot/runtime';
```

Add selectors:

```ts
tooltip: '[data-vr-tooltip-preview]',
tooltipTrigger: '[data-vr-tooltip-trigger]',
tooltipContent: '[data-vr-tooltip-content]',
commandMenu: '[data-vr-command-menu-preview]',
commandMenuInput: '[data-vr-command-menu-input]',
commandMenuList: '[data-vr-command-menu-list]',
commandMenuItem: '[data-vr-command-menu-item]',
```

Add exports:

```ts
export function setupTooltipPreview(): void {
  onMount((root) => {
    for (const preview of queryElements(root, interactionPreviewSelector.tooltip)) {
      const trigger = queryElement(preview, interactionPreviewSelector.tooltipTrigger);
      const content = queryElement(preview, interactionPreviewSelector.tooltipContent);
      const controller = createTooltipController({ delayMs: 0 });
      const disposeTrigger = controller.registerTrigger(trigger);
      const disposeContent = controller.registerContent(content);

      positionLayer(trigger, content, { side: 'top', align: 'center', offset: 8 });

      return () => {
        disposeTrigger();
        disposeContent();
        controller.dispose();
      };
    }
  });
}

export function setupCommandMenuPreview(): void {
  onMount((root) => {
    for (const preview of queryElements(root, interactionPreviewSelector.commandMenu)) {
      const input = queryElement(preview, interactionPreviewSelector.commandMenuInput) as HTMLInputElement;
      const list = queryElement(preview, interactionPreviewSelector.commandMenuList);
      const controller = createCommandMenuController();
      const disposers: Dispose[] = [controller.registerInput(input), controller.registerList(list)];

      for (const item of queryElements(preview, interactionPreviewSelector.commandMenuItem)) {
        const value = item.getAttribute('data-vr-command-menu-item');
        if (value === null) {
          continue;
        }

        disposers.push(controller.registerItem(value, item));
      }

      return () => {
        for (const dispose of disposers) {
          dispose();
        }

        controller.dispose();
      };
    }
  });
}
```

- [ ] **Step 8: Create docs HTML pages**

Each page starts with:

```html
<div class="app component-gallery-app component-popover-app">
  <main>
    <h1>{{ doc().title }}</h1>
    <section class="variants-overview">
      <article>
        <h2>Variants</h2>
        <p>{{ doc().api }}</p>
      </article>
    </section>
    <section class="variant-doc" id="popover-default">
      <div class="section-head">
        <div>
          <h2>Default</h2>
          <p>{{ doc().summary }}</p>
        </div>
        <button class="copy-button" type="button" aria-label="Copy code">Copy</button>
      </div>
      <div class="variant-example">
        <div class="variant-preview">
          <vr-popover data-vr-overlay-preview align.end side.bottom>
            <vr-popover-trigger data-vr-overlay-trigger>
              <vr-button variant.outline>Open</vr-button>
            </vr-popover-trigger>
            <vr-popover-content data-vr-overlay-content hidden>
              <vr-popover-title>Dimensions</vr-popover-title>
              <vr-popover-description>Set the dimensions for the layer.</vr-popover-description>
            </vr-popover-content>
          </vr-popover>
        </div>
        <pre><code>&lt;vr-popover align.end side.bottom&gt;...&lt;/vr-popover&gt;</code></pre>
      </div>
    </section>
  </main>
</div>
```

Use the same page shape for tooltip and command menu with their selectors, preview data attributes, and code snippets. Keep actual page copy short and practical.

- [ ] **Step 9: Create docs page CSS**

Use shared shadcn-like section styles in each page CSS or move shared rules to `component-phase16e.css` if the existing import pattern allows it:

```css
.component-popover-app,
.component-tooltip-app,
.component-command-menu-app {
  color: var(--vr-color-text);
  min-height: 100vh;
}

.variant-doc {
  border-top: 1px solid var(--vr-color-line);
  padding: 32px 0;
}

.variant-preview {
  align-items: center;
  background-image:
    radial-gradient(color-mix(in srgb, var(--vr-color-line) 80%, transparent) 1px, transparent 1px);
  background-size: 18px 18px;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-md);
  display: flex;
  justify-content: center;
  min-height: 260px;
  overflow: hidden;
  position: relative;
}

.copy-button {
  align-items: center;
  background: transparent;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-sm);
  color: var(--vr-color-muted);
  display: inline-flex;
  height: 32px;
  justify-content: center;
  min-width: 32px;
}

@media (max-width: 720px) {
  .variant-preview {
    min-height: 220px;
  }
}
```

- [ ] **Step 10: Wire routes**

Modify `apps/vanrot-site/src/routes.ts`:

```ts
import { ComponentCommandMenuPage } from './pages/components/component-command-menu.page.ts';
import { ComponentPopoverPage } from './pages/components/component-popover.page.ts';
import { ComponentTooltipPage } from './pages/components/component-tooltip.page.ts';
```

Add route path entries:

```ts
componentPopovers: componentDocPath.popover,
componentTooltips: componentDocPath.tooltip,
componentCommandMenu: componentDocPath.commandMenu,
```

Add route definitions using the existing component-page pattern:

```ts
const componentPopovers = docs.page({
  path: componentDocPath.popover.replace(`${docsBasePath}/`, ''),
  label: 'Popover',
  ...componentDocument('Popover'),
  page: ComponentPopoverPage,
  breadcrumb: routes.breadcrumb.parent(docs),
});
```

Repeat for Tooltip and Command Menu with their page classes.

- [ ] **Step 11: Run site docs tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts tests/site-data.test.ts
```

Expected: PASS.

### Task 6: Docs Shell Dogfooding

**Files:**
- Create: `apps/vanrot-site/src/layouts/docs/docs-shell-interactions.widget.ts`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.ts`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.html`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.css`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [ ] **Step 1: Write failing docs-shell dogfooding test**

Append to `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
it('dogfoods shipped interaction primitives in the docs shell', async () => {
  const html = await readSiteFile('src/layouts/docs/docs.layout.html');
  const ts = await readSiteFile('src/layouts/docs/docs.layout.ts');
  const css = await readSiteFile('src/layouts/docs/docs.layout.css');

  expect(html).toContain('vr-command-menu');
  expect(html).toContain('vr-tooltip');
  expect(html).toContain('vr-popover');
  expect(html).toContain('data-vr-docs-command-menu');
  expect(html).toContain('data-vr-docs-tooltip');
  expect(html).toContain('data-vr-docs-popover');
  expect(ts).toContain('setupDocsShellInteractions');
  expect(css).toContain('backdrop-filter: blur(16px)');
});
```

- [ ] **Step 2: Run docs-shell dogfooding test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts -t "dogfoods"
```

Expected: FAIL because shell primitives are not yet present.

- [ ] **Step 3: Create docs shell interaction widget**

Create `apps/vanrot-site/src/layouts/docs/docs-shell-interactions.widget.ts`:

```ts
import {
  createCommandMenuController,
  createOverlayController,
  createTooltipController,
  onMount,
  type Dispose,
} from '@vanrot/runtime';

const docsShellSelector = {
  commandMenu: '[data-vr-docs-command-menu]',
  commandInput: '[data-vr-docs-command-input]',
  commandList: '[data-vr-docs-command-list]',
  commandItem: '[data-vr-docs-command-item]',
  popover: '[data-vr-docs-popover]',
  popoverTrigger: '[data-vr-docs-popover-trigger]',
  popoverContent: '[data-vr-docs-popover-content]',
  tooltip: '[data-vr-docs-tooltip]',
  tooltipTrigger: '[data-vr-docs-tooltip-trigger]',
  tooltipContent: '[data-vr-docs-tooltip-content]',
} as const;

export function setupDocsShellInteractions(): void {
  onMount((root) => {
    const disposers: Dispose[] = [];

    for (const popover of root.querySelectorAll<HTMLElement>(docsShellSelector.popover)) {
      const trigger = requireElement(popover, docsShellSelector.popoverTrigger);
      const content = requireElement(popover, docsShellSelector.popoverContent);
      const controller = createOverlayController({
        onOpenChange(open) {
          content.hidden = !open;
          trigger.setAttribute('aria-expanded', String(open));
        },
      });
      disposers.push(controller.registerTrigger(trigger));
      disposers.push(controller.registerContent(content));
      disposers.push(() => controller.dispose());
    }

    for (const tooltip of root.querySelectorAll<HTMLElement>(docsShellSelector.tooltip)) {
      const trigger = requireElement(tooltip, docsShellSelector.tooltipTrigger);
      const content = requireElement(tooltip, docsShellSelector.tooltipContent);
      const controller = createTooltipController({ delayMs: 120 });
      disposers.push(controller.registerTrigger(trigger));
      disposers.push(controller.registerContent(content));
      disposers.push(() => controller.dispose());
    }

    for (const commandMenu of root.querySelectorAll<HTMLElement>(docsShellSelector.commandMenu)) {
      const input = requireElement(commandMenu, docsShellSelector.commandInput) as HTMLInputElement;
      const list = requireElement(commandMenu, docsShellSelector.commandList);
      const controller = createCommandMenuController({
        onSelect(value) {
          const target = commandMenu.querySelector<HTMLAnchorElement>(`[data-vr-docs-command-item="${value}"]`);
          target?.click();
        },
      });

      disposers.push(controller.registerInput(input));
      disposers.push(controller.registerList(list));
      for (const item of commandMenu.querySelectorAll<HTMLElement>(docsShellSelector.commandItem)) {
        const value = item.getAttribute('data-vr-docs-command-item');
        if (value === null) {
          continue;
        }

        disposers.push(controller.registerItem(value, item));
      }
      disposers.push(() => controller.dispose());
    }

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

function requireElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);

  if (element !== null) {
    return element;
  }

  throw new Error(`Missing docs shell element for ${selector}.`);
}
```

- [ ] **Step 4: Expose docs command items from the layout class**

Modify `apps/vanrot-site/src/layouts/docs/docs.layout.ts`:

```ts
import { setupDocsShellInteractions } from './docs-shell-interactions.widget.ts';
```

Add constructor and flattened command items:

```ts
export class DocsLayout {
  labels = siteNavigationSectionLabel;
  getStartedItems = siteNavigationBySection.getStarted;
  frameworkItems = siteNavigationBySection.framework;
  uiItems = siteNavigationBySection.ui;
  componentItems = siteNavigationBySection.components;
  exampleItems = siteNavigationBySection.examples;
  referenceItems = siteNavigationBySection.reference;
  commandItems = [
    ...this.getStartedItems,
    ...this.frameworkItems,
    ...this.uiItems,
    ...this.componentItems,
    ...this.exampleItems,
    ...this.referenceItems,
  ];

  constructor() {
    setupDocsShellInteractions();
  }
}
```

- [ ] **Step 5: Update shell markup to dogfood 16G primitives**

Modify `apps/vanrot-site/src/layouts/docs/docs.layout.html` near the top of `<vr-layout>`:

```html
<div class="docs-shell-bar">
  <vr-popover class="docs-command-popover" data-vr-docs-popover align.start side.bottom>
    <vr-popover-trigger data-vr-docs-popover-trigger>
      <button class="docs-command-trigger" type="button" aria-expanded="false">Search docs</button>
    </vr-popover-trigger>
    <vr-popover-content class="docs-command-panel" data-vr-docs-popover-content hidden>
      <vr-command-menu data-vr-docs-command-menu>
        <vr-command-menu-input
          data-vr-docs-command-input
          aria-label="Search docs"
        />
        <vr-command-menu-list data-vr-docs-command-list>
          <vr-command-menu-group heading="Documentation">
            @for (item of commandItems; track item.key) {
              <a
                class="docs-command-item"
                [href]="item.href"
                [attr.data-vr-docs-command-item]="item.key"
              >
                <vr-command-menu-item>{{ item.label }}</vr-command-menu-item>
              </a>
            }
          </vr-command-menu-group>
        </vr-command-menu-list>
      </vr-command-menu>
    </vr-popover-content>
  </vr-popover>

  <vr-tooltip data-vr-docs-tooltip side.bottom align.center>
    <vr-tooltip-trigger data-vr-docs-tooltip-trigger>
      <button class="docs-icon-action" type="button" aria-label="Toggle compact navigation">Nav</button>
    </vr-tooltip-trigger>
    <vr-tooltip-content data-vr-docs-tooltip-content hidden>Toggle compact navigation</vr-tooltip-content>
  </vr-tooltip>
</div>
```

Keep the existing `vr-sidebar`, `vr-nav`, and `vr-outlet` structure.

- [ ] **Step 6: Add shell polish and blur**

Modify `apps/vanrot-site/src/layouts/docs/docs.layout.css`:

```css
.docs-shell-bar {
  position: sticky;
  top: 56px;
  z-index: var(--vr-z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 10px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--vr-color-line) 60%, transparent);
  background: color-mix(in srgb, var(--vr-color-canvas) 82%, transparent);
  backdrop-filter: blur(16px);
}

.docs-command-trigger,
.docs-icon-action {
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-md);
  background: var(--vr-surface-raised);
  color: var(--vr-color-text);
  min-height: 36px;
}

.docs-command-trigger {
  min-width: min(340px, 60vw);
  padding: 0 14px;
  text-align: left;
}

.docs-command-panel {
  width: min(420px, calc(100vw - 32px));
}

.docs-command-item {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 7: Run docs shell test**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts -t "dogfoods"
```

Expected: PASS.

### Task 7: October Showcase Page With Admin, Dashboard, And Mobile Patterns

**Files:**
- Create: `apps/vanrot-site/src/pages/examples/october-showcase.page.ts`
- Create: `apps/vanrot-site/src/pages/examples/october-showcase.page.html`
- Create: `apps/vanrot-site/src/pages/examples/october-showcase.page.css`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`

- [ ] **Step 1: Write failing showcase route and section tests**

Append to `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
it('routes the October showcase and includes admin dashboard mobile sections', async () => {
  expect(route.octoberShowcase.fullPath()).toBe('/docs/examples/october-showcase');

  const html = await readSiteFile('src/pages/examples/october-showcase.page.html');
  expect(html).toContain('id="admin-pattern"');
  expect(html).toContain('id="dashboard-pattern"');
  expect(html).toContain('id="mobile-pattern"');
  expect(html).toContain('vr-command-menu');
  expect(html).toContain('vr-popover');
  expect(html).toContain('vr-tooltip');
  expect(html).toContain('vr-dialog');
  expect(html).toContain('vr-dropdown');
  expect(html).toContain('vr-table');
});
```

Append to `apps/vanrot-site/tests/site-data.test.ts`:

```ts
it('includes the October showcase article in examples navigation', () => {
  expect(siteArticleKey.octoberShowcase).toBe('octoberShowcase');
  expect(siteNavigationBySection.examples.map((item) => item.href)).toContain(
    '/docs/examples/october-showcase',
  );
});
```

- [ ] **Step 2: Run showcase tests and confirm they fail**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts tests/site-data.test.ts -t "October showcase"
```

Expected: FAIL because the route, article key, and page do not exist.

- [ ] **Step 3: Add showcase data**

Modify `apps/vanrot-site/src/docs/site-data.ts`:

```ts
octoberShowcase: 'octoberShowcase',
```

Add this article object to `apps/vanrot-site/src/docs/site-data.json` articles:

```json
{
  "key": "octoberShowcase",
  "section": "examples",
  "path": "/docs/examples/october-showcase",
  "label": "October Showcase",
  "title": "October Showcase",
  "summary": "A final Phase 16G composition page for admin, dashboard, and mobile patterns built from the shipped primitive catalog.",
  "body": "Use this page to verify practical October UI composition before Phase 17 begins."
}
```

Modify `apps/vanrot-site/src/docs/site-navigation.ts` examples group:

```ts
items: [navItem(siteArticleKey.examples), navItem(siteArticleKey.octoberShowcase)],
```

- [ ] **Step 4: Create showcase page class**

Create `apps/vanrot-site/src/pages/examples/october-showcase.page.ts`:

```ts
import { setupOverlayPreview } from '../components/component-interaction-preview.widget.ts';
import { setupDocsShellInteractions } from '../../layouts/docs/docs-shell-interactions.widget.ts';

export class OctoberShowcasePage {
  constructor() {
    setupOverlayPreview();
    setupDocsShellInteractions();
  }
}
```

- [ ] **Step 5: Create showcase HTML**

Create `apps/vanrot-site/src/pages/examples/october-showcase.page.html`:

```html
<div class="october-showcase">
  <main>
    <h1>October Showcase</h1>

    <section class="showcase-section" id="admin-pattern">
      <header>
        <h2>Admin Pattern</h2>
      </header>
      <vr-layout class="admin-shell">
        <vr-sidebar class="admin-sidebar" placement.left aria-label="Admin navigation">
          <vr-nav aria-label="Admin">
            <a href="/docs/components/dialogs">Dialog</a>
            <a href="/docs/components/dropdowns">Dropdown</a>
            <a href="/docs/components/command-menu">Command Menu</a>
          </vr-nav>
        </vr-sidebar>
        <section class="admin-main">
          <vr-breadcrumb aria-label="Breadcrumb">
            <a href="/docs">Docs</a>
            <span>Admin</span>
          </vr-breadcrumb>
          <vr-popover data-vr-overlay-preview align.end side.bottom>
            <vr-popover-trigger data-vr-overlay-trigger>
              <vr-button variant.outline>Account</vr-button>
            </vr-popover-trigger>
            <vr-popover-content data-vr-overlay-content hidden>
              <vr-dropdown>
                <vr-dropdown-item>Profile</vr-dropdown-item>
                <vr-dropdown-item>Settings</vr-dropdown-item>
              </vr-dropdown>
            </vr-popover-content>
          </vr-popover>
          <vr-command-menu>
            <vr-command-menu-input aria-label="Search admin actions" />
            <vr-command-menu-list>
              <vr-command-menu-item value.users>Invite users</vr-command-menu-item>
              <vr-command-menu-item value.audit>View audit log</vr-command-menu-item>
            </vr-command-menu-list>
          </vr-command-menu>
        </section>
      </vr-layout>
    </section>

    <section class="showcase-section" id="dashboard-pattern">
      <header>
        <h2>Dashboard Pattern</h2>
      </header>
      <vr-grid cols.3 gap.4>
        <vr-stat tone.default>Revenue</vr-stat>
        <vr-stat tone.success>Activation</vr-stat>
        <vr-stat tone.warning>Open alerts</vr-stat>
      </vr-grid>
      <vr-popover data-vr-overlay-preview align.start side.bottom>
        <vr-popover-trigger data-vr-overlay-trigger>
          <vr-button variant.outline>Filters</vr-button>
        </vr-popover-trigger>
        <vr-popover-content data-vr-overlay-content hidden>
          <vr-list>
            <vr-list-item>Status</vr-list-item>
            <vr-list-item>Owner</vr-list-item>
            <vr-list-item>Updated</vr-list-item>
          </vr-list>
        </vr-popover-content>
      </vr-popover>
      <vr-table density.compact>
        <vr-table-header>
          <vr-table-row>
            <vr-table-head>Project</vr-table-head>
            <vr-table-head>Status</vr-table-head>
            <vr-table-head>Owner</vr-table-head>
          </vr-table-row>
        </vr-table-header>
        <vr-table-body>
          <vr-table-row>
            <vr-table-cell>October UI</vr-table-cell>
            <vr-table-cell>Ready</vr-table-cell>
            <vr-table-cell>Vanrot</vr-table-cell>
          </vr-table-row>
        </vr-table-body>
      </vr-table>
    </section>

    <section class="showcase-section" id="mobile-pattern">
      <header>
        <h2>Mobile Pattern</h2>
      </header>
      <div class="mobile-frame">
        <vr-header>
          <vr-tooltip side.bottom align.center>
            <vr-tooltip-trigger>
              <vr-button aria-label="Open menu">Menu</vr-button>
            </vr-tooltip-trigger>
            <vr-tooltip-content>Open menu</vr-tooltip-content>
          </vr-tooltip>
          <vr-button variant.outline>Search</vr-button>
        </vr-header>
        <vr-drawer side.right>
          <vr-drawer-content>
            <vr-nav aria-label="Mobile">
              <a href="/docs/components/popovers">Popover</a>
              <a href="/docs/components/tooltips">Tooltip</a>
            </vr-nav>
          </vr-drawer-content>
        </vr-drawer>
        <vr-dialog size.md>
          <vr-dialog-content>
            <vr-dialog-title>Mobile Action</vr-dialog-title>
            <vr-dialog-description>Confirm the compact flow.</vr-dialog-description>
          </vr-dialog-content>
        </vr-dialog>
      </div>
    </section>
  </main>
</div>
```

- [ ] **Step 6: Create showcase CSS**

Create `apps/vanrot-site/src/pages/examples/october-showcase.page.css`:

```css
.october-showcase {
  color: var(--vr-color-text);
  padding: 40px clamp(20px, 5vw, 72px);
}

.october-showcase main {
  display: grid;
  gap: 40px;
  margin: 0 auto;
  max-width: 1180px;
}

.showcase-section {
  border-top: 1px solid var(--vr-color-line);
  display: grid;
  gap: 20px;
  padding-top: 28px;
}

.admin-shell {
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-md);
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 360px;
  overflow: hidden;
}

.admin-sidebar {
  border-right: 1px solid var(--vr-color-line);
}

.admin-main {
  display: grid;
  gap: 18px;
  padding: 20px;
}

.mobile-frame {
  border: 1px solid var(--vr-color-line);
  border-radius: 24px;
  margin: 0 auto;
  max-width: 390px;
  min-height: 620px;
  overflow: hidden;
  padding: 16px;
}

@media (max-width: 760px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--vr-color-line);
  }
}
```

- [ ] **Step 7: Wire showcase route**

Modify `apps/vanrot-site/src/routes.ts`:

```ts
import { OctoberShowcasePage } from './pages/examples/october-showcase.page.ts';
```

Add route path:

```ts
octoberShowcase: '/docs/examples/october-showcase',
```

Add route definition under docs routes:

```ts
const octoberShowcase = docs.page({
  path: 'examples/october-showcase',
  label: 'October Showcase',
  ...componentDocument('October Showcase'),
  page: OctoberShowcasePage,
  breadcrumb: routes.breadcrumb.parent(docs),
});
```

Export it through the existing route object so `route.octoberShowcase.fullPath()` works.

- [ ] **Step 8: Run showcase tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts tests/site-data.test.ts -t "October showcase"
```

Expected: PASS.

### Task 8: Phase Completion Docs, Verification, Server Restart, And Browser QA

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16G.md`

- [ ] **Step 1: Run package-focused tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- --run tests/ui/positioned-layer.test.ts tests/ui/tooltip-controller.test.ts tests/ui/command-menu-controller.test.ts tests/exports/exports.test.ts
pnpm --filter @vanrot/ui test -- --run tests/metadata.test.ts tests/assets.test.ts
pnpm --filter @vanrot/compiler test -- --run tests/codegen/generate-component.test.ts tests/codegen/ui-token-attributes.test.ts tests/integration/compiler-production.test.ts
pnpm --filter @vanrot/cli test -- --run tests/add.test.ts tests/ui-command.test.ts
pnpm --filter @vanrot/vanrot-site test -- --run tests/site-pages.test.ts tests/site-data.test.ts
```

Expected: all PASS.

- [ ] **Step 2: Run full verification before tracker completion**

Run:

```bash
pnpm verify
```

Expected: PASS, including `verify:phase-docs` and runtime size budget.

- [ ] **Step 3: Mark Phase 16G complete in tracker docs**

Modify `docs/superpowers/feature-maturity.md`:

- Update Phase 16 notes from `16A through 16F are complete; 16G owns...` to `16A through 16G are complete; Phase 17 owns...`.
- Mark the exact 16G row or Phase 16 slice entry as complete if the file has a dedicated checklist row.
- Keep unfinished Phase 17 work untouched.

Modify `docs/superpowers/final-tdd-inventory.md` with a Phase 16G section:

```md
### Phase 16G Final October Showcase

- Runtime helpers: `positionLayer`, `createTooltipController`, `createCommandMenuController`.
- UI primitives: `popover`, `tooltip`, `commandMenu` source templates, CSS, tests, registry metadata, and asset URLs.
- Compiler coverage: `ui-popover`, `ui-tooltip`, `ui-command-menu` lowering and dotted-token diagnostics.
- CLI coverage: `vr add popover`, `vr add tooltip`, `vr add commandMenu`, and `vr ui commandMenu --help`.
- Site coverage: component docs pages, docs-shell dogfooding, and `/docs/examples/october-showcase`.
- Verification evidence: package-focused tests plus `pnpm verify`.
```

Modify `docs/vanrot-presentation.html` so the roadmap shows Phase 16G done and Phase 17 active.

- [ ] **Step 4: Mark this plan's completed tasks**

After all implementation and verification pass, change each completed checkbox in `docs/superpowers/plans/Phase-16G.md` from `- [ ]` to `- [x]`.

- [ ] **Step 5: Re-run phase docs and diff hygiene**

Run:

```bash
pnpm verify:phase-docs
git diff --check
```

Expected: both commands pass.

- [ ] **Step 6: Restart the local site dev server**

Run:

```bash
pkill -f "vite/bin/vite.js.*--port 1990" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1990
```

Expected: Vite serves on `http://127.0.0.1:1990/`. Keep the server running for browser QA.

- [ ] **Step 7: Verify local routes respond**

Run in another shell:

```bash
curl -I http://127.0.0.1:1990/docs/components/popovers
curl -I http://127.0.0.1:1990/docs/components/tooltips
curl -I http://127.0.0.1:1990/docs/components/command-menu
curl -I http://127.0.0.1:1990/docs/examples/october-showcase
```

Expected: each response is `HTTP/1.1 200 OK`.

- [ ] **Step 8: Browser visual QA**

Use the Browser skill to inspect:

- `http://127.0.0.1:1990/docs/components/popovers`
- `http://127.0.0.1:1990/docs/components/tooltips`
- `http://127.0.0.1:1990/docs/components/command-menu`
- `http://127.0.0.1:1990/docs/examples/october-showcase`
- `http://127.0.0.1:1990/docs`

Desktop viewport expected:

- popover opens near the trigger, closes on Escape/outside click, and restores focus;
- tooltip opens on hover/focus and does not steal focus;
- command menu arrow keys move active item and Enter selects;
- docs shell has blur-backed sticky controls and no overlap;
- October showcase admin/dashboard/mobile sections fit without text overflow.

Mobile viewport expected:

- command menu panel fits within the viewport;
- showcase admin shell stacks cleanly;
- mobile frame does not occlude following content;
- no text overlaps buttons, cards, code panels, or overlay layers.

- [ ] **Step 9: Final git status report**

Run:

```bash
git status --short --branch
```

Expected: working tree contains only Phase 16G files and any pre-existing unrelated user changes. Do not stage or commit unless the user explicitly asks.

## Self-Review Checklist

- [ ] Spec coverage: runtime helpers, three primitives, metadata, compiler, CLI, docs pages, docs shell dogfooding, showcase patterns, tracker docs, verification, server restart, and browser QA are each mapped to a task.
- [ ] Placeholder scan: run a red-flag search for unfinished planning language in `docs/superpowers/plans/Phase-16G.md` and fix any matches.
- [ ] Type consistency: confirm `commandMenu`, `vr-command-menu`, `ui-command-menu`, `componentCommandMenu`, and `/docs/components/command-menu` are spelled consistently across tasks.
- [ ] Repo protocol: no subagents, no worktrees, no staging, no commits, and no pushes are part of execution.
- [ ] Phase protocol: do not mark 16G done until tests, `pnpm verify`, site restart, route checks, and browser QA all pass.
