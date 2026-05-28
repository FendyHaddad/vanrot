import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vanrotTemplateRules } from '../dist/template-files.js';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'dist', 'template-globs.json');
const payload = {
  extension: vanrotTemplateRules.extension,
  excludeExact: vanrotTemplateRules.excludeExact,
  excludeSuffix: vanrotTemplateRules.excludeSuffix,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`wrote ${outPath}`);
