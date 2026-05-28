#!/usr/bin/env node
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { startLanguageServer } from '../server.js';

const connection = createConnection(ProposedFeatures.all);
startLanguageServer(connection);
