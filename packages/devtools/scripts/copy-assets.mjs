import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const assets = [
  ['src/extension/manifest.json', 'dist/manifest.json'],
  ['src/panel/panel.html', 'dist/panel/panel.html'],
  ['src/panel/panel.css', 'dist/panel/panel.css'],
  ['src/extension/devtools.html', 'dist/extension/devtools.html'],
  ['src/extension/manifest.json', 'dist/extension/manifest.json'],
];

for (const [from, to] of assets) {
  await mkdir(dirname(join(root, to)), { recursive: true });
  await writeFile(join(root, to), await readFile(join(root, from)));
}
