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
    suggestion: 'Use a supported role suffix such as .component.ts, .page.ts, .layout.ts, or .button.ts.',
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
  VR019: {
    message: 'Invalid Vanrot UI primitive variant.',
    suggestion: 'Use a variant listed by the primitive metadata in @vanrot/ui.',
    docsPath: '/docs/ui/primitives',
  },
  VR020: {
    message: 'Duplicate Vanrot UI dotted token.',
    suggestion: 'Use only one dotted token from each finite token group.',
    docsPath: '/docs/ui/dotted-token-attributes',
  },
  VR021: {
    message: 'Unknown Vanrot UI dotted token.',
    suggestion: 'Use a dotted token listed by the primitive metadata in @vanrot/ui.',
    docsPath: '/docs/ui/dotted-token-attributes',
  },
  VR_PIPE_UNKNOWN: {
    message: 'Unknown template pipe.',
    suggestion: 'Use a built-in pipe or export a custom pipe from a .pipe.ts file.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_UNKNOWN_VARIANT: {
    message: 'Unknown template pipe variant.',
    suggestion: 'Use a built-in variant or export a custom preset from a .pipe.ts file.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_DUPLICATE_NAME: {
    message: 'Duplicate template pipe name.',
    suggestion: 'Keep pipe names globally unique across .pipe.ts files.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_DUPLICATE_PRESET: {
    message: 'Duplicate template pipe preset.',
    suggestion: 'Keep each preset name unique inside its pipe namespace.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_INVALID_ARGUMENT: {
    message: 'Invalid template pipe argument.',
    suggestion: 'Use arguments supported by the pipe contract.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_INVALID_DEFINITION: {
    message: 'Invalid template pipe definition.',
    suggestion: 'Export pipes with definePipe, enumPipe, datePattern, numberPattern, or maskPattern.',
    docsPath: '/docs/formatters',
  },
  VR_PIPE_ASYNC: {
    message: 'Async template pipes are not supported.',
    suggestion: 'Use forms or async resources for asynchronous work, then pipe the resolved value.',
    docsPath: '/docs/formatters',
  },
  VR_ROUTER_MULTIPLE_ROOTS: {
    message: 'App layout templates can contain only one <vr-router />.',
    suggestion: 'Keep one root <vr-router /> in app.layout.html.',
    docsPath: '/docs/router/vr-router',
  },
  VR_ROUTER_OUTSIDE_APP_LAYOUT: {
    message: '<vr-router /> can only be used in app.layout.html.',
    suggestion: 'Move <vr-router /> to app.layout.html and use <vr-outlet /> inside route layouts.',
    docsPath: '/docs/router/vr-router',
  },
  VR_LAYOUT_MISSING_OUTLET: {
    message: 'Route layout templates must contain one <vr-outlet />.',
    suggestion: 'Add <vr-outlet /> to the route layout template.',
    docsPath: '/docs/router/vr-outlet',
  },
  VR_LAYOUT_MULTIPLE_OUTLETS: {
    message: 'Route layout templates can contain only one <vr-outlet />.',
    suggestion: 'Keep one <vr-outlet /> in the route layout template.',
    docsPath: '/docs/router/vr-outlet',
  },
  VR_OUTLET_OUTSIDE_LAYOUT: {
    message: '<vr-outlet /> can only be used in route layout templates.',
    suggestion: 'Move <vr-outlet /> to a route .layout.html file.',
    docsPath: '/docs/router/vr-outlet',
  },
  VR_PAGE_HAS_OUTLET: {
    message: 'Page templates cannot contain <vr-outlet />.',
    suggestion: 'Change the route to a layout route or remove <vr-outlet /> from the page template.',
    docsPath: '/docs/router/page-routes',
  },
};
