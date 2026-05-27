export function formatAiDocsFailures(failures) {
  return [
    'AI docs verification failed.',
    ...failures.map((failure) => `- ${failure}`),
    'Run `vr ai build` and commit the refreshed docs/ai bundle.',
  ].join('\n');
}

export async function verifyAiDocs(root = process.cwd()) {
  const { verifyAiKnowledgeBundle } = await import('../packages/ai/dist/index.js');
  const result = await verifyAiKnowledgeBundle(root);

  if (result.ok) {
    return { exitCode: 0, message: 'AI docs verification passed.' };
  }

  return { exitCode: 1, message: formatAiDocsFailures(result.failures) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifyAiDocs();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
