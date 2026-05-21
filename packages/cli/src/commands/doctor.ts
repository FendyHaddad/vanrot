import { hasErrors, runDoctorChecks } from '../doctor/checks.js';
import { reportDoctorFindings } from '../reporter/diagnostics.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function doctorCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const findings = await runDoctorChecks(context.cwd);

  reportDoctorFindings(context.reporter, findings);

  return {
    exitCode: hasErrors(findings) ? 1 : 0,
  };
}
