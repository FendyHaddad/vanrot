#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const rel = (file) => relative(root, file);
const read = (file) => existsSync(file) ? readFileSync(file, 'utf8') : '';
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail });
}

const agents = read(join(root, 'AGENTS.md'));
const claude = read(join(root, 'CLAUDE.md'));

check('AGENTS.md exists', Boolean(agents), 'root rulebook');
check('CLAUDE.md exists', Boolean(claude), 'mirrors AGENTS.md');
check('AGENTS.md and CLAUDE.md match', agents === claude, 'shared rulebook for Codex and Claude');

const required = [
  '.vanrot-ai/README.md',
  '.vanrot-ai/skills/vanrot-workflow/SKILL.md',
  '.vanrot-ai/hooks/pre-commit.sh',
  '.vanrot-ai/diagnostics/workflow-hygiene.mjs',
  '.vanrot-ai/diagnostics/spec-plan-cleanup.mjs'
];

for (const file of required) {
  check(`${file} exists`, existsSync(join(root, file)), 'project-local AI workflow');
}

const gitHook = join(root, '.git/hooks/pre-commit');
const gitHookText = read(gitHook);
check('.git/hooks/pre-commit delegates to .vanrot-ai', gitHookText.includes('.vanrot-ai/hooks/pre-commit.sh'), rel(gitHook));

const hookSource = join(root, '.vanrot-ai/hooks/pre-commit.sh');
if (existsSync(hookSource)) {
  const mode = statSync(hookSource).mode;
  check('.vanrot-ai pre-commit source is executable', Boolean(mode & 0o111), rel(hookSource));
}

const failed = checks.filter((item) => !item.ok);

for (const item of checks) {
  const mark = item.ok ? 'OK' : 'FAIL';
  console.log(`[${mark}] ${item.name} - ${item.detail}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
