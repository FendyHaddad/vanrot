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
