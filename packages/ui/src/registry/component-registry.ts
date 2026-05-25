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

export interface UiComponentRegistryItem {
  type: string;
  selector: string;
  nativeTag: string;
  baseClass: string;
  category: 'core' | 'layout' | 'forms' | 'data';
  phase: '16A' | '16B' | '16C' | '16D' | '16E' | '16F';
  docsPath: string;
  tokens: Readonly<Record<string, UiTokenGroupRegistry>>;
  booleans: readonly UiAttributeRegistryItem[];
  openAttributes: readonly UiAttributeRegistryItem[];
  events: readonly UiAttributeRegistryItem[];
  slots: readonly UiAttributeRegistryItem[];
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
  primitive: Phase16FormsDataPrimitive,
  input: {
    category: 'forms' | 'data';
    tokens?: Readonly<Record<string, UiTokenGroupRegistry>>;
    booleans?: readonly UiAttributeRegistryItem[];
    openAttributes?: readonly UiAttributeRegistryItem[];
    events?: readonly UiAttributeRegistryItem[];
    slots?: readonly UiAttributeRegistryItem[];
    examples?: readonly { label: string; code: string }[];
    accessibility?: readonly string[];
  },
): UiComponentRegistryItem {
  const selector = phase16FormsDataSelectors[primitive];

  return {
    type: primitive,
    selector,
    nativeTag: phase16FormsDataNativeTags[primitive],
    baseClass: selector,
    category: input.category,
    phase: '16E',
    docsPath: docsPathByPrimitive[primitive],
    tokens: input.tokens ?? {},
    booleans: input.booleans ?? [],
    openAttributes: input.openAttributes ?? [],
    events: input.events ?? [],
    slots: input.slots ?? defaultSlots,
    examples: input.examples ?? [
      {
        label: `${selector} example`,
        code: `<${selector}></${selector}>`,
      },
    ],
    accessibility: input.accessibility ?? ['Keep labels, roles, and keyboard behavior native.'],
  };
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
} as const satisfies Record<Phase16FormsDataPrimitive, UiComponentRegistryItem>;

export function getUiComponentRegistryItem(type: string): UiComponentRegistryItem | undefined {
  return Object.values(uiComponentRegistry).find((item) => item.type === type);
}
