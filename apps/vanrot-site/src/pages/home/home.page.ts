import { computed, signal } from '@vanrot/runtime';
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

const anatomyFiles = [
  {
    file: 'counter.component.ts',
    role: 'logic',
    code: [
      "import { signal } from '@vanrot/runtime';",
      '',
      'export class Counter {',
      '  count = signal(0);',
      '',
      '  increment() {',
      '    this.count.set(this.count() + 1);',
      '  }',
      '}',
    ].join('\n'),
  },
  {
    file: 'counter.component.html',
    role: 'template',
    code: [
      '<button class="counter"',
      '        (click)="increment()">',
      '  Clicked {{ count() }} times',
      '</button>',
    ].join('\n'),
  },
  {
    file: 'counter.component.css',
    role: 'style',
    code: [
      '.counter {',
      '  padding: 10px 18px;',
      '  border: 1px solid #2a2a2a;',
      '  border-radius: 8px;',
      '  background: #000;',
      '  color: #fafafa;',
      '}',
    ].join('\n'),
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
const railPackages = packages.map((pkg, index) => ({
  ...pkg,
  index: String(index + 1).padStart(2, '0'),
}));
const runtimePackages = packages.filter(pkg => runtimeDashboardPackageNames.has(pkg.name));
const dashboardPackages = runtimePackages.flatMap(pkg =>
  pkg.name === '@vanrot/behavior' ? [pkg, behaviorAllBundle] : [pkg],
);
const bundleProfileCount = dashboardPackages.length - runtimePackages.length;
const runtimeEntryCount = dashboardPackages.length;
const runtimePackageCount = runtimePackages.length;

export class HomePage {
  runtimeSize = runtimeSize;
  anatomyFiles = anatomyFiles;
  railPackages = railPackages;
  dashboardPackages = dashboardPackages;
  runtimeEntryCount = runtimeEntryCount;
  runtimePackageCount = runtimePackageCount;
  bundleProfileCount = bundleProfileCount;
  demoCount = signal(0);
  demoDoubled = computed(() => this.demoCount() * 2);
  demoNext = computed(() => this.demoCount() + 1);
  demoBinary = computed(() => {
    const bits = this.demoCount().toString(2).padStart(8, '0');

    return Array.from({ length: 6 }, () => bits).join(' ');
  });

  incrementDemo(): void {
    this.demoCount.set(this.demoCount() + 1);
  }

  constructor() {
    setupHomeInteractions();
  }
}
