import { componentDocs } from '../../docs/component-docs.ts';
import { packageReferenceDocs } from '../../docs/site-data.ts';

const homeCopy = {
  title: 'Vanrot',
  summary:
    'A small frontend framework with signals, compiler role files, typed routes, source-owned UI, and documentation that grows with the framework.',
  primaryCta: 'Read the docs',
  secondaryCta: 'View components',
} as const;

export class HomePage {
  copy = homeCopy;
  components = componentDocs.slice(0, 4);
  packages = packageReferenceDocs;
}
