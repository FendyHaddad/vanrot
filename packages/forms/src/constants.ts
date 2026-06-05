export const FORMS_PACKAGE_NAME = '@vanrot/forms';

export const FORM_METADATA_KIND = 'vanrot-form';

export const FORM_DIAGNOSTIC_CODES = {
  missingDefault: 'VR_FORM_MISSING_DEFAULT',
  unsafeAsyncResource: 'VR_FORM_UNSAFE_ASYNC_RESOURCE',
  sensitiveDraftField: 'VR_FORM_SENSITIVE_DRAFT_FIELD',
  repeatedStringPath: 'VR_FORM_REPEATED_STRING_PATH',
  unsupportedTwoWayBinding: 'VR_FORM_UNSUPPORTED_TWO_WAY_BINDING',
  invalidServerErrorPath: 'VR_FORM_INVALID_SERVER_ERROR_PATH',
  invalidSchemaAdapter: 'VR_FORM_INVALID_SCHEMA_ADAPTER',
} as const;

export const DEFAULT_SENSITIVE_FIELD_NAMES = ['password', 'secret', 'token', 'key', 'credential'] as const;

export const SERVER_ERROR_SOURCE = 'server';
export const SCHEMA_ERROR_SOURCE = 'schema';
export const VALIDATION_ERROR_SOURCE = 'validation';
export const RESOURCE_ERROR_SOURCE = 'resource';
