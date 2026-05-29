export interface CliDiagnosticMetadata {
  code: string;
  message: string;
  nextStep: string;
}

export const cliDiagnosticCatalog: readonly CliDiagnosticMetadata[] = [
  {
    code: 'VR_UNKNOWN_COMMAND',
    message: 'Unknown command',
    nextStep: 'Run vr --help.',
  },
  {
    code: 'VR_UNSUPPORTED_JSON',
    message: 'Structured output is not supported for this command',
    nextStep: 'Run the command without --json or --jsonl.',
  },
  {
    code: 'VR_JSON_MODE_CONFLICT',
    message: '--json and --jsonl cannot be used together',
    nextStep: 'Choose either --json or --jsonl.',
  },
  {
    code: 'VR_DOCTOR_FAILED',
    message: 'Project health checks failed',
    nextStep: 'Run vr doctor after fixing the reported findings.',
  },
  {
    code: 'VR_BUILD_FAILED',
    message: 'Build command failed',
    nextStep: 'Run vr build --verbose for diagnostic details.',
  },
  {
    code: 'VR_TEST_FAILED',
    message: 'Test command failed',
    nextStep: 'Run vr test --verbose for diagnostic details.',
  },
  {
    code: 'VR_UPDATE_TARGET_INVALID',
    message: 'Update target is not supported',
    nextStep: 'Run vr update --help.',
  },
  {
    code: 'VR_UPDATE_FAILED',
    message: 'Project file update failed',
    nextStep: 'Fix the reported update error, then rerun vr update.',
  },
  {
    code: 'VR_UPGRADE_PACKAGE_JSON_MISSING',
    message: 'package.json could not be read',
    nextStep: 'Run vr upgrade from a Vanrot project root.',
  },
  {
    code: 'VR_UPGRADE_PACKAGE_JSON_INVALID',
    message: 'package.json contains invalid JSON',
    nextStep: 'Fix package.json, then rerun vr upgrade.',
  },
  {
    code: 'VR_UPGRADE_NO_PACKAGES',
    message: 'No Vanrot packages were found',
    nextStep: 'Add Vanrot packages before running vr upgrade.',
  },
  {
    code: 'VR_UPGRADE_PACKAGE_MANAGER_FAILED',
    message: 'Package manager install failed',
    nextStep: 'Fix the install error, then rerun vr upgrade.',
  },
  {
    code: 'VR_AI_DISABLED',
    message: 'Vanrot AI doorway is disabled',
    nextStep: 'Enable ai.enabled in vanrot.config.ts.',
  },
  {
    code: 'VR_AI_HISTORY_INVALID',
    message: 'Vanrot AI history contains invalid JSONL',
    nextStep: 'Move the invalid history file aside and rerun vr ai summarize.',
  },
] as const;
