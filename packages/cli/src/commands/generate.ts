import { isKebabCase } from '../generate/names.js';
import { writeRoleFiles, type Role } from '../generate/write-role-files.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function generateCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const [role, name] = args;
  const feature = readOption(args, '--feature');

  if (role !== 'component' && role !== 'page') {
    context.reporter.error(
      'Unsupported generator role.',
      'Use vr generate component <name> or vr generate page <name>.',
    );
    return fail();
  }

  if (name === undefined) {
    context.reporter.error('Missing generated file name.', `Run vr generate ${role} <name>.`);
    return fail();
  }

  if (!isKebabCase(name)) {
    context.reporter.error('Use lowercase kebab-case names.', `Received ${name}.`);
    return fail();
  }

  if (feature !== undefined && !isKebabCase(feature)) {
    context.reporter.error('Use lowercase kebab-case feature names.', `Received ${feature}.`);
    return fail();
  }

  const result = await writeRoleFiles({
    cwd: context.cwd,
    role: role as Role,
    name,
    ...(feature !== undefined ? { feature } : {}),
  });

  context.reporter.heading(`Generated ${role} ${name}`, `${result.files.length} files`);

  for (const file of result.files) {
    context.reporter.success(file);
  }

  return ok();
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
