import { describe, expect, it } from 'vitest';
import { exampleMatrix, requiredExampleWorkflows } from '../src/docs/example-matrix.ts';
import {
  frameworkReference,
  frameworkReferenceStatus,
  publicRouteMetadata,
} from '../src/docs/framework-reference.ts';
import {
  commandReference,
  diagnosticReference,
  packageReference,
} from '../src/docs/site-reference.ts';

describe('framework reference registry', () => {
  it('documents every current workspace package', () => {
    expect(frameworkReference.packages.map((item) => item.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/compiler',
      '@vanrot/config',
      '@vanrot/router',
      '@vanrot/vite-plugin',
      '@vanrot/cli',
      '@vanrot/ui',
      '@vanrot/testing',
      '@vanrot/devtools',
      '@vanrot/ai',
    ]);
  });

  it('uses explicit public documentation states', () => {
    expect(Object.values(frameworkReferenceStatus)).toEqual([
      'production-ready',
      'demo-capable',
      'limited',
      'deferred',
      'not-browser-facing',
    ]);

    for (const limitation of frameworkReference.limitations) {
      expect(Object.values(frameworkReferenceStatus)).toContain(limitation.status);
      expect(limitation.summary.length).toBeGreaterThan(20);
    }
  });

  it('includes route metadata for the public documentation front doors', () => {
    expect(publicRouteMetadata.map((item) => item.path)).toEqual([
      '/',
      '/docs',
      '/docs/components',
    ]);

    for (const route of publicRouteMetadata) {
      expect(route.title).toContain('Vanrot');
      expect(route.description.length).toBeGreaterThan(50);
    }
  });

  it('covers public exports, commands, diagnostics, generated files, and conventions', () => {
    expect(frameworkReference.publicExports.length).toBeGreaterThan(20);
    expect(frameworkReference.commands.map((command) => command.name)).toEqual([
      'create',
      'generate',
      'add',
      'ui',
      'config',
      'doctor',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'compiler')).toBe(true);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'config')).toBe(true);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'router')).toBe(true);
    expect(frameworkReference.generatedFiles.map((item) => item.path)).toContain('src/routes.ts');
    expect(frameworkReference.conventions.map((item) => item.id)).toEqual([
      'role-suffixes',
      'scoped-css',
      'signals-for-state',
      'route-refs',
      'no-ui-markup-in-typescript',
    ]);
  });
});

describe('site reference facade', () => {
  it('re-exports framework reference registries for docs pages', () => {
    expect(packageReference).toBe(frameworkReference.packages);
    expect(commandReference).toBe(frameworkReference.commands);
    expect(diagnosticReference).toBe(frameworkReference.diagnostics);
  });
});

describe('example matrix', () => {
  it('covers every required workflow and every workspace package', () => {
    expect(requiredExampleWorkflows).toEqual([
      'starter-flow',
      'runtime-lifecycle',
      'compiler-templates',
      'routing-workflows',
      'config-diagnostics',
      'cli-commands',
      'ui-framework-usage',
      'testing-helpers',
      'devtools-intelligence',
      'ai-consumption',
      'build-deploy',
    ]);

    for (const workflow of requiredExampleWorkflows) {
      expect(exampleMatrix.some((example) => example.workflows.includes(workflow))).toBe(true);
    }

    for (const packageReference of frameworkReference.packages) {
      expect(exampleMatrix.some((example) => example.packages.includes(packageReference.name))).toBe(
        true,
      );
    }
  });
});
