import { getCurrentMatch } from '@vanrot/router';
import {
  getSiteArticle,
  siteArticleKey,
  siteArticles,
  type SiteArticle,
  type SiteArticleSection,
} from '../../docs/site-data.ts';

const routeKeyToArticleKey = {
  docsIntroduction: siteArticleKey.introduction,
  docsInstallation: siteArticleKey.installation,
  docsProjectStructure: siteArticleKey.projectStructure,
  docsRuntime: siteArticleKey.runtime,
  docsRuntimeSignals: siteArticleKey.runtimeSignals,
  docsRuntimeInputs: siteArticleKey.runtimeInputs,
  docsRuntimeForms: siteArticleKey.runtimeForms,
  docsRuntimeControllers: siteArticleKey.runtimeControllers,
  docsRuntimeDevtoolsGraph: siteArticleKey.runtimeDevtoolsGraph,
  docsRuntimeLifecycle: siteArticleKey.runtimeLifecycle,
  docsRuntimeMounting: siteArticleKey.runtimeMounting,
  docsBehavior: siteArticleKey.behavior,
  docsBehaviorForm: siteArticleKey.behaviorForm,
  docsBehaviorOverlay: siteArticleKey.behaviorOverlay,
  docsBehaviorTooltip: siteArticleKey.behaviorTooltip,
  docsBehaviorTabs: siteArticleKey.behaviorTabs,
  docsBehaviorTable: siteArticleKey.behaviorTable,
  docsBehaviorToast: siteArticleKey.behaviorToast,
  docsBehaviorCommandMenu: siteArticleKey.behaviorCommandMenu,
  docsBehaviorPositionedLayer: siteArticleKey.behaviorPositionedLayer,
  docsSeo: siteArticleKey.seo,
  docsSeoPackageBoundary: siteArticleKey.seoPackageBoundary,
  docsSeoMetadataLadder: siteArticleKey.seoMetadataLadder,
  docsSeoConfigControlPlane: siteArticleKey.seoConfigControlPlane,
  docsSeoCreateAndAddFlows: siteArticleKey.seoCreateAndAddFlows,
  docsSeoDoctorAndBuildOutput: siteArticleKey.seoDoctorAndBuildOutput,
  docsSeoSocialImages: siteArticleKey.seoSocialImages,
  docsCompiler: siteArticleKey.compiler,
  docsCompilerFileConventions: siteArticleKey.compilerFileConventions,
  docsCompilerComponentClass: siteArticleKey.compilerComponentClass,
  docsCompilerTemplateSyntax: siteArticleKey.compilerTemplateSyntax,
  docsCompilerExpressions: siteArticleKey.compilerExpressions,
  docsCompilerEventBinding: siteArticleKey.compilerEventBinding,
  docsCompilerScopedCss: siteArticleKey.compilerScopedCss,
  docsCompilerChildComponents: siteArticleKey.compilerChildComponents,
  docsCompilerSlots: siteArticleKey.compilerSlots,
  docsCompilerIfElse: siteArticleKey.compilerIfElse,
  docsCompilerFor: siteArticleKey.compilerFor,
  docsCompilerInputs: siteArticleKey.compilerInputs,
  docsCompilerSourceMaps: siteArticleKey.compilerSourceMaps,
  docsCompilerCompilationApi: siteArticleKey.compilerCompilationApi,
  docsVitePlugin: siteArticleKey.vitePlugin,
  docsVitePluginSetup: siteArticleKey.vitePluginSetup,
  docsVitePluginOptions: siteArticleKey.vitePluginOptions,
  docsVitePluginTransform: siteArticleKey.vitePluginTransform,
  docsVitePluginHotReload: siteArticleKey.vitePluginHotReload,
  docsVitePluginVirtualModules: siteArticleKey.vitePluginVirtualModules,
  docsVitePluginDiagnostics: siteArticleKey.vitePluginDiagnostics,
  docsVitePluginSourceMaps: siteArticleKey.vitePluginSourceMaps,
  docsVitePluginDevtoolsMetadata: siteArticleKey.vitePluginDevtoolsMetadata,
  docsCli: siteArticleKey.cli,
  docsCliCommandSurface: siteArticleKey.cliCommandSurface,
  docsCliProjectCreation: siteArticleKey.cliProjectCreation,
  docsCliRoleGeneration: siteArticleKey.cliRoleGeneration,
  docsCliUiPrimitiveAdd: siteArticleKey.cliUiPrimitiveAdd,
  docsCliConfigMaintenance: siteArticleKey.cliConfigMaintenance,
  docsCliProjectIntelligence: siteArticleKey.cliProjectIntelligence,
  docsCliTaskRunners: siteArticleKey.cliTaskRunners,
  docsCliDevServer: siteArticleKey.cliDevServer,
  docsCliBuild: siteArticleKey.cliBuild,
  docsCliTest: siteArticleKey.cliTest,
  docsConfiguration: siteArticleKey.configuration,
  docsConfigurationFile: siteArticleKey.configurationFile,
  docsConfigurationDefaults: siteArticleKey.configurationDefaults,
  docsConfigurationUi: siteArticleKey.configurationUi,
  docsConfigurationRouter: siteArticleKey.configurationRouter,
  docsConfigurationAi: siteArticleKey.configurationAi,
  docsConfigurationMaintenance: siteArticleKey.configurationMaintenance,
  docsRouting: siteArticleKey.routing,
  docsRoutingRouteTable: siteArticleKey.routingRouteTable,
  docsRoutingParamsQuery: siteArticleKey.routingParamsQuery,
  docsRoutingLayoutsRedirects: siteArticleKey.routingLayoutsRedirects,
  docsRoutingGuards: siteArticleKey.routingGuards,
  docsRoutingNavigation: siteArticleKey.routingNavigation,
  docsRoutingPreloadingKeepAlive: siteArticleKey.routingPreloadingKeepAlive,
  docsSsrHydration: siteArticleKey.ssrHydration,
  docsSsrPackageBoundary: siteArticleKey.ssrPackageBoundary,
  docsSsrRenderDocument: siteArticleKey.ssrRenderDocument,
  docsSsrHydrationContract: siteArticleKey.ssrHydrationContract,
  docsSsrStateSerialization: siteArticleKey.ssrStateSerialization,
  docsSsrRouter: siteArticleKey.ssrRouter,
  docsSsrDeferredStreaming: siteArticleKey.ssrDeferredStreaming,
  docsUi: siteArticleKey.uiOctober,
  docsTheming: siteArticleKey.theming,
  docsVanrotstyles: siteArticleKey.vanrotstyles,
  docsTesting: siteArticleKey.testing,
  docsTestingComponent: siteArticleKey.testingComponent,
  docsTestingScreen: siteArticleKey.testingScreen,
  docsTestingRouting: siteArticleKey.testingRouting,
  docsTestingStrategy: siteArticleKey.testingStrategy,
  docsForms: siteArticleKey.forms,
  docsFormsBoundary: siteArticleKey.formsBoundary,
  docsFormsFieldRefs: siteArticleKey.formsFieldRefs,
  docsFormsValidationLifecycle: siteArticleKey.formsValidationLifecycle,
  docsFormsAsyncResources: siteArticleKey.formsAsyncResources,
  docsFormsArraysWizardsErrors: siteArticleKey.formsArraysWizardsErrors,
  docsFormsDraftPersistence: siteArticleKey.formsDraftPersistence,
  docsFormsToolingTests: siteArticleKey.formsToolingTests,
  docsStore: siteArticleKey.store,
  docsStoreActions: siteArticleKey.storeActions,
  docsStoreSelectors: siteArticleKey.storeSelectors,
  docsStoreReducers: siteArticleKey.storeReducers,
  docsStoreEffects: siteArticleKey.storeEffects,
  docsStorePageUsage: siteArticleKey.storePageUsage,
  docsStoreInspection: siteArticleKey.storeInspection,
  docsStoreReplay: siteArticleKey.storeReplay,
  docsFormatters: siteArticleKey.formatters,
  docsFormattersCompilerOwned: siteArticleKey.formattersCompilerOwned,
  docsFormattersTemplatePipes: siteArticleKey.formattersTemplatePipes,
  docsFormattersBuiltInSuite: siteArticleKey.formattersBuiltInSuite,
  docsFormattersBuiltInArguments: siteArticleKey.formattersBuiltInArguments,
  docsFormattersPipeRoleFiles: siteArticleKey.formattersPipeRoleFiles,
  docsFormattersNamedPresets: siteArticleKey.formattersNamedPresets,
  docsFormattersEnumPipes: siteArticleKey.formattersEnumPipes,
  docsFormattersContext: siteArticleKey.formattersContext,
  docsFormattersCompilerDiagnostics: siteArticleKey.formattersCompilerDiagnostics,
  docsFormattersViteTooling: siteArticleKey.formattersViteTooling,
  docsFormattersTesting: siteArticleKey.formattersTesting,
  docsDevtools: siteArticleKey.devtools,
  docsDevtoolsProjectMap: siteArticleKey.devtoolsProjectMap,
  docsDevtoolsRuntimeGraph: siteArticleKey.devtoolsRuntimeGraph,
  docsDevtoolsViteMetadata: siteArticleKey.devtoolsViteMetadata,
  docsDevtoolsPanelState: siteArticleKey.devtoolsPanelState,
  docsDevtoolsStaleState: siteArticleKey.devtoolsStaleState,
  docsExamples: siteArticleKey.examples,
  docsWebglThreejs: siteArticleKey.webglThreejs,
  docsConventions: siteArticleKey.conventions,
  docsConventionsRoleFiles: siteArticleKey.conventionsRoleFiles,
  docsConventionsTemplatesStyles: siteArticleKey.conventionsTemplatesStyles,
  docsConventionsStateLogic: siteArticleKey.conventionsStateLogic,
  docsConventionsRoutingStrings: siteArticleKey.conventionsRoutingStrings,
  docsConventionsScopedCss: siteArticleKey.conventionsScopedCss,
  docsConventionsAiReadable: siteArticleKey.conventionsAiReadable,
  docsChangelog: siteArticleKey.changelog,
} as const;

type ArticleRouteKey = keyof typeof routeKeyToArticleKey;

interface DocsArticleViewSection extends SiteArticleSection {
  points: readonly string[];
  code: {
    title: string;
    code: string;
    isEmpty: boolean;
    lines: readonly DocsCodeLine[];
  };
  note: string;
}

interface DocsCodeLine {
  number: number;
  content: string;
  tokens: readonly DocsCodeToken[];
}

interface DocsCodeToken {
  id: string;
  kind: DocsCodeTokenKind;
  text: string;
}

const emptyCode = {
  title: '',
  code: '',
  isEmpty: true,
} as const;

type DocsCodeTokenKind =
  | 'comment'
  | 'function'
  | 'keyword'
  | 'number'
  | 'operator'
  | 'property'
  | 'punctuation'
  | 'string'
  | 'text';

const codeKeywords = new Set([
  'as',
  'const',
  'else',
  'export',
  'false',
  'from',
  'function',
  'if',
  'import',
  'interface',
  'let',
  'new',
  'readonly',
  'return',
  'true',
  'type',
]);

const punctuationCharacters = new Set(['(', ')', '{', '}', '[', ']', ',', ';']);

const operatorCharacters = new Set(['=', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '?', ':', '.']);

const pairedOperators = new Set(['=>', '===', '!==', '>=', '<=', '&&', '||', '??', '+=', '-=', '*=', '/=']);

export class DocsArticlePage {
  article(): SiteArticle {
    const routeKey = getCurrentMatch()?.route.key;

    if (isArticleRouteKey(routeKey)) {
      return getSiteArticle(routeKeyToArticleKey[routeKey]);
    }

    return siteArticles.introduction;
  }

  articleSections(): readonly DocsArticleViewSection[] {
    return this.article().sections.map(toViewSection);
  }
}

function isArticleRouteKey(value: string | undefined): value is ArticleRouteKey {
  return value !== undefined && value in routeKeyToArticleKey;
}

function toViewSection(section: SiteArticleSection): DocsArticleViewSection {
  return {
    ...section,
    points: section.points ?? [],
    code: toViewCode(section.code),
    note: section.note ?? '',
  };
}

function toViewCode(code: SiteArticleSection['code']): DocsArticleViewSection['code'] {
  const source = code ?? emptyCode;
  const normalizedCode = normalizeCodeSource(source.code);

  return {
    ...source,
    code: normalizedCode,
    isEmpty: normalizedCode.length === 0,
    lines: toCodeLines(normalizedCode),
  };
}

function normalizeCodeSource(code: string): string {
  return code.replaceAll('\\n', '\n');
}

function toCodeLines(code: string): readonly DocsCodeLine[] {
  if (code === '') {
    return [];
  }

  return code.split('\n').map((content, index) => ({
    number: index + 1,
    content,
    tokens: toCodeTokens(content, index + 1),
  }));
}

function toCodeTokens(content: string, lineNumber: number): readonly DocsCodeToken[] {
  const tokens: DocsCodeToken[] = [];
  let offset = 0;

  while (offset < content.length) {
    if (content.startsWith('//', offset)) {
      pushToken(tokens, lineNumber, 'comment', content.slice(offset));
      break;
    }

    const character = content.charAt(offset);

    if (isWhitespace(character)) {
      const end = readWhile(content, offset, isWhitespace);
      pushToken(tokens, lineNumber, 'text', content.slice(offset, end));
      offset = end;
      continue;
    }

    if (isQuote(character)) {
      const end = readStringEnd(content, offset);
      pushToken(tokens, lineNumber, 'string', content.slice(offset, end));
      offset = end;
      continue;
    }

    if (isDigit(character)) {
      const end = readWhile(content, offset, isDigit);
      pushToken(tokens, lineNumber, 'number', content.slice(offset, end));
      offset = end;
      continue;
    }

    if (isIdentifierStart(character)) {
      const end = readWhile(content, offset, isIdentifierPart);
      const text = content.slice(offset, end);
      pushToken(tokens, lineNumber, codeTokenKind(text, content, offset, end), text);
      offset = end;
      continue;
    }

    if (punctuationCharacters.has(character)) {
      pushToken(tokens, lineNumber, 'punctuation', character);
      offset += 1;
      continue;
    }

    if (operatorCharacters.has(character)) {
      const pairedOperator = content.slice(offset, offset + 2);
      const end = pairedOperators.has(pairedOperator) ? offset + 2 : offset + 1;
      pushToken(tokens, lineNumber, 'operator', content.slice(offset, end));
      offset = end;
      continue;
    }

    pushToken(tokens, lineNumber, 'text', character);
    offset += 1;
  }

  return tokens;
}

function pushToken(tokens: DocsCodeToken[], lineNumber: number, kind: DocsCodeTokenKind, text: string): void {
  tokens.push({
    id: `${lineNumber}-${tokens.length}`,
    kind,
    text,
  });
}

function codeTokenKind(
  text: string,
  content: string,
  start: number,
  end: number,
): DocsCodeTokenKind {
  if (codeKeywords.has(text)) {
    return 'keyword';
  }

  if (previousNonWhitespace(content, start) === '.') {
    return 'property';
  }

  if (nextNonWhitespace(content, end) === '(') {
    return 'function';
  }

  return 'text';
}

function readWhile(content: string, start: number, predicate: (character: string) => boolean): number {
  let offset = start;

  while (offset < content.length && predicate(content.charAt(offset))) {
    offset += 1;
  }

  return offset;
}

function readStringEnd(content: string, start: number): number {
  const quote = content.charAt(start);
  let offset = start + 1;

  while (offset < content.length) {
    if (content.charAt(offset) === '\\') {
      offset += 2;
      continue;
    }

    if (content.charAt(offset) === quote) {
      return offset + 1;
    }

    offset += 1;
  }

  return content.length;
}

function previousNonWhitespace(content: string, start: number): string {
  for (let offset = start - 1; offset >= 0; offset -= 1) {
    const character = content.charAt(offset);

    if (!isWhitespace(character)) {
      return character;
    }
  }

  return '';
}

function nextNonWhitespace(content: string, start: number): string {
  for (let offset = start; offset < content.length; offset += 1) {
    const character = content.charAt(offset);

    if (!isWhitespace(character)) {
      return character;
    }
  }

  return '';
}

function isWhitespace(character: string): boolean {
  return character === ' ' || character === '\t';
}

function isQuote(character: string): boolean {
  return character === "'" || character === '"' || character === '`';
}

function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

function isIdentifierStart(character: string): boolean {
  return (character >= 'A' && character <= 'Z') || (character >= 'a' && character <= 'z') || character === '_' || character === '$';
}

function isIdentifierPart(character: string): boolean {
  return isIdentifierStart(character) || isDigit(character);
}
