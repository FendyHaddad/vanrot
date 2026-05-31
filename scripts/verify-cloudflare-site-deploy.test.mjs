import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const workflowPath = '.github/workflows/vanrot-site-pages.yml';
const wranglerPath = 'apps/vanrot-site/wrangler.toml';
const linkerPath = 'scripts/link-cloudflare-vanrot-site.mjs';

describe('cloudflare site deploy wiring', () => {
  it('deploys the Vanrot site to the expected Cloudflare Pages project', async () => {
    const workflow = await readFile(workflowPath, 'utf8');
    const wrangler = await readFile(wranglerPath, 'utf8');

    expect(wrangler).toContain('name = "vanrot"');
    expect(wrangler).toContain('pages_build_output_dir = "dist"');
    expect(workflow).toContain('name: Deploy Vanrot Site');
    expect(workflow).toContain('pages deploy apps/vanrot-site/dist --project-name=vanrot');
    expect(workflow).toContain('CLOUDFLARE_API_TOKEN');
    expect(workflow).toContain('CLOUDFLARE_ACCOUNT_ID');
  });

  it('limits push deploys to site-related paths', async () => {
    const workflow = await readFile(workflowPath, 'utf8');

    expect(workflow).toContain('paths:');
    expect(workflow).toContain('apps/vanrot-site/**');
    expect(workflow).toContain('packages/runtime/**');
    expect(workflow).toContain('packages/behavior/**');
    expect(workflow).toContain('packages/router/**');
    expect(workflow).toContain('packages/ui/**');
    expect(workflow).toContain('packages/vite-plugin/**');
    expect(workflow).toContain('packages/cli/**');
    expect(workflow).toContain('packages/config/**');
    expect(workflow).toContain('scripts/link-cloudflare-vanrot-site.mjs');
    expect(workflow).not.toContain('- **');
    expect(workflow).not.toContain('- "*"');
  });

  it('links the custom domain before deployment', async () => {
    const workflow = await readFile(workflowPath, 'utf8');
    const linker = await readFile(linkerPath, 'utf8');

    expect(workflow).toContain('node scripts/link-cloudflare-vanrot-site.mjs');
    expect(linker).toContain("'vanrot.vankode.com'");
    expect(linker).toContain("'vankode.com'");
    expect(linker).toContain('pages/projects');
    expect(linker).toContain('dns_records');
    expect(linker).toContain('CLOUDFLARE_API_TOKEN');
  });
});
