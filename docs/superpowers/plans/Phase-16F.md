# Phase 16F October Interaction Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use subagents, parallel agents, worktrees, `git add`, `git commit`, or `git push` in this repository unless the user explicitly asks. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the October interaction foundation for `dialog`, `drawer`, `dropdown`, `tabs`, and `toast` with small runtime controllers, registry-backed source templates, compiler lowering, CLI support, example-only docs pages, and completion tracking.

**Architecture:** Extend the Phase 16E registry as the single source of truth for root primitives, child anatomy, token groups, docs paths, asset URLs, compiler metadata, and CLI help. Add three small runtime helpers in `@vanrot/runtime` instead of a UI manager: overlay, tabs, and toast. Keep docs as examples only; the Vanrot site shell must not adopt these primitives for navigation in Phase 16F.

**Tech Stack:** TypeScript, Vanrot runtime signals, DOM APIs, Vitest with jsdom where DOM behavior is tested, `@vanrot/ui` registry metadata, `@vanrot/compiler` code generation, `@vanrot/cli`, and `apps/vanrot-site`.

---

## Implementation Decisions

- Runtime helper files:
  - `packages/runtime/src/ui/overlay-controller.ts`
  - `packages/runtime/src/ui/tabs-controller.ts`
  - `packages/runtime/src/ui/toast-controller.ts`
- Root primitives only get source template directories:
  - `dialog`
  - `drawer`
  - `dropdown`
  - `tabs`
  - `toast`
- Child selectors are registry anatomy entries, not top-level UI primitives:
  - Dialog anatomy: `vr-dialog-trigger`, `vr-dialog-content`, `vr-dialog-header`, `vr-dialog-title`, `vr-dialog-description`, `vr-dialog-footer`, `vr-dialog-close`
  - Drawer anatomy: `vr-drawer-trigger`, `vr-drawer-content`, `vr-drawer-header`, `vr-drawer-title`, `vr-drawer-description`, `vr-drawer-footer`, `vr-drawer-close`
  - Dropdown anatomy: `vr-dropdown-trigger`, `vr-dropdown-content`, `vr-dropdown-item`, `vr-dropdown-label`, `vr-dropdown-separator`
  - Tabs anatomy: `vr-tabs-list`, `vr-tabs-trigger`, `vr-tabs-panel`
  - Toast anatomy: `vr-toast-viewport`, `vr-toast-item`, `vr-toast-title`, `vr-toast-description`, `vr-toast-close`
- Dotted token matrix:
  - Dialog: `size.sm`, `size.md`, `size.lg`, `motion.instant`, `motion.subtle`
  - Drawer: `side.left`, `side.right`, `side.top`, `side.bottom`, `size.sm`, `size.md`, `size.lg`
  - Dropdown: `align.start`, `align.center`, `align.end`, `side.top`, `side.bottom`, `size.sm`, `size.md`
  - Tabs: `variant.line`, `variant.pill`, `orientation.horizontal`, `orientation.vertical`
  - Toast: `tone.default`, `tone.success`, `tone.warning`, `tone.danger`, `placement.topright`, `placement.topleft`, `placement.bottomright`, `placement.bottomleft`
- Docs routes:
  - `/docs/components/dialogs`
  - `/docs/components/drawers`
  - `/docs/components/dropdowns`
  - `/docs/components/tabs`
  - `/docs/components/toasts`
- CLI help table layout for anatomy:

```text
Anatomy
  vr-dialog-trigger: Registers the element that opens the dialog.
  vr-dialog-content: Renders the accessible dialog surface.
```

## File Structure

Create:

- `packages/runtime/src/ui/overlay-controller.ts`: open state, trigger/content registration, escape close, outside click close, initial focus, focus restore.
- `packages/runtime/src/ui/tabs-controller.ts`: selected value, trigger/panel registration, click selection, arrow-key movement, selected state for ARIA wiring.
- `packages/runtime/src/ui/toast-controller.ts`: accessible toast queue, tones, manual dismiss, timeout dismiss.
- `packages/runtime/tests/ui/overlay-controller.test.ts`: DOM behavior tests for overlay focus and closing.
- `packages/runtime/tests/ui/tabs-controller.test.ts`: DOM behavior tests for tabs selection and keyboard movement.
- `packages/runtime/tests/ui/toast-controller.test.ts`: queue, dismiss, and timer tests.
- `packages/ui/src/primitives/dialog/ui.dialog.ts`
- `packages/ui/src/primitives/dialog/ui.dialog.html`
- `packages/ui/src/primitives/dialog/ui.dialog.css`
- `packages/ui/src/primitives/dialog/ui.dialog.test.ts`
- `packages/ui/src/primitives/dialog/usage.home.html`
- `packages/ui/src/primitives/drawer/ui.drawer.ts`
- `packages/ui/src/primitives/drawer/ui.drawer.html`
- `packages/ui/src/primitives/drawer/ui.drawer.css`
- `packages/ui/src/primitives/drawer/ui.drawer.test.ts`
- `packages/ui/src/primitives/drawer/usage.home.html`
- `packages/ui/src/primitives/dropdown/ui.dropdown.ts`
- `packages/ui/src/primitives/dropdown/ui.dropdown.html`
- `packages/ui/src/primitives/dropdown/ui.dropdown.css`
- `packages/ui/src/primitives/dropdown/ui.dropdown.test.ts`
- `packages/ui/src/primitives/dropdown/usage.home.html`
- `packages/ui/src/primitives/tabs/ui.tabs.ts`
- `packages/ui/src/primitives/tabs/ui.tabs.html`
- `packages/ui/src/primitives/tabs/ui.tabs.css`
- `packages/ui/src/primitives/tabs/ui.tabs.test.ts`
- `packages/ui/src/primitives/tabs/usage.home.html`
- `packages/ui/src/primitives/toast/ui.toast.ts`
- `packages/ui/src/primitives/toast/ui.toast.html`
- `packages/ui/src/primitives/toast/ui.toast.css`
- `packages/ui/src/primitives/toast/ui.toast.test.ts`
- `packages/ui/src/primitives/toast/usage.home.html`
- `apps/vanrot-site/src/pages/components/component-dialog.page.ts`
- `apps/vanrot-site/src/pages/components/component-dialog.page.html`
- `apps/vanrot-site/src/pages/components/component-dialog.page.css`
- `apps/vanrot-site/src/pages/components/component-drawer.page.ts`
- `apps/vanrot-site/src/pages/components/component-drawer.page.html`
- `apps/vanrot-site/src/pages/components/component-drawer.page.css`
- `apps/vanrot-site/src/pages/components/component-dropdown.page.ts`
- `apps/vanrot-site/src/pages/components/component-dropdown.page.html`
- `apps/vanrot-site/src/pages/components/component-dropdown.page.css`
- `apps/vanrot-site/src/pages/components/component-tabs.page.ts`
- `apps/vanrot-site/src/pages/components/component-tabs.page.html`
- `apps/vanrot-site/src/pages/components/component-tabs.page.css`
- `apps/vanrot-site/src/pages/components/component-toast.page.ts`
- `apps/vanrot-site/src/pages/components/component-toast.page.html`
- `apps/vanrot-site/src/pages/components/component-toast.page.css`

Modify:

- `packages/runtime/src/index.ts`: export public interaction controllers.
- `packages/runtime/src/internal.ts`: export compiler-facing helpers only if compiler-generated code imports them.
- `packages/runtime/package.json`: export map remains unchanged unless controller imports require a new subpath; prefer existing `.` exports.
- `packages/ui/src/registry/component-registry.ts`: add Phase 16F primitive order, anatomy field, token groups, events, examples, accessibility copy, and registry entries.
- `packages/ui/src/registry/token-scales.ts`: add shared token arrays only if a token is reused by two or more Phase 16F primitives.
- `packages/ui/src/metadata.ts`: add `uiPrimitiveType` entries, `uiPrimitiveOrder` entries, `uiPrimitive`, token groups, package inventory, and `uiAssetUrl` entries.
- `packages/ui/src/index.ts`: export Phase 16F order/type and any new token scale types.
- `packages/ui/src/styles/vanrotstyles.css`: add global October classes for the five primitives and anatomy classes.
- `packages/ui/tests/metadata.test.ts`: assert Phase 16F metadata and registry.
- `packages/ui/tests/assets.test.ts`: assert source template files and usage snippets.
- `packages/compiler/src/api/types.ts`: add `ui-dialog`, `ui-drawer`, `ui-dropdown`, `ui-tabs`, and `ui-toast` compile features.
- `packages/compiler/src/codegen/ui-elements.ts`: consume root primitive metadata and anatomy metadata.
- `packages/compiler/src/codegen/ui-token-attributes.ts`: keep strict dotted token behavior working for Phase 16F tokens.
- `packages/compiler/src/codegen/generate-component.ts`: lower root and anatomy tags, wire semantic defaults, and keep generated class order stable.
- `packages/compiler/tests/codegen/generate-component.test.ts`: add Phase 16F lowering tests.
- `packages/compiler/tests/codegen/ui-token-attributes.test.ts`: add Phase 16F token and duplicate diagnostics.
- `packages/compiler/tests/integration/compiler-production.test.ts`: include feature reporting for the five primitives.
- `packages/cli/src/add/ui-assets.ts`: let `vr add` copy the five new primitive directories through registry-backed URLs.
- `packages/cli/src/add/add-ui.ts`: accept the five new primitive names through `uiPrimitiveOrder`.
- `packages/cli/src/commands/ui.ts`: print anatomy in component help.
- `packages/cli/tests/add.test.ts`: test `vr add` for Phase 16F primitives.
- `packages/cli/tests/ui-command.test.ts`: test help output for Phase 16F anatomy, tokens, events, examples, and docs paths.
- `apps/vanrot-site/src/docs/component-doc-paths.ts`: add docs paths.
- `apps/vanrot-site/src/docs/component-docs.ts`: ensure generated docs data includes Phase 16F titles and examples.
- `apps/vanrot-site/src/docs/site-navigation.ts`: verify generated component navigation includes new pages.
- `apps/vanrot-site/src/routes.ts`: import and route the five component pages.
- `apps/vanrot-site/tests/site-pages.test.ts`: add docs route and page structure tests.
- `apps/vanrot-site/tests/site-data.test.ts`: add docs data checks for the five primitives.
- `scripts/verify-site-docs.test.mjs`: update only if route/doc drift checks require an explicit allowlist.
- `docs/superpowers/feature-maturity.md`: split the Phase 16 tracker language into 16F and 16G and mark only the 16F slice complete when implementation passes.
- `docs/superpowers/final-tdd-inventory.md`: add Phase 16F packages, helpers, primitives, docs pages, CLI commands, and verification commands.
- `docs/vanrot-presentation.html`: update the roadmap so Phase 16F is done and Phase 16G is the next active October slice.

---

### Task 1: Runtime Overlay Controller

**Files:**
- Create: `packages/runtime/src/ui/overlay-controller.ts`
- Create: `packages/runtime/tests/ui/overlay-controller.test.ts`
- Modify: `packages/runtime/src/index.ts`
- Modify: `packages/runtime/src/internal.ts`

- [x] **Step 1: Write the failing overlay controller test**

Create `packages/runtime/tests/ui/overlay-controller.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOverlayController } from '../../src/ui/overlay-controller.js';

describe('createOverlayController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens and closes with controlled state callbacks', () => {
    const onOpenChange = vi.fn();
    const controller = createOverlayController({ onOpenChange });

    controller.openOverlay();
    expect(controller.open()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    controller.closeOverlay();
    expect(controller.open()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    controller.dispose();
  });

  it('focuses content on open and restores trigger focus on close', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const input = document.createElement('input');

    content.tabIndex = -1;
    content.append(input);
    document.body.append(trigger, content);
    trigger.focus();

    const controller = createOverlayController();
    controller.registerTrigger(trigger);
    controller.registerContent(content);

    controller.openOverlay();
    expect(document.activeElement).toBe(input);

    controller.closeOverlay();
    expect(document.activeElement).toBe(trigger);

    controller.dispose();
  });

  it('closes on escape when enabled', () => {
    const controller = createOverlayController();
    controller.openOverlay();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(controller.open()).toBe(false);
    controller.dispose();
  });

  it('closes on outside pointerdown when enabled', () => {
    const content = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(content, outside);

    const controller = createOverlayController();
    controller.registerContent(content);
    controller.openOverlay();

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(controller.open()).toBe(false);
    controller.dispose();
  });

  it('keeps open when pointerdown starts inside content', () => {
    const content = document.createElement('div');
    const button = document.createElement('button');
    content.append(button);
    document.body.append(content);

    const controller = createOverlayController();
    controller.registerContent(content);
    controller.openOverlay();

    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(controller.open()).toBe(true);
    controller.dispose();
  });
});
```

- [x] **Step 2: Run overlay test to verify it fails**

Run:

```sh
pnpm --filter @vanrot/runtime test -- tests/ui/overlay-controller.test.ts
```

Expected: FAIL with a module resolution error for `../../src/ui/overlay-controller.js`.

- [x] **Step 3: Implement the overlay controller**

Create `packages/runtime/src/ui/overlay-controller.ts`:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface OverlayControllerOptions {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsidePointer?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface OverlayController {
  readonly open: WritableSignal<boolean>;
  registerTrigger(trigger: HTMLElement): () => void;
  registerContent(content: HTMLElement): () => void;
  openOverlay(): void;
  closeOverlay(): void;
  toggleOverlay(): void;
  dispose(): void;
}

export function createOverlayController(options: OverlayControllerOptions = {}): OverlayController {
  const open = signal(options.initialOpen === undefined ? false : options.initialOpen);
  const closeOnEscape = options.closeOnEscape === undefined ? true : options.closeOnEscape;
  const closeOnOutsidePointer =
    options.closeOnOutsidePointer === undefined ? true : options.closeOnOutsidePointer;
  const triggers = new Set<HTMLElement>();
  const contents = new Set<HTMLElement>();
  const disposers = new Set<() => void>();
  let restoreFocusElement: HTMLElement | null = null;

  function notify(nextOpen: boolean): void {
    open.set(nextOpen);
    options.onOpenChange?.(nextOpen);
  }

  function openOverlay(): void {
    if (open()) {
      return;
    }

    restoreFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    notify(true);
    focusFirstContentElement(contents);
  }

  function closeOverlay(): void {
    if (!open()) {
      return;
    }

    notify(false);
    restoreFocusElement?.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!closeOnEscape || event.key !== 'Escape') {
      return;
    }

    closeOverlay();
  }

  function handlePointerdown(event: PointerEvent): void {
    if (!closeOnOutsidePointer || !open()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    for (const content of contents) {
      if (content.contains(target)) {
        return;
      }
    }

    closeOverlay();
  }

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown);
  disposers.add(() => document.removeEventListener('keydown', handleKeydown));
  disposers.add(() => document.removeEventListener('pointerdown', handlePointerdown));

  return {
    open,
    registerTrigger(trigger) {
      triggers.add(trigger);
      const disposeClick = register(trigger, 'click', () => openOverlay());
      disposers.add(disposeClick);

      return () => {
        triggers.delete(trigger);
        disposers.delete(disposeClick);
        disposeClick();
      };
    },
    registerContent(content) {
      contents.add(content);

      return () => {
        contents.delete(content);
      };
    },
    openOverlay,
    closeOverlay,
    toggleOverlay() {
      if (open()) {
        closeOverlay();
        return;
      }

      openOverlay();
    },
    dispose() {
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      triggers.clear();
      contents.clear();
    },
  };
}

function focusFirstContentElement(contents: ReadonlySet<HTMLElement>): void {
  const [content] = contents;
  if (content === undefined) {
    return;
  }

  const focusable = content.querySelector<HTMLElement>(focusableSelector);
  if (focusable !== null) {
    focusable.focus();
    return;
  }

  content.focus();
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

- [x] **Step 4: Export the overlay controller**

Modify `packages/runtime/src/index.ts`:

```ts
export type { OverlayController, OverlayControllerOptions } from './ui/overlay-controller.js';
export { createOverlayController } from './ui/overlay-controller.js';
```

Modify `packages/runtime/src/internal.ts` only if compiler-generated code imports the helper directly:

```ts
export type { OverlayController, OverlayControllerOptions } from './ui/overlay-controller.js';
export { createOverlayController } from './ui/overlay-controller.js';
```

- [x] **Step 5: Run overlay test to verify it passes**

Run:

```sh
pnpm --filter @vanrot/runtime test -- tests/ui/overlay-controller.test.ts
```

Expected: PASS for all overlay controller tests.

- [x] **Step 6: Review checkpoint**

Run:

```sh
git diff -- packages/runtime/src/ui/overlay-controller.ts packages/runtime/tests/ui/overlay-controller.test.ts packages/runtime/src/index.ts packages/runtime/src/internal.ts
```

Expected: diff shows only the overlay helper, exports, and test. Do not stage or commit.

---

### Task 2: Runtime Tabs And Toast Controllers

**Files:**
- Create: `packages/runtime/src/ui/tabs-controller.ts`
- Create: `packages/runtime/src/ui/toast-controller.ts`
- Create: `packages/runtime/tests/ui/tabs-controller.test.ts`
- Create: `packages/runtime/tests/ui/toast-controller.test.ts`
- Modify: `packages/runtime/src/index.ts`
- Modify: `packages/runtime/src/internal.ts`

- [x] **Step 1: Write failing tabs controller tests**

Create `packages/runtime/tests/ui/tabs-controller.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createTabsController } from '../../src/ui/tabs-controller.js';

describe('createTabsController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('selects tabs by value and exposes selected state', () => {
    const controller = createTabsController({ defaultValue: 'overview' });

    controller.select('activity');

    expect(controller.value()).toBe('activity');
    expect(controller.isSelected('overview')).toBe(false);
    expect(controller.isSelected('activity')).toBe(true);
  });

  it('moves selection with arrow keys in registration order', () => {
    const overview = document.createElement('button');
    const activity = document.createElement('button');
    const billing = document.createElement('button');
    document.body.append(overview, activity, billing);

    const controller = createTabsController({ defaultValue: 'overview' });
    controller.registerTrigger('overview', overview);
    controller.registerTrigger('activity', activity);
    controller.registerTrigger('billing', billing);

    overview.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(controller.value()).toBe('activity');
    expect(document.activeElement).toBe(activity);

    activity.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(controller.value()).toBe('overview');
    expect(document.activeElement).toBe(overview);

    controller.dispose();
  });

  it('connects triggers and panels through selected state', () => {
    const trigger = document.createElement('button');
    const panel = document.createElement('div');

    const controller = createTabsController({ defaultValue: 'overview' });
    controller.registerTrigger('activity', trigger);
    controller.registerPanel('activity', panel);

    controller.select('activity');

    expect(trigger.getAttribute('aria-selected')).toBe('true');
    expect(panel.hidden).toBe(false);

    controller.select('other');

    expect(trigger.getAttribute('aria-selected')).toBe('false');
    expect(panel.hidden).toBe(true);

    controller.dispose();
  });
});
```

- [x] **Step 2: Write failing toast controller tests**

Create `packages/runtime/tests/ui/toast-controller.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToastController } from '../../src/ui/toast-controller.js';

describe('createToastController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enqueues accessible toast messages', () => {
    const controller = createToastController();

    const toast = controller.enqueue({
      title: 'Saved',
      description: 'Profile changes were saved.',
      tone: 'success',
    });

    expect(controller.toasts()).toEqual([
      {
        id: toast.id,
        title: 'Saved',
        description: 'Profile changes were saved.',
        tone: 'success',
      },
    ]);
  });

  it('dismisses a toast manually', () => {
    const controller = createToastController();
    const toast = controller.enqueue({ title: 'Removed', tone: 'danger' });

    controller.dismiss(toast.id);

    expect(controller.toasts()).toEqual([]);
  });

  it('dismisses a toast after its timeout', () => {
    const controller = createToastController({ defaultTimeoutMs: 5000 });

    controller.enqueue({ title: 'Queued', tone: 'default' });
    vi.advanceTimersByTime(4999);
    expect(controller.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(controller.toasts()).toHaveLength(0);
  });
});
```

- [x] **Step 3: Run controller tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/runtime test -- tests/ui/tabs-controller.test.ts tests/ui/toast-controller.test.ts
```

Expected: FAIL with module resolution errors for `tabs-controller.js` and `toast-controller.js`.

- [x] **Step 4: Implement the tabs controller**

Create `packages/runtime/src/ui/tabs-controller.ts`:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';

export interface TabsControllerOptions {
  defaultValue: string;
}

export interface TabsController {
  readonly value: WritableSignal<string>;
  registerTrigger(value: string, trigger: HTMLElement): () => void;
  registerPanel(value: string, panel: HTMLElement): () => void;
  select(value: string): void;
  isSelected(value: string): boolean;
  dispose(): void;
}

export function createTabsController(options: TabsControllerOptions): TabsController {
  const value = signal(options.defaultValue);
  const triggers = new Map<string, HTMLElement>();
  const panels = new Map<string, HTMLElement>();
  const disposers = new Set<() => void>();

  function select(nextValue: string): void {
    value.set(nextValue);
    syncElements(value(), triggers, panels);
  }

  function move(currentValue: string, direction: 1 | -1): void {
    const values = [...triggers.keys()];
    const index = values.indexOf(currentValue);
    if (index === -1 || values.length === 0) {
      return;
    }

    const nextIndex = (index + direction + values.length) % values.length;
    const nextValue = values[nextIndex];
    const nextTrigger = nextValue === undefined ? undefined : triggers.get(nextValue);
    if (nextValue === undefined || nextTrigger === undefined) {
      return;
    }

    select(nextValue);
    nextTrigger.focus();
  }

  function registerKeydown(triggerValue: string, trigger: HTMLElement): () => void {
    const listener = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        move(triggerValue, 1);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        move(triggerValue, -1);
      }
    };

    trigger.addEventListener('keydown', listener);
    return () => trigger.removeEventListener('keydown', listener);
  }

  return {
    value,
    registerTrigger(triggerValue, trigger) {
      triggers.set(triggerValue, trigger);
      trigger.setAttribute('role', 'tab');
      const disposeClick = register(trigger, 'click', () => select(triggerValue));
      const disposeKeydown = registerKeydown(triggerValue, trigger);
      disposers.add(disposeClick);
      disposers.add(disposeKeydown);
      syncElements(value(), triggers, panels);

      return () => {
        triggers.delete(triggerValue);
        disposers.delete(disposeClick);
        disposers.delete(disposeKeydown);
        disposeClick();
        disposeKeydown();
      };
    },
    registerPanel(panelValue, panel) {
      panels.set(panelValue, panel);
      panel.setAttribute('role', 'tabpanel');
      syncElements(value(), triggers, panels);

      return () => {
        panels.delete(panelValue);
      };
    },
    select,
    isSelected(candidate) {
      return value() === candidate;
    },
    dispose() {
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      triggers.clear();
      panels.clear();
    },
  };
}

function syncElements(
  selectedValue: string,
  triggers: ReadonlyMap<string, HTMLElement>,
  panels: ReadonlyMap<string, HTMLElement>,
): void {
  for (const [candidate, trigger] of triggers) {
    const selected = candidate === selectedValue;
    trigger.setAttribute('aria-selected', String(selected));
    trigger.tabIndex = selected ? 0 : -1;
  }

  for (const [candidate, panel] of panels) {
    panel.hidden = candidate !== selectedValue;
  }
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

- [x] **Step 5: Implement the toast controller**

Create `packages/runtime/src/ui/toast-controller.ts`:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger';

export interface ToastMessageInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  timeoutMs?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface ToastControllerOptions {
  defaultTimeoutMs?: number;
  createId?: () => string;
}

export interface ToastController {
  readonly toasts: WritableSignal<readonly ToastMessage[]>;
  enqueue(input: ToastMessageInput): ToastMessage;
  dismiss(id: string): void;
  clear(): void;
}

let nextToastId = 0;

export function createToastController(options: ToastControllerOptions = {}): ToastController {
  const toasts = signal<readonly ToastMessage[]>([]);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const defaultTimeoutMs = options.defaultTimeoutMs === undefined ? 4000 : options.defaultTimeoutMs;

  function createId(): string {
    if (options.createId !== undefined) {
      return options.createId();
    }

    nextToastId += 1;
    return `toast-${nextToastId}`;
  }

  function dismiss(id: string): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }

    toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  function enqueue(input: ToastMessageInput): ToastMessage {
    const toast = {
      id: createId(),
      title: input.title,
      description: input.description,
      tone: input.tone === undefined ? 'default' : input.tone,
    } satisfies ToastMessage;

    toasts.update((current) => [...current, toast]);

    const timeoutMs = input.timeoutMs === undefined ? defaultTimeoutMs : input.timeoutMs;
    if (timeoutMs > 0) {
      timers.set(toast.id, setTimeout(() => dismiss(toast.id), timeoutMs));
    }

    return toast;
  }

  return {
    toasts,
    enqueue,
    dismiss,
    clear() {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }

      timers.clear();
      toasts.set([]);
    },
  };
}
```

- [x] **Step 6: Export tabs and toast controllers**

Modify `packages/runtime/src/index.ts`:

```ts
export type { TabsController, TabsControllerOptions } from './ui/tabs-controller.js';
export { createTabsController } from './ui/tabs-controller.js';
export type {
  ToastController,
  ToastControllerOptions,
  ToastMessage,
  ToastMessageInput,
  ToastTone,
} from './ui/toast-controller.js';
export { createToastController } from './ui/toast-controller.js';
```

Modify `packages/runtime/src/internal.ts` only if compiler-generated code imports these helpers directly:

```ts
export type { TabsController, TabsControllerOptions } from './ui/tabs-controller.js';
export { createTabsController } from './ui/tabs-controller.js';
export type {
  ToastController,
  ToastControllerOptions,
  ToastMessage,
  ToastMessageInput,
  ToastTone,
} from './ui/toast-controller.js';
export { createToastController } from './ui/toast-controller.js';
```

- [x] **Step 7: Run tabs and toast tests to verify they pass**

Run:

```sh
pnpm --filter @vanrot/runtime test -- tests/ui/tabs-controller.test.ts tests/ui/toast-controller.test.ts
```

Expected: PASS for tabs and toast controller tests.

- [x] **Step 8: Run runtime verification**

Run:

```sh
pnpm --filter @vanrot/runtime typecheck
pnpm --filter @vanrot/runtime test
```

Expected: both commands pass.

---

### Task 3: UI Registry, Metadata, Assets, And Source Templates

**Files:**
- Create: all five primitive directories under `packages/ui/src/primitives/`
- Modify: `packages/ui/src/registry/component-registry.ts`
- Modify: `packages/ui/src/registry/token-scales.ts`
- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/vanrotstyles.css`
- Modify: `packages/ui/tests/metadata.test.ts`
- Modify: `packages/ui/tests/assets.test.ts`

- [x] **Step 1: Write failing metadata tests for Phase 16F**

Append to `packages/ui/tests/metadata.test.ts`:

```ts
it('exports the Phase 16F interaction primitive order', () => {
  expect(phase16InteractionPrimitiveOrder).toEqual([
    'dialog',
    'drawer',
    'dropdown',
    'tabs',
    'toast',
  ]);

  expect(uiPrimitiveOrder).toEqual(expect.arrayContaining(phase16InteractionPrimitiveOrder));
});

it('exports rich registry data for Phase 16F interaction primitives', () => {
  expect(uiComponentRegistry.dialog).toMatchObject({
    selector: 'vr-dialog',
    nativeTag: 'div',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/dialogs',
  });
  expect(uiComponentRegistry.dialog.tokens.size.tokens).toEqual(['sm', 'md', 'lg']);
  expect(uiComponentRegistry.dialog.tokens.motion.tokens).toEqual(['instant', 'subtle']);
  expect(uiComponentRegistry.dialog.anatomy.map((part) => part.selector)).toEqual([
    'vr-dialog-trigger',
    'vr-dialog-content',
    'vr-dialog-header',
    'vr-dialog-title',
    'vr-dialog-description',
    'vr-dialog-footer',
    'vr-dialog-close',
  ]);

  expect(uiComponentRegistry.drawer.tokens.side.tokens).toEqual(['left', 'right', 'top', 'bottom']);
  expect(uiComponentRegistry.dropdown.tokens.align.tokens).toEqual(['start', 'center', 'end']);
  expect(uiComponentRegistry.tabs.tokens.orientation.tokens).toEqual(['horizontal', 'vertical']);
  expect(uiComponentRegistry.toast.tokens.tone.tokens).toEqual(['default', 'success', 'warning', 'danger']);
  expect(uiComponentRegistry.toast.tokens.placement.tokens).toEqual([
    'topright',
    'topleft',
    'bottomright',
    'bottomleft',
  ]);
});
```

- [x] **Step 2: Write failing asset tests for Phase 16F templates**

Append to `packages/ui/tests/assets.test.ts`:

```ts
it('ships source templates for every Phase 16F interaction primitive', async () => {
  for (const primitive of phase16InteractionPrimitiveOrder) {
    const metadata = uiPrimitive[primitive];
    const kebabPrimitive = toKebabCase(primitive);

    await expect(readFile(fileURLToPath(uiAssetUrl[primitive].typescript), 'utf8')).resolves.toContain(
      `export class Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`,
    );
    await expect(readFile(fileURLToPath(uiAssetUrl[primitive].html), 'utf8')).resolves.toContain(
      `<${metadata.selector}`,
    );
    await expect(readFile(fileURLToPath(uiAssetUrl[primitive].css), 'utf8')).resolves.toContain(
      metadata.baseClass,
    );
    await expect(readFile(fileURLToPath(uiAssetUrl[primitive].test), 'utf8')).resolves.toContain(
      metadata.selector,
    );
    await expect(readFile(fileURLToPath(uiAssetUrl[primitive].homeUsage), 'utf8')).resolves.toContain(
      `<${metadata.selector}`,
    );
    expect(kebabPrimitive).toMatch(/^[a-z-]+$/);
  }
});
```

Update the import list in both tests so it includes:

```ts
phase16InteractionPrimitiveOrder,
```

- [x] **Step 3: Run UI tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
```

Expected: FAIL because `phase16InteractionPrimitiveOrder`, registry entries, and asset URLs do not exist yet.

- [x] **Step 4: Extend the registry interface and Phase 16F order**

Modify `packages/ui/src/registry/component-registry.ts`:

```ts
export interface UiAnatomyRegistryItem {
  selector: string;
  nativeTag: string;
  baseClass: string;
  role?: string;
  description: string;
}

export interface UiComponentRegistryItem {
  type: string;
  selector: string;
  nativeTag: string;
  baseClass: string;
  category: 'core' | 'layout' | 'forms' | 'data' | 'interaction';
  phase: '16A' | '16B' | '16C' | '16D' | '16E' | '16F';
  docsPath: string;
  tokens: Readonly<Record<string, UiTokenGroupRegistry>>;
  booleans: readonly UiAttributeRegistryItem[];
  openAttributes: readonly UiAttributeRegistryItem[];
  events: readonly UiAttributeRegistryItem[];
  slots: readonly UiAttributeRegistryItem[];
  anatomy: readonly UiAnatomyRegistryItem[];
  examples: readonly {
    label: string;
    code: string;
  }[];
  accessibility: readonly string[];
}

export const phase16InteractionPrimitiveOrder = [
  'dialog',
  'drawer',
  'dropdown',
  'tabs',
  'toast',
] as const;

export type Phase16InteractionPrimitive = (typeof phase16InteractionPrimitiveOrder)[number];
```

Update the existing `registryEntry(...)` helper so it defaults `anatomy` to an empty array:

```ts
anatomy: options.anatomy === undefined ? [] : options.anatomy,
```

- [x] **Step 5: Add exact Phase 16F registry entries**

Append these entries inside `uiComponentRegistry`:

```ts
dialog: registryEntry('dialog', {
  nativeTag: 'div',
  category: 'interaction',
  phase: '16F',
  docsPath: '/docs/components/dialogs',
  tokens: {
    size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-dialog-size-${value}`),
    motion: tokenGroup('motion', ['instant', 'subtle'], 'subtle', (value) => `vr-dialog-motion-${value}`),
  },
  openAttributes: [
    { name: 'open', description: 'Controls whether the dialog starts open.' },
    { name: 'aria-label', description: 'Accessible label when no title anatomy is present.' },
    { name: 'aria-labelledby', description: 'Id of the visible dialog title.' },
    { name: 'aria-describedby', description: 'Id of the dialog description.' },
  ],
  events: [
    { name: 'openchange', description: 'Emitted when the dialog opens or closes.' },
    { name: 'close', description: 'Emitted after the dialog closes.' },
  ],
  anatomy: [
    { selector: 'vr-dialog-trigger', nativeTag: 'span', baseClass: 'vr-dialog-trigger', description: 'Registers the element that opens the dialog.' },
    { selector: 'vr-dialog-content', nativeTag: 'div', baseClass: 'vr-dialog-content', role: 'dialog', description: 'Renders the accessible dialog surface.' },
    { selector: 'vr-dialog-header', nativeTag: 'div', baseClass: 'vr-dialog-header', description: 'Groups title and description content.' },
    { selector: 'vr-dialog-title', nativeTag: 'h2', baseClass: 'vr-dialog-title', description: 'Provides the visible dialog title.' },
    { selector: 'vr-dialog-description', nativeTag: 'p', baseClass: 'vr-dialog-description', description: 'Provides supporting dialog description text.' },
    { selector: 'vr-dialog-footer', nativeTag: 'div', baseClass: 'vr-dialog-footer', description: 'Groups secondary and primary actions.' },
    { selector: 'vr-dialog-close', nativeTag: 'button', baseClass: 'vr-dialog-close', description: 'Closes the dialog.' },
  ],
  examples: [
    {
      label: 'Edit profile dialog',
      code: '<vr-dialog size.md><vr-dialog-trigger><vr-button>Open</vr-button></vr-dialog-trigger><vr-dialog-content><vr-dialog-title>Edit profile</vr-dialog-title></vr-dialog-content></vr-dialog>',
    },
  ],
  accessibility: [
    'Focus moves into the dialog when it opens.',
    'Focus returns to the trigger when the dialog closes.',
  ],
}),
drawer: registryEntry('drawer', {
  nativeTag: 'div',
  category: 'interaction',
  phase: '16F',
  docsPath: '/docs/components/drawers',
  tokens: {
    side: tokenGroup('side', ['left', 'right', 'top', 'bottom'], 'right', (value) => `vr-drawer-side-${value}`),
    size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-drawer-size-${value}`),
  },
  openAttributes: [
    { name: 'open', description: 'Controls whether the drawer starts open.' },
    { name: 'aria-label', description: 'Accessible label when no title anatomy is present.' },
  ],
  events: [
    { name: 'openchange', description: 'Emitted when the drawer opens or closes.' },
    { name: 'close', description: 'Emitted after the drawer closes.' },
  ],
  anatomy: [
    { selector: 'vr-drawer-trigger', nativeTag: 'span', baseClass: 'vr-drawer-trigger', description: 'Registers the element that opens the drawer.' },
    { selector: 'vr-drawer-content', nativeTag: 'aside', baseClass: 'vr-drawer-content', role: 'dialog', description: 'Renders the drawer surface.' },
    { selector: 'vr-drawer-header', nativeTag: 'div', baseClass: 'vr-drawer-header', description: 'Groups drawer title and description.' },
    { selector: 'vr-drawer-title', nativeTag: 'h2', baseClass: 'vr-drawer-title', description: 'Provides the visible drawer title.' },
    { selector: 'vr-drawer-description', nativeTag: 'p', baseClass: 'vr-drawer-description', description: 'Provides supporting drawer description text.' },
    { selector: 'vr-drawer-footer', nativeTag: 'div', baseClass: 'vr-drawer-footer', description: 'Groups drawer actions.' },
    { selector: 'vr-drawer-close', nativeTag: 'button', baseClass: 'vr-drawer-close', description: 'Closes the drawer.' },
  ],
  examples: [
    {
      label: 'Filter drawer',
      code: '<vr-drawer side.right size.md><vr-drawer-trigger><vr-button variant.outline>Filters</vr-button></vr-drawer-trigger><vr-drawer-content><vr-drawer-title>Filters</vr-drawer-title></vr-drawer-content></vr-drawer>',
    },
  ],
  accessibility: [
    'Focus moves into the drawer when it opens.',
    'Escape closes the drawer.',
  ],
}),
dropdown: registryEntry('dropdown', {
  nativeTag: 'div',
  category: 'interaction',
  phase: '16F',
  docsPath: '/docs/components/dropdowns',
  tokens: {
    align: tokenGroup('align', ['start', 'center', 'end'], 'start', (value) => `vr-dropdown-align-${value}`),
    side: tokenGroup('side', ['top', 'bottom'], 'bottom', (value) => `vr-dropdown-side-${value}`),
    size: tokenGroup('size', ['sm', 'md'], 'md', (value) => `vr-dropdown-size-${value}`),
  },
  openAttributes: [
    { name: 'open', description: 'Controls whether the dropdown starts open.' },
    { name: 'aria-label', description: 'Accessible label for icon-only dropdown triggers.' },
  ],
  events: [
    { name: 'openchange', description: 'Emitted when the dropdown opens or closes.' },
    { name: 'select', description: 'Emitted when an item is selected.' },
  ],
  anatomy: [
    { selector: 'vr-dropdown-trigger', nativeTag: 'button', baseClass: 'vr-dropdown-trigger', description: 'Opens and closes the dropdown.' },
    { selector: 'vr-dropdown-content', nativeTag: 'div', baseClass: 'vr-dropdown-content', description: 'Renders dropdown options.' },
    { selector: 'vr-dropdown-item', nativeTag: 'button', baseClass: 'vr-dropdown-item', description: 'Represents a selectable dropdown item.' },
    { selector: 'vr-dropdown-label', nativeTag: 'div', baseClass: 'vr-dropdown-label', description: 'Labels a group of items.' },
    { selector: 'vr-dropdown-separator', nativeTag: 'hr', baseClass: 'vr-dropdown-separator', description: 'Separates item groups.' },
  ],
  examples: [
    {
      label: 'Account dropdown',
      code: '<vr-dropdown align.end><vr-dropdown-trigger>Open</vr-dropdown-trigger><vr-dropdown-content><vr-dropdown-item>Profile</vr-dropdown-item></vr-dropdown-content></vr-dropdown>',
    },
  ],
  accessibility: [
    'Trigger exposes aria-expanded.',
    'Escape and outside pointer input close the dropdown.',
  ],
}),
tabs: registryEntry('tabs', {
  nativeTag: 'div',
  category: 'interaction',
  phase: '16F',
  docsPath: '/docs/components/tabs',
  tokens: {
    variant: tokenGroup('variant', ['line', 'pill'], 'line', (value) => `vr-tabs-variant-${value}`),
    orientation: tokenGroup('orientation', ['horizontal', 'vertical'], 'horizontal', (value) => `vr-tabs-orientation-${value}`),
  },
  openAttributes: [
    { name: 'value', description: 'Selected tab value.' },
    { name: 'aria-label', description: 'Accessible label for the tab group.' },
  ],
  events: [
    { name: 'change', description: 'Emitted when the selected tab value changes.' },
  ],
  anatomy: [
    { selector: 'vr-tabs-list', nativeTag: 'div', baseClass: 'vr-tabs-list', role: 'tablist', description: 'Groups tab triggers.' },
    { selector: 'vr-tabs-trigger', nativeTag: 'button', baseClass: 'vr-tabs-trigger', role: 'tab', description: 'Selects a matching panel by value.' },
    { selector: 'vr-tabs-panel', nativeTag: 'div', baseClass: 'vr-tabs-panel', role: 'tabpanel', description: 'Displays content for a matching trigger value.' },
  ],
  examples: [
    {
      label: 'Overview tabs',
      code: '<vr-tabs value.overview><vr-tabs-list><vr-tabs-trigger value.overview>Overview</vr-tabs-trigger></vr-tabs-list><vr-tabs-panel value.overview>Overview content</vr-tabs-panel></vr-tabs>',
    },
  ],
  accessibility: [
    'Triggers expose selected state.',
    'Arrow keys move between registered triggers.',
  ],
}),
toast: registryEntry('toast', {
  nativeTag: 'section',
  category: 'interaction',
  phase: '16F',
  docsPath: '/docs/components/toasts',
  tokens: {
    tone: tokenGroup('tone', ['default', 'success', 'warning', 'danger'], 'default', (value) => `vr-toast-tone-${value}`),
    placement: tokenGroup('placement', ['topright', 'topleft', 'bottomright', 'bottomleft'], 'bottomright', (value) => `vr-toast-placement-${value}`),
  },
  openAttributes: [
    { name: 'aria-label', description: 'Accessible label for the toast live region.' },
  ],
  events: [
    { name: 'dismiss', description: 'Emitted when a toast is dismissed.' },
  ],
  anatomy: [
    { selector: 'vr-toast-viewport', nativeTag: 'div', baseClass: 'vr-toast-viewport', description: 'Positions queued toast items.' },
    { selector: 'vr-toast-item', nativeTag: 'div', baseClass: 'vr-toast-item', description: 'Renders one queued toast message.' },
    { selector: 'vr-toast-title', nativeTag: 'strong', baseClass: 'vr-toast-title', description: 'Displays toast title text.' },
    { selector: 'vr-toast-description', nativeTag: 'p', baseClass: 'vr-toast-description', description: 'Displays optional toast body text.' },
    { selector: 'vr-toast-close', nativeTag: 'button', baseClass: 'vr-toast-close', description: 'Dismisses one toast.' },
  ],
  examples: [
    {
      label: 'Success toast',
      code: '<vr-toast tone.success placement.bottomright><vr-toast-item><vr-toast-title>Saved</vr-toast-title></vr-toast-item></vr-toast>',
    },
  ],
  accessibility: [
    'Toast viewport uses a live region.',
    'Manual dismiss remains keyboard reachable.',
  ],
}),
```

Update the `uiComponentRegistry` type assertion:

```ts
} as const satisfies Record<
  Phase16FormsDataPrimitive | Phase16InteractionPrimitive,
  UiComponentRegistryItem
>;
```

- [x] **Step 6: Extend metadata and exports**

Modify `packages/ui/src/metadata.ts`:

```ts
import {
  phase16FormsDataPrimitiveOrder,
  phase16InteractionPrimitiveOrder,
  uiComponentRegistry,
} from './registry/component-registry.js';
```

Add to `uiPrimitiveType`:

```ts
dialog: 'dialog',
drawer: 'drawer',
dropdown: 'dropdown',
tabs: 'tabs',
toast: 'toast',
```

Add to `uiPrimitiveOrder` after the Phase 16E spread:

```ts
...phase16InteractionPrimitiveOrder.map((primitive) => uiPrimitiveType[primitive]),
```

Extend derived loops that currently use `phase16FormsDataPrimitiveOrder` so they use:

```ts
const registryBackedPrimitiveOrder = [
  ...phase16FormsDataPrimitiveOrder,
  ...phase16InteractionPrimitiveOrder,
] as const;
```

Then use `registryBackedPrimitiveOrder` for `uiPrimitive`, `uiPrimitiveTokenGroup`, `uiComponentCatalog`, `uiPackageInventory`, and `uiAssetUrl`.

Modify `packages/ui/src/index.ts`:

```ts
export type {
  Phase16FormsDataPrimitive,
  Phase16InteractionPrimitive,
  UiAnatomyRegistryItem,
  UiAttributeRegistryItem,
  UiComponentRegistryItem,
  UiTokenGroupRegistry,
} from './registry/component-registry.js';
export {
  getUiComponentRegistryItem,
  phase16FormsDataPrimitiveOrder,
  phase16InteractionPrimitiveOrder,
  uiComponentRegistry,
} from './registry/component-registry.js';
```

- [x] **Step 7: Add source templates for the five primitives**

Create the five primitive directories and files. Use this exact TypeScript shape for each primitive, with the class and copy label changed to match the primitive:

```ts
import { signal } from '@vanrot/runtime';

const dialogCopy = {
  label: 'Dialog',
} as const;

export class UiDialog {
  label = signal(dialogCopy.label);
}
```

Use these root HTML templates:

```html
<vr-dialog size.md>
  <vr-dialog-trigger>
    <vr-button type="button">Open dialog</vr-button>
  </vr-dialog-trigger>
  <vr-dialog-content>
    <vr-dialog-header>
      <vr-dialog-title>{{ label() }}</vr-dialog-title>
      <vr-dialog-description>Review account details before saving.</vr-dialog-description>
    </vr-dialog-header>
    <vr-dialog-footer>
      <vr-button variant.secondary type="button">Cancel</vr-button>
      <vr-button type="button">Save</vr-button>
    </vr-dialog-footer>
  </vr-dialog-content>
</vr-dialog>
```

```html
<vr-drawer side.right size.md>
  <vr-drawer-trigger>
    <vr-button variant.outline type="button">Open drawer</vr-button>
  </vr-drawer-trigger>
  <vr-drawer-content>
    <vr-drawer-header>
      <vr-drawer-title>{{ label() }}</vr-drawer-title>
      <vr-drawer-description>Filter the current workspace view.</vr-drawer-description>
    </vr-drawer-header>
  </vr-drawer-content>
</vr-drawer>
```

```html
<vr-dropdown align.end side.bottom>
  <vr-dropdown-trigger type="button">{{ label() }}</vr-dropdown-trigger>
  <vr-dropdown-content>
    <vr-dropdown-label>Account</vr-dropdown-label>
    <vr-dropdown-item>Profile</vr-dropdown-item>
    <vr-dropdown-item>Settings</vr-dropdown-item>
    <vr-dropdown-separator></vr-dropdown-separator>
    <vr-dropdown-item>Sign out</vr-dropdown-item>
  </vr-dropdown-content>
</vr-dropdown>
```

```html
<vr-tabs value.overview variant.line>
  <vr-tabs-list>
    <vr-tabs-trigger value.overview>Overview</vr-tabs-trigger>
    <vr-tabs-trigger value.activity>Activity</vr-tabs-trigger>
  </vr-tabs-list>
  <vr-tabs-panel value.overview>Overview content</vr-tabs-panel>
  <vr-tabs-panel value.activity>Activity content</vr-tabs-panel>
</vr-tabs>
```

```html
<vr-toast tone.success placement.bottomright aria-label="Notifications">
  <vr-toast-viewport>
    <vr-toast-item>
      <vr-toast-title>{{ label() }}</vr-toast-title>
      <vr-toast-description>Changes were saved.</vr-toast-description>
    </vr-toast-item>
  </vr-toast-viewport>
</vr-toast>
```

Each primitive test file uses this shape:

```ts
import { describe, expect, it } from 'vitest';
import { UiDialog } from './ui.dialog.js';

describe('UiDialog', () => {
  it('exposes stable demo copy', () => {
    const component = new UiDialog();

    expect(component.label()).toBe('Dialog');
  });
});
```

- [x] **Step 8: Add CSS for root and anatomy classes**

Append the Phase 16F section to `packages/ui/src/styles/vanrotstyles.css`. The section must include these selectors at minimum:

```css
.vr-dialog,
.vr-drawer,
.vr-dropdown,
.vr-tabs,
.vr-toast {
  color: var(--vr-color-text);
  font-family: var(--vr-font-sans);
}

.vr-dialog-content,
.vr-drawer-content,
.vr-dropdown-content,
.vr-toast-item {
  background: var(--vr-surface-popover);
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-lg);
  box-shadow: var(--vr-shadow-lg);
}

.vr-dialog-content,
.vr-drawer-content {
  max-width: min(32rem, calc(100vw - var(--vr-space-6)));
  padding: var(--vr-space-5);
}

.vr-tabs-list {
  align-items: center;
  display: inline-flex;
  gap: var(--vr-space-1);
}

.vr-tabs-trigger {
  border-radius: var(--vr-radius-md);
}

.vr-toast-viewport {
  display: grid;
  gap: var(--vr-space-3);
}
```

Add token classes for every dotted token in the implementation decisions section.

- [x] **Step 9: Run UI tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
pnpm --filter @vanrot/ui typecheck
```

Expected: both commands pass.

---

### Task 4: Compiler Lowering And Dotted Token Diagnostics

**Files:**
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/ui-token-attributes.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`
- Modify: `packages/compiler/tests/codegen/ui-token-attributes.test.ts`
- Modify: `packages/compiler/tests/integration/compiler-production.test.ts`

- [x] **Step 1: Write failing lowering tests**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('lowers Phase 16F interaction primitives and anatomy to semantic DOM', () => {
  const templateSource = [
    '<vr-dialog size.lg>',
    '  <vr-dialog-trigger><vr-button>Open</vr-button></vr-dialog-trigger>',
    '  <vr-dialog-content>',
    '    <vr-dialog-title>Edit profile</vr-dialog-title>',
    '    <vr-dialog-description>Update account details.</vr-dialog-description>',
    '  </vr-dialog-content>',
    '</vr-dialog>',
    '<vr-tabs value.overview>',
    '  <vr-tabs-list>',
    '    <vr-tabs-trigger value.overview>Overview</vr-tabs-trigger>',
    '  </vr-tabs-list>',
    '  <vr-tabs-panel value.overview>Overview content</vr-tabs-panel>',
    '</vr-tabs>',
  ].join('');

  const result = generateComponent({
    metadata,
    nodes: parseNodes(templateSource),
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'counter.component.html',
    templateSource,
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain("document.createElement('div')");
  expect(result.js).toContain('vr-dialog vr-dialog-size-lg vr-dialog-motion-subtle');
  expect(result.js).toContain('vr-dialog-content');
  expect(result.js).toContain("setAttribute('role', 'dialog')");
  expect(result.js).toContain('vr-tabs-trigger');
  expect(result.features).toEqual(expect.arrayContaining(['ui-dialog', 'ui-tabs']));
});
```

- [x] **Step 2: Write failing dotted token tests**

Append to `packages/compiler/tests/codegen/ui-token-attributes.test.ts`:

```ts
it('accepts Phase 16F dotted token attributes', () => {
  const result = resolveUiTokenAttributes({
    attributes: [
      { name: 'side.right', value: null, location: null },
      { name: 'size.lg', value: null, location: null },
    ],
    tagName: 'vr-drawer',
    uiElement: compilerUiElement.drawer,
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.classNames).toEqual(['vr-drawer-side-right', 'vr-drawer-size-lg']);
});

it('diagnoses duplicate Phase 16F dotted token groups', () => {
  const result = resolveUiTokenAttributes({
    attributes: [
      { name: 'placement.topright', value: null, location: null },
      { name: 'placement.bottomright', value: null, location: null },
    ],
    tagName: 'vr-toast',
    uiElement: compilerUiElement.toast,
  });

  expect(result.diagnostics).toHaveLength(1);
  expect(result.diagnostics[0]?.message).toContain('Duplicate placement token for <vr-toast>');
});
```

- [x] **Step 3: Run compiler tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts tests/codegen/ui-token-attributes.test.ts
```

Expected: FAIL because compile features and compiler UI element entries do not include Phase 16F yet.

- [x] **Step 4: Add compile features**

Modify `packages/compiler/src/api/types.ts` so `CompileFeature` includes:

```ts
| 'ui-dialog'
| 'ui-drawer'
| 'ui-dropdown'
| 'ui-tabs'
| 'ui-toast'
```

- [x] **Step 5: Extend compiler UI metadata for root and anatomy tags**

Modify `packages/compiler/src/codegen/ui-elements.ts`:

```ts
const uiPrimitiveFeature = {
  button: 'ui-button',
  card: 'ui-card',
  badge: 'ui-badge',
  avatar: 'ui-avatar',
  alert: 'ui-alert',
  loader: 'ui-loader',
  skeleton: 'ui-skeleton',
  separator: 'ui-separator',
  layout: 'ui-layout',
  container: 'ui-container',
  section: 'ui-section',
  grid: 'ui-grid',
  header: 'ui-header',
  footer: 'ui-footer',
  sidebar: 'ui-sidebar',
  nav: 'ui-nav',
  breadcrumb: 'ui-breadcrumb',
  img: 'ui-img',
  src: 'ui-src',
  form: 'ui-form',
  formField: 'ui-form-field',
  label: 'ui-label',
  input: 'ui-input',
  textarea: 'ui-textarea',
  select: 'ui-select',
  checkbox: 'ui-checkbox',
  radioGroup: 'ui-radio-group',
  radio: 'ui-radio',
  switch: 'ui-switch',
  slider: 'ui-slider',
  table: 'ui-table',
  tableHeader: 'ui-table-header',
  tableBody: 'ui-table-body',
  tableRow: 'ui-table-row',
  tableHead: 'ui-table-head',
  tableCell: 'ui-table-cell',
  tableFooter: 'ui-table-footer',
  tableCaption: 'ui-table-caption',
  pagination: 'ui-pagination',
  list: 'ui-list',
  listItem: 'ui-list-item',
  stat: 'ui-stat',
  emptyState: 'ui-empty-state',
  dialog: 'ui-dialog',
  drawer: 'ui-drawer',
  dropdown: 'ui-dropdown',
  tabs: 'ui-tabs',
  toast: 'ui-toast',
} as const satisfies Record<UiPrimitiveType, CompileFeature>;

export interface CompilerUiAnatomyElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  role?: string;
  owner: UiPrimitiveType;
  feature: CompileFeature;
}

export const compilerUiAnatomyElement = Object.fromEntries(
  Object.values(uiComponentRegistry).flatMap((component) =>
    component.anatomy.map((anatomy) => [
      anatomy.selector,
      {
        tagName: anatomy.selector,
        nativeTagName: anatomy.nativeTag,
        baseClass: anatomy.baseClass,
        role: anatomy.role,
        owner: component.type as UiPrimitiveType,
        feature: uiPrimitiveFeature[component.type as UiPrimitiveType],
      },
    ]),
  ),
) as Record<string, CompilerUiAnatomyElement>;

export function findCompilerUiAnatomyElement(tagName: string): CompilerUiAnatomyElement | null {
  return compilerUiAnatomyElement[tagName] === undefined ? null : compilerUiAnatomyElement[tagName];
}
```

- [x] **Step 6: Lower anatomy tags in generated components**

Modify `packages/compiler/src/codegen/generate-component.ts`:

```ts
const uiElement = findCompilerUiElement(node.tagName);
if (uiElement !== null) {
  generateCompilerUiElement(node, parentName, scopeAttribute, state, uiElement);
  return;
}

const anatomyElement = findCompilerUiAnatomyElement(node.tagName);
if (anatomyElement !== null) {
  generateCompilerUiAnatomyElement(node, parentName, scopeAttribute, state, anatomyElement);
  return;
}
```

Add `generateCompilerUiAnatomyElement(...)` next to `generateCompilerUiElement(...)`:

```ts
function generateCompilerUiAnatomyElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  anatomyElement: CompilerUiAnatomyElement,
): void {
  const elementName = state.ids.next(anatomyElement.nativeTagName);

  state.features.add(anatomyElement.feature);
  state.lines.push(`  const ${elementName} = document.createElement(${quoteString(anatomyElement.nativeTagName)});`);
  state.lines.push(`  ${elementName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  ${elementName}.setAttribute('class', ${quoteString(anatomyElement.baseClass)});`);

  if (anatomyElement.role !== undefined) {
    state.lines.push(`  ${elementName}.setAttribute('role', ${quoteString(anatomyElement.role)});`);
  }

  generateAttributes(node, elementName, state, { skipNames: new Set() });
  generateChildren(node.children, elementName, scopeAttribute, state);
  state.lines.push(`  ${parentName}.append(${elementName});`);
}
```

Use existing local names for `ElementNode`, `GenerateState`, `quoteString`, `generateAttributes`, and `generateChildren`.

- [x] **Step 7: Run compiler tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts tests/codegen/ui-token-attributes.test.ts
pnpm --filter @vanrot/compiler typecheck
```

Expected: both commands pass.

---

### Task 5: CLI Add And Component Help

**Files:**
- Modify: `packages/cli/src/add/ui-assets.ts`
- Modify: `packages/cli/src/add/add-ui.ts`
- Modify: `packages/cli/src/commands/ui.ts`
- Modify: `packages/cli/tests/add.test.ts`
- Modify: `packages/cli/tests/ui-command.test.ts`

- [x] **Step 1: Write failing `vr add` tests**

Append to `packages/cli/tests/add.test.ts`:

```ts
it('adds Phase 16F interaction primitives from registry-backed assets', async () => {
  for (const primitive of ['dialog', 'drawer', 'dropdown', 'tabs', 'toast'] as const) {
    const cwd = await createTempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', primitive], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src', 'ui', primitive, `ui.${primitive}.html`), 'utf8')).resolves.toContain(
      `<vr-${primitive}`,
    );
    expect(reporter.output()).toContain(`Added ${primitive}`);
  }
});
```

- [x] **Step 2: Write failing `vr ui <component> --help` tests**

Append to `packages/cli/tests/ui-command.test.ts`:

```ts
it('prints Phase 16F anatomy in component help', async () => {
  const reporter = createMemoryReporter();

  const result = await runCli(['ui', 'dialog', '--help'], { reporter });

  expect(result.exitCode).toBe(0);
  const output = reporter.output();
  expect(output).toContain('vr-dialog');
  expect(output).toContain('Docs: /docs/components/dialogs');
  expect(output).toContain('Dotted tokens');
  expect(output).toContain('size: sm, md, lg (default md)');
  expect(output).toContain('Anatomy');
  expect(output).toContain('vr-dialog-trigger: Registers the element that opens the dialog.');
  expect(output).toContain('Examples');
});
```

- [x] **Step 3: Run CLI tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/cli test -- tests/add.test.ts tests/ui-command.test.ts
```

Expected: FAIL because anatomy help is not printed and Phase 16F assets are not available.

- [x] **Step 4: Print anatomy in UI help**

Modify `packages/cli/src/commands/ui.ts`:

```ts
const anatomyLines = registryItem.anatomy.map(
  (part) => `  ${part.selector}: ${part.description}`,
);
```

Add this section after `Slots`:

```ts
section('Anatomy', anatomyLines),
```

Keep `Slots` in the output for existing entries.

- [x] **Step 5: Verify `vr add` uses registry-backed assets**

Confirm `packages/cli/src/add/ui-assets.ts` reads from `uiAssetUrl[primitive]`. If it has a local allowlist, add:

```ts
'dialog',
'drawer',
'dropdown',
'tabs',
'toast',
```

Confirm `packages/cli/src/add/add-ui.ts` accepts primitive names through `uiPrimitiveOrder`. If it has generated copy width assumptions, update the pad width so `dropdown` and existing long names render cleanly.

- [x] **Step 6: Run CLI tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/cli test -- tests/add.test.ts tests/ui-command.test.ts
pnpm --filter @vanrot/cli typecheck
```

Expected: both commands pass.

---

### Task 6: Vanrot Site Example-Only Component Docs

**Files:**
- Create: the 15 Phase 16F page files listed in File Structure
- Modify: `apps/vanrot-site/src/docs/component-doc-paths.ts`
- Modify: `apps/vanrot-site/src/docs/component-docs.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`

- [x] **Step 1: Load the docs component skill before editing docs files**

Read `/Users/user/.codex/skills/vanrot-doc-component/SKILL.md` and follow its Button page pattern for this task. The docs shell must keep its current navigation implementation and must not dogfood drawer, tabs, dropdown, or toast in Phase 16F.

- [x] **Step 2: Write failing docs route tests**

Append these cases to the component docs matrix in `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
{ routeKey: 'componentDialogs', path: '/docs/components/dialogs', fileBase: 'component-dialog', title: 'Dialog', tokenSnippet: 'size.md' },
{ routeKey: 'componentDrawers', path: '/docs/components/drawers', fileBase: 'component-drawer', title: 'Drawer', tokenSnippet: 'side.right' },
{ routeKey: 'componentDropdowns', path: '/docs/components/dropdowns', fileBase: 'component-dropdown', title: 'Dropdown', tokenSnippet: 'align.end' },
{ routeKey: 'componentTabs', path: '/docs/components/tabs', fileBase: 'component-tabs', title: 'Tabs', tokenSnippet: 'variant.line' },
{ routeKey: 'componentToasts', path: '/docs/components/toasts', fileBase: 'component-toast', title: 'Toast', tokenSnippet: 'tone.success' },
```

Add assertions to the page structure test:

```ts
expect(source).toContain('<h1>{{ doc().title }}</h1>');
expect(source).toContain('class="variant-doc"');
expect(source).toContain('class="code-snippet"');
expect(source).toContain('copy-icon-button');
```

- [x] **Step 3: Run site tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts tests/site-data.test.ts
```

Expected: FAIL because route keys and component page files do not exist.

- [x] **Step 4: Add docs paths**

Modify `apps/vanrot-site/src/docs/component-doc-paths.ts`:

```ts
[uiPrimitiveType.dialog]: '/docs/components/dialogs',
[uiPrimitiveType.drawer]: '/docs/components/drawers',
[uiPrimitiveType.dropdown]: '/docs/components/dropdowns',
[uiPrimitiveType.tabs]: '/docs/components/tabs',
[uiPrimitiveType.toast]: '/docs/components/toasts',
```

- [x] **Step 5: Add route imports and route path keys**

Modify `apps/vanrot-site/src/routes.ts` imports:

```ts
import { ComponentDialogPage } from './pages/components/component-dialog.page.ts';
import { ComponentDrawerPage } from './pages/components/component-drawer.page.ts';
import { ComponentDropdownPage } from './pages/components/component-dropdown.page.ts';
import { ComponentTabsPage } from './pages/components/component-tabs.page.ts';
import { ComponentToastPage } from './pages/components/component-toast.page.ts';
```

Add route paths:

```ts
componentDialogs: componentDocPath.dialog,
componentDrawers: componentDocPath.drawer,
componentDropdowns: componentDocPath.dropdown,
componentTabs: componentDocPath.tabs,
componentToasts: componentDocPath.toast,
```

Add route objects:

```ts
const componentDialogs = componentDocsPage(routePath.componentDialogs, 'Dialog', ComponentDialogPage);
const componentDrawers = componentDocsPage(routePath.componentDrawers, 'Drawer', ComponentDrawerPage);
const componentDropdowns = componentDocsPage(routePath.componentDropdowns, 'Dropdown', ComponentDropdownPage);
const componentTabs = componentDocsPage(routePath.componentTabs, 'Tabs', ComponentTabsPage);
const componentToasts = componentDocsPage(routePath.componentToasts, 'Toast', ComponentToastPage);
```

Include the five route objects in the exported route tree next to existing component docs routes.

- [x] **Step 6: Create docs page TypeScript files**

Use this TypeScript shape for each page, changing the primitive and error copy:

```ts
import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentDialogPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.dialog);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Dialog component docs.');
  }
}
```

- [x] **Step 7: Create docs page HTML files**

Each HTML file must keep the Button pattern and include:

```html
<div class="app component-gallery-app component-dialog-app">
  <main class="content">
    <h1>{{ doc().title }}</h1>

    <section class="preview">
      <div class="preview-head">
        <span>Examples</span>
      </div>
      <div class="preview-body variant-grid">
        <div class="variant-tile">
          <span>Default</span>
          <code>size.md</code>
        </div>
      </div>
    </section>

    <section class="variant-doc">
      <div class="variant-copy">
        <h2>Default Dialog</h2>
        <p>Focus moves into the dialog when it opens and returns to the trigger when it closes.</p>
        <code>variant="default"</code>
      </div>
      <div class="variant-preview">
        <vr-dialog size.md>
          <vr-dialog-trigger>
            <vr-button type="button">Open dialog</vr-button>
          </vr-dialog-trigger>
          <vr-dialog-content>
            <vr-dialog-title>Edit profile</vr-dialog-title>
            <vr-dialog-description>Update account details.</vr-dialog-description>
          </vr-dialog-content>
        </vr-dialog>
      </div>
      <div class="code-snippet">
        <button class="copy-icon-button" aria-label="Copy dialog example" type="button"></button>
        <pre><code>&lt;vr-dialog size.md&gt;
  &lt;vr-dialog-trigger&gt;
    &lt;vr-button type="button"&gt;Open dialog&lt;/vr-button&gt;
  &lt;/vr-dialog-trigger&gt;
  &lt;vr-dialog-content&gt;
    &lt;vr-dialog-title&gt;Edit profile&lt;/vr-dialog-title&gt;
  &lt;/vr-dialog-content&gt;
&lt;/vr-dialog&gt;</code></pre>
      </div>
    </section>
  </main>
</div>
```

Use the same selector pattern for the other pages with these required snippets:

```html
<vr-drawer side.right size.md>
```

```html
<vr-dropdown align.end side.bottom>
```

```html
<vr-tabs value.overview variant.line>
```

```html
<vr-toast tone.success placement.bottomright aria-label="Notifications">
```

- [x] **Step 8: Create docs page CSS files**

Each CSS file may import the shared Phase 16E docs CSS and add a page class:

```css
@import './component-phase16e.css';

.component-dialog-app .variant-preview {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

Use the matching app class for drawer, dropdown, tabs, and toast.

- [x] **Step 9: Run site tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts tests/site-data.test.ts
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: both commands pass.

---

### Task 7: Phase Tracking, Inventory, And Final Verification

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16F.md`
- Modify: `docs/superpowers/specs/Phase-16F.md` only when implementation changes requirements.

- [x] **Step 1: Update final TDD inventory**

Add a Phase 16F entry to `docs/superpowers/final-tdd-inventory.md` with these bullets:

```md
### Phase 16F October Interaction Foundation

- Packages: `@vanrot/runtime`, `@vanrot/ui`, `@vanrot/compiler`, `@vanrot/cli`, `@vanrot/vanrot-site`.
- Runtime helpers: `createOverlayController`, `createTabsController`, `createToastController`.
- UI primitives: `dialog`, `drawer`, `dropdown`, `tabs`, `toast`.
- CLI coverage: `vr add dialog`, `vr add drawer`, `vr add dropdown`, `vr add tabs`, `vr add toast`, and `vr ui <component> --help` for the same five primitives.
- Docs routes: `/docs/components/dialogs`, `/docs/components/drawers`, `/docs/components/dropdowns`, `/docs/components/tabs`, `/docs/components/toasts`.
- Verification: package tests for runtime, UI, compiler, CLI, site docs; `pnpm verify`; `git diff --check`.
```

- [x] **Step 2: Update feature maturity without closing top-level Phase 16**

Modify `docs/superpowers/feature-maturity.md`:

```md
| [ ]  | Phase 16 | UI October production | 16A foundation, 16B core primitives, 16C Vanrot learning site base, 16D layout/navigation/media, 16E forms/data, 16F interaction foundation, 16G final October polish | `@vanrot/ui` is progressing through October production slices; Phase 16 remains open until 16G completes popover, tooltip, command menu, richer keyboard behavior, admin/dashboard/mobile patterns, docs-shell dogfooding decision, full visual QA, and final completion. |
```

Add or update a detailed feature row that states Phase 16F is production-ready once verification passes:

```md
| October interaction foundation | ui, runtime, compiler, cli, docs | Phase 16F | Dialog, drawer, dropdown, tabs, and toast ship with registry metadata, source templates, compiler lowering, CLI add/help support, runtime controllers, example-only docs, and tests | Blocking focus behavior, basic keyboard behavior, accessible toast queue, docs routes, and package verification pass | Production-Ready through Phase 16F | Phase 16G owns popover, tooltip, command menu, richer keyboard behavior, admin/dashboard/mobile patterns, docs-shell dogfooding decision, and final visual QA. |
```

- [x] **Step 3: Update presentation roadmap**

Modify `docs/vanrot-presentation.html` so the roadmap marks Phase 16F complete and Phase 16G active. The visible roadmap copy must state:

```text
Phase 16F: October interaction foundation complete
Phase 16G: Final October polish active
```

- [x] **Step 4: Mark plan checkboxes during execution**

As each task passes, update this file by changing completed checklist items from:

```md
- [x] **Step N: Step title**
```

to:

```md
- [x] **Step N: Step title**
```

Do not mark unchecked work complete before its verification command passes.

- [x] **Step 5: Run focused package verification**

Run:

```sh
pnpm --filter @vanrot/runtime test
pnpm --filter @vanrot/ui test
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/cli test
pnpm --filter @vanrot/vanrot-site test
```

Expected: all commands pass.

- [x] **Step 6: Run repository verification**

Run:

```sh
pnpm verify
git diff --check
```

Expected: both commands pass.

- [x] **Step 7: Restart and verify the Vanrot site**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 3000" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 3000
```

In a second terminal, run:

```sh
curl -I http://localhost:3000/docs/components/dialogs
curl -I http://localhost:3000/docs/components/drawers
curl -I http://localhost:3000/docs/components/dropdowns
curl -I http://localhost:3000/docs/components/tabs
curl -I http://localhost:3000/docs/components/toasts
```

Expected: each route returns `HTTP/1.1 200 OK` or `HTTP/1.1 304 Not Modified`.

- [x] **Step 8: Final status report**

Run:

```sh
git status --short --branch
```

Expected: changed files are limited to the Phase 16F implementation, docs, tests, and trackers. Report unrelated local changes separately and leave them untouched.
