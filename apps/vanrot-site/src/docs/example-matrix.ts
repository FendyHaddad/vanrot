import { frameworkReference } from './framework-reference.ts';

export const requiredExampleWorkflows = [
  'starter-flow',
  'runtime-lifecycle',
  'behavior-helpers',
  'compiler-templates',
  'routing-workflows',
  'config-diagnostics',
  'cli-commands',
  'ui-framework-usage',
  'testing-helpers',
  'devtools-intelligence',
  'ai-consumption',
  'build-deploy',
  'webgl-threejs',
  'ssr-hydration',
] as const;

export type RequiredExampleWorkflow = (typeof requiredExampleWorkflows)[number];

export const exampleMatrix = frameworkReference.examples;
