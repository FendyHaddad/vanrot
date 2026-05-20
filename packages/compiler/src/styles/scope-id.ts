import { createHash } from 'node:crypto';

export function createScopeAttribute(componentPath: string, styleSource: string): string {
  const normalizedPath = componentPath.replaceAll('\\', '/');
  const hash = createHash('sha256')
    .update(normalizedPath)
    .update('\0')
    .update(styleSource)
    .digest('hex')
    .slice(0, 6);

  return `data-vr-${hash}`;
}
