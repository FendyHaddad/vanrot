// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createAccordionController,
  createCalendarController,
  createCollapsibleController,
  createComboboxController,
  createContextMenuController,
  createDatePickerController,
  createDisclosureController,
  createDragDropController,
  createFocusReturnController,
  createFocusTrap,
  createListboxController,
  createMenuController,
  createMenubarController,
  createMultiSelectionController,
  createNavigationMenuController,
  createRovingFocusController,
  createScrollAreaController,
  createSelectController,
  createSelectionController,
  createTableResizeController,
  createToggleGroupController,
  createToolbarController,
  mountPortal,
  reorderItems,
  visuallyHiddenProps,
} from '../../src/index.js';

const options = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'katherine', label: 'Katherine Johnson', disabled: true },
] as const;

describe('Phase 28 behavior expansion controllers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('manages collapsible, accordion, and disclosure state', () => {
    const collapsible = createCollapsibleController({ defaultOpen: false });
    collapsible.toggle();
    expect(collapsible.open()).toBe(true);
    expect(collapsible.getTriggerProps()).toMatchObject({ 'aria-expanded': 'true' });

    const accordion = createAccordionController({ type: 'multiple', defaultValue: ['intro'] });
    accordion.toggleItem('api');
    accordion.toggleItem('intro');
    expect(accordion.value()).toEqual(['api']);
    expect(accordion.isOpen('api')).toBe(true);

    const disclosure = createDisclosureController({ id: 'details', defaultOpen: true });
    expect(disclosure.getContentProps()).toMatchObject({ id: 'details', hidden: false });
  });

  it('manages selection, listbox, select, combobox, and multi-selection state', () => {
    const selection = createSelectionController({ options, defaultValue: 'ada' });
    selection.move(1);
    selection.selectActive();
    expect(selection.selectedValue()).toBe('grace');

    const listbox = createListboxController({ options, defaultValue: 'ada' });
    expect(listbox.getOptionProps('ada')).toMatchObject({ role: 'option', 'aria-selected': 'true' });

    const select = createSelectController({ options });
    select.openSelect();
    select.move(1);
    select.selectActive();
    expect(select.open()).toBe(false);
    expect(select.value()).toBe('grace');

    const combobox = createComboboxController({ options });
    combobox.setQuery('grace');
    expect(combobox.filteredOptions().map((option) => option.value)).toEqual(['grace']);

    const multi = createMultiSelectionController({ values: ['a', 'b', 'c', 'd'] });
    multi.toggle('a');
    multi.selectRange('a', 'c');
    expect([...multi.selectedValues()]).toEqual(['a', 'b', 'c']);
  });

  it('manages menus, context menus, menubars, and navigation menus', () => {
    const menu = createMenuController({ items: options });
    menu.openMenu();
    menu.move(1);
    expect(menu.activeValue()).toBe('grace');
    expect(menu.getItemProps('grace')).toMatchObject({ role: 'menuitem', 'data-active': 'true' });

    const context = createContextMenuController();
    context.openAt(24, 48);
    expect(context.position()).toEqual({ x: 24, y: 48 });

    const menubar = createMenubarController({ menus: ['file', 'edit'] });
    menubar.openMenu('file');
    menubar.move(1);
    expect(menubar.activeMenu()).toBe('edit');

    const navigation = createNavigationMenuController({ values: ['docs', 'api'] });
    navigation.openMenu('docs');
    navigation.select('api');
    expect(navigation.value()).toBe('api');
    expect(navigation.openValue()).toBe(null);
  });

  it('manages toggle groups and toolbar roving focus', () => {
    const toggle = createToggleGroupController({ type: 'multiple', defaultValue: ['bold'] });
    toggle.toggle('italic');
    toggle.toggle('bold');
    expect(toggle.value()).toEqual(['italic']);

    const toolbar = createToolbarController({ values: ['undo', 'redo', 'save'] });
    toolbar.move(1);
    expect(toolbar.activeValue()).toBe('redo');
    expect(toolbar.getItemProps('redo')).toMatchObject({ role: 'button', tabIndex: 0 });
  });

  it('manages scroll area, portal, focus, and visually hidden helpers', () => {
    const scrollArea = createScrollAreaController({
      viewportSize: 100,
      contentSize: 250,
      offset: 25,
    });
    expect(scrollArea.atStart()).toBe(false);
    expect(scrollArea.atEnd()).toBe(false);
    scrollArea.update({ offset: 150 });
    expect(scrollArea.atEnd()).toBe(true);

    const node = document.createElement('div');
    const disposePortal = mountPortal(node);
    expect(document.body.contains(node)).toBe(true);
    disposePortal();
    expect(document.body.contains(node)).toBe(false);

    const trigger = document.createElement('button');
    const first = document.createElement('button');
    const second = document.createElement('button');
    const region = document.createElement('section');
    region.append(first, second);
    document.body.append(trigger, region);
    trigger.focus();

    const focusReturn = createFocusReturnController();
    focusReturn.capture();
    first.focus();
    focusReturn.restore();
    expect(document.activeElement).toBe(trigger);

    const trap = createFocusTrap(region);
    trap.activate();
    expect(document.activeElement).toBe(first);
    trap.deactivate();

    const roving = createRovingFocusController({ values: ['one', 'two'] });
    roving.move(1);
    expect(roving.activeValue()).toBe('two');
    expect(visuallyHiddenProps()).toMatchObject({ 'data-vanrot-visually-hidden': 'true' });
  });

  it('manages calendar grids and date picker state', () => {
    const calendar = createCalendarController({
      month: new Date(2026, 5, 1),
      selectedDate: new Date(2026, 5, 4),
    });
    expect(calendar.weeks()).toHaveLength(6);
    expect(calendar.label()).toBe('June 2026');
    calendar.nextMonth();
    expect(calendar.label()).toBe('July 2026');

    const picker = createDatePickerController({ month: new Date(2026, 5, 1) });
    picker.openPicker();
    picker.selectDate(new Date(2026, 5, 12));
    expect(picker.open()).toBe(false);
    expect(picker.selectedDate()?.toDateString()).toBe(new Date(2026, 5, 12).toDateString());
  });

  it('manages drag-drop reorder and table column resizing', () => {
    expect(reorderItems(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);

    const dragDrop = createDragDropController({ items: ['a', 'b', 'c'] });
    dragDrop.startDrag('a');
    dragDrop.enterDrop('c');
    expect(dragDrop.drop()).toEqual(['b', 'c', 'a']);

    const resize = createTableResizeController({
      columns: [
        { id: 'name', width: 160, minWidth: 120, maxWidth: 240 },
        { id: 'status', width: 100 },
      ],
    });
    resize.startResize('name', 10);
    resize.updateResize(140);
    resize.endResize();
    expect(resize.widths()).toMatchObject({ name: 240, status: 100 });
  });
});
