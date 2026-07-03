import type { Dispose } from '@vanrot/runtime';

type PhaseMap = { manifestoEnd: number; zoomEnd: number; wallSettleEnd: number };

type PackageWallCard = { element: HTMLElement; row: number; column: number };

const selector = {
  section: '[data-vr-finale]',
  viewport: '[data-vr-finale-viewport]',
  glyphCanvas: '[data-vr-manifesto-canvas]',
  manifestoLines: '[data-vr-manifesto-lines]',
} as const;
const packageWallSelector = {
  section: '[data-vr-package-wall]',
  grid: '[data-vr-package-wall-grid]',
  source: '[data-vr-package-wall-source]',
} as const;

const desktopPhase: PhaseMap = { manifestoEnd: 0.3, zoomEnd: 0.52, wallSettleEnd: 0.82 };
const mobilePhase: PhaseMap = { manifestoEnd: 0.48, zoomEnd: 0.76, wallSettleEnd: 0.88 };

const glyphCell = 9;
const starGlyphs = '01:.+=*';
const canvasDprCap = 1;
const starDensity = 0.055;
const progressFollow = 0.2;
/* Viewport fraction of pre-pin scroll that already reveals the manifesto, so
   the finale teases itself while the section is still entering the fold. */
const manifestoLead = 0.5;
const streakRiseStart = 0.6;
const streakSettleSpan = 0.35;
const wallFadeSpan = 0.08;

const packageWallColumns = 6;
const packageWallVisibleColumns = 5;
const packageWallRows = 3;
const packageWallSlots = packageWallColumns * packageWallRows;
const packageWallLaneSpeed = 0.000016;
const packageWallScrollLaneSpeed = 0.0018;
const packageWallGutter = 8;
const packageWallFlatColumns = 5.2;
/* Row height divisor > row count keeps the distorted top row inside the
   frame so package names stay visible below the wall heading. */
const packageWallFlatRows = 4.2;
const packageWallLensZoom = 0.88;
const packageWallLensDistortion = -0.05;

const noop: Dispose = () => {};
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hash = (x: number, y: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return n - Math.floor(n);
};
const smooth = (t: number): number => t * t * (3 - 2 * t);
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const positiveModulo = (value: number, modulus: number): number => ((value % modulus) + modulus) % modulus;

export function setupFinaleScene(): Dispose {
  const section = document.querySelector<HTMLElement>(selector.section);

  if (section === null) {
    return noop;
  }

  const viewport = section.querySelector<HTMLElement>(selector.viewport);
  const glyphCanvas = section.querySelector<HTMLCanvasElement>(selector.glyphCanvas);
  const linesHost = section.querySelector<HTMLElement>(selector.manifestoLines);

  if (viewport === null || glyphCanvas === null || linesHost === null) {
    return noop;
  }

  if (prefersReducedMotion()) {
    section.classList.add('finale--static');
    section.style.setProperty('--p', '1');
    section.style.setProperty('--mp', '1');
    section.style.setProperty('--wp', '1');
    return noop;
  }

  const ctx = glyphCanvas.getContext('2d');

  if (ctx === null) {
    section.classList.add('finale--static');
    return noop;
  }

  const mobileQuery = window.matchMedia('(max-width: 760px)');

  let mode: 'desktop' | 'mobile' = mobileQuery.matches ? 'mobile' : 'desktop';
  let phase = mode === 'mobile' ? mobilePhase : desktopPhase;
  let running = false;
  let raf = 0;
  let progress = 0;
  let targetProgress = 0;
  let manifestoProgress = 0;
  let progressReady = false;
  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;

  const sizeGlyphCanvas = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, canvasDprCap);
    width = Math.max(1, Math.round(viewport.clientWidth || 800));
    height = Math.max(1, Math.round(viewport.clientHeight || 600));
    glyphCanvas.width = width * dpr;
    glyphCanvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'top';
    ctx.font = `${glyphCell}px "JetBrains Mono", ui-monospace, monospace`;
    cols = Math.floor(width / glyphCell);
    rows = Math.floor(height / glyphCell);
  };

  const syncProgress = (): void => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const distance = rect.height - viewportHeight;
    targetProgress = distance <= 0 ? 1 : clamp01(-rect.top / distance);
    const lead = viewportHeight * manifestoLead;
    const manifestoTravel = lead + Math.max(distance, 0) * phase.zoomEnd;
    const targetManifesto = clamp01((lead - rect.top) / manifestoTravel);

    if (!progressReady) {
      progress = targetProgress;
      manifestoProgress = targetManifesto;
      progressReady = true;
    } else {
      progress += (targetProgress - progress) * progressFollow;
      manifestoProgress += (targetManifesto - manifestoProgress) * progressFollow;
    }

    if (Math.abs(targetProgress - progress) < 0.0008) {
      progress = targetProgress;
    }

    if (Math.abs(targetManifesto - manifestoProgress) < 0.0008) {
      manifestoProgress = targetManifesto;
    }

    section.style.setProperty('--p', progress.toFixed(4));
    section.style.setProperty('--mp', manifestoProgress.toFixed(4));
    section.style.setProperty('--wp', clamp01((progress - phase.zoomEnd) / wallFadeSpan).toFixed(4));
  };

  const wallProgress = (): number =>
    clamp01((progress - phase.zoomEnd) / (phase.wallSettleEnd - phase.zoomEnd));

  const drawStars = (time: number, zoomProgress: number): void => {
    const centerX = cols / 2;
    const centerY = rows / 2;
    const maxDist = Math.hypot(centerX, centerY);
    const reveal = manifestoProgress;
    const rise = smooth(clamp01((zoomProgress - streakRiseStart) / (1 - streakRiseStart)));
    const settle = 1 - smooth(clamp01(wallProgress() / streakSettleSpan));
    const streak = zoomProgress > 0 ? rise * settle : 0;
    const pixelCenterX = width / 2;
    const pixelCenterY = height / 2;
    const drawStreaks = streak > 0.15;

    if (drawStreaks) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.24, 0.08 + streak * 0.16).toFixed(3)})`;
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (hash(x * 0.7, y * 1.3) >= starDensity) {
          continue;
        }

        const seed = hash(x, y);
        const dist = Math.hypot(x - centerX, y - centerY) / maxDist;
        const lit = smooth(clamp01((reveal * 1.2 - dist) / 0.25));
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.9 + seed * 6.283);
        const alpha = 0.03 + lit * (0.08 + 0.2 * twinkle);
        const px = x * glyphCell;
        const py = y * glyphCell;

        if (drawStreaks) {
          const fromCenterX = px - pixelCenterX;
          const fromCenterY = py - pixelCenterY;
          const length = Math.hypot(fromCenterX, fromCenterY) || 1;
          const streakLength = streak * (6 + 46 * dist);
          ctx.moveTo(px, py);
          ctx.lineTo(
            px + (fromCenterX / length) * streakLength,
            py + (fromCenterY / length) * streakLength,
          );
          continue;
        }

        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(starGlyphs.charAt(Math.floor(seed * starGlyphs.length)), px, py);
      }
    }

    if (drawStreaks) {
      ctx.stroke();
    }
  };

  const drawGlyphScene = (time: number): void => {
    const zoomProgress = (progress - phase.manifestoEnd) / (phase.zoomEnd - phase.manifestoEnd);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    drawStars(time, zoomProgress);
  };

  const frame = (now: number): void => {
    if (!running) {
      return;
    }

    const time = now / 1000;
    syncProgress();
    drawGlyphScene(time);
    raf = window.requestAnimationFrame(frame);
  };

  const startLoop = (): void => {
    if (running) {
      return;
    }

    running = true;
    sizeGlyphCanvas();
    raf = window.requestAnimationFrame(frame);
  };

  const stopLoop = (): void => {
    running = false;
    window.cancelAnimationFrame(raf);
  };

  const onModeChange = (event: MediaQueryListEvent): void => {
    mode = event.matches ? 'mobile' : 'desktop';
    phase = mode === 'mobile' ? mobilePhase : desktopPhase;
    sizeGlyphCanvas();
  };

  let resizeFrame = 0;

  const onResize = (): void => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      sizeGlyphCanvas();
    });
  };

  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startLoop();
        return;
      }

      stopLoop();
    });
  });

  visibilityObserver.observe(section);
  mobileQuery.addEventListener('change', onModeChange);
  window.addEventListener('resize', onResize);
  syncProgress();

  return () => {
    stopLoop();
    visibilityObserver.disconnect();
    mobileQuery.removeEventListener('change', onModeChange);
    window.removeEventListener('resize', onResize);
    window.cancelAnimationFrame(resizeFrame);
  };
}

type WallPoint = { x: number; y: number };

type WallLens = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  tileWidth: number;
  tileHeight: number;
  distortX: number;
  distortY: number;
};

/* Inverts the phantom-style barrel shader `t = (zoom + d * dot(u, u)) * u`
   so a flat-grid point lands where the lens would have displayed it.
   Solved as a scalar bisection on s = |u|²; flat points past the lens fold
   have no screen position, so s clamps there (always outside the viewport). */
function distortWallPoint(tx: number, ty: number, distortX: number, distortY: number): WallPoint {
  const strongest = Math.max(Math.abs(distortX), Math.abs(distortY));
  const fold = strongest === 0 ? 16 : packageWallLensZoom / (3 * strongest);
  const radius = (s: number): number => {
    const ax = packageWallLensZoom + distortX * s;
    const ay = packageWallLensZoom + distortY * s;

    return (tx * tx) / (ax * ax) + (ty * ty) / (ay * ay);
  };

  let s = fold;

  if (radius(fold) - fold <= 0) {
    let lo = 0;
    let hi = fold;

    for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) / 2;

      if (radius(mid) - mid > 0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    s = (lo + hi) / 2;
  }

  return {
    x: tx / (packageWallLensZoom + distortX * s),
    y: ty / (packageWallLensZoom + distortY * s),
  };
}

/* CSS matrix3d homography mapping the tile rect (0,0)-(w,h) onto a screen quad. */
function wallQuadTransform(width: number, height: number, quad: WallPoint[]): string {
  const [p0, p1, p2, p3] = quad as [WallPoint, WallPoint, WallPoint, WallPoint];
  const sumX = p0.x - p1.x + p2.x - p3.x;
  const sumY = p0.y - p1.y + p2.y - p3.y;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sumX * dy2 - dx2 * sumY) / den;
  const h = (dx1 * sumY - sumX * dy1) / den;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;

  return `matrix3d(${a / width}, ${d / width}, 0, ${g / width}, ${b / height}, ${e / height}, 0, ${h / height}, 0, 0, 1, 0, ${p0.x}, ${p0.y}, 0, 1)`;
}

function applyWallTile(element: HTMLElement, row: number, slot: number, lens: WallLens): void {
  const centerCol = (packageWallVisibleColumns - 1) / 2;
  const centerX = (slot - centerCol) * lens.cellWidth;
  const centerY = (row - 1) * lens.cellHeight;
  const halfTileW = lens.tileWidth / 2;
  const halfTileH = lens.tileHeight / 2;
  const halfW = lens.width / 2;
  const halfH = lens.height / 2;

  const corner = (x: number, y: number): WallPoint => {
    const p = distortWallPoint(x / halfW, y / halfH, lens.distortX, lens.distortY);

    return { x: p.x * halfW + halfW, y: p.y * halfH + halfH };
  };

  const quad = [
    corner(centerX - halfTileW, centerY - halfTileH),
    corner(centerX + halfTileW, centerY - halfTileH),
    corner(centerX + halfTileW, centerY + halfTileH),
    corner(centerX - halfTileW, centerY + halfTileH),
  ];

  element.style.transform = wallQuadTransform(lens.tileWidth, lens.tileHeight, quad);
}

function clonePackageWallCard(source: HTMLElement): HTMLElement {
  const element = source.cloneNode(true) as HTMLElement;
  element.classList.add('package-wall-card');

  return element;
}

export function setupPackageWallScene(): Dispose {
  const section = document.querySelector<HTMLElement>(packageWallSelector.section);

  if (section === null) {
    return noop;
  }

  const grid = section.querySelector<HTMLElement>(packageWallSelector.grid);
  const source = section.querySelector<HTMLElement>(packageWallSelector.source);

  if (grid === null || source === null) {
    return noop;
  }

  const originals = Array.from(source.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );

  if (originals.length === 0) {
    return noop;
  }

  grid.replaceChildren();
  const cards: PackageWallCard[] = [];

  for (let slot = 0; slot < packageWallSlots; slot++) {
    const original = originals[slot % originals.length];

    if (original === undefined) {
      continue;
    }

    const row = Math.floor(slot / packageWallColumns);
    const column = slot % packageWallColumns;
    const element = clonePackageWallCard(original);
    grid.appendChild(element);
    cards.push({ element, row, column });
  }

  let raf = 0;
  let running = false;
  const startedAt = window.performance.now();
  const reduceMotion = prefersReducedMotion();
  const lens: WallLens = {
    width: 0,
    height: 0,
    cellWidth: 0,
    cellHeight: 0,
    tileWidth: 0,
    tileHeight: 0,
    distortX: 0,
    distortY: 0,
  };

  const measureWall = (): void => {
    const rect = grid.getBoundingClientRect();
    lens.width = rect.width;
    lens.height = Math.max(rect.height, 1);
    lens.cellWidth = lens.width / packageWallFlatColumns;
    lens.cellHeight = lens.height / packageWallFlatRows;
    lens.tileWidth = lens.cellWidth - packageWallGutter;
    lens.tileHeight = lens.cellHeight - packageWallGutter;
    lens.distortX = packageWallLensDistortion;
    lens.distortY = packageWallLensDistortion * (lens.width / lens.height);

    for (const card of cards) {
      card.element.style.width = `${lens.tileWidth.toFixed(2)}px`;
      card.element.style.height = `${lens.tileHeight.toFixed(2)}px`;
    }
  };

  const renderWall = (time: number): void => {
    const laneTravel = (time - startedAt) * packageWallLaneSpeed + window.scrollY * packageWallScrollLaneSpeed;
    const laneProgress = reduceMotion ? 0 : laneTravel % packageWallColumns;

    for (const card of cards) {
      const rowDirection = card.row === 1 ? -1 : 1;
      const normalizedSlot = positiveModulo(card.column + rowDirection * laneProgress, packageWallColumns);
      const visualSlot = normalizedSlot > packageWallVisibleColumns ? normalizedSlot - packageWallColumns : normalizedSlot;
      applyWallTile(card.element, card.row, visualSlot, lens);
    }

    if (!running || reduceMotion) {
      return;
    }

    raf = window.requestAnimationFrame(renderWall);
  };

  const onWallResize = (): void => {
    measureWall();

    if (!running) {
      renderWall(window.performance.now());
    }
  };

  const startWall = (): void => {
    if (running) {
      return;
    }

    running = true;
    raf = window.requestAnimationFrame(renderWall);
  };

  const stopWall = (): void => {
    if (!running) {
      return;
    }

    running = false;
    window.cancelAnimationFrame(raf);
  };

  const visibilityObserver = new IntersectionObserver(entries => {
    const visible = entries.some(entry => entry.isIntersecting);

    if (visible) {
      startWall();
      return;
    }

    stopWall();
  }, { threshold: 0.08 });

  visibilityObserver.observe(section);
  window.addEventListener('resize', onWallResize);
  measureWall();
  renderWall(startedAt);

  if (reduceMotion) {
    stopWall();
  }

  return () => {
    stopWall();
    visibilityObserver.disconnect();
    window.removeEventListener('resize', onWallResize);
    grid.replaceChildren();
  };
}
