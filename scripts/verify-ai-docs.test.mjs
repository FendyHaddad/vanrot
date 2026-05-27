import { describe, expect, it } from 'vitest';
import { formatAiDocsFailures } from './verify-ai-docs.mjs';

describe('verify-ai-docs', () => {
  it('formats readable failures', () => {
    expect(formatAiDocsFailures(['AI bundle is stale: source fingerprint changed.'])).toBe(
      'AI docs verification failed.\n- AI bundle is stale: source fingerprint changed.\nRun `vr ai build` and commit the refreshed docs/ai bundle.',
    );
  });
});
