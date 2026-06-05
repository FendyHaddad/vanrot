import { collectMetadata } from './arrays.js';
import { FORM_METADATA_KIND } from './constants.js';
import type { FieldFactoryMap, FormMetadata } from './types.js';

export function createFormMetadata(fields: FieldFactoryMap, name?: string): FormMetadata {
  return {
    kind: FORM_METADATA_KIND,
    ...(name ? { name } : {}),
    fields: collectMetadata(fields),
    backendContractGenerated: false,
  };
}
