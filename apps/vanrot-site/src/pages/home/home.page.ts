import { packageReferenceDocs } from '../../docs/site-data.ts';
import { setupHomeInteractions } from './home-interactions.widget.ts';

const runtimeSize = '1.8kb';
const packageDashboardMeta = {
  '@vanrot/runtime': { version: '0.1.0', size: runtimeSize },
  '@vanrot/behavior': { version: '0.1.0', size: '4.1kb' },
  '@vanrot/compiler': { version: '0.1.1', size: '12.1kb' },
  '@vanrot/config': { version: '0.1.0', size: '2.4kb' },
  '@vanrot/language-server': { version: '0.1.1', size: '—' },
  '@vanrot/router': { version: '0.1.0', size: '5.2kb' },
  '@vanrot/vite-plugin': { version: '0.1.1', size: '6.0kb' },
  '@vanrot/cli': { version: '0.1.1', size: '—' },
  '@vanrot/ui': { version: '0.1.0', size: '9.4kb' },
  '@vanrot/testing': { version: '0.1.0', size: '3.1kb' },
  '@vanrot/devtools': { version: '0.1.0', size: '—' },
  '@vanrot/ai': { version: '0.1.0', size: '—' },
} as const;

const fallbackPackageMeta = { version: '—', size: '—' } as const;
const behaviorAllBundle = {
  name: '@vanrot/behavior/all',
  area: 'All behavior helpers',
  version: '0.1.0',
  size: '4.1kb',
  statusLabel: 'bundle',
} as const;
const runtimeDashboardPackageNames = new Set([
  '@vanrot/runtime',
  '@vanrot/behavior',
  '@vanrot/router',
  '@vanrot/ui',
]);

const homeCopy = {
  eyebrow: 'AI-first · Signal-based · Secure by design',
  typedLine: 'The only framework you need. Reactivity without the fluff.',
  primaryCta: 'Read the docs',
  installCta: '$ npm i @vanrot/runtime',
  componentsHeading: 'A component system, not a starter kit',
  componentsBody:
    'Real blocks built from vr-card, vr-table, vr-sidebar, vr-badge. Monochrome, crisp, production-grade.',
  componentsCta: 'Browse UI components',
  aiHeading: 'AI-first, secure by design',
  aiBody:
    'Vanrot ships a machine-readable manifest your agent reads directly — and a runtime with no eval, scoped styles, and zero supply-chain surface.',
  signalsHeading: 'Signals that make sense',
  signalsBody: 'No virtual DOM, no reconciliation. Update a signal — only what depends on it recomputes.',
  packagesHeading: 'Every package, one manifest',
  packagesBody: 'Each package ships independently. Pull only what you need.',
  startHeading: 'Start in one command',
  startBody: 'No config, no boilerplate. Scaffold a typed, reactive app in seconds.',
  installCommand: '$ npm create vanrot@latest',
} as const;

const aiFeatures = [
  {
    icon: '⌥',
    title: 'Agent manifest',
    body: 'Structured docs/ai knowledge. Agents understand Vanrot without guessing.',
  },
  {
    icon: '$_',
    title: 'vr ai',
    body: 'One command exposes the whole framework surface to any coding agent.',
  },
  {
    icon: '⊘',
    title: 'No eval',
    body: 'Templates compile to plain JS. CSP-friendly, nothing evaluated at runtime.',
  },
  {
    icon: '▣',
    title: 'Zero runtime deps',
    body: 'Vite powers dev/build. The browser runtime ships dependency-free.',
  },
] as const;

function isProductionReady(status: string): boolean {
  return status.startsWith('production-ready');
}

function dashboardMetaFor(packageName: string): { version: string; size: string } {
  return packageDashboardMeta[packageName as keyof typeof packageDashboardMeta] ?? fallbackPackageMeta;
}

const packages = packageReferenceDocs.map(pkg => {
  const meta = dashboardMetaFor(pkg.name);

  return {
    name: pkg.name,
    area: pkg.area,
    version: meta.version,
    size: meta.size,
    statusLabel: isProductionReady(pkg.status) ? 'stable' : 'demo',
  };
});
const runtimePackages = packages.filter(pkg => runtimeDashboardPackageNames.has(pkg.name));
const dashboardPackages = runtimePackages.flatMap(pkg =>
  pkg.name === '@vanrot/behavior' ? [pkg, behaviorAllBundle] : [pkg],
);
const stablePackageCount = packages.filter(pkg => pkg.statusLabel === 'stable').length;
const demoPackageCount = packages.length - stablePackageCount;
const bundleProfileCount = dashboardPackages.length - runtimePackages.length;
const packageSummary = `${dashboardPackages.length} runtime entries · ${runtimePackages.length} packages, ${bundleProfileCount} bundle`;

export class HomePage {
  copy = homeCopy;
  runtimeSize = runtimeSize;
  aiFeatures = aiFeatures;
  packages = packages;
  dashboardPackages = dashboardPackages;
  packageCount = packageReferenceDocs.length;
  packageSummary = packageSummary;
  stats = [
    { num: runtimeSize, label: 'Runtime size', detail: 'gzipped' },
    { num: '0', label: 'Runtime deps', detail: 'Vite builds' },
    { num: String(dashboardPackages.length), label: 'Runtime entries', detail: `${runtimePackages.length} packages` },
    { num: '100%', label: 'Type coverage', detail: 'strict' },
  ];

  constructor() {
    setupHomeInteractions();
  }
}
