export interface MapSegment {
  templateStart: number;
  virtualStart: number;
  length: number;
}

export class PositionMap {
  constructor(private readonly segments: readonly MapSegment[]) {}

  toVirtual(templateOffset: number): number | null {
    for (const segment of this.segments) {
      const end = segment.templateStart + segment.length;

      if (templateOffset >= segment.templateStart && templateOffset <= end) {
        return segment.virtualStart + (templateOffset - segment.templateStart);
      }
    }

    return null;
  }

  toTemplate(virtualOffset: number): number | null {
    for (const segment of this.segments) {
      const end = segment.virtualStart + segment.length;

      if (virtualOffset >= segment.virtualStart && virtualOffset <= end) {
        return segment.templateStart + (virtualOffset - segment.virtualStart);
      }
    }

    return null;
  }
}
