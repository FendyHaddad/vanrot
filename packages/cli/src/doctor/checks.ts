import { checkBehaviorUsage } from './behavior.js';
import { checkProjectHealth } from './project-health.js';
import { checkVanrotRules } from './vanrot-rules.js';

export type DoctorSeverity = 'error' | 'warning';

export interface DoctorFinding {
  severity: DoctorSeverity;
  code: string;
  filePath: string;
  message: string;
  nextStep: string;
}

export async function runDoctorChecks(cwd: string): Promise<DoctorFinding[]> {
  return [
    ...(await checkProjectHealth(cwd)),
    ...(await checkVanrotRules(cwd)),
    ...(await checkBehaviorUsage(cwd)),
  ];
}

export function hasErrors(findings: DoctorFinding[]): boolean {
  return findings.some((finding) => finding.severity === 'error');
}
