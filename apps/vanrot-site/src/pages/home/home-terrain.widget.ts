import type { Dispose } from '@vanrot/runtime';

const selector = {
  section: '[data-vr-system]',
  canvas: '[data-vr-system-terrain]',
  coords: '[data-vr-system-coords]',
} as const;

const noop: Dispose = () => {};
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hash = (x: number, y: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return n - Math.floor(n);
};
const smooth = (t: number): number => t * t * (3 - 2 * t);

const valueNoise = (x: number, y: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);

  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
};

const elevation = (x: number, y: number, time: number): number => {
  const base = valueNoise(x * 0.045 + time * 0.016, y * 0.075 + time * 0.011);
  const detail = valueNoise(x * 0.11 + 37.2 + time * 0.027, y * 0.18 + 11.8);

  return base * 0.72 + detail * 0.28;
};

export function setupSystemTerrain(): Dispose {
  const section = document.querySelector<HTMLElement>(selector.section);
  const canvas = document.querySelector<HTMLCanvasElement>(selector.canvas);

  if (section === null || canvas === null) {
    return noop;
  }

  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    return noop;
  }

  const cell = 10;
  const bands = 9;
  const bandWidth = 0.16;
  const glyphs = '·:-~=+*#%@';
  const spotlightRadius = 280;

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let raf = 0;
  let resizeFrame = 0;
  let visible = false;
  let mouseX = -1;
  let mouseY = -1;
  const start = performance.now();

  const resizeCanvas = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 800));
    height = Math.max(1, Math.round(rect.height || 600));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'top';
    ctx.font = `${cell}px "JetBrains Mono", ui-monospace, monospace`;
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
  };

  const drawFrame = (time: number): void => {
    ctx.clearRect(0, 0, width, height);
    const hasMouse = mouseX >= 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const level = elevation(x, y, time) * bands;
        const frac = level - Math.floor(level);

        if (frac >= bandWidth) {
          continue;
        }

        const band = Math.floor(level) % glyphs.length;
        const px = x * cell;
        const py = y * cell;
        let alpha = 0.05 + 0.1 * (band / glyphs.length);

        if (hasMouse) {
          const dx = px - mouseX;
          const dy = py - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const boost = Math.max(0, 1 - dist / spotlightRadius);
          alpha += boost * boost * 0.3;
        }

        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(glyphs.charAt(band), px, py);
      }
    }
  };

  const frame = (now: number): void => {
    drawFrame((now - start) / 1000);
    raf = window.requestAnimationFrame(frame);
  };

  const play = (): void => {
    window.cancelAnimationFrame(raf);

    if (prefersReducedMotion()) {
      drawFrame(0);
      return;
    }

    raf = window.requestAnimationFrame(frame);
  };

  const resize = (): void => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resizeCanvas();

      if (!visible) {
        return;
      }

      play();
    });
  };

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      visible = entry.isIntersecting;

      if (!visible) {
        window.cancelAnimationFrame(raf);
        continue;
      }

      play();
    }
  });

  const disposePointer = setupCoordsReadout(section, (x, y) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = x - rect.left;
    mouseY = y - rect.top;
  });

  resizeCanvas();
  observer.observe(section);
  window.addEventListener('resize', resize);

  return () => {
    window.cancelAnimationFrame(raf);
    window.cancelAnimationFrame(resizeFrame);
    window.removeEventListener('resize', resize);
    observer.disconnect();
    disposePointer();
  };
}

function setupCoordsReadout(
  section: HTMLElement,
  onPointer: (x: number, y: number) => void,
): Dispose {
  const readout = section.querySelector<HTMLElement>(selector.coords);

  if (prefersReducedMotion()) {
    return noop;
  }

  let frame = 0;

  const onMove = (event: PointerEvent): void => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      onPointer(event.clientX, event.clientY);

      if (readout === null) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const u = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width)));
      const v = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(1, rect.height)));
      const lat = (4 + v * 2.4).toFixed(3);
      const lon = (101 + u * 3.6).toFixed(3);
      const elev = Math.round(elevation(u * 96, v * 64, 0) * 1980);
      readout.textContent = `LAT ${lat} · LON ${lon} · ELEV ${elev}m`;
    });
  };

  section.addEventListener('pointermove', onMove);

  return () => {
    window.cancelAnimationFrame(frame);
    section.removeEventListener('pointermove', onMove);
  };
}
