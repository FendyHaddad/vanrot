import type { ComponentType, Signal } from '@vanrot/runtime';
import type { RouteDiagnostic } from './route-diagnostics.js';

export type RouteParams = Record<string, string>;
export type RouteQueryValue = string | number | boolean | readonly string[] | null | undefined;
export type RouteQuery = Record<string, RouteQueryValue>;

export type RoutePageModule = ComponentType;
export type RouteLayoutModule = ComponentType;

export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;
export type RouteLayoutLoader = () => Promise<RouteLayoutModule | { default: RouteLayoutModule }>;

export type RouteKind = 'page' | 'layout';

export interface RouteNavMetadata {
  kind: 'primary' | 'hidden';
}

export interface RouteQueryDefinition {
  default?: RouteQueryValue;
  array?: boolean;
}

export type RouteQueryDefinitionMap = Record<string, RouteQueryDefinition>;

export interface RouteBreadcrumbDefinition {
  kind: 'root' | 'parent';
  parent?: RouteRef;
}

export interface RouteDefinition {
  path: string;
  label: string;
  kind?: RouteKind;
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
  layout?: RouteLayoutModule;
  loadLayout?: RouteLayoutLoader;
  nav?: RouteNavMetadata;
  query?: RouteQueryDefinitionMap;
  breadcrumb?: RouteBreadcrumbDefinition;
}

export type RouteInput = Record<string, RouteDefinition | RouteRef>;

export interface RouteRef {
  readonly kind: RouteKind;
  readonly definition: RouteDefinition;
  readonly parent?: RouteRef;
  readonly children: RouteRef[];
  page(definition: RouteDefinition): RouteRef;
  layout(definition: RouteDefinition): RouteRef;
}

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
  kind: RouteKind;
  fullPath: string;
  parent?: DefinedRoute;
  children: DefinedRoute[];
  breadcrumbParent?: DefinedRoute;
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
