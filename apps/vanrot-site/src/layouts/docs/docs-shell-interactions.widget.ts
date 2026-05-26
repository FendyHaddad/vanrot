import {
  createCommandMenuController,
  createOverlayController,
  onMount,
  type Dispose,
} from '@vanrot/runtime';

const docsShellSelector = {
  commandMenu: '[data-vr-docs-command-menu]',
  commandInput: '[data-vr-docs-command-input]',
  commandItem: '[data-vr-docs-command-item]',
  nestedOverlay: '[data-vr-overlay-preview]',
  nestedOverlayTrigger: '[data-vr-overlay-trigger]',
  nestedOverlayContent: '[data-vr-overlay-content]',
  nestedCommandMenu: '[data-vr-command-menu-preview]',
  nestedCommandInput: '[data-vr-command-menu-input]',
  nestedCommandItem: '[data-vr-command-menu-item]',
} as const;

const noop: Dispose = () => {};

export function setupDocsShellInteractions(): void {
  onMount(() => {
    const disposers = [
      setupCommandMenu(),
      ...setupNestedOverlayPreviews(),
      ...setupNestedCommandMenuPreviews(),
    ];

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

function setupNestedOverlayPreviews(): Dispose[] {
  return queryElements(document, docsShellSelector.nestedOverlay).map((root) =>
    setupNestedOverlayPreview(root),
  );
}

function setupNestedCommandMenuPreviews(): Dispose[] {
  return queryElements(document, docsShellSelector.nestedCommandMenu).map((root) =>
    setupNestedCommandMenuPreview(root),
  );
}

function setupCommandMenu(): Dispose {
  const menu = queryElement(document, docsShellSelector.commandMenu);

  if (menu === null) {
    return noop;
  }

  const input = queryInput(menu, docsShellSelector.commandInput);

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
    ...queryElements(menu, docsShellSelector.commandItem).map((item, index) =>
      controller.registerItem(commandItemValue(item, index), item),
    ),
  ];

  return () => {
    for (const dispose of disposers) {
      dispose();
    }

    controller.dispose();
  };
}

function setupNestedOverlayPreview(root: HTMLElement): Dispose {
  const trigger = queryElement(root, docsShellSelector.nestedOverlayTrigger);
  const content = queryElement(root, docsShellSelector.nestedOverlayContent);

  if (trigger === null || content === null) {
    return noop;
  }

  const controller = createOverlayController({
    onOpenChange(open) {
      syncNestedOverlayPreview(trigger, content, open);
    },
  });
  const disposers = [controller.registerTrigger(trigger), controller.registerContent(content)];

  syncNestedOverlayPreview(trigger, content, controller.open());

  return () => {
    for (const dispose of disposers) {
      dispose();
    }

    controller.dispose();
  };
}

function setupNestedCommandMenuPreview(root: HTMLElement): Dispose {
  const input = queryInput(root, docsShellSelector.nestedCommandInput);

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
    ...queryElements(root, docsShellSelector.nestedCommandItem).map((item, index) =>
      controller.registerItem(commandItemValue(item, index), item),
    ),
  ];

  return () => {
    for (const dispose of disposers) {
      dispose();
    }

    controller.dispose();
  };
}

function syncNestedOverlayPreview(trigger: HTMLElement, content: HTMLElement, open: boolean): void {
  trigger.setAttribute('aria-expanded', String(open));
  trigger.dataset.state = open ? 'open' : 'closed';
  content.hidden = !open;
  content.dataset.state = open ? 'open' : 'closed';
}

function commandItemValue(item: HTMLElement, index: number): string {
  return queryAnchor(item)?.href ?? `docs-command-${index}`;
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
