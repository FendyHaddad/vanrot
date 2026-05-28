import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { vanrotTemplateRules } from '../src/template-files.js';

const here = dirname(fileURLToPath(import.meta.url));
const artifactPath = join(here, '..', 'dist', 'template-globs.json');

const kotlinMirror = {
  extension: '.html',
  excludeExact: ['index.html', 'panel.html', 'devtools.html', 'landing-page-design.html'],
  excludeSuffix: ['-presentation.html'],
};

describe('template-globs artifact', () => {
  it('matches the canonical TS rule', () => {
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as typeof kotlinMirror;
    expect(artifact.extension).toBe(vanrotTemplateRules.extension);
    expect(artifact.excludeExact).toEqual([...vanrotTemplateRules.excludeExact]);
    expect(artifact.excludeSuffix).toEqual([...vanrotTemplateRules.excludeSuffix]);
  });

  it('matches the Kotlin plugin mirror', () => {
    expect(kotlinMirror.extension).toBe(vanrotTemplateRules.extension);
    expect(kotlinMirror.excludeExact).toEqual([...vanrotTemplateRules.excludeExact]);
    expect(kotlinMirror.excludeSuffix).toEqual([...vanrotTemplateRules.excludeSuffix]);
  });
});
