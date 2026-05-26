import ts from 'typescript';

export function upsertVanrotConfigDomain(
  sourceText: string,
  domainName: string,
  domainValueSource: string,
): string {
  const sourceFile = ts.createSourceFile(
    'vanrot.config.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  if (sourceText.includes(`${domainName}:`)) {
    return sourceText;
  }

  const marker = 'devServer: { port: 1990 },';
  if (sourceText.includes(marker)) {
    return sourceText.replace(marker, `${marker}\n  ${domainName}: ${domainValueSource},`);
  }

  const closing = '});';
  if (sourceText.includes(closing)) {
    return sourceText.replace(closing, `  ${domainName}: ${domainValueSource},\n${closing}`);
  }

  return sourceFile.getFullText();
}

export function removeVanrotConfigDomainIfGenerated(
  sourceText: string,
  domainName: string,
  generatedDomainValueSource: string,
): string {
  const domainLine = `${domainName}: ${generatedDomainValueSource},`;

  if (!sourceText.includes(domainLine)) {
    return sourceText;
  }

  return sourceText.replace(`  ${domainLine}\n`, '');
}
