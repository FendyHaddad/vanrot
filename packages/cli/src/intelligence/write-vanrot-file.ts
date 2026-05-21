import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface WriteVanrotFileOptions {
  makeDirectory?: (dirPath: string) => Promise<void>;
  writeTextFile?: (filePath: string, content: string) => Promise<void>;
}

export async function writeVanrotFile(
  cwd: string,
  fileName: string,
  content: string,
  options: WriteVanrotFileOptions = {},
): Promise<string> {
  const makeDirectory = options.makeDirectory ?? createDirectory;
  const writeTextFile = options.writeTextFile ?? writeFile;
  const directoryPath = join(cwd, '.vanrot');
  const filePath = join(directoryPath, fileName);

  await makeDirectory(directoryPath);
  await writeTextFile(filePath, content);

  return `.vanrot/${fileName}`;
}

async function createDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
