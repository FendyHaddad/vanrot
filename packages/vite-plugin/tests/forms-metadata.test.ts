import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { discoverFormDefinitionFiles, createFormsMetadata } from '@/forms/forms-metadata.js';

describe('forms metadata discovery', () => {
  it('discovers .form.ts role files and exports stable metadata', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-forms-'));
    const sourceRoot = join(root, 'src');
    await mkdir(join(sourceRoot, 'checkout'), { recursive: true });
    await writeFile(join(sourceRoot, 'checkout', 'checkout.form.ts'), 'export const checkoutForm = createForm({});');
    await writeFile(join(sourceRoot, 'checkout', 'checkout.component.ts'), 'export class CheckoutComponent {}');

    const files = await discoverFormDefinitionFiles(root);

    expect(files.map((file) => file.relativePath)).toEqual(['src/checkout/checkout.form.ts']);
    expect(createFormsMetadata(files)).toEqual({
      kind: 'vanrot-forms-metadata',
      files: [{ relativePath: 'src/checkout/checkout.form.ts' }],
    });
  });
});
