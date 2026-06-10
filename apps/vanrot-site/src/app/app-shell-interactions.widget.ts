import { createOverlayController } from '@vanrot/behavior/overlay';
import { onMount, type Dispose } from '@vanrot/runtime';

const appShellSelector = {
  menuTrigger: '[data-vr-site-menu-trigger]',
  menu: '[data-vr-site-menu]',
} as const;

const noop: Dispose = () => {};
const menuOpenBodyClass = 'site-menu-open';

export function setupAppShellInteractions(): void {
  onMount(() => setupSiteMenu());
}

function setupSiteMenu(): Dispose {
  const trigger = queryElement(document, appShellSelector.menuTrigger);
  const menu = queryElement(document, appShellSelector.menu);

  if (trigger === null || menu === null) {
    return noop;
  }

  const controller = createOverlayController({
    closeOnOutsidePointer: false,
    onOpenChange(open) {
      syncSiteMenu(trigger, menu, open);
    },
  });

  const toggleMenu = () => {
    controller.toggleOverlay();
  };
  const closeOnLinkClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a[href]') !== null) {
      controller.closeOverlay();
    }
  };

  trigger.addEventListener('click', toggleMenu);
  menu.addEventListener('click', closeOnLinkClick);
  const disposeContent = controller.registerContent(menu);

  syncSiteMenu(trigger, menu, controller.open());

  return () => {
    trigger.removeEventListener('click', toggleMenu);
    menu.removeEventListener('click', closeOnLinkClick);
    disposeContent();
    controller.dispose();
    document.body.classList.remove(menuOpenBodyClass);
  };
}

function syncSiteMenu(trigger: HTMLElement, menu: HTMLElement, open: boolean): void {
  trigger.setAttribute('aria-expanded', String(open));
  trigger.dataset.state = open ? 'open' : 'closed';
  menu.hidden = !open;
  menu.dataset.state = open ? 'open' : 'closed';
  document.body.classList.toggle(menuOpenBodyClass, open);
}

function queryElement(root: ParentNode, selector: string): HTMLElement | null {
  const element = root.querySelector(selector);

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}
