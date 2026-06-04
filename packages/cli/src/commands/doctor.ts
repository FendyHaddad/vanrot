import { loadVanrotProjectConfig } from '@vanrot/config';
import { hasErrors, runDoctorChecks } from '../doctor/checks.js';
import { buildProjectMap, type ProjectMap } from '../intelligence/project-map.js';
import { reportDoctorFindings } from '../reporter/diagnostics.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail } from '../result.js';
import { commandInvocation, commandName } from './metadata.js';

export async function doctorCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const inspect = args.includes('--inspect');
  const unknownArg = args.find((arg) => arg !== '--inspect');

  if (unknownArg !== undefined) {
    context.reporter.error(
      `Unknown option for ${commandInvocation(commandName.doctor)}`,
      `Unexpected argument: ${unknownArg}`,
    );
    return fail();
  }

  const findings = await runDoctorChecks(context.cwd);
  const loaded = !findings.some((finding) => finding.code === 'VRT0001')
    ? await loadVanrotProjectConfig(context.cwd)
    : null;

  if (loaded !== null) {
    for (const diagnostic of loaded.diagnostics) {
      findings.push({
        severity: diagnostic.severity,
        code: diagnostic.code,
        filePath: diagnostic.filePath ?? 'vanrot.config.ts',
        message: `${diagnostic.code} ${diagnostic.message}`,
        nextStep: diagnostic.suggestion,
      });
    }
  }

  reportDoctorFindings(context.reporter, findings);

  if (inspect && loaded !== null) {
    reportProjectIntelligence(
      await buildProjectMap(context.cwd, {
        ai: loaded.config.ai,
        configSource: loaded.exists ? 'vanrot.config.ts' : null,
      }),
      context,
    );
  }

  return {
    exitCode: hasErrors(findings) ? 1 : 0,
  };
}

function reportProjectIntelligence(map: ProjectMap, context: CommandContext): void {
  context.reporter.heading('Project Intelligence', `schema ${map.schemaVersion}`);
  context.reporter.success('roles', roleSummary(map));
  context.reporter.success('graph', `${map.graph.nodes.length} nodes, ${map.graph.edges.length} edges`);
  context.reporter.success('routes', `routes: ${map.routes.length}`);
  context.reporter.success('i18n', `locales: ${map.i18n.locales.length}`);

  for (const reason of map.stale.reasons) {
    context.reporter.warning('project-map stale', reason);
  }
}

function roleSummary(map: ProjectMap): string {
  return [
    `components: ${map.roles.components.length}`,
    `pages: ${map.roles.pages.length}`,
    `dialogs: ${map.roles.dialogs.length}`,
    `layouts: ${map.roles.layouts.length}`,
    `widgets: ${map.roles.widgets.length}`,
    `forms: ${map.roles.forms.length}`,
  ].join(', ');
}
