import { describe, expect, it } from 'vitest';
import { projectMapPath } from '../src/main.ts';

describe('devtools intelligence example', () => {
  it('documents the project map output path', () => {
    expect(projectMapPath).toBe('.vanrot/project-map.json');
  });
});
