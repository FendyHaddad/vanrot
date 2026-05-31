import { effect, onDestroy, onMount, type Dispose } from '@vanrot/runtime';

const contextLostEvent = 'webglcontextlost';
const contextRestoredEvent = 'webglcontextrestored';
const fallbackUnsupportedWebgl = 'WebGL is not available in this browser.';
const fallbackMobile = 'The compact/mobile fallback is active.';
const fallbackContextLost =
  'The WebGL context was lost. Vanrot keeps cleanup deterministic until restore.';

export const webglIntegrationDecision = {
  packageName: null,
  runtimeDependency: 'none',
  shippedShape: 'recipe-only',
  threeDependency: 'app-dependency',
} as const;

export const webglAssetPaths = {
  checkerTexture: './assets/checker-texture.json',
} as const;

export type WebglCanvasStatus =
  | 'ready'
  | 'unsupported'
  | 'mobile-fallback'
  | 'context-lost'
  | 'destroyed';

export interface WebglCanvasLike {
  height: number;
  width: number;
  addEventListener(type: string, listener: EventListener): void;
  getContext(contextId: string, attributes?: WebGLContextAttributes): object | null;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface WebglContainerLike {
  readonly clientHeight: number;
  readonly clientWidth: number;
}

export interface WebglFrame {
  readonly context: object;
  readonly elapsedMs: number;
  readonly frameCount: number;
}

export interface WebglDisposable {
  readonly name: string;
  dispose(): void;
}

export interface WebglRenderer {
  dispose(): void;
  render(frame: WebglFrame): void;
  setSize(width: number, height: number, devicePixelRatio: number): void;
}

export type WebglSignalBinding = () => Dispose;

export interface WebglCanvasController {
  destroy(): void;
  fallbackReason(): string;
  frameCount(): number;
  status(): WebglCanvasStatus;
}

export interface WebglCanvasControllerOptions {
  readonly canvas: WebglCanvasLike;
  readonly container: WebglContainerLike;
  readonly cancelAnimationFrame?: (frameId: number) => void;
  readonly createRenderer: (context: object) => WebglRenderer;
  readonly devicePixelRatio?: number;
  readonly mobileFallback?: boolean;
  readonly observeResize?: (resize: () => void) => Dispose;
  readonly prefersReducedMotion?: boolean;
  readonly requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  readonly resources?: readonly WebglDisposable[];
  readonly signalBindings?: readonly WebglSignalBinding[];
}

export function bindSignalToScene<T>(read: () => T, apply: (value: T) => void): WebglSignalBinding {
  return () => effect(() => apply(read()));
}

export function registerWebglCanvasWidget(createOptions: () => WebglCanvasControllerOptions): void {
  let controller: WebglCanvasController | null = null;

  onMount(() => {
    controller = createWebglCanvasController(createOptions());

    return () => {
      controller?.destroy();
      controller = null;
    };
  });

  onDestroy(() => {
    controller?.destroy();
    controller = null;
  });
}

export function createWebglCanvasController(
  options: WebglCanvasControllerOptions,
): WebglCanvasController {
  if (options.mobileFallback === true) {
    return createFallbackController('mobile-fallback', fallbackMobile);
  }

  const context = resolveWebglContext(options.canvas);

  if (context === null) {
    return createFallbackController('unsupported', fallbackUnsupportedWebgl);
  }

  const webglContext = context;
  let currentStatus: WebglCanvasStatus = 'ready';
  let destroyed = false;
  let fallbackReason = '';
  let frameCount = 0;
  let lastElapsedMs = 0;
  let pendingFrame: number | null = null;

  const requestAnimationFrame =
    options.requestAnimationFrame ??
    ((callback: FrameRequestCallback) => globalThis.requestAnimationFrame(callback));
  const cancelAnimationFrame =
    options.cancelAnimationFrame ?? ((frameId: number) => globalThis.cancelAnimationFrame(frameId));
  const cleanupScope = new WebglCleanupScope();
  const renderer = options.createRenderer(webglContext);

  cleanupScope.addDisposable(renderer);

  for (const resource of options.resources ?? []) {
    cleanupScope.addDisposable(resource);
  }

  resizeRenderer();
  registerResizeCleanup();
  registerContextLifecycle();
  registerSignalBindings();

  if (options.prefersReducedMotion === true) {
    renderOneFrame(0);
  } else {
    startRenderLoop();
  }

  return {
    destroy,
    fallbackReason: () => fallbackReason,
    frameCount: () => frameCount,
    status: () => currentStatus,
  };

  function destroy(): void {
    if (destroyed) {
      return;
    }

    destroyed = true;
    stopRenderLoop();
    cleanupScope.dispose();
    currentStatus = 'destroyed';
  }

  function registerContextLifecycle(): void {
    const onContextLost = (event: Event): void => {
      event.preventDefault();
      stopRenderLoop();
      currentStatus = 'context-lost';
      fallbackReason = fallbackContextLost;
    };
    const onContextRestored = (): void => {
      if (destroyed) {
        return;
      }

      fallbackReason = '';
      currentStatus = 'ready';
      resizeRenderer();

      if (options.prefersReducedMotion === true) {
        renderOneFrame(lastElapsedMs);
        return;
      }

      startRenderLoop();
    };

    options.canvas.addEventListener(contextLostEvent, onContextLost);
    options.canvas.addEventListener(contextRestoredEvent, onContextRestored);
    cleanupScope.addCleanup(() =>
      options.canvas.removeEventListener(contextRestoredEvent, onContextRestored),
    );
    cleanupScope.addCleanup(() => options.canvas.removeEventListener(contextLostEvent, onContextLost));
  }

  function registerResizeCleanup(): void {
    const cleanup = options.observeResize?.(resizeRenderer);

    if (cleanup === undefined) {
      return;
    }

    cleanupScope.addCleanup(cleanup);
  }

  function registerSignalBindings(): void {
    for (const binding of options.signalBindings ?? []) {
      cleanupScope.addCleanup(binding());
    }
  }

  function resizeRenderer(): void {
    const devicePixelRatio = Math.max(1, options.devicePixelRatio ?? globalThis.devicePixelRatio ?? 1);
    const width = Math.max(1, Math.round(options.container.clientWidth * devicePixelRatio));
    const height = Math.max(1, Math.round(options.container.clientHeight * devicePixelRatio));

    options.canvas.width = width;
    options.canvas.height = height;
    renderer.setSize(width, height, devicePixelRatio);
  }

  function startRenderLoop(): void {
    if (pendingFrame !== null || currentStatus !== 'ready' || destroyed) {
      return;
    }

    pendingFrame = requestAnimationFrame((elapsedMs) => {
      pendingFrame = null;

      if (currentStatus !== 'ready' || destroyed) {
        return;
      }

      renderOneFrame(elapsedMs);
      startRenderLoop();
    });
  }

  function stopRenderLoop(): void {
    if (pendingFrame === null) {
      return;
    }

    cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }

  function renderOneFrame(elapsedMs: number): void {
    lastElapsedMs = elapsedMs;
    frameCount += 1;
    renderer.render({ context: webglContext, elapsedMs, frameCount });
  }
}

function resolveWebglContext(canvas: WebglCanvasLike): object | null {
  return canvas.getContext('webgl2') ?? canvas.getContext('webgl');
}

function createFallbackController(
  status: Extract<WebglCanvasStatus, 'unsupported' | 'mobile-fallback'>,
  reason: string,
): WebglCanvasController {
  return {
    destroy() {},
    fallbackReason: () => reason,
    frameCount: () => 0,
    status: () => status,
  };
}

class WebglCleanupScope {
  private cleanups: Dispose[] = [];
  private disposed = false;

  addCleanup(cleanup: Dispose): void {
    if (this.disposed) {
      cleanup();
      return;
    }

    this.cleanups.push(cleanup);
  }

  addDisposable(disposable: Pick<WebglDisposable, 'dispose'>): void {
    this.addCleanup(() => disposable.dispose());
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    const cleanups = [...this.cleanups].reverse();
    this.cleanups = [];

    for (const cleanup of cleanups) {
      cleanup();
    }
  }
}
