import {
  uiDensityToken,
  uiInputTypeToken,
  uiListMarkerToken,
  uiPaginationVariantToken,
  uiStatAlignToken,
} from './token-scales.js';

export interface UiTokenGroupRegistry {
  name: string;
  tokens: readonly string[];
  defaultToken: string;
  classByToken: Readonly<Record<string, string>>;
}

export interface UiAttributeRegistryItem {
  name: string;
  description: string;
}

export interface UiAnatomyRegistryItem {
  selector: string;
  nativeTag: string;
  baseClass: string;
  role?: string;
  description: string;
}

export interface UiComponentRegistryItem {
  type: string;
  selector: string;
  nativeTag: string;
  baseClass: string;
  category: 'core' | 'layout' | 'forms' | 'data' | 'interaction';
  phase: '16A' | '16B' | '16C' | '16D' | '16E' | '16F';
  docsPath: string;
  tokens: Readonly<Record<string, UiTokenGroupRegistry>>;
  booleans: readonly UiAttributeRegistryItem[];
  openAttributes: readonly UiAttributeRegistryItem[];
  events: readonly UiAttributeRegistryItem[];
  slots: readonly UiAttributeRegistryItem[];
  anatomy: readonly UiAnatomyRegistryItem[];
  examples: readonly {
    label: string;
    code: string;
  }[];
  accessibility: readonly string[];
}

export const phase16FormsDataPrimitiveOrder = [
  'form',
  'formField',
  'label',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radioGroup',
  'radio',
  'switch',
  'slider',
  'table',
  'tableHeader',
  'tableBody',
  'tableRow',
  'tableHead',
  'tableCell',
  'tableFooter',
  'tableCaption',
  'pagination',
  'list',
  'listItem',
  'stat',
  'emptyState',
] as const;

export type Phase16FormsDataPrimitive = (typeof phase16FormsDataPrimitiveOrder)[number];

export const phase16InteractionPrimitiveOrder = [
  'dialog',
  'drawer',
  'dropdown',
  'tabs',
  'toast',
] as const;

export type Phase16InteractionPrimitive = (typeof phase16InteractionPrimitiveOrder)[number];

type RegistryBackedPrimitive = Phase16FormsDataPrimitive | Phase16InteractionPrimitive;

const phase16FormsDataNativeTags = {
  form: 'form',
  formField: 'div',
  label: 'label',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  checkbox: 'input',
  radioGroup: 'div',
  radio: 'input',
  switch: 'button',
  slider: 'input',
  table: 'table',
  tableHeader: 'thead',
  tableBody: 'tbody',
  tableRow: 'tr',
  tableHead: 'th',
  tableCell: 'td',
  tableFooter: 'tfoot',
  tableCaption: 'caption',
  pagination: 'nav',
  list: 'ul',
  listItem: 'li',
  stat: 'section',
  emptyState: 'section',
} as const satisfies Record<Phase16FormsDataPrimitive, string>;

const phase16InteractionNativeTags = {
  dialog: 'div',
  drawer: 'div',
  dropdown: 'div',
  tabs: 'div',
  toast: 'section',
} as const satisfies Record<Phase16InteractionPrimitive, string>;

const phase16FormsDataSelectors = {
  form: 'vr-form',
  formField: 'vr-form-field',
  label: 'vr-label',
  input: 'vr-input',
  textarea: 'vr-textarea',
  select: 'vr-select',
  checkbox: 'vr-checkbox',
  radioGroup: 'vr-radio-group',
  radio: 'vr-radio',
  switch: 'vr-switch',
  slider: 'vr-slider',
  table: 'vr-table',
  tableHeader: 'vr-table-header',
  tableBody: 'vr-table-body',
  tableRow: 'vr-table-row',
  tableHead: 'vr-table-head',
  tableCell: 'vr-table-cell',
  tableFooter: 'vr-table-footer',
  tableCaption: 'vr-table-caption',
  pagination: 'vr-pagination',
  list: 'vr-list',
  listItem: 'vr-list-item',
  stat: 'vr-stat',
  emptyState: 'vr-empty-state',
} as const satisfies Record<Phase16FormsDataPrimitive, string>;

const phase16InteractionSelectors = {
  dialog: 'vr-dialog',
  drawer: 'vr-drawer',
  dropdown: 'vr-dropdown',
  tabs: 'vr-tabs',
  toast: 'vr-toast',
} as const satisfies Record<Phase16InteractionPrimitive, string>;

const docsPathByPrimitive = {
  form: '/docs/components/forms',
  formField: '/docs/components/form-fields',
  label: '/docs/components/labels',
  input: '/docs/components/inputs',
  textarea: '/docs/components/textareas',
  select: '/docs/components/selects',
  checkbox: '/docs/components/checkboxes',
  radioGroup: '/docs/components/radio-groups',
  radio: '/docs/components/radios',
  switch: '/docs/components/switches',
  slider: '/docs/components/sliders',
  table: '/docs/components/tables',
  tableHeader: '/docs/components/table-headers',
  tableBody: '/docs/components/table-bodies',
  tableRow: '/docs/components/table-rows',
  tableHead: '/docs/components/table-heads',
  tableCell: '/docs/components/table-cells',
  tableFooter: '/docs/components/table-footers',
  tableCaption: '/docs/components/table-captions',
  pagination: '/docs/components/pagination',
  list: '/docs/components/lists',
  listItem: '/docs/components/list-items',
  stat: '/docs/components/stats',
  emptyState: '/docs/components/empty-states',
} as const satisfies Record<Phase16FormsDataPrimitive, string>;

const phase16InteractionDocsPathByPrimitive = {
  dialog: '/docs/components/dialogs',
  drawer: '/docs/components/drawers',
  dropdown: '/docs/components/dropdowns',
  tabs: '/docs/components/tabs',
  toast: '/docs/components/toasts',
} as const satisfies Record<Phase16InteractionPrimitive, string>;

const formControlBooleans = [
  { name: 'required', description: 'Marks the field required for validation.' },
  { name: 'disabled', description: 'Prevents user interaction.' },
  { name: 'readonly', description: 'Keeps the control readable without allowing edits.' },
  { name: 'invalid', description: 'Sets visual and accessibility invalid state.' },
] as const;

const formControlOpenAttributes = [
  { name: 'name', description: 'Application-owned field name.' },
  { name: 'value', description: 'Application-owned control value.' },
  { name: 'placeholder', description: 'Native placeholder text.' },
  { name: 'aria-label', description: 'Accessible label when no visible label is present.' },
  { name: 'aria-describedby', description: 'Connects help and error copy.' },
] as const;

const formControlEvents = [
  { name: 'input', description: 'Native input event used by controlled form state.' },
  { name: 'change', description: 'Native change event used by validation state.' },
  { name: 'blur', description: 'Marks the field touched.' },
] as const;

const tableBooleans = [
  { name: 'sortable', description: 'Enables column sorting.' },
  { name: 'filterable', description: 'Enables client-side filtering helpers.' },
  { name: 'paginated', description: 'Enables page state helpers.' },
  { name: 'selectable', description: 'Enables row selection state.' },
  { name: 'loading', description: 'Displays loading state.' },
] as const;

const defaultSlots = [{ name: 'default', description: 'Primary component content.' }] as const;

function tokenGroup(
  name: string,
  tokens: readonly string[],
  defaultToken: string,
  classNameForToken: (value: string) => string,
  emitDefaultClass = false,
): UiTokenGroupRegistry {
  return {
    name,
    defaultToken,
    tokens,
    classByToken: Object.fromEntries(
      tokens.map((token) => [
        token,
        token === defaultToken && !emitDefaultClass ? '' : classNameForToken(token),
      ]),
    ),
  };
}

function registryEntry(
  primitive: RegistryBackedPrimitive,
  input: {
    nativeTag?: string;
    category: 'forms' | 'data' | 'interaction';
    phase?: '16E' | '16F';
    docsPath?: string;
    tokens?: Readonly<Record<string, UiTokenGroupRegistry>>;
    booleans?: readonly UiAttributeRegistryItem[];
    openAttributes?: readonly UiAttributeRegistryItem[];
    events?: readonly UiAttributeRegistryItem[];
    slots?: readonly UiAttributeRegistryItem[];
    anatomy?: readonly UiAnatomyRegistryItem[];
    examples?: readonly { label: string; code: string }[];
    accessibility?: readonly string[];
  },
): UiComponentRegistryItem {
  const selector = selectorForPrimitive(primitive);

  return {
    type: primitive,
    selector,
    nativeTag: input.nativeTag === undefined ? nativeTagForPrimitive(primitive) : input.nativeTag,
    baseClass: selector,
    category: input.category,
    phase: input.phase === undefined ? '16E' : input.phase,
    docsPath: input.docsPath === undefined ? docsPathForPrimitive(primitive) : input.docsPath,
    tokens: input.tokens ?? {},
    booleans: input.booleans ?? [],
    openAttributes: input.openAttributes ?? [],
    events: input.events ?? [],
    slots: input.slots ?? defaultSlots,
    anatomy: input.anatomy === undefined ? [] : input.anatomy,
    examples: input.examples ?? [
      {
        label: `${selector} example`,
        code: `<${selector}></${selector}>`,
      },
    ],
    accessibility: input.accessibility ?? ['Keep labels, roles, and keyboard behavior native.'],
  };
}

function selectorForPrimitive(primitive: RegistryBackedPrimitive): string {
  if (isFormsDataPrimitive(primitive)) {
    return phase16FormsDataSelectors[primitive];
  }

  return phase16InteractionSelectors[primitive];
}

function nativeTagForPrimitive(primitive: RegistryBackedPrimitive): string {
  if (isFormsDataPrimitive(primitive)) {
    return phase16FormsDataNativeTags[primitive];
  }

  return phase16InteractionNativeTags[primitive];
}

function docsPathForPrimitive(primitive: RegistryBackedPrimitive): string {
  if (isFormsDataPrimitive(primitive)) {
    return docsPathByPrimitive[primitive];
  }

  return phase16InteractionDocsPathByPrimitive[primitive];
}

function isFormsDataPrimitive(primitive: RegistryBackedPrimitive): primitive is Phase16FormsDataPrimitive {
  return phase16FormsDataPrimitiveOrder.includes(primitive as Phase16FormsDataPrimitive);
}

const formFieldOpenAttributes = [
  { name: 'name', description: 'Application-owned field name.' },
  { name: 'label', description: 'Visible field label.' },
  { name: 'description', description: 'Help text for the field.' },
] as const;

const inputTokens = {
  size: tokenGroup('size', ['xs', 'sm', 'md', 'lg', 'xl'], 'md', (value) => `vr-input-size-${value}`),
  tone: tokenGroup(
    'tone',
    ['default', 'success', 'warning', 'danger'],
    'default',
    (value) => `vr-input-tone-${value}`,
  ),
  type: tokenGroup('type', uiInputTypeToken, 'text', (value) => `vr-input-type-${value}`),
} as const;

const controlTokens = {
  size: tokenGroup('size', ['xs', 'sm', 'md', 'lg'], 'md', (value) => `vr-control-size-${value}`),
  tone: tokenGroup(
    'tone',
    ['default', 'success', 'warning', 'danger'],
    'default',
    (value) => `vr-control-tone-${value}`,
  ),
} as const;

const tableTokens = {
  density: tokenGroup(
    'density',
    uiDensityToken,
    'comfortable',
    (value) => `vr-table-density-${value}`,
  ),
  tone: tokenGroup('tone', ['default', 'muted'], 'default', (value) => `vr-table-tone-${value}`),
} as const;

export const uiComponentRegistry = {
  form: registryEntry('form', {
    category: 'forms',
    booleans: [
      { name: 'disabled', description: 'Disables all registered fields.' },
      { name: 'pending', description: 'Marks a submit as in progress.' },
    ],
    openAttributes: [{ name: 'name', description: 'Application-owned form name.' }],
    events: [{ name: 'submit', description: 'Validates fields before application save code runs.' }],
    examples: [
      {
        label: 'Controlled form',
        code: '<vr-form><vr-form-field name="email" required><vr-input type.email></vr-input></vr-form-field></vr-form>',
      },
    ],
    accessibility: ['Submit orchestration marks invalid fields touched before preventing submit.'],
  }),
  formField: registryEntry('formField', {
    category: 'forms',
    booleans: [{ name: 'required', description: 'Marks the registered field required.' }],
    openAttributes: formFieldOpenAttributes,
    slots: [
      { name: 'label', description: 'Field label content.' },
      { name: 'description', description: 'Field help content.' },
      { name: 'message', description: 'Validation message content.' },
      ...defaultSlots,
    ],
  }),
  label: registryEntry('label', {
    category: 'forms',
    openAttributes: [{ name: 'for', description: 'ID of the labelled control.' }],
  }),
  input: registryEntry('input', {
    category: 'forms',
    tokens: inputTokens,
    booleans: formControlBooleans,
    openAttributes: formControlOpenAttributes,
    events: [
      { name: 'input', description: 'Native input event used by controlled form state.' },
      { name: 'change', description: 'Native change event used by validation state.' },
      { name: 'blur', description: 'Marks the field touched.' },
    ],
    slots: [],
    examples: [
      {
        label: 'Email input',
        code: '<vr-input type.email size.md name="email" placeholder="Email"></vr-input>',
      },
    ],
    accessibility: [
      'Use a visible <vr-label> or aria-label.',
      'Validation sets aria-invalid and aria-describedby when an error element is present.',
    ],
  }),
  textarea: registryEntry('textarea', {
    category: 'forms',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg', 'xl'], 'md', (value) => `vr-textarea-size-${value}`),
      tone: inputTokens.tone,
    },
    booleans: formControlBooleans,
    openAttributes: formControlOpenAttributes,
    events: formControlEvents,
  }),
  select: registryEntry('select', {
    category: 'forms',
    tokens: {
      size: inputTokens.size,
      tone: inputTokens.tone,
    },
    booleans: formControlBooleans,
    openAttributes: formControlOpenAttributes,
    events: formControlEvents,
  }),
  checkbox: registryEntry('checkbox', {
    category: 'forms',
    tokens: controlTokens,
    booleans: [
      ...formControlBooleans,
      { name: 'checked', description: 'Sets the native checked state.' },
    ],
    openAttributes: formControlOpenAttributes,
    events: formControlEvents,
    slots: [],
  }),
  radioGroup: registryEntry('radioGroup', {
    category: 'forms',
    booleans: [{ name: 'disabled', description: 'Disables child radios.' }],
    openAttributes: [{ name: 'name', description: 'Shared radio group name.' }],
    slots: defaultSlots,
    accessibility: ['Use a group label and keep radio options keyboard reachable.'],
  }),
  radio: registryEntry('radio', {
    category: 'forms',
    tokens: controlTokens,
    booleans: [
      ...formControlBooleans,
      { name: 'checked', description: 'Sets the native checked state.' },
    ],
    openAttributes: formControlOpenAttributes,
    events: formControlEvents,
    slots: [],
  }),
  switch: registryEntry('switch', {
    category: 'forms',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-switch-size-${value}`),
      tone: controlTokens.tone,
    },
    booleans: [
      { name: 'checked', description: 'Sets pressed state.' },
      { name: 'disabled', description: 'Prevents user interaction.' },
    ],
    events: [{ name: 'change', description: 'Emitted when pressed state changes.' }],
    slots: [],
    accessibility: ['Compiler lowering keeps switch as a button with role switch.'],
  }),
  slider: registryEntry('slider', {
    category: 'forms',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-slider-size-${value}`),
      tone: controlTokens.tone,
    },
    booleans: formControlBooleans,
    openAttributes: [
      ...formControlOpenAttributes,
      { name: 'min', description: 'Minimum slider value.' },
      { name: 'max', description: 'Maximum slider value.' },
      { name: 'step', description: 'Slider step value.' },
    ],
    events: formControlEvents,
    slots: [],
  }),
  table: registryEntry('table', {
    category: 'data',
    tokens: tableTokens,
    booleans: tableBooleans,
    openAttributes: [{ name: 'aria-label', description: 'Accessible table label.' }],
    events: [
      { name: 'sort', description: 'Emitted when a sortable column changes.' },
      { name: 'filter', description: 'Emitted when the filter query changes.' },
      { name: 'select', description: 'Emitted when row selection changes.' },
    ],
    examples: [
      {
        label: 'Sortable table',
        code: '<vr-table density.compact sortable filterable paginated selectable></vr-table>',
      },
    ],
    accessibility: ['Use <vr-table-caption> for accessible context when visible title copy helps.'],
  }),
  tableHeader: registryEntry('tableHeader', { category: 'data' }),
  tableBody: registryEntry('tableBody', { category: 'data' }),
  tableRow: registryEntry('tableRow', {
    category: 'data',
    booleans: [
      { name: 'selected', description: 'Marks the row selected.' },
      { name: 'disabled', description: 'Prevents row selection.' },
    ],
  }),
  tableHead: registryEntry('tableHead', {
    category: 'data',
    openAttributes: [{ name: 'sort', description: 'Application-owned sort key.' }],
  }),
  tableCell: registryEntry('tableCell', { category: 'data' }),
  tableFooter: registryEntry('tableFooter', { category: 'data' }),
  tableCaption: registryEntry('tableCaption', { category: 'data' }),
  pagination: registryEntry('pagination', {
    category: 'data',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-pagination-size-${value}`),
      variant: tokenGroup(
        'variant',
        uiPaginationVariantToken,
        'default',
        (value) => `vr-pagination-${value}`,
      ),
    },
    openAttributes: [
      { name: 'page', description: 'Current one-based page.' },
      { name: 'total', description: 'Total item count.' },
      { name: 'pageSize', description: 'Items per page.' },
    ],
    events: [{ name: 'page', description: 'Emitted when the active page changes.' }],
  }),
  list: registryEntry('list', {
    category: 'data',
    tokens: {
      marker: tokenGroup('marker', uiListMarkerToken, 'disc', (value) => `vr-list-marker-${value}`),
      density: tokenGroup(
        'density',
        uiDensityToken,
        'comfortable',
        (value) => `vr-list-density-${value}`,
      ),
    },
  }),
  listItem: registryEntry('listItem', { category: 'data' }),
  stat: registryEntry('stat', {
    category: 'data',
    tokens: {
      tone: tokenGroup(
        'tone',
        ['default', 'success', 'warning', 'danger', 'muted'],
        'default',
        (value) => `vr-stat-tone-${value}`,
      ),
      align: tokenGroup('align', uiStatAlignToken, 'left', (value) => `vr-stat-align-${value}`),
    },
  }),
  emptyState: registryEntry('emptyState', {
    category: 'data',
    tokens: {
      tone: tokenGroup('tone', ['default', 'muted'], 'default', (value) => `vr-empty-state-${value}`),
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-empty-state-size-${value}`),
    },
    slots: [
      { name: 'default', description: 'Empty state body.' },
      { name: 'actions', description: 'Recovery actions.' },
    ],
  }),
  dialog: registryEntry('dialog', {
    nativeTag: 'div',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/dialogs',
    tokens: {
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-dialog-size-${value}`, true),
      motion: tokenGroup(
        'motion',
        ['instant', 'subtle'],
        'subtle',
        (value) => `vr-dialog-motion-${value}`,
        true,
      ),
    },
    openAttributes: [
      { name: 'open', description: 'Controls whether the dialog starts open.' },
      { name: 'aria-label', description: 'Accessible label when no title anatomy is present.' },
      { name: 'aria-labelledby', description: 'Id of the visible dialog title.' },
      { name: 'aria-describedby', description: 'Id of the dialog description.' },
    ],
    events: [
      { name: 'openchange', description: 'Emitted when the dialog opens or closes.' },
      { name: 'close', description: 'Emitted after the dialog closes.' },
    ],
    anatomy: [
      {
        selector: 'vr-dialog-trigger',
        nativeTag: 'span',
        baseClass: 'vr-dialog-trigger',
        description: 'Registers the element that opens the dialog.',
      },
      {
        selector: 'vr-dialog-content',
        nativeTag: 'div',
        baseClass: 'vr-dialog-content',
        role: 'dialog',
        description: 'Renders the accessible dialog surface.',
      },
      {
        selector: 'vr-dialog-header',
        nativeTag: 'div',
        baseClass: 'vr-dialog-header',
        description: 'Groups title and description content.',
      },
      {
        selector: 'vr-dialog-title',
        nativeTag: 'h2',
        baseClass: 'vr-dialog-title',
        description: 'Provides the visible dialog title.',
      },
      {
        selector: 'vr-dialog-description',
        nativeTag: 'p',
        baseClass: 'vr-dialog-description',
        description: 'Provides supporting dialog description text.',
      },
      {
        selector: 'vr-dialog-footer',
        nativeTag: 'div',
        baseClass: 'vr-dialog-footer',
        description: 'Groups secondary and primary actions.',
      },
      {
        selector: 'vr-dialog-close',
        nativeTag: 'button',
        baseClass: 'vr-dialog-close',
        description: 'Closes the dialog.',
      },
    ],
    examples: [
      {
        label: 'Edit profile dialog',
        code: '<vr-dialog size.md><vr-dialog-trigger><vr-button>Open</vr-button></vr-dialog-trigger><vr-dialog-content><vr-dialog-title>Edit profile</vr-dialog-title></vr-dialog-content></vr-dialog>',
      },
    ],
    accessibility: [
      'Focus moves into the dialog when it opens.',
      'Focus returns to the trigger when the dialog closes.',
    ],
  }),
  drawer: registryEntry('drawer', {
    nativeTag: 'div',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/drawers',
    tokens: {
      side: tokenGroup(
        'side',
        ['left', 'right', 'top', 'bottom'],
        'right',
        (value) => `vr-drawer-side-${value}`,
        true,
      ),
      size: tokenGroup('size', ['sm', 'md', 'lg'], 'md', (value) => `vr-drawer-size-${value}`, true),
    },
    openAttributes: [
      { name: 'open', description: 'Controls whether the drawer starts open.' },
      { name: 'aria-label', description: 'Accessible label when no title anatomy is present.' },
    ],
    events: [
      { name: 'openchange', description: 'Emitted when the drawer opens or closes.' },
      { name: 'close', description: 'Emitted after the drawer closes.' },
    ],
    anatomy: [
      {
        selector: 'vr-drawer-trigger',
        nativeTag: 'span',
        baseClass: 'vr-drawer-trigger',
        description: 'Registers the element that opens the drawer.',
      },
      {
        selector: 'vr-drawer-content',
        nativeTag: 'aside',
        baseClass: 'vr-drawer-content',
        role: 'dialog',
        description: 'Renders the drawer surface.',
      },
      {
        selector: 'vr-drawer-header',
        nativeTag: 'div',
        baseClass: 'vr-drawer-header',
        description: 'Groups drawer title and description.',
      },
      {
        selector: 'vr-drawer-title',
        nativeTag: 'h2',
        baseClass: 'vr-drawer-title',
        description: 'Provides the visible drawer title.',
      },
      {
        selector: 'vr-drawer-description',
        nativeTag: 'p',
        baseClass: 'vr-drawer-description',
        description: 'Provides supporting drawer description text.',
      },
      {
        selector: 'vr-drawer-footer',
        nativeTag: 'div',
        baseClass: 'vr-drawer-footer',
        description: 'Groups drawer actions.',
      },
      {
        selector: 'vr-drawer-close',
        nativeTag: 'button',
        baseClass: 'vr-drawer-close',
        description: 'Closes the drawer.',
      },
    ],
    examples: [
      {
        label: 'Filter drawer',
        code: '<vr-drawer side.right size.md><vr-drawer-trigger><vr-button variant.outline>Filters</vr-button></vr-drawer-trigger><vr-drawer-content><vr-drawer-title>Filters</vr-drawer-title></vr-drawer-content></vr-drawer>',
      },
    ],
    accessibility: ['Focus moves into the drawer when it opens.', 'Escape closes the drawer.'],
  }),
  dropdown: registryEntry('dropdown', {
    nativeTag: 'div',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/dropdowns',
    tokens: {
      align: tokenGroup(
        'align',
        ['start', 'center', 'end'],
        'start',
        (value) => `vr-dropdown-align-${value}`,
        true,
      ),
      side: tokenGroup(
        'side',
        ['top', 'bottom'],
        'bottom',
        (value) => `vr-dropdown-side-${value}`,
        true,
      ),
      size: tokenGroup('size', ['sm', 'md'], 'md', (value) => `vr-dropdown-size-${value}`, true),
    },
    openAttributes: [
      { name: 'open', description: 'Controls whether the dropdown starts open.' },
      { name: 'aria-label', description: 'Accessible label for icon-only dropdown triggers.' },
    ],
    events: [
      { name: 'openchange', description: 'Emitted when the dropdown opens or closes.' },
      { name: 'select', description: 'Emitted when an item is selected.' },
    ],
    anatomy: [
      {
        selector: 'vr-dropdown-trigger',
        nativeTag: 'button',
        baseClass: 'vr-dropdown-trigger',
        description: 'Opens and closes the dropdown.',
      },
      {
        selector: 'vr-dropdown-content',
        nativeTag: 'div',
        baseClass: 'vr-dropdown-content',
        description: 'Renders dropdown options.',
      },
      {
        selector: 'vr-dropdown-item',
        nativeTag: 'button',
        baseClass: 'vr-dropdown-item',
        description: 'Represents a selectable dropdown item.',
      },
      {
        selector: 'vr-dropdown-label',
        nativeTag: 'div',
        baseClass: 'vr-dropdown-label',
        description: 'Labels a group of items.',
      },
      {
        selector: 'vr-dropdown-separator',
        nativeTag: 'hr',
        baseClass: 'vr-dropdown-separator',
        description: 'Separates item groups.',
      },
    ],
    examples: [
      {
        label: 'Account dropdown',
        code: '<vr-dropdown align.end><vr-dropdown-trigger>Open</vr-dropdown-trigger><vr-dropdown-content><vr-dropdown-item>Profile</vr-dropdown-item></vr-dropdown-content></vr-dropdown>',
      },
    ],
    accessibility: [
      'Trigger exposes aria-expanded.',
      'Escape and outside pointer input close the dropdown.',
    ],
  }),
  tabs: registryEntry('tabs', {
    nativeTag: 'div',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/tabs',
    tokens: {
      variant: tokenGroup(
        'variant',
        ['line', 'pill'],
        'line',
        (value) => `vr-tabs-variant-${value}`,
        true,
      ),
      orientation: tokenGroup(
        'orientation',
        ['horizontal', 'vertical'],
        'horizontal',
        (value) => `vr-tabs-orientation-${value}`,
        true,
      ),
    },
    openAttributes: [
      { name: 'value', description: 'Selected tab value.' },
      { name: 'aria-label', description: 'Accessible label for the tab group.' },
    ],
    events: [{ name: 'change', description: 'Emitted when the selected tab value changes.' }],
    anatomy: [
      {
        selector: 'vr-tabs-list',
        nativeTag: 'div',
        baseClass: 'vr-tabs-list',
        role: 'tablist',
        description: 'Groups tab triggers.',
      },
      {
        selector: 'vr-tabs-trigger',
        nativeTag: 'button',
        baseClass: 'vr-tabs-trigger',
        role: 'tab',
        description: 'Selects a matching panel by value.',
      },
      {
        selector: 'vr-tabs-panel',
        nativeTag: 'div',
        baseClass: 'vr-tabs-panel',
        role: 'tabpanel',
        description: 'Displays content for a matching trigger value.',
      },
    ],
    examples: [
      {
        label: 'Overview tabs',
        code: '<vr-tabs value.overview><vr-tabs-list><vr-tabs-trigger value.overview>Overview</vr-tabs-trigger></vr-tabs-list><vr-tabs-panel value.overview>Overview content</vr-tabs-panel></vr-tabs>',
      },
    ],
    accessibility: [
      'Triggers expose selected state.',
      'Arrow keys move between registered triggers.',
    ],
  }),
  toast: registryEntry('toast', {
    nativeTag: 'section',
    category: 'interaction',
    phase: '16F',
    docsPath: '/docs/components/toasts',
    tokens: {
      tone: tokenGroup(
        'tone',
        ['default', 'success', 'warning', 'danger'],
        'default',
        (value) => `vr-toast-tone-${value}`,
        true,
      ),
      placement: tokenGroup(
        'placement',
        ['topright', 'topleft', 'bottomright', 'bottomleft'],
        'bottomright',
        (value) => `vr-toast-placement-${value}`,
        true,
      ),
    },
    openAttributes: [
      { name: 'aria-label', description: 'Accessible label for the toast live region.' },
    ],
    events: [{ name: 'dismiss', description: 'Emitted when a toast is dismissed.' }],
    anatomy: [
      {
        selector: 'vr-toast-viewport',
        nativeTag: 'div',
        baseClass: 'vr-toast-viewport',
        description: 'Positions queued toast items.',
      },
      {
        selector: 'vr-toast-item',
        nativeTag: 'div',
        baseClass: 'vr-toast-item',
        description: 'Renders one queued toast message.',
      },
      {
        selector: 'vr-toast-title',
        nativeTag: 'strong',
        baseClass: 'vr-toast-title',
        description: 'Displays toast title text.',
      },
      {
        selector: 'vr-toast-description',
        nativeTag: 'p',
        baseClass: 'vr-toast-description',
        description: 'Displays optional toast body text.',
      },
      {
        selector: 'vr-toast-close',
        nativeTag: 'button',
        baseClass: 'vr-toast-close',
        description: 'Dismisses one toast.',
      },
    ],
    examples: [
      {
        label: 'Success toast',
        code: '<vr-toast tone.success placement.bottomright><vr-toast-item><vr-toast-title>Saved</vr-toast-title></vr-toast-item></vr-toast>',
      },
    ],
    accessibility: [
      'Toast viewport uses a live region.',
      'Manual dismiss remains keyboard reachable.',
    ],
  }),
} as const satisfies Record<
  Phase16FormsDataPrimitive | Phase16InteractionPrimitive,
  UiComponentRegistryItem
>;

export function getUiComponentRegistryItem(type: string): UiComponentRegistryItem | undefined {
  return Object.values(uiComponentRegistry).find((item) => item.type === type);
}
