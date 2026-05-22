import * as ts from 'typescript';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';

const INPUT_HELPER_NAME = 'input';
const REQUIRED_INPUT_METHOD_NAME = 'required';
const DEFAULT_INPUT_METHOD_NAME = 'default';

export interface ComponentInputMetadata {
  name: string;
  required: boolean;
  modelName: string;
  defaultExpression: string;
}

export interface ComponentInputsResult {
  inputs: ComponentInputMetadata[];
  diagnostics: CompileDiagnostic[];
}

export function readComponentInputs(
  componentPath: string,
  componentSource: string,
  componentName: string,
): ComponentInputsResult {
  const sourceFile = ts.createSourceFile(
    componentPath,
    componentSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const classDeclaration = sourceFile.statements.find((statement): statement is ts.ClassDeclaration => {
    return ts.isClassDeclaration(statement) && statement.name?.text === componentName;
  });

  if (classDeclaration === undefined) {
    return { inputs: [], diagnostics: [] };
  }

  const inputs: ComponentInputMetadata[] = [];
  const diagnostics: CompileDiagnostic[] = [];

  for (const member of classDeclaration.members) {
    if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
      continue;
    }

    const inputDeclaration = readInputDeclaration(sourceFile, member.name.text, member.initializer, componentPath);

    if (inputDeclaration === null) {
      continue;
    }

    if ('diagnostic' in inputDeclaration) {
      diagnostics.push(inputDeclaration.diagnostic);
      continue;
    }

    inputs.push(inputDeclaration.input);
  }

  return { inputs, diagnostics };
}

type InputDeclarationReadResult =
  | { input: ComponentInputMetadata }
  | { diagnostic: CompileDiagnostic }
  | null;

function readInputDeclaration(
  sourceFile: ts.SourceFile,
  inputName: string,
  initializer: ts.Expression | undefined,
  componentPath: string,
): InputDeclarationReadResult {
  if (initializer === undefined || !ts.isCallExpression(initializer)) {
    return null;
  }

  if (!ts.isPropertyAccessExpression(initializer.expression)) {
    return null;
  }

  const receiver = initializer.expression.expression;

  if (!ts.isIdentifier(receiver) || receiver.text !== INPUT_HELPER_NAME) {
    return null;
  }

  const methodName = initializer.expression.name.text;

  if (methodName === REQUIRED_INPUT_METHOD_NAME) {
    if (initializer.arguments.length !== 0) {
      return createInvalidInputDeclaration(componentPath);
    }

    const modelName = initializer.typeArguments?.[0]?.getText(sourceFile);
    const input: ComponentInputMetadata = {
      name: inputName,
      required: true,
      modelName: '',
      defaultExpression: '',
    };

    if (modelName !== undefined) {
      input.modelName = modelName;
    }

    return {
      input,
    };
  }

  if (methodName === DEFAULT_INPUT_METHOD_NAME) {
    if (initializer.arguments.length !== 1) {
      return createInvalidInputDeclaration(componentPath);
    }

    const defaultValue = initializer.arguments[0];

    if (defaultValue === undefined) {
      return createInvalidInputDeclaration(componentPath);
    }

    return {
      input: {
        name: inputName,
        required: false,
        modelName: '',
        defaultExpression: defaultValue.getText(sourceFile),
      },
    };
  }

  return createInvalidInputDeclaration(componentPath);
}

function createInvalidInputDeclaration(componentPath: string): InputDeclarationReadResult {
  return {
    diagnostic: createDiagnostic('VR017', 'error', undefined, componentPath),
  };
}
