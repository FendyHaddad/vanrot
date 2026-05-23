import { relative } from 'node:path';
import type { HmrContext, ModuleNode } from 'vite';

const roleSuffixes = ['component', 'page', 'layout', 'button'] as const;

export function findOwnerComponentPath(filePath: string): string | undefined {
  for (const role of roleSuffixes) {
    if (filePath.endsWith(`.${role}.html`)) {
      return filePath.replace(new RegExp(`\\.${role}\\.html$`), `.${role}.ts`);
    }

    if (filePath.endsWith(`.${role}.css`)) {
      return filePath.replace(new RegExp(`\\.${role}\\.css$`), `.${role}.ts`);
    }
  }

  return undefined;
}

export async function handleVanrotHotUpdate(ctx: HmrContext): Promise<ModuleNode[] | undefined> {
  const ownerComponentPath = findOwnerComponentPath(ctx.file);

  if (ownerComponentPath === undefined) {
    return undefined;
  }

  ctx.server.moduleGraph.onFileChange?.(ownerComponentPath);

  const ownerModules = await findOwnerModules(ctx, ownerComponentPath);

  if (ownerModules.length === 0) {
    ctx.server.ws.send({ type: 'full-reload' });
    return [];
  }

  const invalidatedModules = new Set<ModuleNode>();

  for (const ownerModule of ownerModules) {
    ctx.server.moduleGraph.invalidateModule(
      ownerModule,
      invalidatedModules,
      ctx.timestamp,
      true,
    );
  }

  return ownerModules;
}

async function findOwnerModules(
  ctx: HmrContext,
  ownerComponentPath: string,
): Promise<ModuleNode[]> {
  const modules = new Set<ModuleNode>();
  const modulesByFile = ctx.server.moduleGraph.getModulesByFile?.(ownerComponentPath);
  const ownerModuleById = ctx.server.moduleGraph.getModuleById(ownerComponentPath);
  const ownerModuleByUrl = await getOwnerModuleByUrl(ctx, ownerComponentPath);

  if (modulesByFile !== undefined) {
    for (const module of modulesByFile) {
      modules.add(module);
    }
  }

  if (ownerModuleById !== undefined) {
    modules.add(ownerModuleById);
  }

  if (ownerModuleByUrl !== undefined) {
    modules.add(ownerModuleByUrl);
  }

  return [...modules];
}

async function getOwnerModuleByUrl(
  ctx: HmrContext,
  ownerComponentPath: string,
): Promise<ModuleNode | undefined> {
  const root = ctx.server.config?.root;

  if (root === undefined) {
    return undefined;
  }

  const ownerUrl = `/${relative(root, ownerComponentPath).replaceAll('\\', '/')}`;
  return (await ctx.server.moduleGraph.getModuleByUrl(ownerUrl)) ?? undefined;
}
