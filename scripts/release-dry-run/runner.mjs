import { spawn } from 'node:child_process';
import { createCommandStep } from './model.mjs';

export async function runCommand({
  name,
  command,
  args = [],
  cwd,
  env = {},
  required = true,
}) {
  const renderedCommand = renderCommand(command, args);
  const result = await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({ exitCode: 1, stdout, stderr: error.message });
    });
    child.on('close', (exitCode) => {
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
  });

  return createCommandStep({
    name,
    command: renderedCommand,
    cwd,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    required,
  });
}

function renderCommand(command, args) {
  return [command, ...args].map((part) => quoteIfNeeded(part)).join(' ');
}

function quoteIfNeeded(part) {
  if (!/\s/.test(part)) {
    return part;
  }

  return JSON.stringify(part);
}
