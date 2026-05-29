import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createSkippedStep } from './model.mjs';
import { runCommand } from './runner.mjs';

const localTapName = 'vanrot/local';
const formulaName = 'vanrot';
const homebrewEnv = {
  HOMEBREW_NO_AUTO_UPDATE: '1',
  HOMEBREW_NO_ENV_HINTS: '1',
};

export async function createHomebrewStep({
  runner = runCommand,
  repositoryRoot,
  formulaPath,
}) {
  const detection = await runner({
    name: 'detect Homebrew',
    command: 'which',
    args: ['brew'],
    cwd: repositoryRoot,
    required: false,
  });

  if (detection.status === 'fail') {
    return createSkippedStep({
      name: 'homebrew local install',
      reason: 'Homebrew is not installed.',
    });
  }

  await runner({
    name: 'homebrew cleanup stale local tap',
    command: 'brew',
    args: ['untap', localTapName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: false,
  });

  const tapStep = await runner({
    name: 'homebrew create local tap',
    command: 'brew',
    args: ['tap-new', '--no-git', localTapName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: true,
  });

  if (tapStep.status === 'fail') {
    return tapStep;
  }

  const repositoryStep = await runner({
    name: 'homebrew resolve local tap',
    command: 'brew',
    args: ['--repository', localTapName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: true,
  });

  if (repositoryStep.status === 'fail') {
    await cleanupLocalTap({ runner, repositoryRoot });
    return repositoryStep;
  }

  const tapRoot = repositoryStep.stdoutTail.trim().split('\n').at(-1);
  await mkdir(join(tapRoot, 'Formula'), { recursive: true });
  await cp(formulaPath ?? join(repositoryRoot, 'Formula', 'vanrot.rb'), join(tapRoot, 'Formula', 'vanrot.rb'));

  const installStep = await runner({
    name: 'homebrew local install',
    command: 'brew',
    args: ['install', '--formula', '--build-from-source', `${localTapName}/${formulaName}`],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: true,
  });

  if (installStep.status === 'fail') {
    await cleanupLocalTap({ runner, repositoryRoot });
    return installStep;
  }

  const linkStep = await runner({
    name: 'homebrew local link',
    command: 'brew',
    args: ['link', '--overwrite', formulaName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: true,
  });

  if (linkStep.status === 'fail') {
    await cleanupLocalTap({ runner, repositoryRoot });
    return linkStep;
  }

  const testStep = await runner({
    name: 'homebrew local test',
    command: 'brew',
    args: ['test', `${localTapName}/${formulaName}`],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: true,
  });

  await cleanupLocalTap({ runner, repositoryRoot });

  if (testStep.status === 'fail') {
    return testStep;
  }

  return installStep;
}

export async function writeLocalFormula({ directory, sourceArchivePath }) {
  await mkdir(directory, { recursive: true });

  const sha256 = createHash('sha256').update(await readFile(sourceArchivePath)).digest('hex');
  const formulaPath = join(directory, 'vanrot.rb');

  await writeFile(
    formulaPath,
    `class Vanrot < Formula
  desc "Local Vanrot CLI release dry-run"
  homepage "https://vanrot.dev"
  url "file://${sourceArchivePath}"
  version "0.0.0"
  sha256 "${sha256}"
  license "MIT"

  depends_on "node"

  def install
    tarballs = Dir["#{buildpath}/**/*.tgz"]
    odie "No Vanrot package tarballs found in #{buildpath}" if tarballs.empty?
    system "npm", "install", "--prefix", libexec, "--omit=dev", *tarballs
    bin.install_symlink libexec/"node_modules/.bin/vr" => "vr"
  end

  test do
    system "#{bin}/vr", "--help"
  end
end
`,
    'utf8',
  );

  return formulaPath;
}

async function cleanupLocalTap({ runner, repositoryRoot }) {
  await runner({
    name: 'homebrew uninstall local formula',
    command: 'brew',
    args: ['uninstall', '--force', formulaName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: false,
  });
  await runner({
    name: 'homebrew remove local tap',
    command: 'brew',
    args: ['untap', localTapName],
    cwd: repositoryRoot,
    env: homebrewEnv,
    required: false,
  });
}
