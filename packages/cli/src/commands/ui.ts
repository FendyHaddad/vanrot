import {
  getUiComponentRegistryItem,
  uiPrimitive,
  uiPrimitiveOrder,
  type UiComponentRegistryItem,
  type UiPrimitiveType,
} from '@vanrot/ui';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function uiCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const [actionOrComponent, helpFlag] = args;

  if (actionOrComponent === '--help' || actionOrComponent === '-h') {
    context.reporter.line('vr ui list\nvr ui <component> --help');
    return ok();
  }

  if (actionOrComponent === undefined || actionOrComponent === 'list') {
    context.reporter.line(renderUiList());
    return ok();
  }

  if (helpFlag === '--help' || helpFlag === '-h') {
    return printComponentHelp(actionOrComponent, context);
  }

  context.reporter.error(
    `Unknown ui command: ${args.join(' ')}`,
    'Use vr ui list or vr ui <component> --help.',
  );
  return fail();
}

function printComponentHelp(component: string, context: CommandContext): CommandResult {
  if (!isUiPrimitive(component)) {
    context.reporter.error(
      `Unknown UI component: ${component}`,
      `Supported UI components: ${uiPrimitiveOrder.join(', ')}`,
    );
    return fail();
  }

  const registryItem = getUiComponentRegistryItem(component) ?? basicRegistryItem(component);
  const metadata = uiPrimitive[component];
  const tokenLines = Object.values(registryItem.tokens).map(
    (group) => `  ${group.name}: ${group.tokens.join(', ')} (default ${group.defaultToken})`,
  );
  const booleanLines = registryItem.booleans.map(
    (attribute) => `  ${attribute.name}: ${attribute.description}`,
  );
  const openAttributeLines = registryItem.openAttributes.map(
    (attribute) => `  ${attribute.name}: ${attribute.description}`,
  );
  const eventLines = registryItem.events.map((event) => `  ${event.name}: ${event.description}`);
  const slotLines = registryItem.slots.map((slot) => `  ${slot.name}: ${slot.description}`);
  const anatomyLines = registryItem.anatomy.map(
    (part) => `  ${part.selector}: ${part.description}`,
  );
  const exampleLines = registryItem.examples.map((example) => `  ${example.label}: ${example.code}`);

  context.reporter.line(
    [
      `${metadata.selector}`,
      '',
      `Native tag: ${metadata.nativeTag}`,
      `Docs: ${registryItem.docsPath}`,
      '',
      section('Dotted tokens', tokenLines),
      section('Booleans', booleanLines),
      section('Open attributes', openAttributeLines),
      section('Events', eventLines),
      section('Slots', slotLines),
      section('Anatomy', anatomyLines),
      section('Examples', exampleLines),
    ]
      .filter((line) => line.length > 0)
      .join('\n'),
  );

  return ok();
}

function renderUiList(): string {
  const lines = uiPrimitiveOrder.map((primitive) => {
    const metadata = uiPrimitive[primitive];

    return `  ${primitive.padEnd(14)} ${metadata.selector.padEnd(22)} ${metadata.productionPhase}`;
  });

  return ['Vanrot UI components', '', ...lines, '', 'Use vr ui <component> --help.'].join('\n');
}

function section(title: string, lines: readonly string[]): string {
  if (lines.length === 0) {
    return '';
  }

  return [title, ...lines, ''].join('\n');
}

function isUiPrimitive(component: string): component is UiPrimitiveType {
  return uiPrimitiveOrder.some((primitive) => primitive === component);
}

function basicRegistryItem(component: UiPrimitiveType): UiComponentRegistryItem {
  const metadata = uiPrimitive[component];

  return {
    type: component,
    selector: metadata.selector,
    nativeTag: metadata.nativeTag,
    baseClass: metadata.baseClass,
    category: 'core',
    phase: metadata.productionPhase,
    docsPath: metadata.docsPath,
    tokens: {},
    booleans: [],
    openAttributes: [],
    events: [],
    slots: [],
    anatomy: [],
    examples: [],
    accessibility: [],
  };
}
