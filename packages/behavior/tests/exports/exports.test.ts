import { describe, expect, it } from 'vitest';
import * as behavior from '../../src/index.js';

describe('@vanrot/behavior exports', () => {
  it('exposes the migrated behavior helpers at the package root', () => {
    expect(behavior.createFormController).toBeTypeOf('function');
    expect(behavior.createTableController).toBeTypeOf('function');
    expect(behavior.connectTableFilter).toBeTypeOf('function');
    expect(behavior.createOverlayController).toBeTypeOf('function');
    expect(behavior.createTabsController).toBeTypeOf('function');
    expect(behavior.createTooltipController).toBeTypeOf('function');
    expect(behavior.createToastController).toBeTypeOf('function');
    expect(behavior.createCommandMenuController).toBeTypeOf('function');
    expect(behavior.positionLayer).toBeTypeOf('function');
    expect(behavior.createCollapsibleController).toBeTypeOf('function');
    expect(behavior.createAccordionController).toBeTypeOf('function');
    expect(behavior.createDisclosureController).toBeTypeOf('function');
    expect(behavior.createSelectionController).toBeTypeOf('function');
    expect(behavior.createListboxController).toBeTypeOf('function');
    expect(behavior.createSelectController).toBeTypeOf('function');
    expect(behavior.createComboboxController).toBeTypeOf('function');
    expect(behavior.createMultiSelectionController).toBeTypeOf('function');
    expect(behavior.createMenuController).toBeTypeOf('function');
    expect(behavior.createContextMenuController).toBeTypeOf('function');
    expect(behavior.createMenubarController).toBeTypeOf('function');
    expect(behavior.createNavigationMenuController).toBeTypeOf('function');
    expect(behavior.createToggleGroupController).toBeTypeOf('function');
    expect(behavior.createToolbarController).toBeTypeOf('function');
    expect(behavior.createScrollAreaController).toBeTypeOf('function');
    expect(behavior.mountPortal).toBeTypeOf('function');
    expect(behavior.createFocusTrap).toBeTypeOf('function');
    expect(behavior.createRovingFocusController).toBeTypeOf('function');
    expect(behavior.createFocusReturnController).toBeTypeOf('function');
    expect(behavior.visuallyHiddenProps).toBeTypeOf('function');
    expect(behavior.createCalendarController).toBeTypeOf('function');
    expect(behavior.createDatePickerController).toBeTypeOf('function');
    expect(behavior.createDragDropController).toBeTypeOf('function');
    expect(behavior.reorderItems).toBeTypeOf('function');
    expect(behavior.createTableResizeController).toBeTypeOf('function');
  });

  it('supports explicit subpath source modules', async () => {
    await expect(import('../../src/form.js')).resolves.toMatchObject({
      createFormController: expect.any(Function),
    });
    await expect(import('../../src/table.js')).resolves.toMatchObject({
      createTableController: expect.any(Function),
      connectTableFilter: expect.any(Function),
    });
    await expect(import('../../src/tooltip.js')).resolves.toMatchObject({
      createTooltipController: expect.any(Function),
    });
    await expect(import('../../src/all.js')).resolves.toMatchObject({
      createCommandMenuController: expect.any(Function),
      createCollapsibleController: expect.any(Function),
      createComboboxController: expect.any(Function),
      createContextMenuController: expect.any(Function),
      createDatePickerController: expect.any(Function),
      createDragDropController: expect.any(Function),
      createFocusTrap: expect.any(Function),
      createScrollAreaController: expect.any(Function),
      createTableResizeController: expect.any(Function),
      createToggleGroupController: expect.any(Function),
      positionLayer: expect.any(Function),
    });
    await expect(import('../../src/collapsible.js')).resolves.toMatchObject({
      createAccordionController: expect.any(Function),
    });
    await expect(import('../../src/selection.js')).resolves.toMatchObject({
      createComboboxController: expect.any(Function),
    });
    await expect(import('../../src/menu.js')).resolves.toMatchObject({
      createContextMenuController: expect.any(Function),
    });
    await expect(import('../../src/toggle.js')).resolves.toMatchObject({
      createToolbarController: expect.any(Function),
    });
    await expect(import('../../src/scroll-area.js')).resolves.toMatchObject({
      createScrollAreaController: expect.any(Function),
    });
    await expect(import('../../src/portal.js')).resolves.toMatchObject({
      mountPortal: expect.any(Function),
    });
    await expect(import('../../src/focus.js')).resolves.toMatchObject({
      visuallyHiddenProps: expect.any(Function),
    });
    await expect(import('../../src/calendar.js')).resolves.toMatchObject({
      createDatePickerController: expect.any(Function),
    });
    await expect(import('../../src/drag-drop.js')).resolves.toMatchObject({
      reorderItems: expect.any(Function),
    });
    await expect(import('../../src/table-resize.js')).resolves.toMatchObject({
      createTableResizeController: expect.any(Function),
    });
  });
});
