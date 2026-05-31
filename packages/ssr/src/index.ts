import { mount, type AppHandle, type ComponentType } from '@vanrot/runtime';
import {
  buildRouteUrl,
  matchRouteChain,
  resolveRoutePage,
  type DefinedRoute,
  type DefinedRouteTable,
  type RouteChainMatch,
  type RouteGuard,
  type RouteGuardContext,
  type RouteMatch,
  type RouteRedirectTarget,
  type RouteRef,
  type RouteUrlInput,
} from '@vanrot/router';

export const hydrationStateScriptId = '__vanrot_hydration_state__';

export const hydrationEventReplayPolicy = {
  status: 'deferred',
  supported: false,
} as const;

export type SsrDiagnosticCode =
  | 'VRSSR_ATTRIBUTE_MISMATCH'
  | 'VRSSR_BROWSER_API'
  | 'VRSSR_EXTRA_NODE'
  | 'VRSSR_INVALID_COMPONENT'
  | 'VRSSR_MISSING_NODE'
  | 'VRSSR_NODE_ORDER_MISMATCH'
  | 'VRSSR_ROUTE_DIVERGENCE'
  | 'VRSSR_ROUTE_GUARD_BLOCKED'
  | 'VRSSR_ROUTE_NOT_FOUND'
  | 'VRSSR_ROUTE_REDIRECT'
  | 'VRSSR_STATE_INVALID'
  | 'VRSSR_TEXT_MISMATCH';

export interface SsrDiagnostic {
  code: SsrDiagnosticCode;
  message: string;
  path?: string;
  expected?: unknown;
  actual?: unknown;
  attribute?: string;
  source?: string;
}

export interface ServerRenderResult<TContext = unknown> {
  html: string;
  ctx: TContext;
}

export interface ServerComponentModule<TContext = unknown> {
  renderToHtml(
    initialInputs?: Record<string, unknown>,
    projectedSlots?: Record<string, string>,
  ): ServerRenderResult<TContext>;
}

export interface HydratableComponentModule {
  hydrateComponent(target: Element, options?: HydrateOptions): AppHandle;
}

export interface RenderToStringOptions {
  inputs?: Record<string, unknown>;
  slots?: Record<string, string>;
}

export interface HtmlAssetOptions {
  basePath?: string;
  styles?: readonly string[];
  scripts?: readonly string[];
}

export interface HtmlDocumentOptions {
  body: string;
  title?: string;
  lang?: string;
  head?: readonly string[];
  assets?: HtmlAssetOptions;
  state?: unknown;
}

export interface HydrateOptions {
  expectedHtml?: string;
  source?: string;
  state?: unknown;
}

export interface HydrationResult extends AppHandle {
  diagnostics: SsrDiagnostic[];
}

export interface ReadHydrationStateOptions {
  remove?: boolean;
}

export type SsrRouteResult =
  | {
      status: 'matched';
      path: string;
      routeKeys: string[];
      params: Record<string, string>;
      query: RouteMatch['query'];
      component: ComponentType;
      lazy: boolean;
      match: RouteChainMatch;
    }
  | {
      status: 'redirect';
      code: 'VRSSR_ROUTE_REDIRECT';
      path: string;
      location: string;
      match: RouteChainMatch;
    }
  | {
      status: 'blocked';
      code: 'VRSSR_ROUTE_GUARD_BLOCKED';
      path: string;
      match: RouteChainMatch;
    }
  | {
      status: 'not-found';
      code: 'VRSSR_ROUTE_NOT_FOUND';
      path: string;
      diagnostics: SsrDiagnostic[];
    };

export class VanrotSsrError extends Error {
  constructor(readonly diagnostic: SsrDiagnostic) {
    super(`${diagnostic.code}: ${diagnostic.message}`);
    this.name = 'VanrotSsrError';
  }
}

export function renderToString(
  component: ServerComponentModule,
  options: RenderToStringOptions = {},
): string {
  try {
    if (!isServerComponent(component)) {
      throw new VanrotSsrError({
        code: 'VRSSR_INVALID_COMPONENT',
        message: 'Server rendering requires a component module with renderToHtml(...).',
      });
    }

    return component.renderToHtml(options.inputs ?? {}, options.slots ?? {}).html;
  } catch (error) {
    if (error instanceof VanrotSsrError) {
      throw error;
    }

    if (isBrowserApiError(error)) {
      throw new VanrotSsrError({
        code: 'VRSSR_BROWSER_API',
        message: 'Server rendering touched a browser-only API while rendering an SSR component.',
      });
    }

    throw error;
  }
}

export function renderServerComponent(
  component: ServerComponentModule,
  initialInputs: Record<string, unknown> = {},
  projectedSlots: Record<string, string> = {},
): ServerRenderResult {
  return component.renderToHtml(initialInputs, projectedSlots);
}

export function renderServerSlot(
  projectedSlots: Record<string, string>,
  name: string,
  fallback: () => string,
): string {
  return projectedSlots[name] ?? fallback();
}

export function renderDocument(options: HtmlDocumentOptions): string {
  const lang = escapeAttribute(options.lang ?? 'en');
  const title = options.title === undefined ? '' : `<title>${escapeHtml(options.title)}</title>`;
  const head = [title, ...(options.head ?? []), ...renderStyleAssets(options.assets)].filter(Boolean);
  const stateScript =
    options.state === undefined
      ? ''
      : `<script type="application/json" id="${hydrationStateScriptId}">${serializeHydrationState(
          options.state,
        )}</script>`;
  const scripts = renderScriptAssets(options.assets);
  const body = [options.body, stateScript, ...scripts].filter(Boolean).join('\n');

  return [
    '<!doctype html>',
    `<html lang="${lang}">`,
    '<head>',
    ...head,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
  ].join('\n');
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeAttribute(value: unknown): string {
  return escapeHtml(value);
}

export function serializeHydrationState(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export function readHydrationState(
  documentRef: Document,
  options: ReadHydrationStateOptions = {},
): unknown {
  const script = documentRef.getElementById(hydrationStateScriptId);

  if (script === null) {
    return undefined;
  }

  try {
    const value = JSON.parse(script.textContent ?? 'null') as unknown;

    if (options.remove === true) {
      script.remove();
    }

    return value;
  } catch {
    throw new VanrotSsrError({
      code: 'VRSSR_STATE_INVALID',
      message: 'Serialized hydration state must be valid JSON.',
      path: hydrationStateScriptId,
    });
  }
}

export function hydrate(
  component: ComponentType | HydratableComponentModule,
  target: Element,
  options: HydrateOptions = {},
): HydrationResult {
  const diagnostics =
    options.expectedHtml === undefined
      ? []
      : compareHydrationMarkup(
          options.expectedHtml,
          target,
          options.source === undefined ? {} : { source: options.source },
        );

  if (diagnostics.length > 0) {
    return {
      diagnostics,
      destroy() {},
    };
  }

  const handle = isHydratableComponent(component)
    ? component.hydrateComponent(target, options)
    : mount(component as ComponentType, target);

  return {
    diagnostics,
    destroy() {
      handle.destroy();
    },
  };
}

export function compareHydrationMarkup(
  expectedHtml: string,
  actualHost: Element,
  options: { source?: string } = {},
): SsrDiagnostic[] {
  const template = actualHost.ownerDocument.createElement('template');
  template.innerHTML = expectedHtml;

  return compareNodeList(
    Array.from(template.content.childNodes),
    Array.from(actualHost.childNodes),
    'root',
    options.source,
  );
}

export function diagnoseRouteHydration(input: {
  serverPath: string;
  clientPath: string;
}): SsrDiagnostic[] {
  if (input.serverPath === input.clientPath) {
    return [];
  }

  return [
    {
      code: 'VRSSR_ROUTE_DIVERGENCE',
      message: `Hydrated route diverged from server route: expected "${input.serverPath}" but found "${input.clientPath}".`,
      path: 'route',
      expected: input.serverPath,
      actual: input.clientPath,
    },
  ];
}

export async function resolveSsrRoute(
  routes: DefinedRouteTable,
  path: string,
): Promise<SsrRouteResult> {
  const match = matchRouteChain(routes, path);

  if (match === null) {
    return {
      status: 'not-found',
      code: 'VRSSR_ROUTE_NOT_FOUND',
      path,
      diagnostics: [
        {
          code: 'VRSSR_ROUTE_NOT_FOUND',
          message: `No Vanrot route matches "${path}".`,
          path: 'route',
          expected: path,
          actual: null,
        },
      ],
    };
  }

  const redirect = resolveRedirectRoute(match);

  if (redirect !== null) {
    return {
      status: 'redirect',
      code: 'VRSSR_ROUTE_REDIRECT',
      path,
      location: redirect,
      match,
    };
  }

  const guardDecision = await resolveGuardDecision(routes, match);

  if (guardDecision !== null) {
    if (guardDecision.kind === 'blocked') {
      return {
        status: 'blocked',
        code: 'VRSSR_ROUTE_GUARD_BLOCKED',
        path,
        match,
      };
    }

    return {
      status: 'redirect',
      code: 'VRSSR_ROUTE_REDIRECT',
      path,
      location: guardDecision.location,
      match,
    };
  }

  const leaf = match.chain[match.chain.length - 1]?.route;

  if (leaf === undefined) {
    return {
      status: 'not-found',
      code: 'VRSSR_ROUTE_NOT_FOUND',
      path,
      diagnostics: [],
    };
  }

  return {
    status: 'matched',
    path,
    routeKeys: match.chain.map((item) => item.route.key),
    params: match.params,
    query: match.query,
    component: await resolveRoutePage(leaf),
    lazy: leaf.page === undefined && leaf.loadPage !== undefined,
    match,
  };
}

export async function renderRouteToString(
  routes: DefinedRouteTable,
  path: string,
): Promise<string> {
  const route = await resolveSsrRoute(routes, path);

  if (route.status !== 'matched') {
    throw new VanrotSsrError({
      code: route.code,
      message:
        route.status === 'redirect'
          ? `SSR route "${path}" redirected to "${route.location}".`
          : `SSR route "${path}" did not resolve to a renderable page.`,
      path: 'route',
    });
  }

  return renderToString(route.component as unknown as ServerComponentModule, {
    inputs: route.params,
  });
}

function isServerComponent(value: unknown): value is ServerComponentModule {
  return (
    typeof value === 'object'
    && value !== null
    && 'renderToHtml' in value
    && typeof value.renderToHtml === 'function'
  );
}

function isHydratableComponent(value: unknown): value is HydratableComponentModule {
  return (
    typeof value === 'object'
    && value !== null
    && 'hydrateComponent' in value
    && typeof value.hydrateComponent === 'function'
  );
}

function isBrowserApiError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /\b(document|window|localStorage|sessionStorage)\b/u.test(error.message);
}

function renderStyleAssets(assets: HtmlAssetOptions | undefined): string[] {
  return (assets?.styles ?? []).map(
    (asset) => `<link rel="stylesheet" href="${escapeAttribute(resolveAssetUrl(asset, assets))}">`,
  );
}

function renderScriptAssets(assets: HtmlAssetOptions | undefined): string[] {
  return (assets?.scripts ?? []).map(
    (asset) => `<script type="module" src="${escapeAttribute(resolveAssetUrl(asset, assets))}"></script>`,
  );
}

function resolveAssetUrl(asset: string, options: HtmlAssetOptions | undefined): string {
  if (/^(?:[a-z]+:)?\/\//iu.test(asset) || asset.startsWith('/')) {
    return asset;
  }

  const basePath = options?.basePath ?? '';

  if (basePath.length === 0) {
    return asset;
  }

  return `${basePath.replace(/\/?$/u, '/')}${asset.replace(/^\//u, '')}`;
}

function compareNodeList(
  expectedNodes: readonly ChildNode[],
  actualNodes: readonly ChildNode[],
  parentPath: string,
  source: string | undefined,
): SsrDiagnostic[] {
  const diagnostics: SsrDiagnostic[] = [];
  const maxLength = Math.max(expectedNodes.length, actualNodes.length);

  for (let index = 0; index < maxLength; index += 1) {
    const expected = expectedNodes[index];
    const actual = actualNodes[index];
    const childPath = childNodePath(expected ?? actual, expectedNodes, actualNodes, parentPath, index);

    if (expected === undefined && actual !== undefined) {
      diagnostics.push(createExtraNodeDiagnostic(childPath, actual, source));
      return diagnostics;
    }

    if (expected !== undefined && actual === undefined) {
      diagnostics.push(createMissingNodeDiagnostic(childPath, expected, source));
      return diagnostics;
    }

    if (expected === undefined || actual === undefined) {
      continue;
    }

    diagnostics.push(...compareNode(expected, actual, childPath, source));

    if (diagnostics.length > 0) {
      return diagnostics;
    }
  }

  return diagnostics;
}

function compareNode(
  expected: ChildNode,
  actual: ChildNode,
  path: string,
  source: string | undefined,
): SsrDiagnostic[] {
  if (expected.nodeType !== actual.nodeType) {
    return [createNodeOrderDiagnostic(path, expected, actual, source)];
  }

  if (isElement(expected) && isElement(actual)) {
    if (expected.tagName.toLowerCase() !== actual.tagName.toLowerCase()) {
      return [createNodeOrderDiagnostic(path, expected, actual, source)];
    }

    const attributeDiagnostic = compareAttributes(expected, actual, path, source);

    if (attributeDiagnostic !== null) {
      return [attributeDiagnostic];
    }

    return compareNodeList(
      Array.from(expected.childNodes),
      Array.from(actual.childNodes),
      path,
      source,
    );
  }

  if (isText(expected) && isText(actual) && expected.data !== actual.data) {
    return [
      {
        code: 'VRSSR_TEXT_MISMATCH',
        message: `Hydration text mismatch at ${path}${sourceText(source)}.`,
        path,
        expected: expected.data,
        actual: actual.data,
        ...(source === undefined ? {} : { source }),
      },
    ];
  }

  return [];
}

function compareAttributes(
  expected: Element,
  actual: Element,
  path: string,
  source: string | undefined,
): SsrDiagnostic | null {
  for (const attribute of Array.from(expected.attributes)) {
    const actualValue = actual.getAttribute(attribute.name);

    if (actualValue === attribute.value) {
      continue;
    }

    return {
      code: 'VRSSR_ATTRIBUTE_MISMATCH',
      message: `Hydration attribute mismatch for "${attribute.name}" at ${path}${sourceText(source)}.`,
      path,
      expected: attribute.value,
      actual: actualValue,
      attribute: attribute.name,
      ...(source === undefined ? {} : { source }),
    };
  }

  return null;
}

function childNodePath(
  node: ChildNode | undefined,
  expectedNodes: readonly ChildNode[],
  actualNodes: readonly ChildNode[],
  parentPath: string,
  index: number,
): string {
  if (node === undefined) {
    return `${parentPath}/node[${index}]`;
  }

  const siblings = expectedNodes[index] === undefined ? actualNodes : expectedNodes;
  const label = nodeLabel(node);
  const matchingIndex =
    siblings.slice(0, index + 1).filter((candidate) => nodeLabel(candidate) === label).length - 1;

  return `${parentPath}/${label}[${matchingIndex}]`;
}

function createMissingNodeDiagnostic(
  path: string,
  expected: ChildNode,
  source: string | undefined,
): SsrDiagnostic {
  return {
    code: 'VRSSR_MISSING_NODE',
    message: `Hydration missing node at ${path}${sourceText(source)}.`,
    path,
    expected: describeNode(expected),
    actual: null,
    ...(source === undefined ? {} : { source }),
  };
}

function createExtraNodeDiagnostic(
  path: string,
  actual: ChildNode,
  source: string | undefined,
): SsrDiagnostic {
  return {
    code: 'VRSSR_EXTRA_NODE',
    message: `Hydration extra node at ${path}${sourceText(source)}.`,
    path,
    expected: null,
    actual: describeNode(actual),
    ...(source === undefined ? {} : { source }),
  };
}

function createNodeOrderDiagnostic(
  path: string,
  expected: ChildNode,
  actual: ChildNode,
  source: string | undefined,
): SsrDiagnostic {
  return {
    code: 'VRSSR_NODE_ORDER_MISMATCH',
    message: `Hydration node order mismatch at ${path}${sourceText(source)}.`,
    path,
    expected: describeNode(expected),
    actual: describeNode(actual),
    ...(source === undefined ? {} : { source }),
  };
}

function sourceText(source: string | undefined): string {
  return source === undefined ? '' : ` in ${source}`;
}

function nodeLabel(node: ChildNode): string {
  if (isElement(node)) {
    return node.tagName.toLowerCase();
  }

  if (isText(node)) {
    return '#text';
  }

  return `node-${node.nodeType}`;
}

function describeNode(node: ChildNode): string {
  return nodeLabel(node);
}

function isElement(node: ChildNode): node is Element {
  return node.nodeType === 1;
}

function isText(node: ChildNode): node is Text {
  return node.nodeType === 3;
}

function resolveRedirectRoute(match: RouteChainMatch): string | null {
  const leaf = match.chain[match.chain.length - 1]?.route;

  if (leaf?.kind !== 'redirect') {
    return null;
  }

  const redirect = leaf.redirect;

  if (redirect === undefined) {
    return null;
  }

  const input = buildRedirectInput(
    redirect.input,
    redirect.params?.(match.params),
    redirect.queryInput?.(match.query),
  );

  return buildRouteUrl(redirect.to, input);
}

function buildRedirectInput(
  baseInput: RouteUrlInput | undefined,
  params: RouteUrlInput['params'],
  query: RouteUrlInput['query'],
): RouteUrlInput {
  return {
    params: { ...(baseInput?.params ?? {}), ...(params ?? {}) },
    query: { ...(baseInput?.query ?? {}), ...(query ?? {}) },
  };
}

async function resolveGuardDecision(
  routes: DefinedRouteTable,
  match: RouteChainMatch,
): Promise<{ kind: 'blocked' } | { kind: 'redirect'; location: string } | null> {
  const leaf = match.chain[match.chain.length - 1];

  if (leaf === undefined) {
    return null;
  }

  const context: RouteGuardContext = {
    to: leaf,
    from: null,
  };

  for (const routeMatch of match.chain) {
    const guards = normalizeGuards(routeMatch.route);

    for (const guard of guards) {
      const decision = normalizeGuardResult(await guard(context), routes);

      if (decision !== null) {
        return decision;
      }
    }
  }

  return null;
}

function normalizeGuards(route: DefinedRoute): RouteGuard[] {
  if (route.canEnter === undefined) {
    return [];
  }

  if (Array.isArray(route.canEnter)) {
    return [...route.canEnter];
  }

  return [route.canEnter as RouteGuard];
}

function normalizeGuardResult(
  result: unknown,
  routes: DefinedRouteTable,
): { kind: 'blocked' } | { kind: 'redirect'; location: string } | null {
  if (result === true) {
    return null;
  }

  if (result === false) {
    return { kind: 'blocked' };
  }

  if (isStructuredRouteTarget(result)) {
    return {
      kind: 'redirect',
      location: buildRouteUrl(resolveGuardTarget(result.route, routes), result.input),
    };
  }

  if (isRouteRefCandidate(result)) {
    return {
      kind: 'redirect',
      location: buildRouteUrl(resolveGuardTarget(result, routes), {}),
    };
  }

  return null;
}

function isStructuredRouteTarget(
  value: unknown,
): value is Extract<RouteRedirectTarget, { kind: 'route-target' }> {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'route-target';
}

function isRouteRefCandidate(value: unknown): value is RouteRef {
  return typeof value === 'object' && value !== null && 'definition' in value;
}

function resolveGuardTarget(target: RouteRef, routes: DefinedRouteTable): DefinedRoute {
  for (const route of Object.values(routes)) {
    if (route.ref === target) {
      return route;
    }
  }

  throw new VanrotSsrError({
    code: 'VRSSR_ROUTE_NOT_FOUND',
    message: 'Guard returned a route that is not defined in the SSR route table.',
    path: 'route',
  });
}
