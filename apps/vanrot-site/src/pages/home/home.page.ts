import { packageReferenceDocs } from '../../docs/site-data.ts';

const homeCopy = {
  eyebrow: 'Signal-based UI framework',
  title: "The Hitchhiker's Guide To The Only Framework You Need!",
  summary:
    'Learn the framework surface, inspect the October component system, and verify what is production-ready before building real apps.',
  primaryCta: 'Framework Documentation',
  secondaryCta: 'Design Component',
} as const;

export class HomePage {
  copy = homeCopy;
  packages = packageReferenceDocs.map(pkg => ({
    ...pkg,
    statusLabel: pkg.status === 'production-ready' ? 'stable' : 'demo',
    statusClass: pkg.status === 'production-ready' ? 'pkg-badge--stable' : 'pkg-badge--demo',
  }));
}
