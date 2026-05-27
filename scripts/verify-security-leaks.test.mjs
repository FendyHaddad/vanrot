import { describe, expect, it } from 'vitest';
import {
  formatSecurityLeakFailures,
  redactSecretLine,
  scanText,
} from './verify-security-leaks.mjs';

describe('verify-security-leaks', () => {
  it('detects provider keys and redacts long tokens', () => {
    const providerName = ['OPENAI', 'API', 'KEY'].join('_');
    const providerPrefix = 'sk-proj-';
    const providerSecret = `${providerPrefix}abcdefghijklmnopqrstuvwxyz123456`;
    const hits = scanText('demo.env', `${providerName}="${providerSecret}"`);

    expect(hits).toEqual([
      {
        file: 'demo.env',
        line: 1,
        type: 'openai-key',
        snippet: 'OPENAI_API_KEY="sk-proj-..."',
      },
      {
        file: 'demo.env',
        line: 1,
        type: 'generic-secret-assignment',
        snippet: 'OPENAI_API_KEY="sk-proj-..."',
      },
    ]);
  });

  it('does not treat normal source tokens as secrets', () => {
    expect(scanText('load.ts', "const exportToken = 'export default';")).toEqual([]);
  });

  it('detects secrets in hidden file paths', () => {
    const providerName = ['ANTHROPIC', 'API', 'KEY'].join('_');
    const providerSecret = `${'sk-ant-'}abcdefghijklmnopqrstuvwxyz123456`;

    expect(scanText('.env.local', `${providerName}="${providerSecret}"`)).toEqual([
      {
        file: '.env.local',
        line: 1,
        type: 'anthropic-key',
        snippet: 'ANTHROPIC_API_KEY="sk-ant-a..."',
      },
      {
        file: '.env.local',
        line: 1,
        type: 'generic-secret-assignment',
        snippet: 'ANTHROPIC_API_KEY="sk-ant-a..."',
      },
    ]);
  });

  it('formats readable failures', () => {
    expect(
      formatSecurityLeakFailures([
        {
          file: 'demo.env',
          line: 1,
          type: 'openai-key',
          snippet: 'OPENAI_API_KEY="sk-proj-..."',
        },
      ]),
    ).toBe(
      'Security leak verification failed.\n- demo.env:1 openai-key OPENAI_API_KEY="sk-proj-..."\nRemove committed secrets or replace them with documented placeholders.',
    );
  });

  it('redacts long opaque values', () => {
    expect(redactSecretLine('token="abcdefghijklmnop123456"')).toBe('token="abcdefgh..."');
  });
});
