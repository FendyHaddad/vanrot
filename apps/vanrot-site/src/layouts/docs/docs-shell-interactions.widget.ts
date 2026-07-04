import { createCommandMenuController } from '@vanrot/behavior/command-menu';
import { createOverlayController } from '@vanrot/behavior/overlay';
import { onMount, type Dispose } from '@vanrot/runtime';

const docsShellSelector = {
  layout: '.docs-layout',
  sidebar: '.docs-sidebar',
  menuToggle: '[data-vr-docs-menu-toggle]',
  menuBackdrop: '[data-vr-docs-menu-backdrop]',
  commandMenu: '[data-vr-docs-command-menu]',
  commandInput: '[data-vr-docs-command-input]',
  commandItem: '[data-vr-docs-command-item]',
  nestedOverlay: '[data-vr-overlay-preview]',
  nestedOverlayTrigger: '[data-vr-overlay-trigger]',
  nestedOverlayContent: '[data-vr-overlay-content]',
  nestedCommandMenu: '[data-vr-command-menu-preview]',
  nestedCommandInput: '[data-vr-command-menu-input]',
  nestedCommandItem: '[data-vr-command-menu-item]',
  articleBookmark: '[data-vr-docs-article-bookmark]',
  docsContent: '.docs-content',
} as const;

const noop: Dispose = () => {};
const sidebarOpenClass = 'docs-sidebar-open';
const activeArticleBookmarkClass = 'docs-article-bookmark-active';
const activeArticleSectionOffset = 156;
const pageBottomThreshold = 4;

export function setupDocsShellInteractions(): void {
  onMount(() => {
    const disposers = [
      setupMobileSidebar(),
      setupCommandMenu(),
      setupArticleBookmarks(),
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

function setupMobileSidebar(): Dispose {
  const layout = queryElement(document, docsShellSelector.layout);
  const sidebar = queryElement(document, docsShellSelector.sidebar);
  const toggle = queryElement(document, docsShellSelector.menuToggle);
  const backdrop = queryElement(document, docsShellSelector.menuBackdrop);

  if (layout === null || sidebar === null || toggle === null || backdrop === null) {
    return noop;
  }

  const syncOpen = (open: boolean) => {
    layout.classList.toggle(sidebarOpenClass, open);
    toggle.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
  };

  const close = () => syncOpen(false);
  const onToggleClick = () => syncOpen(!layout.classList.contains(sidebarOpenClass));

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    close();
  };

  const onSidebarClick = (event: Event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest('a[href]') === null) {
      return;
    }

    close();
  };

  toggle.addEventListener('click', onToggleClick);
  backdrop.addEventListener('click', close);
  sidebar.addEventListener('click', onSidebarClick);
  document.addEventListener('keydown', onKeydown);

  return () => {
    toggle.removeEventListener('click', onToggleClick);
    backdrop.removeEventListener('click', close);
    sidebar.removeEventListener('click', onSidebarClick);
    document.removeEventListener('keydown', onKeydown);
  };
}

function setupArticleBookmarks(): Dispose {
  let disposeCurrentBookmarks: Dispose = noop;
  let frame = 0;
  const content = queryElement(document, docsShellSelector.docsContent) ?? document.body;

  const remountBookmarks = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      disposeCurrentBookmarks();
      disposeCurrentBookmarks = setupCurrentArticleBookmarks();
    });
  };

  const observer = new MutationObserver(remountBookmarks);
  observer.observe(content, { childList: true, subtree: true });
  remountBookmarks();

  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    disposeCurrentBookmarks();
  };
}

function setupCurrentArticleBookmarks(): Dispose {
  const bookmarks = queryElements(document, docsShellSelector.articleBookmark) as HTMLAnchorElement[];

  if (bookmarks.length === 0) {
    return noop;
  }

  const sections = bookmarks
    .map((bookmark) => articleSectionForBookmark(bookmark))
    .filter((entry): entry is ArticleBookmarkSection => entry !== null);

  if (sections.length === 0) {
    return noop;
  }

  let scheduled = false;

  const syncActiveBookmark = () => {
    scheduled = false;
    const activeEntry = activeArticleBookmarkSection(sections);

    for (const entry of sections) {
      const active = entry === activeEntry;
      entry.bookmark.classList.toggle(activeArticleBookmarkClass, active);

      if (active) {
        entry.bookmark.setAttribute('aria-current', 'true');
        continue;
      }

      entry.bookmark.removeAttribute('aria-current');
    }
  };

  const scheduleSync = () => {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(syncActiveBookmark);
  };

  syncActiveBookmark();
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync);

  return () => {
    window.removeEventListener('scroll', scheduleSync);
    window.removeEventListener('resize', scheduleSync);
  };
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

interface ArticleBookmarkSection {
  bookmark: HTMLAnchorElement;
  section: HTMLElement;
}

function articleSectionForBookmark(bookmark: HTMLAnchorElement): ArticleBookmarkSection | null {
  const href = bookmark.getAttribute('href');

  if (href === null || !href.startsWith('#')) {
    return null;
  }

  const section = document.getElementById(href.slice(1));

  if (section === null) {
    return null;
  }

  return {
    bookmark,
    section,
  };
}

function activeArticleBookmarkSection(
  sections: readonly ArticleBookmarkSection[],
): ArticleBookmarkSection {
  if (isAtPageBottom()) {
    return lastArticleBookmarkSection(sections);
  }

  let activeEntry = firstArticleBookmarkSection(sections);

  for (const entry of sections) {
    if (entry.section.getBoundingClientRect().top > activeArticleSectionOffset) {
      break;
    }

    activeEntry = entry;
  }

  return activeEntry;
}

function isAtPageBottom(): boolean {
  const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const viewportBottom = window.scrollY + window.innerHeight;

  return pageHeight - viewportBottom <= pageBottomThreshold;
}

function firstArticleBookmarkSection(
  sections: readonly ArticleBookmarkSection[],
): ArticleBookmarkSection {
  const [first] = sections;

  if (first === undefined) {
    throw new Error('Docs article bookmarks require at least one section.');
  }

  return first;
}

function lastArticleBookmarkSection(
  sections: readonly ArticleBookmarkSection[],
): ArticleBookmarkSection {
  const last = sections[sections.length - 1];

  if (last === undefined) {
    throw new Error('Docs article bookmarks require at least one section.');
  }

  return last;
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
