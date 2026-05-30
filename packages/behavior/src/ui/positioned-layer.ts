export type LayerAlign = 'start' | 'center' | 'end';
export type LayerSide = 'top' | 'right' | 'bottom' | 'left';

export interface PositionLayerOptions {
  align?: LayerAlign;
  offset?: number;
  side?: LayerSide;
}

const defaultOffset = 4;

export function positionLayer(
  trigger: HTMLElement,
  content: HTMLElement,
  options: PositionLayerOptions = {},
): void {
  const side = options.side ?? 'bottom';
  const align = options.align ?? 'center';
  const offset = options.offset ?? defaultOffset;
  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const top = resolveTop(triggerRect, contentRect, side, offset);
  const left = resolveLeft(triggerRect, contentRect, side, align, offset);

  content.style.position = 'absolute';
  content.style.left = `${Math.round(left)}px`;
  content.style.top = `${Math.round(top)}px`;
  content.style.transformOrigin = resolveTransformOrigin(side, align);
  content.dataset.vrSide = side;
  content.dataset.vrAlign = align;
}

function resolveTop(trigger: DOMRect, content: DOMRect, side: LayerSide, offset: number): number {
  if (side === 'top') {
    return trigger.top - content.height - offset;
  }

  if (side === 'bottom') {
    return trigger.bottom + offset;
  }

  return trigger.top + (trigger.height - content.height) / 2;
}

function resolveLeft(
  trigger: DOMRect,
  content: DOMRect,
  side: LayerSide,
  align: LayerAlign,
  offset: number,
): number {
  if (side === 'left') {
    return trigger.left - content.width - offset;
  }

  if (side === 'right') {
    return trigger.right + offset;
  }

  if (align === 'start') {
    return trigger.left;
  }

  if (align === 'end') {
    return trigger.right - content.width;
  }

  return trigger.left + (trigger.width - content.width) / 2;
}

function resolveTransformOrigin(side: LayerSide, align: LayerAlign): string {
  const crossAxis = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';

  if (side === 'top') {
    return `bottom ${crossAxis}`;
  }

  if (side === 'bottom') {
    return `top ${crossAxis}`;
  }

  if (side === 'left') {
    return `${crossAxis} right`;
  }

  return `${crossAxis} left`;
}
