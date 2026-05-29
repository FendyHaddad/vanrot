import * as ts from 'typescript';

export function createVirtualLanguageService(fileName: string, text: string): ts.LanguageService {
  const files = new Map<string, { text: string; version: number }>();
  files.set(fileName, { text, version: 1 });

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [...files.keys()],
    getScriptVersion: (name) => String(files.get(name)?.version ?? 0),
    getScriptSnapshot: (name) => {
      const file = files.get(name);

      if (file !== undefined) {
        return ts.ScriptSnapshot.fromString(file.text);
      }

      if (!ts.sys.fileExists(name)) {
        return undefined;
      }

      const onDisk = ts.sys.readFile(name);
      return onDisk === undefined ? undefined : ts.ScriptSnapshot.fromString(onDisk);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  return ts.createLanguageService(host, ts.createDocumentRegistry());
}
