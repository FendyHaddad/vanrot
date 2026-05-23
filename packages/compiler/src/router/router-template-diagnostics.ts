import type { CompileDiagnostic, DiagnosticCode } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { ElementNode, TemplateNode } from '../template/ast.js';

export function diagnoseRouterTemplateUsage(
  nodes: readonly TemplateNode[],
  templatePath: string,
): CompileDiagnostic[] {
  const routerNodes = collectElements(nodes, 'vr-router');
  const outletNodes = collectElements(nodes, 'vr-outlet');
  const diagnostics: CompileDiagnostic[] = [];
  const isAppLayout = templatePath.endsWith('app.layout.html');
  const isRouteLayout = templatePath.endsWith('.layout.html') && !isAppLayout;
  const isPage = templatePath.endsWith('.page.html');

  if (routerNodes.length > 1) {
    diagnostics.push(createRouterDiagnostic('VR_ROUTER_MULTIPLE_ROOTS', templatePath, routerNodes[1]));
  }

  if (routerNodes.length > 0 && !isAppLayout) {
    diagnostics.push(createRouterDiagnostic('VR_ROUTER_OUTSIDE_APP_LAYOUT', templatePath, routerNodes[0]));
  }

  if (outletNodes.length > 0 && !isRouteLayout) {
    diagnostics.push(createRouterDiagnostic('VR_OUTLET_OUTSIDE_LAYOUT', templatePath, outletNodes[0]));
  }

  if (isPage && outletNodes.length > 0) {
    diagnostics.push(createRouterDiagnostic('VR_PAGE_HAS_OUTLET', templatePath, outletNodes[0]));
  }

  if (isRouteLayout && outletNodes.length === 0 && routerNodes.length === 0) {
    diagnostics.push(createRouterDiagnostic('VR_LAYOUT_MISSING_OUTLET', templatePath));
  }

  if (isRouteLayout && outletNodes.length > 1) {
    diagnostics.push(createRouterDiagnostic('VR_LAYOUT_MULTIPLE_OUTLETS', templatePath, outletNodes[1]));
  }

  return diagnostics;
}

function collectElements(nodes: readonly TemplateNode[], tagName: string): ElementNode[] {
  const matches: ElementNode[] = [];

  for (const node of nodes) {
    if (node.kind === 'element') {
      if (node.tagName === tagName) {
        matches.push(node);
      }

      matches.push(...collectElements(node.children, tagName));
      continue;
    }

    matches.push(...collectElements(readNodeChildren(node), tagName));
  }

  return matches;
}

function readNodeChildren(node: Exclude<TemplateNode, ElementNode>): readonly TemplateNode[] {
  if (node.kind === 'if-block') {
    return [...node.consequent, ...node.alternate];
  }

  if (node.kind === 'for-block') {
    return [...node.body, ...node.empty];
  }

  if (node.kind === 'slot-outlet') {
    return node.fallback;
  }

  return [];
}

function createRouterDiagnostic(
  code: DiagnosticCode,
  templatePath: string,
  node?: ElementNode,
): CompileDiagnostic {
  if (node === undefined) {
    return createDiagnostic(code, 'error', undefined, templatePath);
  }

  return createDiagnostic(code, 'error', undefined, templatePath, node.span.line, node.span.column);
}
