import type { CompiledComponentModule, Signal } from '@vanrot/runtime';

export type RouteParams = Record<string, string>;

export type RoutePageModule = CompiledComponentModule;

export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;

export interface RouteDefinition {
  path: string;
  label: string;
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
}

export type RouteInput = Record<string, RouteDefinition>;

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
};

export type DefinedRouteTable<Input extends RouteInput = RouteInput> = {
  readonly [Key in keyof Input & string]: DefinedRoute<Key> & Input[Key];
};

export interface RouteMatch {
  route: DefinedRoute;
  params: RouteParams;
  path: string;
}

export type RouteParamsSignal = Signal<RouteParams>;
