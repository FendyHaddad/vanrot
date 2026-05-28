import { defaultSourceRoot } from '@vanrot/config';

export function resolveRoutesPath(projectRoot: string): string {
  const root = projectRoot.replace(/\/+$/, '');
  return `${root}/${defaultSourceRoot}/routes.ts`;
}
