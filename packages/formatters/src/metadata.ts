export interface PipeMetadata {
  name: string;
  sourcePath: string;
  kind: 'built-in' | 'custom' | 'preset';
  namespace: string;
}

export interface PipeUsageMetadata {
  templatePath: string;
  line: number;
  column: number;
  name: string;
}
