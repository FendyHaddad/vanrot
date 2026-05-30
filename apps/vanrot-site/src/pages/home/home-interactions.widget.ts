import { onMount, type Dispose } from '@vanrot/runtime';

const selector = {
  heroCanvas: '[data-vr-home-hero]',
  typedTarget: '[data-vr-home-typed]',
  packageBadge: '[data-vr-package-badge]',
  revealSection: '[data-vr-reveal-section]',
} as const;

const noop: Dispose = () => {};
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupHomeInteractions(): void {
  onMount(() => {
    const disposers = [setupHeroAnimation(), setupPackageBadgeTones(), setupScrollReveal()];

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  });
}

function setupHeroAnimation(): Dispose {
  const canvas = document.querySelector<HTMLCanvasElement>(selector.heroCanvas);

  if (canvas === null) {
    return noop;
  }

  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    return noop;
  }

  const cell = 7;
  const dense = '@#%&8$ABXYZ';
  const faint = '01:.+=*';
  const asciiChurnRate = 5;
  const rainRate = 1.2;
  const hash = (x: number, y: number): number => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

    return n - Math.floor(n);
  };
  const smooth = (t: number): number => t * t * (3 - 2 * t);

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let mask: Uint8ClampedArray | null = null;
  let raf = 0;
  let start = performance.now();
  let fallbackTimer = 0;
  let resizeFrame = 0;
  let started = false;

  const buildMask = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 800));
    height = Math.max(1, Math.round(rect.height || 480));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'top';
    ctx.font = `${cell}px "JetBrains Mono", ui-monospace, monospace`;
    cols = Math.floor(width / cell);
    rows = Math.floor(height / cell);
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const octx = off.getContext('2d');

    if (octx === null) {
      return;
    }

    octx.fillStyle = '#fff';
    const fontSize = Math.min(128, width / 5);
    const logoYOffset = width < 640 ? -96 : -30;
    octx.font = `900 ${fontSize}px Geist, ui-sans-serif, system-ui, Arial, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText('VANROT', width / 2, height / 2 + logoYOffset);
    mask = octx.getImageData(0, 0, width, height).data;
  };

  const drawStaticFrame = (): void => {
    if (mask === null) {
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cell * width + x * cell;

        if ((mask[idx * 4] ?? 0) <= 128) {
          continue;
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(dense.charAt(Math.floor(hash(x, y) * dense.length)), x * cell, y * cell);
      }
    }
  };

  const frame = (now: number): void => {
    if (mask === null) {
      return;
    }

    const time = (now - start) / 1000;
    const intro = smooth(Math.min(1, time / 2));
    const step = Math.floor(time * asciiChurnRate);
    const rainStep = Math.floor(time * rainRate);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cell * width + x * cell;
        const on = (mask[idx * 4] ?? 0) > 128;
        const seed = hash(x, y);

        if (on) {
          drawLogoGlyph(x, y, seed, intro, time, step);
          continue;
        }

        drawAmbientGlyph(x, y, seed, rainStep);
      }
    }

    raf = window.requestAnimationFrame(frame);
  };

  const drawLogoGlyph = (
    x: number,
    y: number,
    seed: number,
    intro: number,
    time: number,
    step: number,
  ): void => {
    if (seed >= intro) {
      const gi = Math.floor(seed * faint.length + step) % faint.length;
      const alpha = 0.3 + 0.2 * seed;
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fillText(faint.charAt(gi), x * cell, y * cell);
      return;
    }

    const brightness = 0.78 + 0.2 * Math.sin(time * 1.3 + x * 0.12 + y * 0.08);
    const gi = Math.floor(seed * dense.length + step * 0.5) % dense.length;
    ctx.fillStyle = `rgba(255,255,255,${brightness.toFixed(2)})`;
    ctx.fillText(dense.charAt(gi), x * cell, y * cell);
  };

  const drawAmbientGlyph = (x: number, y: number, seed: number, rainStep: number): void => {
    if (hash(x * 0.7, y + rainStep) >= 0.014) {
      return;
    }

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillText(faint.charAt(Math.floor(seed * faint.length)), x * cell, y * cell);
  };

  const go = (): void => {
    if (started) {
      return;
    }

    started = true;
    buildMask();

    if (prefersReducedMotion()) {
      drawStaticFrame();
      return;
    }

    start = performance.now();
    raf = window.requestAnimationFrame(frame);
  };

  const resize = (): void => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      started = false;
      window.cancelAnimationFrame(raf);
      go();
    });
  };

  if (document.fonts !== undefined && document.fonts.ready !== undefined) {
    void document.fonts.ready.then(go);
    fallbackTimer = window.setTimeout(go, 600);
  } else {
    go();
  }

  window.addEventListener('resize', resize);
  const disposeTyped = setupTypedSubtitle();

  return () => {
    window.clearTimeout(fallbackTimer);
    window.cancelAnimationFrame(raf);
    window.cancelAnimationFrame(resizeFrame);
    window.removeEventListener('resize', resize);
    disposeTyped();
  };
}

function setupPackageBadgeTones(): Dispose {
  const badges = Array.from(document.querySelectorAll<HTMLElement>(selector.packageBadge));

  for (const badge of badges) {
    const status = badge.textContent?.trim();
    badge.classList.toggle('pkg-badge--demo', status === 'demo');
    badge.classList.toggle('pkg-badge--stable', status === 'stable');
  }

  return noop;
}

function setupTypedSubtitle(): Dispose {
  const target = document.querySelector<HTMLElement>(selector.typedTarget);

  if (target === null) {
    return noop;
  }

  const line = target.dataset.vrHomeTyped || target.textContent || '';

  if (prefersReducedMotion()) {
    target.textContent = line;
    return noop;
  }

  target.textContent = '';
  let index = 0;
  let timer = 0;
  const type = (): void => {
    if (index > line.length) {
      return;
    }

    target.textContent = line.slice(0, index++);
    timer = window.setTimeout(type, 36);
  };
  const startTimer = window.setTimeout(type, 1300);

  return () => {
    window.clearTimeout(startTimer);
    window.clearTimeout(timer);
  };
}

function setupScrollReveal(): Dispose {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(selector.revealSection));

  if (sections.length === 0) {
    return noop;
  }

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    sections.forEach(section => section.classList.add('in'));
    return noop;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );

  sections.forEach(section => observer.observe(section));

  return () => observer.disconnect();
}
