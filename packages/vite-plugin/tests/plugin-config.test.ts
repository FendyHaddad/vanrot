import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Plugin, UserConfig } from 'vite';
import vanrot from '@/index.js';

type ConfigHook = (
  this: unknown,
  config: UserConfig,
  env: { command: 'build' | 'serve'; mode: string },
) => UserConfig | Promise<UserConfig>;

function getConfigHook(plugin: Plugin): ConfigHook {
  const hook = plugin.config;

  if (typeof hook === 'function') {
    return hook as ConfigHook;
  }

  if (hook !== undefined && typeof hook === 'object' && 'handler' in hook) {
    return hook.handler as ConfigHook;
  }

  throw new Error('Expected config hook.');
}

describe('vanrot plugin config', () => {
  it('injects normalized router navigation polish config', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-vite-router-config-'));
    await writeFile(
      join(root, 'vanrot.config.ts'),
      [
        'export default {',
        '  router: {',
        '    navigationPolish: { title: false, meta: false, scroll: false, focus: false },',
        '    diagnostics: { missingTitle: "off", missingMetaDescription: "error" },',
        '  },',
        '};',
        '',
      ].join('\n'),
    );

    const config = await getConfigHook(vanrot({ root })).call(
      {} as never,
      { root },
      { command: 'serve', mode: 'development' },
    );

    expect(config).toMatchObject({
      define: {
        __VANROT_ROUTER_NAVIGATION_POLISH__: JSON.stringify({
          navigationPolish: { title: false, meta: false, scroll: false, focus: false },
          diagnostics: { missingTitle: 'off', missingMetaDescription: 'error' },
        }),
      },
    });
  });
});
