import { describe, expect, it } from 'vitest';
import {
  generatedVanrotSeoConfigSource,
  removeGeneratedVanrotSeoConfigDomain,
  removeVanrotConfigDomainIfGenerated,
  upsertVanrotConfigDomain,
  upsertVanrotSeoConfigDomain,
} from '../src/index.js';

describe('upsertVanrotConfigDomain', () => {
  it('inserts missing ui domain and stays idempotent on repeated calls', () => {
    const source = [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1964 },',
      '});',
      '',
    ].join('\n');

    const once = upsertVanrotConfigDomain(source, 'ui', '{ prefix: "ui" }');
    const twice = upsertVanrotConfigDomain(once, 'ui', '{ prefix: "ui" }');

    expect(once).toContain('ui: { prefix: "ui" },');
    expect((twice.match(/ui:\s*\{\s*prefix:\s*"ui"\s*\}/g) ?? []).length).toBe(1);
  });

  it('removes an unmanaged domain only when it matches generated shape', () => {
    const generated = [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1964 },',
      '  ui: { prefix: "ui" },',
      '});',
      '',
    ].join('\n');

    const customized = generated.replace('ui: { prefix: "ui" },', 'ui: { prefix: "marketing" },');

    expect(removeVanrotConfigDomainIfGenerated(generated, 'ui', '{ prefix: "ui" }')).not.toContain(
      'ui:',
    );
    expect(removeVanrotConfigDomainIfGenerated(customized, 'ui', '{ prefix: "ui" }')).toContain('ui:');
  });

  it('upserts and removes generated SEO config without touching customized SEO config', () => {
    const source = [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1964 },',
      '});',
      '',
    ].join('\n');

    const generated = upsertVanrotSeoConfigDomain(source);
    const customized = generated.replace(
      generatedVanrotSeoConfigSource,
      '{ siteUrl: "https://vanrot.vankode.com" }',
    );

    expect(generated).toContain(`seo: ${generatedVanrotSeoConfigSource},`);
    expect(removeGeneratedVanrotSeoConfigDomain(generated)).not.toContain('seo:');
    expect(removeGeneratedVanrotSeoConfigDomain(customized)).toContain('seo:');
  });
});
