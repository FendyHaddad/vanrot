import { vanrotBehavior, type VanrotBehaviorName } from '@vanrot/config';

export interface BehaviorDefinition {
  name: VanrotBehaviorName;
  label: string;
  importPath: string;
  symbols: readonly string[];
}

export const behaviorDefinitions: readonly BehaviorDefinition[] = [
  {
    name: vanrotBehavior.form,
    label: 'Form controller',
    importPath: '@vanrot/behavior/form',
    symbols: ['createFormController', 'connectFormControl'],
  },
  {
    name: vanrotBehavior.table,
    label: 'Table controller',
    importPath: '@vanrot/behavior/table',
    symbols: ['createTableController', 'connectTableFilter'],
  },
  {
    name: vanrotBehavior.overlay,
    label: 'Overlay controller',
    importPath: '@vanrot/behavior/overlay',
    symbols: ['createOverlayController'],
  },
  {
    name: vanrotBehavior.tabs,
    label: 'Tabs controller',
    importPath: '@vanrot/behavior/tabs',
    symbols: ['createTabsController'],
  },
  {
    name: vanrotBehavior.tooltip,
    label: 'Tooltip controller',
    importPath: '@vanrot/behavior/tooltip',
    symbols: ['createTooltipController'],
  },
  {
    name: vanrotBehavior.toast,
    label: 'Toast controller',
    importPath: '@vanrot/behavior/toast',
    symbols: ['createToastController'],
  },
  {
    name: vanrotBehavior.commandMenu,
    label: 'Command menu controller',
    importPath: '@vanrot/behavior/command-menu',
    symbols: ['createCommandMenuController'],
  },
  {
    name: vanrotBehavior.positionedLayer,
    label: 'Positioned layer helper',
    importPath: '@vanrot/behavior/positioned-layer',
    symbols: ['positionLayer'],
  },
  {
    name: vanrotBehavior.collapsible,
    label: 'Collapsible, accordion, and disclosure helpers',
    importPath: '@vanrot/behavior/collapsible',
    symbols: [
      'createCollapsibleController',
      'createAccordionController',
      'createDisclosureController',
    ],
  },
  {
    name: vanrotBehavior.selection,
    label: 'Selection, listbox, select, combobox, and multi-selection helpers',
    importPath: '@vanrot/behavior/selection',
    symbols: [
      'createSelectionController',
      'createListboxController',
      'createSelectController',
      'createComboboxController',
      'createMultiSelectionController',
    ],
  },
  {
    name: vanrotBehavior.menu,
    label: 'Menu, context menu, menubar, and navigation menu helpers',
    importPath: '@vanrot/behavior/menu',
    symbols: [
      'createMenuController',
      'createContextMenuController',
      'createMenubarController',
      'createNavigationMenuController',
    ],
  },
  {
    name: vanrotBehavior.toggle,
    label: 'Toggle group and toolbar helpers',
    importPath: '@vanrot/behavior/toggle',
    symbols: ['createToggleGroupController', 'createToolbarController'],
  },
  {
    name: vanrotBehavior.scrollArea,
    label: 'Scroll area helper',
    importPath: '@vanrot/behavior/scroll-area',
    symbols: ['createScrollAreaController'],
  },
  {
    name: vanrotBehavior.portal,
    label: 'Portal helper',
    importPath: '@vanrot/behavior/portal',
    symbols: ['mountPortal'],
  },
  {
    name: vanrotBehavior.focus,
    label: 'Focus and visually hidden helpers',
    importPath: '@vanrot/behavior/focus',
    symbols: [
      'createFocusTrap',
      'createFocusReturnController',
      'createRovingFocusController',
      'visuallyHiddenProps',
    ],
  },
  {
    name: vanrotBehavior.calendar,
    label: 'Calendar and date picker helpers',
    importPath: '@vanrot/behavior/calendar',
    symbols: ['createCalendarController', 'createDatePickerController'],
  },
  {
    name: vanrotBehavior.dragDrop,
    label: 'Drag and drop helpers',
    importPath: '@vanrot/behavior/drag-drop',
    symbols: ['createDragDropController', 'reorderItems'],
  },
  {
    name: vanrotBehavior.tableResize,
    label: 'Table column resize helper',
    importPath: '@vanrot/behavior/table-resize',
    symbols: ['createTableResizeController'],
  },
];

export const behaviorNames = behaviorDefinitions.map((definition) => definition.name);

export function findBehaviorDefinition(name: string): BehaviorDefinition | undefined {
  return behaviorDefinitions.find((definition) => definition.name === name);
}

export function parseBehaviorList(value: string): VanrotBehaviorName[] {
  const names = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
  const selected: VanrotBehaviorName[] = [];

  for (const name of names) {
    const definition = findBehaviorDefinition(name);
    if (definition === undefined) {
      throw new Error(`Unknown behavior helper: ${name}.`);
    }

    if (!selected.includes(definition.name)) {
      selected.push(definition.name);
    }
  }

  return selected;
}
