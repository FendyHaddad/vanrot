import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createNodeProcessRunner } from '../src/process/runner.js';

describe('createNodeProcessRunner', () => {
  it('runs binaries installed in the project-local node_modules bin directory', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-runner-'));
    const binDir = join(cwd, 'node_modules', '.bin');
    const command = 'vanrot-local-command-for-test';
    await mkdir(binDir, { recursive: true });

    if (process.platform === 'win32') {
      await writeFile(join(binDir, `${command}.cmd`), '@echo off\nexit /B 0\n');
    } else {
      const commandPath = join(binDir, command);
      await writeFile(commandPath, '#!/bin/sh\nexit 0\n');
      await chmod(commandPath, 0o755);
    }

    const runner = createNodeProcessRunner();

    await expect(runner.run(command, [], { cwd })).resolves.toBe(0);
  });
});
