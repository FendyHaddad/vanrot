export const vanrotTemplateRules = {
  extension: '.html',
  excludeExact: ['index.html', 'panel.html', 'devtools.html', 'landing-page-design.html'],
  excludeSuffix: ['-presentation.html'],
} as const;

export function isVanrotTemplateFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const base = normalized.slice(normalized.lastIndexOf('/') + 1);
  if (!base.endsWith(vanrotTemplateRules.extension)) return false;
  if ((vanrotTemplateRules.excludeExact as readonly string[]).includes(base)) return false;
  for (const suffix of vanrotTemplateRules.excludeSuffix) {
    if (base.endsWith(suffix)) return false;
  }
  return true;
}
