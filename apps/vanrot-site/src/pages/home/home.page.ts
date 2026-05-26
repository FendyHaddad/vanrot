import { packageReferenceDocs } from '../../docs/site-data.ts';

const homeCopy = {
  eyebrow: 'Vanrot framework',
  title: 'Framework docs and design components for Vanrot.',
  summary:
    'Learn the framework surface, inspect the October component system, and verify what is production-ready before building real apps.',
  primaryCta: 'Framework Documentation',
  secondaryCta: 'Design Component',
} as const;

export class HomePage {
  copy = homeCopy;
  packages = packageReferenceDocs;
}
