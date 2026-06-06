import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildEditorIntelligence } from './editor-intelligence.js';
import { loadWorkspaceIndex } from './workspace.js';

export const editorIntelligenceRelativePath = '.vanrot/editor-intelligence.json';

export function exportEditorIntelligence(projectRoot: string): string {
  const outputPath = join(projectRoot, editorIntelligenceRelativePath);
  const tempPath = `${outputPath}.tmp`;
  const intelligence = buildEditorIntelligence(loadWorkspaceIndex(projectRoot));

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(tempPath, `${JSON.stringify(intelligence, null, 2)}\n`);
  renameSync(tempPath, outputPath);

  return outputPath;
}
