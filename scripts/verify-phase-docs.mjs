import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export function parseMaturityRoadmapPhases(markdown) {
  const phases = [];
  const rowPattern = /^\|\s*\[(x| )\]\s*\|\s*Phase\s+(\d+)\s*\|\s*([^|]+?)\s*\|/gm;

  for (const match of markdown.matchAll(rowPattern)) {
    phases.push({
      done: match[1] === 'x',
      number: Number(match[2]),
      title: match[3].trim(),
    });
  }

  return phases;
}

export function checkCompletedPhasePlans(phases, planContentByPhase) {
  const failures = [];

  for (const phase of phases) {
    if (!phase.done || phase.number === 0) {
      continue;
    }

    const planContent = planContentByPhase.get(phase.number);

    if (planContent === undefined) {
      failures.push(
        `Phase ${phase.number} is done in docs/superpowers/feature-maturity.md but docs/superpowers/plans/Phase-${formatPhaseNumber(
          phase.number,
        )}.md is missing.`,
      );
      continue;
    }

    if (/^\s*-\s+\[ \]/m.test(planContent)) {
      failures.push(
        `Phase ${phase.number} is done in docs/superpowers/feature-maturity.md but docs/superpowers/plans/Phase-${formatPhaseNumber(
          phase.number,
        )}.md still has unchecked tasks.`,
      );
    }
  }

  return failures;
}

export function checkMaturityRows(phases, maturityMarkdown) {
  const completedPhaseNumbers = new Set(
    phases.filter((phase) => phase.done).map((phase) => `Phase ${phase.number}`),
  );
  const failures = [];

  for (const line of maturityMarkdown.split('\n')) {
    if (!line.startsWith('|') || line.includes('|---')) {
      continue;
    }

    const columns = line
      .split('|')
      .slice(1, -1)
      .map((column) => column.trim());

    const [feature, , plannedPhase, , , status] = columns;

    if (
      feature === undefined ||
      plannedPhase === undefined ||
      status === undefined ||
      !completedPhaseNumbers.has(plannedPhase) ||
      status !== 'Planned'
    ) {
      continue;
    }

    failures.push(
      `${plannedPhase} is done in docs/superpowers/feature-maturity.md but feature maturity row "${feature}" is still Planned.`,
    );
  }

  return failures;
}

export function checkFuturePipeline(futurePipelineMarkdown) {
  const failures = [];
  const editorSection = extractMarkdownSection(futurePipelineMarkdown, /Editor Tooling/i);

  if (editorSection === '') {
    failures.push(
      'docs/superpowers/future-pipeline.md is missing an editor tooling section.',
    );
    return failures;
  }

  if (
    /build a real IntelliJ plugin or language service/i.test(editorSection) ||
    /27C IntelliJ plugin or language-service prototype/i.test(editorSection)
  ) {
    failures.push(
      'docs/superpowers/future-pipeline.md still describes the shipped IntelliJ plugin foundation as future work.',
    );
  }

  if (
    !/(Already shipped|Done):/i.test(editorSection) ||
    !/editors\/intellij/.test(editorSection) ||
    !/com\.vankode\.vanrot/.test(editorSection)
  ) {
    failures.push(
      'docs/superpowers/future-pipeline.md editor tooling section must record the shipped `editors/intellij` foundation and `com.vankode.vanrot` plugin metadata.',
    );
  }

  return failures;
}

function extractMarkdownSection(markdown, headingPattern) {
  const lines = markdown.split(/\r?\n/);
  const sectionLines = [];
  let inSection = false;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);

    if (heading && inSection) {
      break;
    }

    if (heading && headingPattern.test(heading[1])) {
      inSection = true;
    }

    if (inSection) {
      sectionLines.push(line);
    }
  }

  return sectionLines.join('\n');
}

function formatPhaseNumber(phaseNumber) {
  return String(phaseNumber).padStart(2, '0');
}

async function readExistingPhasePlans(phases) {
  const planContentByPhase = new Map();

  for (const phase of phases) {
    if (!phase.done || phase.number === 0) {
      continue;
    }

    const planPath = join(
      projectRoot,
      'docs',
      'superpowers',
      'plans',
      `Phase-${formatPhaseNumber(phase.number)}.md`,
    );

    if (!existsSync(planPath)) {
      continue;
    }

    planContentByPhase.set(phase.number, await readFile(planPath, 'utf8'));
  }

  return planContentByPhase;
}

async function verifyPhaseDocs() {
  const maturity = await readFile(
    join(projectRoot, 'docs', 'superpowers', 'feature-maturity.md'),
    'utf8',
  );
  const futurePipeline = await readFile(
    join(projectRoot, 'docs', 'superpowers', 'future-pipeline.md'),
    'utf8',
  );
  const phases = parseMaturityRoadmapPhases(maturity);
  const planContentByPhase = await readExistingPhasePlans(phases);

  return [
    ...checkCompletedPhasePlans(phases, planContentByPhase),
    ...checkMaturityRows(phases, maturity),
    ...checkFuturePipeline(futurePipeline),
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = await verifyPhaseDocs();

  if (failures.length > 0) {
    console.error('Phase documentation verification failed:');

    for (const failure of failures) {
      console.error(`- ${failure}`);
    }

    process.exit(1);
  }

  console.log('Phase documentation verification passed.');
}
