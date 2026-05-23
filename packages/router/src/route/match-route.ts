import { matchRouteChain } from './match-route-chain.js';
import type { DefinedRouteTable, RouteMatch } from './route-types.js';

export function matchRoute(routes: DefinedRouteTable, path: string): RouteMatch | null {
  const chain = matchRouteChain(routes, path);

  if (chain === null) {
    return null;
  }

  return chain.chain[chain.chain.length - 1] ?? null;
}
