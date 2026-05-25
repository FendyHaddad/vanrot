import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { ElementNode, TemplateAttribute } from '../template/ast.js';
import type { CompilerUiElement } from './ui-elements.js';
import { createInvalidUiVariantMessage } from './ui-elements.js';

interface ResolveUiTokenAttributesInput {
  node: ElementNode;
  templatePath: string;
  templateSource: string;
  uiElement: CompilerUiElement;
}

interface SelectedToken {
  attribute: TemplateAttribute;
  groupName: string;
  token: string;
}

export interface ResolvedUiTokenAttributes {
  activeTokens: Readonly<Record<string, string>>;
  classNames: readonly string[];
  consumedAttributeNames: ReadonlySet<string>;
  diagnostics: readonly CompileDiagnostic[];
}

const dottedTokenAttributePattern = /^([a-z][a-z0-9]*)\.([a-z0-9]+)$/;

export function resolveUiTokenAttributes(
  input: ResolveUiTokenAttributesInput,
): ResolvedUiTokenAttributes {
  const consumedAttributeNames = new Set<string>();
  const diagnostics: CompileDiagnostic[] = [];
  const selectedTokens = new Map<string, SelectedToken>();

  collectDottedTokens(input, selectedTokens, consumedAttributeNames, diagnostics);
  collectLegacyVariantToken(input, selectedTokens, consumedAttributeNames, diagnostics);

  const activeTokens = createActiveTokenMap(input.uiElement, selectedTokens);
  const classNames = createTokenClassNames(input.uiElement, selectedTokens);

  return {
    activeTokens,
    classNames,
    consumedAttributeNames,
    diagnostics,
  };
}

function collectDottedTokens(
  input: ResolveUiTokenAttributesInput,
  selectedTokens: Map<string, SelectedToken>,
  consumedAttributeNames: Set<string>,
  diagnostics: CompileDiagnostic[],
): void {
  for (const attribute of input.node.attributes) {
    const match = dottedTokenAttributePattern.exec(attribute.name);

    if (match === null) {
      continue;
    }

    consumedAttributeNames.add(attribute.name);

    const groupName = match[1] ?? '';
    const token = match[2] ?? '';
    const tokenGroup = input.uiElement.tokenGroups[groupName];

    if (tokenGroup === undefined && isDottedOpenAttribute(groupName)) {
      continue;
    }

    if (tokenGroup === undefined || !tokenGroup.tokens.includes(token)) {
      diagnostics.push(createUnknownTokenDiagnostic(input, attribute));
      continue;
    }

    if (selectedTokens.has(groupName)) {
      diagnostics.push(createDuplicateTokenDiagnostic(input, attribute, groupName));
      continue;
    }

    selectedTokens.set(groupName, {
      attribute,
      groupName,
      token,
    });
  }
}

function isDottedOpenAttribute(groupName: string): boolean {
  return groupName === 'value';
}

function collectLegacyVariantToken(
  input: ResolveUiTokenAttributesInput,
  selectedTokens: Map<string, SelectedToken>,
  consumedAttributeNames: Set<string>,
  diagnostics: CompileDiagnostic[],
): void {
  const variantAttribute = input.node.attributes.find((attribute) => attribute.name === 'variant');

  if (variantAttribute === undefined) {
    return;
  }

  consumedAttributeNames.add(variantAttribute.name);

  const requestedVariant = variantAttribute.value.trim();
  const matchingGroupName = findTokenGroupNameForToken(input.uiElement, requestedVariant);

  if (matchingGroupName === null) {
    diagnostics.push(
      createDiagnostic(
        'VR019',
        'error',
        createInvalidUiVariantMessage(
          input.uiElement.tagName,
          requestedVariant,
          listAllTokenValues(input.uiElement),
        ),
        input.templatePath,
        undefined,
        undefined,
        {
          source: input.templateSource,
          span: variantAttribute.span,
        },
      ),
    );
    return;
  }

  if (selectedTokens.has(matchingGroupName)) {
    diagnostics.push(createDuplicateTokenDiagnostic(input, variantAttribute, matchingGroupName));
    return;
  }

  selectedTokens.set(matchingGroupName, {
    attribute: variantAttribute,
    groupName: matchingGroupName,
    token: requestedVariant,
  });
}

function createActiveTokenMap(
  uiElement: CompilerUiElement,
  selectedTokens: ReadonlyMap<string, SelectedToken>,
): Record<string, string> {
  const activeTokens: Record<string, string> = {};

  for (const [groupName, tokenGroup] of Object.entries(uiElement.tokenGroups)) {
    activeTokens[groupName] = selectedTokens.get(groupName)?.token ?? tokenGroup.defaultToken;
  }

  return activeTokens;
}

function createTokenClassNames(
  uiElement: CompilerUiElement,
  selectedTokens: ReadonlyMap<string, SelectedToken>,
): string[] {
  const classNames: string[] = [];
  const emittedGroups = new Set<string>();

  for (const selectedToken of selectedTokens.values()) {
    const className =
      uiElement.tokenGroups[selectedToken.groupName]?.classByToken[selectedToken.token] ?? '';

    emittedGroups.add(selectedToken.groupName);

    if (className.length === 0) {
      continue;
    }

    classNames.push(className);
  }

  for (const [groupName, tokenGroup] of Object.entries(uiElement.tokenGroups)) {
    if (emittedGroups.has(groupName)) {
      continue;
    }

    const token = tokenGroup.defaultToken;
    const className = tokenGroup.classByToken[token] ?? '';

    if (className.length === 0) {
      continue;
    }

    classNames.push(className);
  }

  return classNames;
}

function findTokenGroupNameForToken(uiElement: CompilerUiElement, token: string): string | null {
  for (const [groupName, tokenGroup] of Object.entries(uiElement.tokenGroups)) {
    if (tokenGroup.tokens.includes(token)) {
      return groupName;
    }
  }

  return null;
}

function createDuplicateTokenDiagnostic(
  input: ResolveUiTokenAttributesInput,
  attribute: TemplateAttribute,
  groupName: string,
): CompileDiagnostic {
  return createDiagnostic(
    'VR020',
    'error',
    `Duplicate ${groupName} token for <${input.uiElement.tagName}>. Use only one of: ${formatGroupTokens(
      input,
      groupName,
    )}.`,
    input.templatePath,
    undefined,
    undefined,
    {
      source: input.templateSource,
      span: attribute.span,
    },
  );
}

function createUnknownTokenDiagnostic(
  input: ResolveUiTokenAttributesInput,
  attribute: TemplateAttribute,
): CompileDiagnostic {
  return createDiagnostic(
    'VR021',
    'error',
    `Unknown token "${attribute.name}" for <${input.uiElement.tagName}>. Supported tokens: ${formatAllTokens(
      input.uiElement,
    )}.`,
    input.templatePath,
    undefined,
    undefined,
    {
      source: input.templateSource,
      span: attribute.span,
    },
  );
}

function formatGroupTokens(input: ResolveUiTokenAttributesInput, groupName: string): string {
  const tokenGroup = input.uiElement.tokenGroups[groupName];

  if (tokenGroup === undefined) {
    return '';
  }

  return tokenGroup.tokens.map((token) => `${groupName}.${token}`).join(', ');
}

function formatAllTokens(uiElement: CompilerUiElement): string {
  const formattedTokens: string[] = [];

  for (const [groupName, tokenGroup] of Object.entries(uiElement.tokenGroups)) {
    formattedTokens.push(...tokenGroup.tokens.map((token) => `${groupName}.${token}`));
  }

  return formattedTokens.join(', ');
}

function listAllTokenValues(uiElement: CompilerUiElement): string[] {
  const tokens = new Set<string>();

  for (const tokenGroup of Object.values(uiElement.tokenGroups)) {
    for (const token of tokenGroup.tokens) {
      tokens.add(token);
    }
  }

  return [...tokens];
}
