import { describe, expect, it } from 'vitest';
import { parseRouteIndex } from '../src/project/route-index.js';

const routesSource = `
import { defineRoutes } from '@vanrot/router';
const home = {}; const docs = {};
export const route = defineRoutes({
  home,
  docs,
});
`;

describe('parseRouteIndex', () => {
  it('extracts route names from the defineRoutes call', () => {
    const entries = parseRouteIndex('src/routes.ts', routesSource);

    expect(entries.map((entry) => entry.name)).toEqual(['home', 'docs']);
  });

  it('records a span for each route name', () => {
    const entries = parseRouteIndex('src/routes.ts', routesSource);
    const home = entries.find((entry) => entry.name === 'home');

    expect(home?.span.filePath).toBe('src/routes.ts');
    expect(home?.span.line).toBeGreaterThan(0);
  });
});
