export interface CreateSkillPackageFilesOptions {
  vanrotVersion: string;
  manifestPath: string;
  rulesPath: string;
}

export interface SkillPackageFile {
  path: string;
  content: string;
}

export function createSkillPackageFiles(
  options: CreateSkillPackageFilesOptions,
): SkillPackageFile[] {
  return [
    {
      path: 'skill/SKILL.md',
      content: [
        '---',
        'name: vanrot',
        'description: Use the official Vanrot AI knowledge bundle for framework rules, commands, diagnostics, examples, and conventions.',
        '---',
        '',
        '# Vanrot',
        '',
        'Use the official Vanrot AI knowledge bundle before answering Vanrot framework questions or editing Vanrot apps.',
        '',
        `- Manifest: \`${options.manifestPath}\``,
        `- Rules: \`${options.rulesPath}\``,
        `- Version: \`${options.vanrotVersion}\``,
        '',
        'Prefer the generated bundle over source-code guessing. If the manifest is stale, ask the user to run `vr ai build`.',
        '',
      ].join('\n'),
    },
    {
      path: 'skill/skill.json',
      content: `${JSON.stringify(
        {
          name: 'vanrot',
          version: options.vanrotVersion,
          manifest: options.manifestPath,
          rules: options.rulesPath,
        },
        null,
        2,
      )}\n`,
    },
  ];
}
