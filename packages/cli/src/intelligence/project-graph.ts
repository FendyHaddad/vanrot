import type {
  ProjectGraph,
  ProjectGraphEdge,
  ProjectGraphNode,
  ProjectMapRoles,
  ProjectRoleFile,
  RouteGraphEntry,
} from '@vanrot/devtools';
import { basename } from 'node:path';
import { discoverImportGraph } from './import-graph.js';
import { discoverRouteGraph } from './route-graph.js';

export interface BuiltProjectGraph {
  graph: ProjectGraph;
  routes: RouteGraphEntry[];
}

export async function buildProjectGraph(
  _cwd: string,
  roles: ProjectMapRoles,
): Promise<BuiltProjectGraph> {
  const nodes: ProjectGraphNode[] = [];
  const edges: ProjectGraphEdge[] = [];

  for (const role of allRoles(roles)) {
    const componentNode = roleNode(role);
    nodes.push(componentNode);

    if (role.templatePath !== null) {
      const templateNode = fileNode('template', role.templatePath);
      nodes.push(templateNode);
      edges.push(edge(componentNode.id, templateNode.id, 'component-to-template'));
    }

    if (role.stylePath !== null) {
      const styleNode = fileNode('style', role.stylePath);
      nodes.push(styleNode);
      edges.push(edge(componentNode.id, styleNode.id, 'component-to-style'));
    }
  }

  const projectFiles = allRoles(roles).map((role) => role.path);
  const routeGraph = await discoverRouteGraph(_cwd);
  const importEdges = await discoverImportGraph(_cwd, projectFiles);
  edges.push(...routeGraph.edges, ...importEdges);

  for (const route of routeGraph.routes) {
    nodes.push({
      id: route.id,
      kind: 'route',
      label: route.ref,
      path: null,
      metadata: { path: route.path },
    });
  }

  return {
    graph: {
      nodes: sortNodes(dedupeNodes(nodes)),
      edges: sortEdges(dedupeEdges(edges)),
    },
    routes: routeGraph.routes,
  };
}

function allRoles(roles: ProjectMapRoles): ProjectRoleFile[] {
  return [
    ...roles.components,
    ...roles.pages,
    ...roles.dialogs,
    ...roles.layouts,
    ...roles.widgets,
    ...roles.forms,
  ];
}

function roleNode(role: ProjectRoleFile): ProjectGraphNode {
  return {
    id: `${role.role}:${role.path}`,
    kind: role.role,
    label: role.name,
    path: role.path,
    role: role.role,
    metadata: {
      templatePath: role.templatePath,
      stylePath: role.stylePath,
    },
  };
}

function fileNode(kind: 'template' | 'style', path: string): ProjectGraphNode {
  return {
    id: `${kind}:${path}`,
    kind,
    label: basename(path),
    path,
    metadata: {},
  };
}

function edge(from: string, to: string, kind: ProjectGraphEdge['kind']): ProjectGraphEdge {
  return { id: `${from}->${to}:${kind}`, from, to, kind };
}

function dedupeNodes(nodes: ProjectGraphNode[]): ProjectGraphNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function dedupeEdges(edges: ProjectGraphEdge[]): ProjectGraphEdge[] {
  return [...new Map(edges.map((item) => [item.id, item])).values()];
}

function sortNodes(nodes: ProjectGraphNode[]): ProjectGraphNode[] {
  return [...nodes].sort((left, right) => left.id.localeCompare(right.id));
}

function sortEdges(edges: ProjectGraphEdge[]): ProjectGraphEdge[] {
  return [...edges].sort((left, right) => left.id.localeCompare(right.id));
}
