import type { ProjectGraphEdge } from '@vanrot/devtools';
import { readFile } from 'node:fs/promises';
import { dirname, normalize, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

export async function discoverImportGraph(
  cwd: string,
  projectFiles: string[],
): Promise<ProjectGraphEdge[]> {
  const edges: ProjectGraphEdge[] = [];

  for (const projectFile of projectFiles) {
    const absolutePath = resolve(cwd, projectFile);
    const source = await readFile(absolutePath, 'utf8');
    const sourceFile = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.Latest, true);

    sourceFile.forEachChild((node) => {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }

      const modulePath = node.moduleSpecifier.text;
      if (!modulePath.startsWith('.')) {
        return;
      }

      const target = toProjectPath(cwd, resolve(dirname(absolutePath), `${modulePath}.ts`));
      edges.push({
        id: `component:${projectFile}->import:${target}:file-imports-file`,
        from: `component:${projectFile}`,
        to: `import:${target}`,
        kind: 'file-imports-file',
      });
    });
  }

  return edges.sort((left, right) => left.id.localeCompare(right.id));
}

function toProjectPath(cwd: string, filePath: string): string {
  return relative(cwd, normalize(filePath)).split(sep).join('/');
}
