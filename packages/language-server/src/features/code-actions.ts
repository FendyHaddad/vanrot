import { type CodeAction, CodeActionKind, type Diagnostic } from 'vscode-languageserver';

export interface BuildCodeActionsInput {
  documentUri: string;
  diagnostics: readonly Diagnostic[];
  routes: Array<{ name: string; path: string | null }>;
  webTypesSources: string[];
}

export function buildCodeActions(input: BuildCodeActionsInput): CodeAction[] {
  return input.diagnostics.flatMap((diagnostic) => {
    if (diagnostic.code === 'VREDITOR001') {
      return routeTypoActions(input.documentUri, diagnostic, input.routes);
    }

    if (diagnostic.code === 'VREDITOR003') {
      return metadataActions(diagnostic, input.webTypesSources);
    }

    return [];
  });
}

function routeTypoActions(
  documentUri: string,
  diagnostic: Diagnostic,
  routes: BuildCodeActionsInput['routes'],
): CodeAction[] {
  const typo = routeNameFromMessage(diagnostic.message);
  const closest = closestRoute(typo, routes.map((route) => route.name));

  if (closest === null) {
    return [];
  }

  return [
    {
      title: `Replace with route.${closest}`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [documentUri]: [{ range: diagnostic.range, newText: `route.${closest}` }],
        },
      },
    },
  ];
}

function metadataActions(diagnostic: Diagnostic, sources: readonly string[]): CodeAction[] {
  const source = sources[0];

  if (source === undefined) {
    return [];
  }

  return [
    {
      title: `Open ${source}`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      command: {
        title: `Open ${source}`,
        command: 'vanrot.openWebTypesSource',
        arguments: [source],
      },
    },
  ];
}

function routeNameFromMessage(message: string): string {
  const match = message.match(/route\.([A-Za-z0-9_-]+)/);
  return match?.[1] ?? '';
}

function closestRoute(value: string, candidates: readonly string[]): string | null {
  let best: { value: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const distance = levenshtein(value, candidate);

    if (best === null || distance < best.distance) {
      best = { value: candidate, distance };
    }
  }

  return best !== null && best.distance <= 3 ? best.value : null;
}

function levenshtein(left: string, right: string): number {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);

  for (let column = 1; column <= right.length; column += 1) {
    rows[0]![column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      rows[row]![column] = Math.min(
        rows[row - 1]![column]! + 1,
        rows[row]![column - 1]! + 1,
        rows[row - 1]![column - 1]! + cost,
      );
    }
  }

  return rows[left.length]![right.length]!;
}
