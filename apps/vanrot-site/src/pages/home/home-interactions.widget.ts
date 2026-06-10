import { onMount, type Dispose } from '@vanrot/runtime';

const selector = {
  heroCanvas: '[data-vr-home-hero]',
  typedTarget: '[data-vr-home-typed]',
  packageBadge: '[data-vr-package-badge]',
  revealSection: '[data-vr-reveal-section]',
  aiSpotlight: '[data-vr-ai-spotlight]',
  aiTilt: '[data-ai-tilt]',
  manifesto: '[data-vr-manifesto]',
  manifestoCanvas: '[data-vr-manifesto-canvas]',
  packageRail: '[data-vr-package-rail]',
  railViewport: '[data-vr-rail-viewport]',
  railTrack: '[data-vr-rail-track]',
  railCounter: '[data-vr-rail-counter]',
} as const;

const noop: Dispose = () => {};
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupHomeInteractions(): void {
  onMount(() => {
    const disposers = [
      setupHeroAnimation(),
      setupPackageBadgeTones(),
      setupScrollReveal(),
      setupAiSpotlight(),
      setupManifestoScene(),
      setupPackageRail(),
    ];

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
  const asciiChurnRate = 2;
  const twinkleRate = 0.9;
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
    const logoYOffset = width < 640 ? -96 : -160;
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
    const step = time * asciiChurnRate;
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

        drawAmbientGlyph(x, y, seed, time);
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

  const drawAmbientGlyph = (x: number, y: number, seed: number, time: number): void => {
    const star = hash(x * 0.7, y * 1.3);

    if (star >= 0.05) {
      return;
    }

    const phase = seed * 6.283;
    const twinkle = 0.5 + 0.5 * Math.sin(time * (twinkleRate + seed * 0.7) + phase);
    const bright = star < 0.012;
    const sparkle = twinkle * twinkle * twinkle;
    const alpha = bright ? 0.1 + 0.55 * sparkle : 0.04 + 0.16 * twinkle;
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
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

function setupAiSpotlight(): Dispose {
  const section = document.querySelector<HTMLElement>(selector.aiSpotlight);

  if (section === null || prefersReducedMotion()) {
    return noop;
  }

  const cells = Array.from(section.querySelectorAll<HTMLElement>(selector.aiTilt));
  let frame = 0;

  const onMove = (event: PointerEvent): void => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      section.style.setProperty('--my', `${event.clientY - rect.top}px`);

      for (const cell of cells) {
        const box = cell.getBoundingClientRect();
        cell.style.setProperty('--cx', `${event.clientX - box.left}px`);
        cell.style.setProperty('--cy', `${event.clientY - box.top}px`);
      }
    });
  };

  section.addEventListener('pointermove', onMove);

  return () => {
    window.cancelAnimationFrame(frame);
    section.removeEventListener('pointermove', onMove);
  };
}

function setupManifestoScene(): Dispose {
  const section = document.querySelector<HTMLElement>(selector.manifesto);

  if (section === null) {
    return noop;
  }

  if (prefersReducedMotion()) {
    section.style.setProperty('--p', '1');
    return noop;
  }

  const canvas = section.querySelector<HTMLCanvasElement>(selector.manifestoCanvas);
  const ctx = canvas?.getContext('2d') ?? null;
  const cell = 7;
  const glyphs = '01:.+=*';
  const fieldDensity = 0.16;
  const hash = (x: number, y: number): number => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

    return n - Math.floor(n);
  };
  const smooth = (t: number): number => t * t * (3 - 2 * t);
  const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let progress = 0;
  let raf = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;
  let animating = false;

  const sizeCanvas = (): void => {
    if (canvas === null || ctx === null) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 800));
    height = Math.max(1, Math.round(rect.height || 600));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'top';
    ctx.font = `${cell}px "JetBrains Mono", ui-monospace, monospace`;
    cols = Math.floor(width / cell);
    rows = Math.floor(height / cell);
  };

  const syncProgress = (): void => {
    const rect = section.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;

    if (distance <= 0) {
      progress = 1;
    } else {
      progress = clamp01(-rect.top / distance);
    }

    section.style.setProperty('--p', progress.toFixed(4));
  };

  const frame = (now: number): void => {
    if (ctx === null) {
      animating = false;
      return;
    }

    const time = now / 1000;
    const centerX = cols / 2;
    const centerY = rows / 2;
    const maxDist = Math.hypot(centerX, centerY);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const seed = hash(x, y);

        if (hash(x * 0.7, y * 1.3) >= fieldDensity) {
          continue;
        }

        const dist = Math.hypot(x - centerX, y - centerY) / maxDist;
        const lit = smooth(clamp01((progress * 1.2 - dist) / 0.25));
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.9 + seed * 6.283);
        const alpha = 0.03 + lit * (0.08 + 0.2 * twinkle);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(glyphs.charAt(Math.floor(seed * glyphs.length)), x * cell, y * cell);
      }
    }

    raf = window.requestAnimationFrame(frame);
  };

  const startAnimation = (): void => {
    if (animating || ctx === null) {
      return;
    }

    animating = true;
    sizeCanvas();
    raf = window.requestAnimationFrame(frame);
  };

  const stopAnimation = (): void => {
    animating = false;
    window.cancelAnimationFrame(raf);
  };

  const onScroll = (): void => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(syncProgress);
  };

  const onResize = (): void => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      sizeCanvas();
      syncProgress();
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAnimation();
        return;
      }

      stopAnimation();
    });
  });

  observer.observe(section);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  syncProgress();

  return () => {
    observer.disconnect();
    stopAnimation();
    window.cancelAnimationFrame(scrollFrame);
    window.cancelAnimationFrame(resizeFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}

function setupPackageRail(): Dispose {
  const section = document.querySelector<HTMLElement>(selector.packageRail);

  if (section === null || prefersReducedMotion()) {
    return noop;
  }

  const viewport = section.querySelector<HTMLElement>(selector.railViewport);
  const track = section.querySelector<HTMLElement>(selector.railTrack);
  const counter = section.querySelector<HTMLElement>(selector.railCounter);

  if (viewport === null || track === null) {
    return noop;
  }

  const cardCount = track.children.length;
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

  const syncCounter = (progress: number): void => {
    if (counter === null || cardCount === 0) {
      return;
    }

    const focused = Math.round(progress * (cardCount - 1)) + 1;
    counter.textContent = String(focused).padStart(2, '0');
  };

  const setupDesktopMode = (): Dispose => {
    let distance = 0;
    let scrollFrame = 0;
    let resizeFrame = 0;

    const measure = (): void => {
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.setProperty('--rail-distance', `${distance}px`);
    };

    const sync = (): void => {
      if (distance <= 0) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 1;
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
      syncCounter(progress);
    };

    const onScroll = (): void => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(sync);
    };

    const onResize = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        measure();
        sync();
      });
    };

    measure();
    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      track.style.transform = '';
      section.style.removeProperty('--rail-distance');
    };
  };

  const setupMobileMode = (): Dispose => {
    let scrollFrame = 0;

    const sync = (): void => {
      const scrollable = track.scrollWidth - track.clientWidth;
      syncCounter(scrollable > 0 ? clamp01(track.scrollLeft / scrollable) : 0);
    };

    const onTrackScroll = (): void => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(sync);
    };

    sync();
    track.addEventListener('scroll', onTrackScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      track.removeEventListener('scroll', onTrackScroll);
    };
  };

  let disposeMode = mobileQuery.matches ? setupMobileMode() : setupDesktopMode();

  const onModeChange = (event: MediaQueryListEvent): void => {
    disposeMode();
    disposeMode = event.matches ? setupMobileMode() : setupDesktopMode();
  };

  mobileQuery.addEventListener('change', onModeChange);

  return () => {
    mobileQuery.removeEventListener('change', onModeChange);
    disposeMode();
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
    { threshold: 0, rootMargin: '0px 0px -5% 0px' },
  );

  sections.forEach(section => observer.observe(section));

  return () => observer.disconnect();
}
