export interface ProcessRunner {
  run(command: string, args: string[], options: { cwd: string }): Promise<number>;
}
