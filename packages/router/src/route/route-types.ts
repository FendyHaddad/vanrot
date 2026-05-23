import type { ComponentType, Signal } from '@vanrot/runtime';
import type { RouteDiagnostic } from './route-diagnostics.js';

export type RouteParams = Record<string, string>;
export type RouteQueryValue = string | number | boolean | readonly string[] | null | undefined;
export type RouteQuery = Record<string, RouteQueryValue>;

export type RoutePageModule = ComponentType;
export type RouteLayoutModule = ComponentType;

export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;
export type RouteLayoutLoader = () => Promise<RouteLayoutModule | { default: RouteLayoutModule }>;

export type RouteKind = 'page' | 'layout' | 'redirect';

export interface RouteNavMetadata {
  kind: 'primary' | 'hidden';
}

export const routePreloadPolicyKinds = {
  none: 'none',
  intent: 'intent',
} as const;

export type RoutePreloadPolicyKind =
  (typeof routePreloadPolicyKinds)[keyof typeof routePreloadPolicyKinds];

export interface RoutePreloadPolicy {
  readonly kind: RoutePreloadPolicyKind;
}

export const routeKeepAlivePolicyKinds = {
  none: 'none',
  sessionDay: 'sessionDay',
} as const;

export type RouteKeepAlivePolicyKind =
  (typeof routeKeepAlivePolicyKinds)[keyof typeof routeKeepAlivePolicyKinds];

export interface RouteKeepAlivePolicy {
  readonly kind: RouteKeepAlivePolicyKind;
}

export const defaultRoutePreloadPolicy: RoutePreloadPolicy = {
  kind: routePreloadPolicyKinds.none,
};

export const defaultRouteKeepAlivePolicy: RouteKeepAlivePolicy = {
  kind: routeKeepAlivePolicyKinds.none,
};

export interface RouteQueryDefinition {
  default?: RouteQueryValue;
  array?: boolean;
}

export type RouteQueryDefinitionMap = Record<string, RouteQueryDefinition>;

export interface RouteBreadcrumbDefinition {
  kind: 'root' | 'parent';
  parent?: RouteRef;
}

export interface RouteDefinitionBase {
  path: string;
  label: string;
  nav?: RouteNavMetadata;
  query?: RouteQueryDefinitionMap;
  breadcrumb?: RouteBreadcrumbDefinition;
  canEnter?: RouteGuardInput;
}

export interface RoutePerformancePolicyDefinition {
  preload?: RoutePreloadPolicy;
  keepAlive?: RouteKeepAlivePolicy;
}

export interface RouteGuardContext {
  readonly to: RouteMatch;
  readonly from: RouteMatch | null;
}

export type RouteRedirectTarget =
  | RouteRef
  | {
      readonly kind: 'route-target';
      readonly route: RouteRef;
      readonly input: RouteUrlInput;
    };

export type RouteGuardResult =
  | boolean
  | RouteRedirectTarget
  | Promise<boolean | RouteRedirectTarget>;

export type RouteGuard = (context: RouteGuardContext) => RouteGuardResult;
export type RouteGuardInput = RouteGuard | readonly RouteGuard[];

export type PageRouteDefinition = RouteDefinitionBase &
  RoutePerformancePolicyDefinition &
  (
    | {
        kind?: 'page';
        page: RoutePageModule;
        loadPage?: never;
        layout?: never;
        loadLayout?: never;
      }
    | {
        kind?: 'page';
        page?: never;
        loadPage: RoutePageLoader;
        layout?: never;
        loadLayout?: never;
      }
  );

export type LayoutRouteDefinition = RouteDefinitionBase &
  RoutePerformancePolicyDefinition &
  (
    | {
        kind?: 'layout';
        page?: never;
        loadPage?: never;
        layout: RouteLayoutModule;
        loadLayout?: never;
      }
    | {
        kind?: 'layout';
        page?: never;
        loadPage?: never;
        layout?: never;
        loadLayout: RouteLayoutLoader;
      }
  );

export interface RedirectRouteDefinition extends RouteDefinitionBase {
  kind?: 'redirect';
  to: RouteRedirectTarget;
  params?: (params: RouteParams) => RouteParams;
  queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  page?: never;
  loadPage?: never;
  layout?: never;
  loadLayout?: never;
  preload?: never;
  keepAlive?: never;
}

export interface RouteDefinition extends RouteDefinitionBase {
  kind?: RouteKind;
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
  layout?: RouteLayoutModule;
  loadLayout?: RouteLayoutLoader;
  to?: RouteRedirectTarget;
  params?: (params: RouteParams) => RouteParams;
  queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  preload?: RoutePreloadPolicy;
  keepAlive?: RouteKeepAlivePolicy;
}

export type RouteInput = Record<string, RouteDefinition | RouteRef>;

export interface RouteRef {
  readonly kind: RouteKind;
  readonly definition: RouteDefinition;
  readonly parent?: RouteRef;
  readonly children: RouteRef[];
  page(definition: PageRouteDefinition): RouteRef;
  layout(definition: LayoutRouteDefinition): RouteRef;
  redirect(definition: RedirectRouteDefinition): RouteRef;
}

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
  kind: RouteKind;
  ref?: RouteRef;
  fullPath: string;
  parent?: DefinedRoute;
  children: DefinedRoute[];
  breadcrumbParent?: DefinedRoute;
  preload: RoutePreloadPolicy;
  keepAlive: RouteKeepAlivePolicy;
  redirect?: {
    to: DefinedRoute;
    input?: RouteUrlInput;
    params?: (params: RouteParams) => RouteParams;
    queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  };
  diagnostics: RouteDiagnostic[];
};

export type DefinedRouteTable<Input extends RouteInput = RouteInput> = {
  readonly [Key in keyof Input & string]: DefinedRoute<Key>;
};

export interface RouteMatch {
  route: DefinedRoute;
  params: RouteParams;
  query: Record<string, string | string[]>;
  path: string;
}

export interface RouteChainMatch {
  chain: RouteMatch[];
  params: RouteParams;
  query: Record<string, string | string[]>;
  path: string;
}

export interface RouteUrlInput {
  params?: RouteParams;
  query?: RouteQuery;
}

export interface RouteBreadcrumb {
  route: DefinedRoute;
  label: string;
  href: string;
}

export type RouteParamsSignal = Signal<RouteParams>;
