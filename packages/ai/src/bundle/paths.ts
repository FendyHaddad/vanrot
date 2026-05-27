export const aiBundleRoot = 'docs/ai';
export const aiBundleKnowledgeDirectory = `${aiBundleRoot}/knowledge`;
export const aiBundleSkillDirectory = `${aiBundleRoot}/skill`;

export const defaultAiBundlePaths = {
  root: aiBundleRoot,
  manifest: `${aiBundleRoot}/manifest.json`,
  index: `${aiBundleRoot}/index.json`,
  rules: `${aiBundleRoot}/rules.md`,
  knowledge: aiBundleKnowledgeDirectory,
  skill: aiBundleSkillDirectory,
} as const;
