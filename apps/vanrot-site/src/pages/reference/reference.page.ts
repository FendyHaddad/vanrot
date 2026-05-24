import {
  commandReference,
  diagnosticReference,
  packageReference,
} from '../../docs/site-reference.ts';

const referenceCopy = {
  title: 'Reference',
  summary:
    'Commands, packages, diagnostics, and current maturity status for the implemented Vanrot framework surface.',
} as const;

export class ReferencePage {
  copy = referenceCopy;
  commands = commandReference;
  packages = packageReference;
  diagnostics = diagnosticReference;
}
