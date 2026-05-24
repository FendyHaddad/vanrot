import { getCurrentMatch } from '@vanrot/router';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

const routeKeyToPrimitive = {
  uiButton: 'button',
  uiCard: 'card',
  uiBadge: 'badge',
  uiAvatar: 'avatar',
  uiAlert: 'alert',
  uiLoader: 'loader',
  uiSkeleton: 'skeleton',
  uiSeparator: 'separator',
} as const;

type ComponentRouteKey = keyof typeof routeKeyToPrimitive;

export class ComponentArticlePage {
  doc(): ComponentDoc {
    const routeKey = getCurrentMatch()?.route.key;
    const primitive = isComponentRouteKey(routeKey) ? routeKeyToPrimitive[routeKey] : 'button';
    const doc = componentDocs.find((candidate) => candidate.primitive === primitive);

    if (doc !== undefined) {
      return doc;
    }

    return firstComponentDoc();
  }
}

function isComponentRouteKey(value: string | undefined): value is ComponentRouteKey {
  return value !== undefined && value in routeKeyToPrimitive;
}

function firstComponentDoc(): ComponentDoc {
  const [first] = componentDocs;

  if (first === undefined) {
    throw new Error('Vanrot site requires at least one component doc.');
  }

  return first;
}
