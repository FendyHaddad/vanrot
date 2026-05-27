import { createSkillPackageFiles } from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('Skill.sh package generator', () => {
  it('creates skill files that point to the official bundle', () => {
    const files = createSkillPackageFiles({
      vanrotVersion: '0.0.0',
      manifestPath: 'docs/ai/manifest.json',
      rulesPath: 'docs/ai/rules.md',
    });

    expect(files.find((file) => file.path === 'skill/SKILL.md')?.content).toContain(
      'Use the official Vanrot AI knowledge bundle',
    );
    expect(files.find((file) => file.path === 'skill/skill.json')?.content).toContain(
      '"name": "vanrot"',
    );
  });
});
