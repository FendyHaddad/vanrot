import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { failedRequiredSteps, summarizeStep } from './model.mjs';

const color = {
  green: '\u001b[32m',
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  reset: '\u001b[0m',
};

export function createReport({
  repositoryRoot,
  packages,
  tarballs,
  steps,
  warnings = [],
  artifacts = [],
  startedAt,
  endedAt,
}) {
  const failedSteps = failedRequiredSteps(steps);

  return {
    success: failedSteps.length === 0,
    startedAt,
    endedAt,
    repositoryRoot,
    packages: packages.map((releasePackage) => releasePackage.name),
    tarballs,
    steps,
    failedSteps,
    warnings,
    artifacts,
  };
}

export async function writeReports({ report, reportDirectory }) {
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(join(reportDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(join(reportDirectory, 'report.md'), formatMarkdownReport(report), 'utf8');
}

export function formatConsoleReport(report) {
  const status = report.success ? `${color.green}pass${color.reset}` : `${color.red}fail${color.reset}`;
  const lines = [`release dry-run ${status}`];

  for (const step of report.steps) {
    lines.push(colorizeSummary(step, summarizeStep(step)));
  }

  for (const warning of report.warnings) {
    lines.push(`${color.yellow}warn${color.reset} ${warning}`);
  }

  if (!report.success) {
    lines.push(`report .vanrot/release-dry-run/report.md`);
  }

  return lines.join('\n');
}

function formatMarkdownReport(report) {
  const failedStep = report.failedSteps[0];
  const outputTail = failedStep?.stderrTail || failedStep?.stdoutTail || failedStep?.message || '';

  return `# Vanrot Release Dry-Run Report

## Summary

- Status: ${report.success ? 'pass' : 'fail'}
- Started: ${report.startedAt}
- Ended: ${report.endedAt}
- Repository: ${report.repositoryRoot}

## Packages

${report.packages.map((packageName) => `- ${packageName}`).join('\n')}

## Steps

${report.steps.map((step) => `- ${summarizeStep(step)}`).join('\n')}

## Failed Step

${failedStep === undefined ? 'None.' : `- Name: ${failedStep.name}
- Command: ${failedStep.command ?? 'n/a'}
- Exit code: ${failedStep.exitCode ?? 'n/a'}`}

## Output Tail

\`\`\`text
${outputTail}
\`\`\`

## Next Action

${report.success ? 'No action needed.' : 'Fix the failed release-path step, then rerun `pnpm verify:release-dry-run`.'}
`;
}

function colorizeSummary(step, summary) {
  if (step.status === 'pass') {
    return `${color.green}${summary}${color.reset}`;
  }

  if (step.status === 'skip') {
    return `${color.yellow}${summary}${color.reset}`;
  }

  return `${color.red}${summary}${color.reset}`;
}
