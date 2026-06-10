import { basename } from 'node:path';

export const forgeRoleSuffix = {
  page: 'page',
  component: 'component',
  layout: 'layout',
  widget: 'widget',
  form: 'form',
} as const;

export type ForgeRoleSuffix = (typeof forgeRoleSuffix)[keyof typeof forgeRoleSuffix];
export type ForgeRoleFileKind = 'script' | 'template' | 'style';

export interface ForgeRoleFileClassification {
  path: string;
  role: ForgeRoleSuffix;
  kind: ForgeRoleFileKind;
  ownerPath: string;
}

const forgeRoleFileExtension = {
  script: 'ts',
  template: 'html',
  style: 'css',
} as const;

const knownForgeRoleSuffixes = Object.values(forgeRoleSuffix);

export function classifyForgeFileRole(filePath: string): ForgeRoleFileClassification | undefined {
  const normalizedPath = toPosixPath(filePath);
  const fileName = basename(normalizedPath);

  for (const role of knownForgeRoleSuffixes) {
    const scriptSuffix = `.${role}.${forgeRoleFileExtension.script}`;
    const templateSuffix = `.${role}.${forgeRoleFileExtension.template}`;
    const styleSuffix = `.${role}.${forgeRoleFileExtension.style}`;

    if (fileName.endsWith(scriptSuffix)) {
      return {
        path: normalizedPath,
        role,
        kind: 'script',
        ownerPath: normalizedPath,
      };
    }

    if (fileName.endsWith(templateSuffix)) {
      return {
        path: normalizedPath,
        role,
        kind: 'template',
        ownerPath: normalizedPath.slice(0, -templateSuffix.length) + scriptSuffix,
      };
    }

    if (fileName.endsWith(styleSuffix)) {
      return {
        path: normalizedPath,
        role,
        kind: 'style',
        ownerPath: normalizedPath.slice(0, -styleSuffix.length) + scriptSuffix,
      };
    }
  }

  return undefined;
}

export function findOwnerRoleFile(filePath: string): string | undefined {
  return classifyForgeFileRole(filePath)?.ownerPath;
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
