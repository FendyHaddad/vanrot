import { createCommandMenuController } from '@vanrot/behavior/command-menu';
import { createOverlayController } from '@vanrot/behavior/overlay';
import { positionLayer } from '@vanrot/behavior/positioned-layer';
import { createTabsController } from '@vanrot/behavior/tabs';
import { createToastController, type ToastMessage } from '@vanrot/behavior/toast';
import { createTooltipController } from '@vanrot/behavior/tooltip';
import { effect, onMount, type Dispose } from '@vanrot/runtime';

const interactionPreviewSelector = {
  overlay: '[data-vr-overlay-preview]',
  overlayTrigger: '[data-vr-overlay-trigger]',
  overlayContent: '[data-vr-overlay-content]',
  overlayClose: '[data-vr-overlay-close]',
  tabs: '[data-vr-tabs-preview]',
  tabsTrigger: '[data-vr-tabs-trigger]',
  tabsPanel: '[data-vr-tabs-panel]',
  tooltip: '[data-vr-tooltip-preview]',
  tooltipTrigger: '[data-vr-tooltip-trigger]',
  tooltipContent: '[data-vr-tooltip-content]',
  commandMenu: '[data-vr-command-menu-preview]',
  commandMenuInput: '[data-vr-command-menu-input]',
  commandMenuItem: '[data-vr-command-menu-item]',
  toast: '[data-vr-toast-preview]',
  toastTrigger: '[data-vr-toast-trigger]',
  toastItem: '[data-vr-toast-item]',
  toastDismiss: '[data-vr-toast-dismiss]',
  toastTitle: '[data-vr-toast-title]',
  toastDescription: '[data-vr-toast-description]',
} as const;

const interactionPreviewState = {
  open: 'open',
  closed: 'closed',
} as const;

const defaultTabsValue = 'overview';
const layerOffset = 8;
const noop: Dispose = () => {};
const toastId = 'component-preview-toast';

export function setupOverlayPreview(): void {
  onMount(() => {
    const root = queryElement(document, interactionPreviewSelector.overlay);

    if (root === null) {
      return;
    }

    const trigger = queryElement(root, interactionPreviewSelector.overlayTrigger);
    const content = queryElement(root, interactionPreviewSelector.overlayContent);

    if (trigger === null || content === null) {
      return;
    }

    const controller = createOverlayController({
      onOpenChange(open) {
        syncOverlayPreview(trigger, content, open);
      },
    });
    const disposeTrigger = controller.registerTrigger(trigger);
    const disposeContent = controller.registerContent(content);
    const disposeCloseButtons = queryElements(root, interactionPreviewSelector.overlayClose).map(
      (button) => register(button, 'click', () => controller.closeOverlay()),
    );

    syncOverlayPreview(trigger, content, controller.open());

    return () => {
      disposeTrigger();
      disposeContent();

      for (const dispose of disposeCloseButtons) {
        dispose();
      }

      controller.dispose();
    };
  });
}

export function setupTabsPreview(): void {
  onMount(() => {
    const roots = queryElements(document, interactionPreviewSelector.tabs);
    const disposers = roots.map((root) => setupTabsPreviewRoot(root));

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

export function setupToastPreview(): void {
  onMount(() => {
    const root = queryElement(document, interactionPreviewSelector.toast);

    if (root === null) {
      return;
    }

    const trigger = queryElement(document, interactionPreviewSelector.toastTrigger);
    const item = queryElement(root, interactionPreviewSelector.toastItem);
    const dismiss = queryElement(root, interactionPreviewSelector.toastDismiss);
    const title = queryText(root, interactionPreviewSelector.toastTitle);
    const description = queryText(root, interactionPreviewSelector.toastDescription);

    if (trigger === null || item === null || dismiss === null || title === undefined) {
      return;
    }

    const controller = createToastController({
      createId() {
        return toastId;
      },
      defaultTimeoutMs: 0,
    });
    const disposeTrigger = register(trigger, 'click', () => {
      controller.clear();
      controller.enqueue(
        description === undefined
          ? { title, tone: 'success', timeoutMs: 0 }
          : { title, description, tone: 'success', timeoutMs: 0 },
      );
    });
    const disposeDismiss = register(dismiss, 'click', () => controller.dismiss(toastId));
    const disposeEffect = effect(() => syncToastPreview(item, controller.toasts()));

    return () => {
      disposeTrigger();
      disposeDismiss();
      disposeEffect();
      controller.clear();
    };
  });
}

export function setupTooltipPreview(): void {
  onMount(() => {
    const roots = queryElements(document, interactionPreviewSelector.tooltip);
    const disposers = roots.map((root) => setupTooltipPreviewRoot(root));

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

export function setupCommandMenuPreview(): void {
  onMount(() => {
    const roots = queryElements(document, interactionPreviewSelector.commandMenu);
    const disposers = roots.map((root) => setupCommandMenuPreviewRoot(root));

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

function setupTabsPreviewRoot(root: HTMLElement): Dispose {
  const controller = createTabsController({
    defaultValue: root.dataset.vrTabsPreview ?? defaultTabsValue,
  });

  for (const trigger of queryElements(root, interactionPreviewSelector.tabsTrigger)) {
    const value = trigger.dataset.vrTabsTrigger;

    if (value === undefined) {
      continue;
    }

    controller.registerTrigger(value, trigger);
  }

  for (const panel of queryElements(root, interactionPreviewSelector.tabsPanel)) {
    const value = panel.dataset.vrTabsPanel;

    if (value === undefined) {
      continue;
    }

    controller.registerPanel(value, panel);
  }

  return () => controller.dispose();
}

function setupTooltipPreviewRoot(root: HTMLElement): Dispose {
  const trigger = queryElement(root, interactionPreviewSelector.tooltipTrigger);
  const content = queryElement(root, interactionPreviewSelector.tooltipContent);

  if (trigger === null || content === null) {
    return noop;
  }

  const controller = createTooltipController({
    delay: 120,
    onOpenChange(open) {
      if (!open || content.hasAttribute('data-vr-tooltip-static')) {
        return;
      }

      positionLayer(trigger, content, { align: 'center', offset: layerOffset, side: 'top' });
    },
  });
  const disposers = [controller.registerTrigger(trigger), controller.registerContent(content)];

  return () => {
    for (const dispose of disposers) {
      dispose();
    }

    controller.dispose();
  };
}

function setupCommandMenuPreviewRoot(root: HTMLElement): Dispose {
  const input = queryInput(root, interactionPreviewSelector.commandMenuInput);

  if (input === null) {
    return noop;
  }

  const controller = createCommandMenuController({
    onSelect(_value, item) {
      queryAnchor(item)?.click();
    },
  });
  const disposers = [
    controller.registerInput(input),
    ...queryElements(root, interactionPreviewSelector.commandMenuItem).map((item, index) =>
      controller.registerItem(commandMenuItemValue(item, index), item),
    ),
  ];

  return () => {
    for (const dispose of disposers) {
      dispose();
    }

    controller.dispose();
  };
}

function syncOverlayPreview(trigger: HTMLElement, content: HTMLElement, open: boolean): void {
  const state = open ? interactionPreviewState.open : interactionPreviewState.closed;

  trigger.setAttribute('aria-expanded', String(open));
  trigger.dataset.state = state;
  content.hidden = !open;
  content.dataset.state = state;
}

function syncToastPreview(item: HTMLElement, toasts: readonly ToastMessage[]): void {
  const [toast] = toasts;
  const open = toast !== undefined;

  item.hidden = !open;
  item.dataset.state = open ? interactionPreviewState.open : interactionPreviewState.closed;
}

function queryElement(root: ParentNode, selector: string): HTMLElement | null {
  const element = root.querySelector(selector);

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}

function queryInput(root: ParentNode, selector: string): HTMLInputElement | null {
  const element = root.querySelector(selector);

  if (element instanceof HTMLInputElement) {
    return element;
  }

  return null;
}

function queryAnchor(root: ParentNode): HTMLAnchorElement | null {
  const element = root.querySelector('a[href]');

  if (element instanceof HTMLAnchorElement) {
    return element;
  }

  return null;
}

function queryElements(root: ParentNode, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll(selector)).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

function queryText(root: ParentNode, selector: string): string | undefined {
  return queryElement(root, selector)?.textContent?.trim();
}

function commandMenuItemValue(item: HTMLElement, index: number): string {
  return queryAnchor(item)?.href ?? `command-preview-${index}`;
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): Dispose {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
