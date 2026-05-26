import { readProjectGraphManifest } from '@vanrot/devtools/node';
import type { NormalizedGraphManifest } from '@vanrot/devtools';

export const vanrotDevtoolsMetadataEndpoint = '/__vanrot/devtools/metadata';

export interface DevtoolsMetadataResponse extends NormalizedGraphManifest {
  endpoint: typeof vanrotDevtoolsMetadataEndpoint;
}

export async function createDevtoolsMetadataResponse(
  cwd: string,
): Promise<DevtoolsMetadataResponse> {
  const result = await readProjectGraphManifest(cwd);

  return {
    endpoint: vanrotDevtoolsMetadataEndpoint,
    ...result,
  };
}
