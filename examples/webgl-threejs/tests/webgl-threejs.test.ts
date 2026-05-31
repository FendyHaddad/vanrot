import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { signal } from '@vanrot/runtime';
import {
  bindSignalToScene,
  createWebglCanvasController,
  webglAssetPaths,
  webglIntegrationDecision,
  type WebglCanvasController,
  type WebglCanvasLike,
} from '../src/scene-preview.widget.ts';

describe('WebGL and three.js lifecycle recipe', () => {
  it('records a recipe-only boundary and keeps assets centralized', () => {
    expect(webglIntegrationDecision).toEqual({
      packageName: null,
      runtimeDependency: 'none',
      shippedShape: 'recipe-only',
      threeDependency: 'app-dependency',
    });

    expect(webglAssetPaths).toEqual({
      checkerTexture: './assets/checker-texture.json',
    });
  });

  it('cleans render loops, listeners, signal bindings, and disposable resources', () => {
    const canvas = new TestCanvas();
    const animation = createAnimationDriver();
    const color = signal('#ff5a3d');
    const colors: string[] = [];
    const disposed: string[] = [];
    const frames: number[] = [];
    const sizes: Array<[number, number, number]> = [];
    const stopResize = vi.fn();

    const controller = createWebglCanvasController({
      canvas,
      cancelAnimationFrame: animation.cancelAnimationFrame,
      container: { clientHeight: 180, clientWidth: 320 },
      createRenderer: () => ({
        dispose: () => disposed.push('renderer'),
        render: (frame) => frames.push(frame.elapsedMs),
        setSize: (width, height, scale) => sizes.push([width, height, scale]),
      }),
      devicePixelRatio: 2,
      observeResize: (resize) => {
        resize();
        return stopResize;
      },
      requestAnimationFrame: animation.requestAnimationFrame,
      resources: [
        { name: 'geometry', dispose: () => disposed.push('geometry') },
        { name: 'material', dispose: () => disposed.push('material') },
        { name: 'texture', dispose: () => disposed.push('texture') },
        { name: 'controls', dispose: () => disposed.push('controls') },
      ],
      signalBindings: [bindSignalToScene(color, (nextColor) => colors.push(nextColor))],
    });

    expect(controller.status()).toBe('ready');
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(360);
    expect(sizes).toEqual([
      [640, 360, 2],
      [640, 360, 2],
    ]);
    expect(colors).toEqual(['#ff5a3d']);
    expect(canvas.listenerCount()).toBe(2);

    color.set('#0f766e');
    animation.runNextFrame(16);

    expect(colors).toEqual(['#ff5a3d', '#0f766e']);
    expect(frames).toEqual([16]);
    expect(animation.pendingFrameCount()).toBe(1);

    controller.destroy();
    controller.destroy();
    color.set('#111827');

    expect(colors).toEqual(['#ff5a3d', '#0f766e']);
    expect(animation.pendingFrameCount()).toBe(0);
    expect(stopResize).toHaveBeenCalledTimes(1);
    expect(canvas.listenerCount()).toBe(0);
    expect(disposed).toEqual(['controls', 'texture', 'material', 'geometry', 'renderer']);
  });

  it('handles missing WebGL, mobile fallback, reduced motion, context loss, and restore', () => {
    const unsupported = createWebglCanvasController({
      canvas: new TestCanvas({ contextAvailable: false }),
      container: { clientHeight: 120, clientWidth: 120 },
      createRenderer: () => createNoopRenderer(),
    });
    const mobile = createWebglCanvasController({
      canvas: new TestCanvas(),
      container: { clientHeight: 120, clientWidth: 120 },
      createRenderer: () => createNoopRenderer(),
      mobileFallback: true,
    });
    const reducedMotionAnimation = createAnimationDriver();
    const reducedMotionFrames: number[] = [];
    const reducedMotion = createWebglCanvasController({
      canvas: new TestCanvas(),
      cancelAnimationFrame: reducedMotionAnimation.cancelAnimationFrame,
      container: { clientHeight: 120, clientWidth: 120 },
      createRenderer: () => ({
        ...createNoopRenderer(),
        render: (frame) => reducedMotionFrames.push(frame.elapsedMs),
      }),
      prefersReducedMotion: true,
      requestAnimationFrame: reducedMotionAnimation.requestAnimationFrame,
    });

    expect(unsupported.status()).toBe('unsupported');
    expect(unsupported.fallbackReason()).toBe('WebGL is not available in this browser.');
    expect(mobile.status()).toBe('mobile-fallback');
    expect(mobile.fallbackReason()).toBe('The compact/mobile fallback is active.');
    expect(reducedMotion.status()).toBe('ready');
    expect(reducedMotionFrames).toEqual([0]);
    expect(reducedMotionAnimation.pendingFrameCount()).toBe(0);

    const canvas = new TestCanvas();
    const animation = createAnimationDriver();
    const controller = createWebglCanvasController({
      canvas,
      cancelAnimationFrame: animation.cancelAnimationFrame,
      container: { clientHeight: 120, clientWidth: 120 },
      createRenderer: () => createNoopRenderer(),
      requestAnimationFrame: animation.requestAnimationFrame,
    });
    const preventDefault = vi.fn();

    canvas.dispatch('webglcontextlost', { preventDefault });

    expect(controller.status()).toBe('context-lost');
    expect(controller.fallbackReason()).toBe('The WebGL context was lost. Vanrot keeps cleanup deterministic until restore.');
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(animation.pendingFrameCount()).toBe(0);

    canvas.dispatch('webglcontextrestored');

    expect(controller.status()).toBe('ready');
    expect(controller.fallbackReason()).toBe('');
    expect(animation.pendingFrameCount()).toBe(1);
  });

  it('does not add three to @vanrot/runtime metadata or source imports', () => {
    const runtimeRoot = join('..', '..', 'packages', 'runtime');
    const runtimeManifest = readFileSync(join(runtimeRoot, 'package.json'), 'utf8');
    const runtimeIndex = readFileSync(join(runtimeRoot, 'src', 'index.ts'), 'utf8');
    const runtimeInternal = readFileSync(join(runtimeRoot, 'src', 'internal.ts'), 'utf8');

    expect(runtimeManifest).not.toContain('three');
    expect(runtimeIndex).not.toContain('three');
    expect(runtimeInternal).not.toContain('three');
  });
});

function createNoopRenderer() {
  return {
    dispose: vi.fn(),
    render: vi.fn(),
    setSize: vi.fn(),
  };
}

function createAnimationDriver() {
  const frames = new Map<number, FrameRequestCallback>();
  const canceledFrames: number[] = [];
  let nextFrameId = 1;

  return {
    cancelAnimationFrame(frameId: number) {
      canceledFrames.push(frameId);
      frames.delete(frameId);
    },
    canceledFrames,
    pendingFrameCount() {
      return frames.size;
    },
    requestAnimationFrame(callback: FrameRequestCallback) {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frames.set(frameId, callback);
      return frameId;
    },
    runNextFrame(elapsedMs: number) {
      const next = frames.entries().next().value;

      if (next === undefined) {
        throw new Error('No animation frame is queued.');
      }

      const [frameId, callback] = next;
      frames.delete(frameId);
      callback(elapsedMs);
    },
  };
}

class TestCanvas implements WebglCanvasLike {
  height = 0;
  width = 0;

  private readonly contextAvailable: boolean;
  private readonly listeners = new Map<string, Set<EventListener>>();

  constructor(options: { contextAvailable?: boolean } = {}) {
    this.contextAvailable = options.contextAvailable ?? true;
  }

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type: string, event: Partial<Event> = {}): void {
    const listeners = this.listeners.get(type);

    if (listeners === undefined) {
      return;
    }

    for (const listener of listeners) {
      listener(event as Event);
    }
  }

  getContext(contextId: string): object | null {
    if (!this.contextAvailable) {
      return null;
    }

    return contextId === 'webgl2' || contextId === 'webgl' ? {} : null;
  }

  listenerCount(): number {
    return [...this.listeners.values()].reduce((total, listeners) => total + listeners.size, 0);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.listeners.get(type)?.delete(listener);
  }
}
