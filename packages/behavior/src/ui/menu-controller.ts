import { signal, type WritableSignal } from '@vanrot/runtime';
import type { SelectionOption } from './selection-controller.js';

export interface MenuControllerOptions {
  items: readonly SelectionOption[];
  defaultOpen?: boolean;
}

export interface MenuController {
  readonly open: WritableSignal<boolean>;
  readonly activeValue: WritableSignal<string | null>;
  openMenu(): void;
  closeMenu(): void;
  move(offset: number): void;
  getItemProps(value: string): Record<string, string | number>;
}

export interface ContextMenuController {
  readonly open: WritableSignal<boolean>;
  readonly position: WritableSignal<{ x: number; y: number } | null>;
  openAt(x: number, y: number): void;
  closeMenu(): void;
}

export interface MenubarController {
  readonly activeMenu: WritableSignal<string | null>;
  openMenu(value: string): void;
  closeMenu(): void;
  move(offset: number): void;
}

export interface NavigationMenuController {
  readonly value: WritableSignal<string | null>;
  readonly openValue: WritableSignal<string | null>;
  openMenu(value: string): void;
  closeMenu(): void;
  select(value: string): void;
}

export function createMenuController(options: MenuControllerOptions): MenuController {
  const enabled = options.items.filter((item) => item.disabled !== true);
  const open = signal(options.defaultOpen ?? false);
  const activeValue = signal<string | null>(enabled[0]?.value ?? null);

  return {
    open,
    activeValue,
    openMenu() {
      open.set(true);
    },
    closeMenu() {
      open.set(false);
    },
    move(offset) {
      if (enabled.length === 0) {
        activeValue.set(null);
        return;
      }

      const currentIndex = Math.max(
        0,
        enabled.findIndex((item) => item.value === activeValue()),
      );
      activeValue.set(enabled[wrapIndex(currentIndex + offset, enabled.length)]?.value ?? null);
    },
    getItemProps(value) {
      return {
        role: 'menuitem',
        'data-active': String(activeValue() === value),
        tabIndex: activeValue() === value ? 0 : -1,
      };
    },
  };
}

export function createContextMenuController(): ContextMenuController {
  const open = signal(false);
  const position = signal<{ x: number; y: number } | null>(null);

  return {
    open,
    position,
    openAt(x, y) {
      position.set({ x, y });
      open.set(true);
    },
    closeMenu() {
      open.set(false);
      position.set(null);
    },
  };
}

export function createMenubarController(options: { menus: readonly string[] }): MenubarController {
  const menus = [...options.menus];
  const activeMenu = signal<string | null>(menus[0] ?? null);

  return {
    activeMenu,
    openMenu(value) {
      if (menus.includes(value)) {
        activeMenu.set(value);
      }
    },
    closeMenu() {
      activeMenu.set(null);
    },
    move(offset) {
      if (menus.length === 0) {
        activeMenu.set(null);
        return;
      }

      const currentIndex = Math.max(0, menus.indexOf(activeMenu() ?? menus[0] ?? ''));
      activeMenu.set(menus[wrapIndex(currentIndex + offset, menus.length)] ?? null);
    },
  };
}

export function createNavigationMenuController(options: {
  values: readonly string[];
  defaultValue?: string;
}): NavigationMenuController {
  const values = [...options.values];
  const value = signal<string | null>(options.defaultValue ?? null);
  const openValue = signal<string | null>(null);

  return {
    value,
    openValue,
    openMenu(nextValue) {
      if (values.includes(nextValue)) {
        openValue.set(nextValue);
      }
    },
    closeMenu() {
      openValue.set(null);
    },
    select(nextValue) {
      if (!values.includes(nextValue)) {
        return;
      }

      value.set(nextValue);
      openValue.set(null);
    },
  };
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
