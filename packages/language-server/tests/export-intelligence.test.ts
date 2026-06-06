import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportEditorIntelligence } from '../src/project/export-intelligence.js';

describe('exportEditorIntelligence', () => {
  it('writes .vanrot/editor-intelligence.json with schema version 1', () => {
    const root = mkdtempSync(join(tmpdir(), 'vanrot-export-intelligence-'));

    const outputPath = exportEditorIntelligence(root);
    const parsed = JSON.parse(readFileSync(outputPath, 'utf8')) as { schemaVersion?: unknown };

    expect(outputPath).toBe(join(root, '.vanrot/editor-intelligence.json'));
    expect(existsSync(outputPath)).toBe(true);
    expect(parsed.schemaVersion).toBe(1);
  });
});
