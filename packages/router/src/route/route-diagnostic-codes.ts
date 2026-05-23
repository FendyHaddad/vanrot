export const routeDiagnosticCodes = {
  duplicatePath: 'VR_ROUTE_DUPLICATE_PATH',
  invalidParentPath: 'VR_ROUTE_INVALID_PARENT_PATH',
  missingRenderTarget: 'VR_ROUTE_MISSING_RENDER_TARGET',
  invalidParamName: 'VR_ROUTE_INVALID_PARAM_NAME',
  missingParam: 'VR_ROUTE_MISSING_PARAM',
  unknownParam: 'VR_ROUTE_UNKNOWN_PARAM',
  unknownQuery: 'VR_ROUTE_UNKNOWN_QUERY',
  queryMetadataRequired: 'VR_ROUTE_QUERY_METADATA_REQUIRED',
  breadcrumbParentMissing: 'VR_ROUTE_BREADCRUMB_PARENT_MISSING',
  breadcrumbParamImpossible: 'VR_ROUTE_BREADCRUMB_PARAM_IMPOSSIBLE',
  invalidTemplateRef: 'VR_ROUTE_INVALID_TEMPLATE_REF',
} as const;

export type RouteDiagnosticCode =
  (typeof routeDiagnosticCodes)[keyof typeof routeDiagnosticCodes];
