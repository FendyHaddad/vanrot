export const FORMATTERS_PACKAGE_NAME = '@vanrot/formatters';

export const FORMATTERS_DOCS_PATH = '/docs/formatters';

export const FORMATTERS_METADATA_KIND = 'vanrot-pipes';

export const PIPE_NAMESPACES = {
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  number: 'number',
  currency: 'currency',
  mask: 'mask',
} as const;

export const PIPE_DIAGNOSTIC_CODES = {
  unknown: 'VR_PIPE_UNKNOWN',
  unknownVariant: 'VR_PIPE_UNKNOWN_VARIANT',
  duplicateName: 'VR_PIPE_DUPLICATE_NAME',
  duplicatePreset: 'VR_PIPE_DUPLICATE_PRESET',
  invalidArgument: 'VR_PIPE_INVALID_ARGUMENT',
  invalidDefinition: 'VR_PIPE_INVALID_DEFINITION',
  asyncPipe: 'VR_PIPE_ASYNC',
} as const;
