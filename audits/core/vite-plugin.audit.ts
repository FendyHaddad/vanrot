import { describe, expect, test } from 'vitest';
import { handleVanrotHotUpdate } from '../../packages/vite-plugin/src/hot-update.js';
import { auditCase, auditSlice } from './audit-slices.js';

interface SentMessage {
  type: string;
}

interface FakeModule {
  id: string;
}

describe(auditSlice.vitePlugin, function () {
  test(
    auditCase(
      auditSlice.vitePlugin,
      'template edits return the owner module for state-preserving HMR instead of forcing a full reload',
    ),
    async function () {
      const ownerModule: FakeModule = {
        id: '/repo/src/app/app.component.ts',
      };
      const sentMessages: SentMessage[] = [];
      const invalidatedModules: FakeModule[] = [];

      const result = await handleVanrotHotUpdate({
        file: '/repo/src/app/app.component.html',
        timestamp: 123,
        server: {
          config: {
            root: '/repo',
          },
          ws: {
            send(message: SentMessage): void {
              sentMessages.push(message);
            },
          },
          moduleGraph: {
            onFileChange(): void {},
            getModulesByFile(): Set<FakeModule> {
              return new Set([ownerModule]);
            },
            getModuleById(): FakeModule {
              return ownerModule;
            },
            async getModuleByUrl(): Promise<FakeModule> {
              return ownerModule;
            },
            invalidateModule(module: FakeModule): void {
              invalidatedModules.push(module);
            },
          },
        },
      } as unknown as Parameters<typeof handleVanrotHotUpdate>[0]);

      expect(sentMessages).not.toContainEqual({ type: 'full-reload' });
      expect(result).toEqual([ownerModule]);
      expect(invalidatedModules).toEqual([ownerModule]);
    },
  );
});
