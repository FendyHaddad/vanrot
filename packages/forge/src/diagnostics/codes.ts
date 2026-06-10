export const forgeDiagnosticCode = {
  devNotImplemented: 'VRFORGE001',
  buildNotImplemented: 'VRFORGE002',
  unknownCommand: 'VRFORGE003',
  missingSourceRoot: 'VRFORGE004',
  unsupportedFileRole: 'VRFORGE005',
  routeDiscoveryFailed: 'VRFORGE006',
  compileDiagnostic: 'VRFORGE007',
} as const;

export type ForgeDiagnosticCode =
  (typeof forgeDiagnosticCode)[keyof typeof forgeDiagnosticCode];
