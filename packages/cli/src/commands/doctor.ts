import { loadVanrotProjectConfig } from '@vanrot/config';
import { hasErrors, runDoctorChecks } from '../doctor/checks.js';
import { reportDoctorFindings } from '../reporter/diagnostics.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function doctorCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const findings = await runDoctorChecks(context.cwd);

  if (!findings.some((finding) => finding.code === 'VRT0001')) {
    const loaded = await loadVanrotProjectConfig(context.cwd);

    for (const diagnostic of loaded.diagnostics) {
      findings.push({
        severity: diagnostic.severity,
        code: diagnostic.code,
        filePath: diagnostic.filePath ?? 'vanrot.config.ts',
        message: diagnostic.message,
        nextStep: diagnostic.suggestion,
      });
    }
  }

  reportDoctorFindings(context.reporter, findings);

  return {
    exitCode: hasErrors(findings) ? 1 : 0,
  };
}
