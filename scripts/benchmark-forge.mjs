import { cp, mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, '..');
const fixtureRoot = join(projectRoot, 'packages/forge/tests/fixtures/benchmarks');
const forgeFixture = join(fixtureRoot, 'forge-basic-app');
const viteFixture = join(fixtureRoot, 'vite-basic-app');

export const requiredForgeBenchmarkFields = [
  'coldDevStartupMs',
  'pageHtmlEditLoopMs',
  'pageCssEditLoopMs',
  'pageTsEditLoopMs',
  'componentEditLoopMs',
  'routeMetadataEditLoopMs',
  'dependencyCount',
  'installSurface',
  'productionBuildOutputFiles',
];

export async function runForgeBenchmark() {
  const forge = await measureForgeFixture();
  const vite = await measureViteFixture();

  return {
    generatedAt: new Date(0).toISOString(),
    fixtures: {
      forge: relative(projectRoot, forgeFixture),
      vite: relative(projectRoot, viteFixture),
    },
    forge,
    vite,
    comparison: {
      forgeFasterForCheckedFixture:
        vite.coldDevStartupMs === null ? null : forge.coldDevStartupMs < vite.coldDevStartupMs,
      publicClaimAllowed: vite.coldDevStartupMs !== null && forge.coldDevStartupMs < vite.coldDevStartupMs,
      note:
        vite.coldDevStartupMs === null
          ? 'Vite timing is not measured by this deterministic harness; do not publish speed claims from this run.'
          : 'Forge and Vite timing were both measured in this run.',
    },
  };
}

async function measureForgeFixture() {
  const forgeApi = await import('../packages/forge/dist/index.js');
  const cwd = await copyFixture(forgeFixture, 'forge-benchmark-');
  const startup = await measure(async () => {
    const server = await forgeApi.startForgeDevServer({ cwd, host: '127.0.0.1', port: 0 });
    await server.close();
  });
  const build = await forgeApi.runForgeBuild({ cwd });
  const outputFiles = await listFiles(join(cwd, 'dist'));

  await rm(cwd, { recursive: true, force: true });

  return {
    coldDevStartupMs: startup,
    pageHtmlEditLoopMs: measurePlan(forgeApi, 'src/pages/home/home.page.html'),
    pageCssEditLoopMs: measurePlan(forgeApi, 'src/pages/home/home.page.css'),
    pageTsEditLoopMs: measurePlan(forgeApi, 'src/pages/home/home.page.ts'),
    componentEditLoopMs: measurePlan(forgeApi, 'src/components/card/card.component.ts'),
    routeMetadataEditLoopMs: measurePlan(forgeApi, 'src/routes.ts'),
    dependencyCount: dependencyCount(await readPackageJson(forgeFixture)),
    installSurface: installSurface(await readPackageJson(forgeFixture)),
    productionBuildExitCode: build.exitCode,
    productionBuildOutputFiles: outputFiles,
  };
}

async function measureViteFixture() {
  const packageJson = await readPackageJson(viteFixture);

  return {
    coldDevStartupMs: null,
    pageHtmlEditLoopMs: null,
    pageCssEditLoopMs: null,
    pageTsEditLoopMs: null,
    componentEditLoopMs: null,
    routeMetadataEditLoopMs: null,
    dependencyCount: dependencyCount(packageJson),
    installSurface: installSurface(packageJson),
    productionBuildOutputFiles: [],
    timingNote: 'Install and live Vite server timing are intentionally not faked by this harness.',
  };
}

async function measure(operation) {
  const start = performance.now();
  await operation();
  return Number((performance.now() - start).toFixed(3));
}

function measurePlan(forgeApi, filePath) {
  const start = performance.now();
  forgeApi.planForgeReload(filePath);
  return Number((performance.now() - start).toFixed(3));
}

async function copyFixture(source, prefix) {
  const cwd = await mkdtemp(join(tmpdir(), prefix));
  await cp(source, cwd, { recursive: true });
  return cwd;
}

async function readPackageJson(root) {
  return JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
}

function dependencyCount(packageJson) {
  return installSurface(packageJson).length;
}

function installSurface(packageJson) {
  return Object.keys({
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }).sort();
}

async function listFiles(root) {
  const rootExists = await exists(root);
  if (!rootExists) {
    return [];
  }

  const files = await walk(root, root);
  return files.sort();
}

async function walk(root, current) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(root, entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(relative(root, entryPath).replaceAll('\\', '/'));
    }
  }

  return files;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await runForgeBenchmark(), null, 2));
}
