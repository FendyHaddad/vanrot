#!/usr/bin/env node
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { exportEditorIntelligence } from '../project/export-intelligence.js';
import { startLanguageServer } from '../server.js';

const [, , command, projectRoot] = process.argv;

if (command === '--export-intelligence') {
  if (projectRoot === undefined) {
    console.error('Usage: vanrot-language-server --export-intelligence <projectRoot>');
    process.exitCode = 1;
  } else {
    console.log(exportEditorIntelligence(projectRoot));
  }
} else {
  const connection = createConnection(ProposedFeatures.all);
  startLanguageServer(connection);
}
