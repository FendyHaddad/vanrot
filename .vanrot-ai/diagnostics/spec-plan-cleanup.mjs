#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const args = new Set(process.argv.slice(2));
const json = args.has('--json');
const remove = args.has('--remove');
const confirmRemove = args.has('--confirm-remove');

if (remove && !confirmRemove) {
  console.error('Refusing removal without --confirm-remove.');
  process.exit(2);
}

const roots = [
  'docs/superpowers/specs',
  'docs/superpowers/plans'
];

function listMarkdown(dir) {
  const full = join(root, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(full, entry.name));
}

function outsideReferences(relPath) {
  const name = basename(relPath);
  const needles = [relPath, name];
  const refs = new Set();

  for (const needle of needles) {
    try {
      const output = execFileSync('git', [
        'grep',
        '-n',
        '--',
        needle,
        ':!docs/superpowers/specs/**',
        ':!docs/superpowers/plans/**'
      ], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

      for (const line of output.split('\n').filter(Boolean)) refs.add(line);
    } catch {
      // No references.
    }
  }

  return [...refs];
}

function classify(file) {
  const relPath = relative(root, file);
  const text = readFileSync(file, 'utf8');
  const isPhasePlan = /^docs\/superpowers\/plans\/Phase-[A-Za-z0-9]+\.md$/.test(relPath);
  const unchecked = /^\s*[-*]\s+\[\s\]/im.test(text);
  const checked = /^\s*[-*]\s+\[[xX]\]/m.test(text);
  const activeWords = /\b(TODO|TBD|Planned|Pending|In progress|Not implemented)\b/i.test(text);
  const completeWords = /\b(Production-Ready|Complete|Completed|Implemented|Shipped)\b/i.test(text);
  const refs = outsideReferences(relPath);

  if (isPhasePlan) {
    return { file: relPath, classification: 'active', reason: 'phase plan files are required by verify-phase-docs when phases are completed', references: refs.slice(0, 5) };
  }

  if (unchecked || activeWords) {
    return { file: relPath, classification: 'active', reason: unchecked ? 'unchecked tasks remain' : 'active wording remains', references: refs.slice(0, 5) };
  }

  if (refs.length > 0) {
    return { file: relPath, classification: 'reference-only', reason: 'referenced outside specs/plans', references: refs.slice(0, 5) };
  }

  if (checked || completeWords) {
    return { file: relPath, classification: 'executed-obsolete', reason: checked ? 'all visible checklist items are checked and no outside references found' : 'completion wording and no outside references found', references: [] };
  }

  return { file: relPath, classification: 'reference-only', reason: 'no safe execution evidence', references: [] };
}

const results = roots.flatMap(listMarkdown).map(classify);
const counts = results.reduce((acc, item) => {
  acc[item.classification] = (acc[item.classification] || 0) + 1;
  return acc;
}, {});
const candidates = results.filter((item) => item.classification === 'executed-obsolete');

if (remove) {
  for (const item of candidates) {
    rmSync(join(root, item.file));
  }
}

if (json) {
  console.log(JSON.stringify({ counts, removed: remove ? candidates.map((item) => item.file) : [], candidates, results }, null, 2));
} else {
  console.log(`active=${counts.active || 0}`);
  console.log(`reference-only=${counts['reference-only'] || 0}`);
  console.log(`executed-obsolete=${counts['executed-obsolete'] || 0}`);

  for (const item of candidates.slice(0, 80)) {
    const prefix = remove ? 'REMOVED' : 'CANDIDATE';
    console.log(`[${prefix}] ${item.file} - ${item.reason}`);
  }

  if (candidates.length > 80) {
    console.log(`...${candidates.length - 80} more candidates not shown`);
  }
}
