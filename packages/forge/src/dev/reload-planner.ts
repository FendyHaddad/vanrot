import { basename } from 'node:path';
import { classifyForgeFileRole } from '../core/file-roles.js';

export type ForgeReloadAction =
  | 'route-refresh'
  | 'style-patch'
  | 'component-refresh'
  | 'layout-refresh'
  | 'server-restart'
  | 'full-reload';

export interface ForgeReloadPlan {
  action: ForgeReloadAction;
  filePath: string;
  ownerPath?: string;
}

const configFileName = 'vanrot.config.ts';

export function planForgeReload(filePath: string): ForgeReloadPlan {
  const normalizedPath = filePath.replaceAll('\\', '/');

  if (basename(normalizedPath) === configFileName) {
    return {
      action: 'server-restart',
      filePath: normalizedPath,
    };
  }

  const classification = classifyForgeFileRole(normalizedPath);
  if (classification === undefined) {
    return {
      action: 'full-reload',
      filePath: normalizedPath,
    };
  }

  if (classification.role === 'layout') {
    return {
      action: 'layout-refresh',
      filePath: normalizedPath,
      ownerPath: classification.ownerPath,
    };
  }

  if (classification.kind === 'style') {
    return {
      action: 'style-patch',
      filePath: normalizedPath,
      ownerPath: classification.ownerPath,
    };
  }

  if (classification.role === 'page') {
    return {
      action: 'route-refresh',
      filePath: normalizedPath,
      ownerPath: classification.ownerPath,
    };
  }

  return {
    action: 'component-refresh',
    filePath: normalizedPath,
    ownerPath: classification.ownerPath,
  };
}
