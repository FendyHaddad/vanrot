import type { DoctorFinding } from '../doctor/checks.js';
import type { Reporter } from './reporter.js';

export function reportDoctorFindings(reporter: Reporter, findings: DoctorFinding[]): void {
  reporter.heading('Vanrot Doctor', `${findings.length} ${findings.length === 1 ? 'finding' : 'findings'}`);

  for (const finding of findings) {
    if (finding.severity === 'error') {
      reporter.error(finding.message, finding.filePath);
      continue;
    }

    reporter.warning(finding.filePath, finding.message);
  }

  reporter.nextSteps(uniqueNextSteps(findings));
}

function uniqueNextSteps(findings: DoctorFinding[]): string[] {
  return [...new Set(findings.map((finding) => finding.nextStep))];
}
