import type { NormalizedGraphManifest, RouteGraphEntry } from '../index.js';

export interface PanelState {
  summary: {
    statusLabel: string;
    nodeCount: number;
    edgeCount: number;
    routeCount: number;
    generatedAt: string | null;
  };
  routes: Array<{ ref: string; path: string; page: string | null }>;
  warnings: string[];
  emptyState: string | null;
}

export function createPanelState(result: NormalizedGraphManifest): PanelState {
  if (result.manifest === null) {
    return {
      summary: {
        statusLabel: labelForStatus(result.status),
        nodeCount: 0,
        edgeCount: 0,
        routeCount: 0,
        generatedAt: null,
      },
      routes: [],
      warnings: result.warnings,
      emptyState: result.warnings[0] ?? 'No graph manifest available.',
    };
  }

  return {
    summary: {
      statusLabel: labelForStatus(result.status),
      nodeCount: result.manifest.graph.nodes.length,
      edgeCount: result.manifest.graph.edges.length,
      routeCount: result.manifest.routes.length,
      generatedAt: result.manifest.generatedAt,
    },
    routes: result.manifest.routes.map(toRouteRow),
    warnings: result.warnings,
    emptyState: result.manifest.graph.nodes.length === 0 ? 'No app graph nodes found.' : null,
  };
}

function toRouteRow(route: RouteGraphEntry): { ref: string; path: string; page: string | null } {
  return { ref: route.ref, path: route.path, page: route.pageNodeId };
}

function labelForStatus(status: NormalizedGraphManifest['status']): string {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'stale':
      return 'Stale';
    case 'missing':
      return 'Missing manifest';
    case 'unreadable':
      return 'Unreadable manifest';
    case 'unsupported-schema':
      return 'Unsupported schema';
  }
}
