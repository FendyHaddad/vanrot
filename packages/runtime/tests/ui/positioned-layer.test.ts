// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { positionLayer } from '../../src/ui/positioned-layer.js';

function rect(input: {
  x: number;
  y: number;
  width: number;
  height: number;
}): DOMRect {
  return {
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    top: input.y,
    right: input.x + input.width,
    bottom: input.y + input.height,
    left: input.x,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

describe('positionLayer', () => {
  it('positions bottom end content with a stable transform origin', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');

    trigger.getBoundingClientRect = () => rect({ x: 120, y: 80, width: 48, height: 32 });
    content.getBoundingClientRect = () => rect({ x: 0, y: 0, width: 160, height: 120 });

    positionLayer(trigger, content, { side: 'bottom', align: 'end', offset: 8 });

    expect(content.style.position).toBe('absolute');
    expect(content.style.left).toBe('8px');
    expect(content.style.top).toBe('120px');
    expect(content.style.transformOrigin).toBe('top right');
    expect(content.dataset.vrSide).toBe('bottom');
    expect(content.dataset.vrAlign).toBe('end');
  });

  it('positions top center content above the trigger', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');

    trigger.getBoundingClientRect = () => rect({ x: 100, y: 200, width: 80, height: 40 });
    content.getBoundingClientRect = () => rect({ x: 0, y: 0, width: 120, height: 60 });

    positionLayer(trigger, content, { side: 'top', align: 'center', offset: 4 });

    expect(content.style.left).toBe('80px');
    expect(content.style.top).toBe('136px');
    expect(content.style.transformOrigin).toBe('bottom center');
  });
});
