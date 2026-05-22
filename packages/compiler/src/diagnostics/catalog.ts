import type { DiagnosticCode } from '../api/types.js';

export interface DiagnosticInfo {
  message: string;
  suggestion: string;
  docsPath: string;
}

export const diagnosticCatalog: Record<DiagnosticCode, DiagnosticInfo> = {
  VR001: {
    message: 'Missing sibling component template file.',
    suggestion: 'Create the matching template file beside the component source file.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR002: {
    message: 'Missing sibling component style file.',
    suggestion: 'Create the matching scoped CSS file beside the component source file.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR003: {
    message: 'Unsupported Vanrot role file.',
    suggestion: 'Use a supported role suffix such as .component.ts, .page.ts, or .button.ts.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR004: {
    message: 'Component class could not be read.',
    suggestion: 'Export a named class that matches the Vanrot role file name and has no required constructor arguments.',
    docsPath: '/docs/compiler/component-class',
  },
  VR005: {
    message: 'Unsupported template syntax.',
    suggestion: 'Use Vanrot template syntax supported by this compiler phase.',
    docsPath: '/docs/compiler/template-syntax',
  },
  VR006: {
    message: 'Unsupported expression syntax.',
    suggestion: 'Move assignments, updates, lambdas, and statement-like logic into the component TypeScript file.',
    docsPath: '/docs/compiler/expressions',
  },
  VR007: {
    message: 'Unsupported event binding expression.',
    suggestion: 'Use a zero-argument component method such as save().',
    docsPath: '/docs/compiler/event-binding',
  },
  VR008: {
    message: 'CSS selector cannot be scoped.',
    suggestion: 'Use scoped selectors, :host, :global(...), or @media syntax supported by Vanrot.',
    docsPath: '/docs/compiler/scoped-css',
  },
  VR009: {
    message: 'Invalid Vanrot route link syntax.',
    suggestion: 'Use <vr route.name /> for Vanrot route links.',
    docsPath: '/docs/router/links',
  },
  VR010: {
    message: 'Unsupported Vanrot UI primitive.',
    suggestion: 'Use a supported Vanrot UI primitive or add the primitive through the UI production plan.',
    docsPath: '/docs/ui/primitives',
  },
  VR011: {
    message: 'Invalid @for block.',
    suggestion: 'Use @for (item of items(); track item.id) { ... } with a required track expression.',
    docsPath: '/docs/compiler/for',
  },
  VR012: {
    message: 'Invalid child component input.',
    suggestion: 'Pass every required child input with [inputName]="value".',
    docsPath: '/docs/compiler/child-components',
  },
  VR013: {
    message: 'Unknown slot target.',
    suggestion: 'Provide slots that the child component receives with <slot.name>.',
    docsPath: '/docs/compiler/slots',
  },
  VR014: {
    message: 'Default export is not a Vanrot component class.',
    suggestion: 'Use an exported named class that matches the role file name.',
    docsPath: '/docs/compiler/component-class',
  },
  VR015: {
    message: 'Multiple component class candidates were found.',
    suggestion: 'Keep one exported Vanrot component class per role file.',
    docsPath: '/docs/compiler/component-class',
  },
  VR016: {
    message: 'Required constructor arguments are not supported.',
    suggestion: 'Use input.required(), input.default(), signals, or services instead of constructor arguments.',
    docsPath: '/docs/compiler/component-class',
  },
  VR017: {
    message: 'Invalid input declaration.',
    suggestion: 'Use input.required<Model>() or input.default(value) in the component class.',
    docsPath: '/docs/compiler/inputs',
  },
  VR018: {
    message: 'Source mapping could not be created.',
    suggestion: 'Report this generated mapping issue with the component, template, and style files.',
    docsPath: '/docs/compiler/source-maps',
  },
};
