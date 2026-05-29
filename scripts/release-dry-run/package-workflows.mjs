import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createReleaseManifest } from './metadata.mjs';
import { runCommand } from './runner.mjs';

const consumerVersions = {
  typescript: '^5.9.3',
  vite: '^8.0.10',
};

export function createTarballName(releasePackage) {
  const packageName = releasePackage.name ?? releasePackage.manifest.name;
  const unscopedName = packageName.replace(/^@/, '').replace('/', '-');

  return `${unscopedName}-${releasePackage.manifest.version}.tgz`;
}

export function createPackageSpecifier(tarballPath) {
  return `file:${tarballPath}`;
}

export function createTarballSpecifiers(packages, artifactsDirectory) {
  return Object.fromEntries(
    packages.map((releasePackage) => [
      releasePackage.name,
      createPackageSpecifier(join(artifactsDirectory, createTarballName(releasePackage))),
    ]),
  );
}

export function createWorkspacePackageJson({ name, tarballSpecifiers }) {
  return {
    name,
    private: true,
    type: 'module',
    scripts: {
      build: 'vite build',
      smoke: 'node smoke.mjs',
    },
    packageManager: 'pnpm@11.1.3',
    dependencies: {
      ...tarballSpecifiers,
      typescript: consumerVersions.typescript,
      vite: consumerVersions.vite,
    },
    devDependencies: {},
  };
}

export function createPnpmWorkspaceYaml(tarballSpecifiers) {
  return [
    'packages:',
    '  - .',
    'overrides:',
    ...Object.entries(tarballSpecifiers).map(
      ([name, specifier]) => `  ${JSON.stringify(name)}: ${JSON.stringify(specifier)}`,
    ),
    '',
  ].join('\n');
}

export async function packPackages({
  packages,
  artifactsDirectory,
  packageCopiesDirectory,
  runner = runCommand,
}) {
  const steps = [];
  const tarballs = [];
  const packageVersions = new Map(
    packages.map((releasePackage) => [releasePackage.name, releasePackage.manifest.version]),
  );

  for (const releasePackage of packages) {
    const packDirectory =
      packageCopiesDirectory === undefined
        ? releasePackage.directory
        : await writeReleasePackageCopy({
            releasePackage,
            packageVersions,
            packageCopiesDirectory,
          });
    const step = await runner({
      name: `pack ${releasePackage.name}`,
      command: 'pnpm',
      args: ['pack', '--pack-destination', artifactsDirectory],
      cwd: packDirectory,
      required: true,
    });
    steps.push(step);
    tarballs.push(join(artifactsDirectory, createTarballName(releasePackage)));
  }

  return { steps, tarballs };
}

async function writeReleasePackageCopy({ releasePackage, packageVersions, packageCopiesDirectory }) {
  const packDirectory = join(packageCopiesDirectory, releasePackage.directoryName);
  await mkdir(packDirectory, { recursive: true });
  await writeJson(
    join(packDirectory, 'package.json'),
    createReleaseManifest(releasePackage, packageVersions),
  );

  for (const fileEntry of releasePackage.manifest.files ?? []) {
    await cp(join(releasePackage.directory, fileEntry), join(packDirectory, fileEntry), {
      recursive: true,
      force: true,
    });
  }

  return packDirectory;
}

export async function writePnpmConsumer({ directory, tarballSpecifiers }) {
  await writeConsumerFiles({
    directory,
    manifest: createWorkspacePackageJson({
      name: 'vanrot-release-pnpm-consumer',
      tarballSpecifiers,
    }),
    tarballSpecifiers,
    includePnpmWorkspace: true,
    includeBuildFiles: true,
  });
}

export async function writeNpmConsumer({ directory, tarballSpecifiers }) {
  await writeConsumerFiles({
    directory,
    manifest: {
      ...createWorkspacePackageJson({
        name: 'vanrot-release-npm-consumer',
        tarballSpecifiers,
      }),
      scripts: {
        smoke: 'node smoke.mjs',
      },
    },
    tarballSpecifiers,
    includePnpmWorkspace: false,
    includeBuildFiles: false,
  });
}

export async function runPnpmConsumerWorkflow({ directory, runner = runCommand }) {
  return [
    await runner({
      name: 'pnpm consumer install',
      command: 'pnpm',
      args: ['install'],
      cwd: directory,
      required: true,
    }),
    await runner({
      name: 'pnpm consumer smoke',
      command: 'pnpm',
      args: ['run', 'smoke'],
      cwd: directory,
      required: true,
    }),
    await runner({
      name: 'pnpm consumer build',
      command: 'pnpm',
      args: ['run', 'build'],
      cwd: directory,
      required: true,
    }),
  ];
}

export async function runNpmConsumerWorkflow({ directory, runner = runCommand }) {
  return [
    await runner({
      name: 'npm consumer install',
      command: 'npm',
      args: ['install'],
      cwd: directory,
      required: true,
    }),
    await runner({
      name: 'npm consumer smoke',
      command: 'npm',
      args: ['run', 'smoke'],
      cwd: directory,
      required: true,
    }),
  ];
}

async function writeConsumerFiles({
  directory,
  manifest,
  tarballSpecifiers,
  includePnpmWorkspace,
  includeBuildFiles,
}) {
  await mkdir(join(directory, 'src', 'counter'), { recursive: true });
  await writeJson(join(directory, 'package.json'), manifest);

  if (includePnpmWorkspace) {
    await writeFile(
      join(directory, 'pnpm-workspace.yaml'),
      createPnpmWorkspaceYaml(tarballSpecifiers),
      'utf8',
    );
  }

  await writeJson(join(directory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['src', 'smoke.mjs', 'vite.config.ts', 'vanrot.config.ts'],
  });
  await writeFile(join(directory, 'smoke.mjs'), smokeSource(), 'utf8');

  if (!includeBuildFiles) {
    return;
  }

  await writeFile(
    join(directory, 'index.html'),
    '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
    'utf8',
  );
  await writeFile(join(directory, 'vite.config.ts'), viteConfigSource(), 'utf8');
  await writeFile(join(directory, 'vanrot.config.ts'), vanrotConfigSource(), 'utf8');
  await writeFile(join(directory, 'src', 'main.ts'), mainSource(), 'utf8');
  await writeFile(
    join(directory, 'src', 'counter', 'counter.component.ts'),
    counterComponentSource(),
    'utf8',
  );
  await writeFile(
    join(directory, 'src', 'counter', 'counter.component.html'),
    counterTemplateSource(),
    'utf8',
  );
  await writeFile(
    join(directory, 'src', 'counter', 'counter.component.css'),
    counterStyleSource(),
    'utf8',
  );
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function smokeSource() {
  return `import { signal } from '@vanrot/runtime';
import { defineVanrotConfig } from '@vanrot/config';
import vanrot from '@vanrot/vite-plugin';

const count = signal(1);
count.set(count() + 1);

if (count() !== 2) {
  throw new Error('Packed runtime signal failed.');
}

if (typeof defineVanrotConfig({ schemaVersion: 1 }) !== 'object') {
  throw new Error('Packed config import failed.');
}

if (typeof vanrot !== 'function') {
  throw new Error('Packed Vite plugin import failed.');
}
`;
}

function viteConfigSource() {
  return `import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
});
`;
}

function vanrotConfigSource() {
  return `import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  source: { root: 'src' },
});
`;
}

function mainSource() {
  return `import { mount } from '@vanrot/runtime';
import { CounterComponent } from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(CounterComponent, target);
`;
}

function counterComponentSource() {
  return `import { signal } from '@vanrot/runtime';

export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update((value) => value + 1);
  }
}
`;
}

function counterTemplateSource() {
  return `<main>
  <button type="button" (click)="increment()">Increment</button>
  <output>{{ count() }}</output>
</main>
`;
}

function counterStyleSource() {
  return `main {
  display: grid;
  gap: 12px;
}
`;
}

export async function copyTarballsForHomebrew({ tarballs, directory }) {
  const artifactsDirectory = join(directory, 'artifacts');
  await mkdir(artifactsDirectory, { recursive: true });

  for (const tarball of tarballs) {
    await cp(tarball, join(artifactsDirectory, tarball.split('/').at(-1)));
  }

  return artifactsDirectory;
}
