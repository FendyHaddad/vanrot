import {
  normalizeVanrotConfig,
  validateVanrotConfig,
  vanrotAiRuleSection,
} from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('AI rules config', () => {
  it('normalizes default provider-neutral AI rule sections', () => {
    const config = normalizeVanrotConfig({});

    expect(config.ai.rules.enabledSections).toEqual([
      vanrotAiRuleSection.projectRules,
      vanrotAiRuleSection.commands,
      vanrotAiRuleSection.fileConventions,
    ]);
    expect(config.ai.rules.customSections).toEqual([]);
  });

  it('reports unknown AI rule sections', () => {
    const diagnostics = validateVanrotConfig({
      ai: {
        rules: {
          enabledSections: ['project-rules', 'made-up-section'],
        },
      },
    });

    expect(diagnostics).toContainEqual({
      code: 'VRCFG011',
      severity: 'error',
      message: 'Unknown ai.rules.enabledSections entry: made-up-section',
      suggestion: 'Use project-rules, commands, file-conventions, or custom section ids declared in ai.rules.customSections.',
    });
  });
});
