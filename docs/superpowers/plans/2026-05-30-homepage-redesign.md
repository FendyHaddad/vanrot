# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/vanrot-site` homepage as a monochrome, shadcn-grade landing page — ASCII hero, real `@vanrot/ui` components, scroll-reveal motion — matching `docs/superpowers/specs/2026-05-30-homepage-redesign-design.md`.

**Architecture:** Three-file Vanrot page (`home.page.{ts,html,css}`) for structure/data/style, plus one `home-interactions.widget.ts` for canvas hero animation + IntersectionObserver scroll-reveal (lifecycle via `onMount`/`onDestroy`). Package data comes from the existing `packageReferenceDocs` single source of truth. Sections dogfood real `vr-*` primitives instead of raw divs. Visual structure is locked by the mockup `docs/superpowers/homepage-mockups/homepage-full.html`.

**Tech Stack:** TypeScript, `@vanrot/runtime` (signals, `onMount`), `@vanrot/ui` primitives, Vanrot compiler templates, Canvas2D, Vitest.

**Mockup reference (authoritative visuals):** `docs/superpowers/homepage-mockups/homepage-full.html`. Strip its visual-companion chrome (`.options`, `toggleSelect`, `<h2>/<p class="subtitle">` wrappers) — only the `.pg` page content and the two `<script>` blocks port over.

---

## Notes / Deviations From Mockup (read before starting)

1. **No version/size data.** `packageReferenceDocs` exposes only `name`, `area`, `status`. The mockup's `v1.4.0 · 3.9kb` footers were invented. Package widgets render **name + area + status** only. Do **not** hardcode versions/sizes.
2. **Package count is data-driven.** Data has 11 packages, not 9. The proof-strip "packages" stat and the package-widget grid both derive from `packages.length`. Section heading uses "Every package, one manifest" (no hardcoded number).
3. **Runtime size copy.** Keep `<4kb` as a single copy constant `runtimeSize` in `home.page.ts`. Confirm the real figure against `pnpm verify:size` before shipping; update the constant if it differs. Do not scatter the number.
4. **CTA hrefs stay literal** (`/docs` and `/docs/components`) to match the existing page and tests; `routePath` is server-side TS and the templates already use literal hrefs.
5. **Run from `apps/vanrot-site`** for filtered tests, or use `pnpm --filter @vanrot/vanrot-site test` from repo root. Commands below assume cwd = `apps/vanrot-site`.

---

## File Structure

- `apps/vanrot-site/src/pages/home/home.page.ts` — **modify.** Copy constants + data model (eyebrow, typed subtitle, stats, packages with status label). Wires the widget in the constructor.
- `apps/vanrot-site/src/pages/home/home.page.html` — **rewrite.** All sections, real `vr-*` primitives, canvas host element.
- `apps/vanrot-site/src/pages/home/home.page.css` — **rewrite.** Monochrome scoped styles, layout, scroll-reveal/divider rules.
- `apps/vanrot-site/src/pages/home/home-interactions.widget.ts` — **create.** `setupHomeInteractions()` → `setupHeroAnimation()` + `setupScrollReveal()`, both `onMount`-scoped, returning disposers.
- `apps/vanrot-site/tests/site-polish.test.ts` — **modify.** Replace stale CTA/structure assertions with the new contract.

---

## Task 1: Update homepage data model + copy (`home.page.ts`)

**Files:**
- Modify: `apps/vanrot-site/src/pages/home/home.page.ts`
- Modify: `apps/vanrot-site/tests/site-polish.test.ts:12-31` (the two home assertions)

- [ ] **Step 1: Update the failing test contract first**

In `tests/site-polish.test.ts`, replace the `'uses approved landing CTA labels'` test body with the new contract:

```ts
  it('uses approved landing CTA labels', async () => {
    const source = await readSiteFile('src/pages/home/home.page.ts');

    expect(source).toContain("primaryCta: 'Read the docs'");
    expect(source).toContain("installCta: '$ npm i @vanrot/runtime'");
    expect(source).toContain("eyebrow: 'AI-first · Signal-based · Secure by design'");
    expect(source).not.toContain("primaryCta: 'Framework Documentation'");
  });
```

- [ ] **Step 2: Run it, expect failure**

Run: `pnpm --filter @vanrot/vanrot-site test site-polish`
Expected: FAIL — `home.page.ts` still has `'Framework Documentation'`.

- [ ] **Step 3: Rewrite `home.page.ts`**

```ts
import { packageReferenceDocs } from '../../docs/site-data.ts';
import { setupHomeInteractions } from './home-interactions.widget.ts';

const runtimeSize = '<4kb'; // confirm against `pnpm verify:size`; single source of truth

const homeCopy = {
  eyebrow: 'AI-first · Signal-based · Secure by design',
  typedLine: 'The only framework you need. Reactivity without the magic.',
  primaryCta: 'Read the docs',
  installCta: '$ npm i @vanrot/runtime',
  componentsHeading: 'A component system, not a starter kit',
  componentsBody:
    'Real blocks built from vr-card, vr-table, vr-sidebar, vr-badge. Monochrome, crisp, production-grade.',
  componentsCta: 'Browse UI components',
  aiHeading: 'AI-first, secure by design',
  aiBody:
    'Vanrot ships a machine-readable manifest your agent reads directly — and a runtime with no eval, scoped styles, and zero supply-chain surface.',
  signalsHeading: 'Signals that make sense',
  signalsBody: 'No virtual DOM, no reconciliation. Update a signal — only what depends on it recomputes.',
  packagesHeading: 'Every package, one manifest',
  packagesBody: 'Each package ships independently. Pull only what you need.',
  startHeading: 'Start in one command',
  startBody: 'No config, no boilerplate. Scaffold a typed, reactive app in seconds.',
  installCommand: '$ npm create vanrot@latest',
} as const;

const aiFeatures = [
  { icon: '⌥', title: 'Agent manifest', body: 'Structured docs/ai knowledge. Agents understand Vanrot without guessing.' },
  { icon: '$_', title: 'vr ai', body: 'One command exposes the whole framework surface to any coding agent.' },
  { icon: '⊘', title: 'No eval', body: 'Templates compile to plain JS. CSP-friendly, nothing evaluated at runtime.' },
  { icon: '▣', title: 'Zero deps', body: '0 runtime dependencies. Tiny supply chain, fully typed surface.' },
] as const;

function isProductionReady(status: string): boolean {
  return status.startsWith('production-ready');
}

export class HomePage {
  copy = homeCopy;
  runtimeSize = runtimeSize;
  aiFeatures = aiFeatures;
  packages = packageReferenceDocs.map(pkg => ({
    name: pkg.name,
    area: pkg.area,
    statusLabel: isProductionReady(pkg.status) ? 'stable' : 'demo',
    statusClass: isProductionReady(pkg.status) ? 'pkg-badge--stable' : 'pkg-badge--demo',
  }));
  packageCount = packageReferenceDocs.length;
  stats = [
    { num: runtimeSize, label: 'runtime, gzipped' },
    { num: '0', label: 'runtime dependencies' },
    { num: String(packageReferenceDocs.length), label: 'packages' },
    { num: '100%', label: 'typed surface' },
  ];

  constructor() {
    setupHomeInteractions();
  }
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `pnpm --filter @vanrot/vanrot-site test site-polish`
Expected: the CTA-labels test PASSES. (Other tests in the file may still fail — handled in Task 5/6. That's expected mid-plan.)

- [ ] **Step 5: Commit**

```bash
git add apps/vanrot-site/src/pages/home/home.page.ts apps/vanrot-site/tests/site-polish.test.ts
git commit -m "feat(site): homepage data model + copy for redesign"
```

---

## Task 2: Hero animation + scroll-reveal widget (`home-interactions.widget.ts`)

**Files:**
- Create: `apps/vanrot-site/src/pages/home/home-interactions.widget.ts`

- [ ] **Step 1: Write the widget**

Port the two `<script>` IIFEs from the mockup into lifecycle-safe functions. The hero queries `[data-vr-home-hero]`; reveal observes `[data-vr-reveal-section]`. Both respect `prefers-reduced-motion`.

```ts
import { onMount, type Dispose } from '@vanrot/runtime';

const selector = {
  heroCanvas: '[data-vr-home-hero]',
  typedTarget: '[data-vr-home-typed]',
  revealSection: '[data-vr-reveal-section]',
} as const;

const noop: Dispose = () => {};
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupHomeInteractions(): void {
  onMount(() => {
    const disposers = [setupHeroAnimation(), setupScrollReveal()];
    return () => disposers.forEach(dispose => dispose());
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

  const buildMask = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width || canvas.clientWidth || 800;
    height = rect.height || 480;
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
    octx.font = `900 ${fontSize}px Geist, ui-sans-serif, system-ui, Arial, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText('VANROT', width / 2, height / 2 - 30);
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
        const idx = ((y * cell) * width + x * cell) * 4;
        if (mask[idx] > 128) {
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText(dense[Math.floor(hash(x, y) * dense.length)], x * cell, y * cell);
        }
      }
    }
  };

  const CHURN = 5;
  const RAIN_RATE = 1.2;
  let start = performance.now();

  const frame = (now: number): void => {
    if (mask === null) {
      return;
    }
    const time = (now - start) / 1000;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    const intro = smooth(Math.min(1, time / 2));
    const step = Math.floor(time * CHURN);
    const rainStep = Math.floor(time * RAIN_RATE);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = ((y * cell) * width + x * cell) * 4;
        const on = mask[idx] > 128;
        const seed = hash(x, y);
        if (on) {
          if (seed < intro) {
            const b = 0.78 + 0.2 * Math.sin(time * 1.3 + x * 0.12 + y * 0.08);
            const gi = ((Math.floor(seed * dense.length + step * 0.5) % dense.length) + dense.length) % dense.length;
            ctx.fillStyle = `rgba(255,255,255,${b.toFixed(2)})`;
            ctx.fillText(dense[gi], x * cell, y * cell);
          } else {
            const gi = ((Math.floor(seed * faint.length + step) % faint.length) + faint.length) % faint.length;
            ctx.fillStyle = `rgba(255,255,255,${(0.3 + 0.2 * seed).toFixed(2)})`;
            ctx.fillText(faint[gi], x * cell, y * cell);
          }
        } else if (hash(x * 0.7, y + rainStep) < 0.014) {
          ctx.fillStyle = 'rgba(255,255,255,0.16)';
          ctx.fillText(faint[Math.floor(seed * faint.length)], x * cell, y * cell);
        }
      }
    }
    raf = window.requestAnimationFrame(frame);
  };

  const go = (): void => {
    buildMask();
    if (prefersReducedMotion()) {
      drawStaticFrame();
      return;
    }
    start = performance.now();
    raf = window.requestAnimationFrame(frame);
  };

  if (document.fonts !== undefined && document.fonts.ready !== undefined) {
    void document.fonts.ready.then(go);
    window.setTimeout(go, 600);
  } else {
    go();
  }

  const disposeTyped = setupTypedSubtitle();

  return () => {
    window.cancelAnimationFrame(raf);
    disposeTyped();
  };
}

function setupTypedSubtitle(): Dispose {
  const target = document.querySelector<HTMLElement>(selector.typedTarget);
  if (target === null) {
    return noop;
  }
  const line = target.dataset.vrHomeTyped ?? target.textContent ?? '';
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
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );
  sections.forEach(section => observer.observe(section));
  return () => observer.disconnect();
}
```

- [ ] **Step 2: Typecheck the widget**

Run: `pnpm --filter @vanrot/vanrot-site typecheck`
Expected: PASS (no type errors). If `home.page.html` does not yet exist the page typecheck still passes — the widget is plain TS.

- [ ] **Step 3: Commit**

```bash
git add apps/vanrot-site/src/pages/home/home-interactions.widget.ts
git commit -m "feat(site): home hero canvas + scroll-reveal widget"
```

---

## Task 3: Homepage template (`home.page.html`)

**Files:**
- Modify (rewrite): `apps/vanrot-site/src/pages/home/home.page.html`
- Modify: `apps/vanrot-site/tests/site-polish.test.ts` (structure assertions)

- [ ] **Step 1: Update structure test contract**

Replace the `'keeps the landing page focused on framework docs and design components'` test body in `tests/site-polish.test.ts`:

```ts
  it('keeps the landing page focused on framework docs and design components', async () => {
    const html = await readSiteFile('src/pages/home/home.page.html');
    const css = await readSiteFile('src/pages/home/home.page.css');

    expect(html).toContain('href="/docs"');
    expect(html).toContain('href="/docs/components"');
    expect(html).toContain('<vr-badge');
    expect(html).toContain('data-vr-home-hero');
    expect(html).toContain('data-vr-reveal-section');
    expect(html).toContain('<vr-table');
    // Component-system section appears before the AI section.
    expect(html.indexOf('A component system')).toBeLessThan(
      html.indexOf('AI-first, secure by design'),
    );
    expect(css).not.toContain('min-height: calc(100vh');
  });
```

- [ ] **Step 2: Run it, expect failure**

Run: `pnpm --filter @vanrot/vanrot-site test site-polish`
Expected: FAIL — current HTML has none of `data-vr-home-hero`, `<vr-table`, the new headings.

- [ ] **Step 3: Rewrite `home.page.html`**

Port `.pg` content from the mockup, swapping raw divs for real primitives and binding data. Section order: Hero → Component system → AI+Secure → Signals → Proof → Packages → Get started. Each `<section>` carries `data-vr-reveal-section`.

```html
<main class="home-page">

  <section class="home-hero" data-vr-reveal-section>
    <canvas class="hero-canvas" data-vr-home-hero></canvas>
    <div class="hero-scan" aria-hidden="true"></div>
    <div class="hero-vignette" aria-hidden="true"></div>
    <div class="hero-copy">
      <vr-badge class="hero-badge">{{ copy.eyebrow }}</vr-badge>
      <p class="hero-typed"><span data-vr-home-typed data-vr-home-typed="{{ copy.typedLine }}"></span><span class="hero-caret"></span></p>
      <div class="hero-actions">
        <a class="btn-primary" href="/docs">{{ copy.primaryCta }}</a>
        <a class="btn-ghost" href="/docs">{{ copy.installCta }}</a>
      </div>
    </div>
  </section>

  <section class="home-components" data-vr-reveal-section>
    <div class="section-head">
      <h2 class="reveal">{{ copy.componentsHeading }}</h2>
      <p class="section-lead reveal">{{ copy.componentsBody }}</p>
    </div>
    <div class="browser-frame reveal">
      <div class="browser-chrome">
        <span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span>
        <span class="browser-url">vanrot.dev/docs/components</span>
      </div>
      <div class="dashboard">
        <vr-sidebar class="db-sidebar" placement.left aria-label="Framework">
          <div class="db-brand"><span class="db-brand-mark"></span><span>Vanrot</span></div>
          <button class="db-search" type="button"><span>⌕</span><span>Search…</span><kbd>⌘K</kbd></button>
          <vr-nav class="db-nav" aria-label="Framework">
            <div class="db-nav-title">Framework</div>
            <a class="db-nav-link db-nav-link--active" href="/docs/components">Dashboard</a>
            <a class="db-nav-link" href="/docs/components">Packages</a>
            <a class="db-nav-link" href="/docs/components">Components</a>
            <a class="db-nav-link" href="/docs">Changelog</a>
          </vr-nav>
        </vr-sidebar>
        <div class="db-main">
          <div class="db-topbar">
            <vr-breadcrumb class="db-crumb">
              <a href="/">Vanrot</a><span class="db-crumb-sep">/</span><a href="/docs">Framework</a><span class="db-crumb-sep">/</span><span>Overview</span>
            </vr-breadcrumb>
            <vr-avatar class="db-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" alt="User"></vr-avatar>
          </div>
          <div class="db-content">
            <div class="db-stats">
              <vr-stat class="db-stat"><span class="db-stat-label">Runtime size</span><span class="db-stat-num">{{ runtimeSize }}</span></vr-stat>
              <vr-stat class="db-stat"><span class="db-stat-label">Dependencies</span><span class="db-stat-num">0</span></vr-stat>
              <vr-stat class="db-stat"><span class="db-stat-label">Packages</span><span class="db-stat-num">{{ packageCount }}</span></vr-stat>
              <vr-stat class="db-stat"><span class="db-stat-label">Type coverage</span><span class="db-stat-num">100%</span></vr-stat>
            </div>
            <vr-card class="db-panel">
              <div class="db-panel-head"><h3>Packages</h3></div>
              <vr-table class="db-table">
                <vr-table-header>
                  <vr-table-row>
                    <vr-table-head>Package</vr-table-head>
                    <vr-table-head>Area</vr-table-head>
                    <vr-table-head class="end">Status</vr-table-head>
                  </vr-table-row>
                </vr-table-header>
                <vr-table-body>
                  @for (item of packages; track item.name) {
                  <vr-table-row>
                    <vr-table-cell class="db-pkg-name">{{ item.name }}</vr-table-cell>
                    <vr-table-cell>{{ item.area }}</vr-table-cell>
                    <vr-table-cell class="end"><vr-badge class="pkg-badge {{ item.statusClass }}">{{ item.statusLabel }}</vr-badge></vr-table-cell>
                  </vr-table-row>
                  }
                </vr-table-body>
              </vr-table>
            </vr-card>
          </div>
        </div>
      </div>
    </div>
    <div class="section-cta reveal"><a class="btn-primary" href="/docs/components">{{ copy.componentsCta }} →</a></div>
  </section>

  <section class="home-ai" data-vr-reveal-section>
    <div class="section-head">
      <h2 class="reveal">{{ copy.aiHeading }}</h2>
      <p class="section-lead reveal">{{ copy.aiBody }}</p>
    </div>
    <div class="ai-grid">
      @for (feature of aiFeatures; track feature.title) {
      <vr-card class="ai-card">
        <span class="ai-icon">{{ feature.icon }}</span>
        <h3 class="ai-title">{{ feature.title }}</h3>
        <p class="ai-body">{{ feature.body }}</p>
      </vr-card>
      }
    </div>
  </section>

  <section class="home-signals" data-vr-reveal-section>
    <div class="section-head">
      <h2 class="reveal">{{ copy.signalsHeading }}</h2>
      <p class="section-lead reveal">{{ copy.signalsBody }}</p>
    </div>
    <div class="signals-demo reveal">
      <vr-card class="code-panel">
        <div class="code-bar"><span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span><span class="code-file">counter.ts</span></div>
        <pre class="code-block"><span class="cc">// no magic, no diffing</span>
<span class="ck">const</span> count = <span class="cf">signal</span>(0);
<span class="ck">const</span> doubled = <span class="cf">computed</span>(() =&gt; count() * 2);
<span class="cf">effect</span>(() =&gt; console.<span class="cf">log</span>(doubled()));

count.<span class="cf">set</span>(21); <span class="cc">// → logs 42</span></pre>
      </vr-card>
      <div class="signals-flow">
        <span class="flow-node">signal</span><span class="flow-arrow">→</span>
        <span class="flow-node">computed</span><span class="flow-arrow">→</span>
        <span class="flow-node">effect</span>
      </div>
    </div>
  </section>

  <section class="home-proof" data-vr-reveal-section>
    <div class="proof-strip">
      @for (stat of stats; track stat.label) {
      <div class="proof-cell">
        <span class="proof-num">{{ stat.num }}</span>
        <span class="proof-label">{{ stat.label }}</span>
      </div>
      }
    </div>
  </section>

  <section class="home-packages" data-vr-reveal-section>
    <div class="section-head">
      <h2 class="reveal">{{ copy.packagesHeading }}</h2>
      <p class="section-lead reveal">{{ copy.packagesBody }}</p>
    </div>
    <div class="packages-grid">
      @for (item of packages; track item.name) {
      <vr-card class="pkg-card">
        <div class="pkg-top">
          <span class="pkg-name">{{ item.name }}</span>
          <vr-badge class="pkg-badge {{ item.statusClass }}">{{ item.statusLabel }}</vr-badge>
        </div>
        <p class="pkg-area">{{ item.area }}</p>
      </vr-card>
      }
    </div>
  </section>

  <section class="home-start" data-vr-reveal-section>
    <div class="section-head">
      <h2 class="reveal">{{ copy.startHeading }}</h2>
      <p class="section-lead reveal">{{ copy.startBody }}</p>
    </div>
    <div class="install-bar reveal"><span>{{ copy.installCommand }}</span><span class="install-copy">copy</span></div>
    <div class="start-actions reveal">
      <a class="btn-primary" href="/docs">{{ copy.primaryCta }}</a>
      <a class="btn-ghost" href="/docs/components">{{ copy.componentsCta }}</a>
    </div>
  </section>

</main>
```

> Note: if the compiler rejects a duplicate `data-vr-home-typed` attribute (value + bare), keep only `data-vr-home-typed="{{ copy.typedLine }}"` and have the widget read `dataset.vrHomeTyped`. The widget already does.

- [ ] **Step 4: Verify the structure test passes + compiler accepts the template**

Run: `pnpm --filter @vanrot/vanrot-site test site-polish`
Expected: the structure test PASSES (CSS test may still fail until Task 4).

Run: `pnpm --filter @vanrot/vanrot-site build`
Expected: build/codegen succeeds (no unknown-element or template diagnostics). If a `vr-*` element errors, check it against `packages/ui/src/primitives/` and the `uiPrimitiveType` map; adjust the tag to a real one.

- [ ] **Step 5: Commit**

```bash
git add apps/vanrot-site/src/pages/home/home.page.html apps/vanrot-site/tests/site-polish.test.ts
git commit -m "feat(site): homepage template with real vr- primitives"
```

---

## Task 4: Homepage styles (`home.page.css`)

**Files:**
- Modify (rewrite): `apps/vanrot-site/src/pages/home/home.page.css`

- [ ] **Step 1: Confirm the CSS assertions still in the test**

The structure test (Task 3) asserts `css` does **not** contain `min-height: calc(100vh`. Keep that true. No new failing test needed here; this task makes the page match the mockup visually and keeps the existing assertion green.

- [ ] **Step 2: Rewrite `home.page.css`**

Port the mockup's stylesheet, scoped under `.home-page`, monochrome only (no `--vr-color-brand`). Full stylesheet:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600&display=swap');

.home-page {
  --home-bg: #000;
  --home-panel: #0a0a0a;
  --home-line: rgba(255, 255, 255, 0.09);
  --home-fg: #fafafa;
  --home-muted: #8a8a8a;
  background: var(--home-bg);
  color: var(--home-fg);
  font-family: var(--vr-font-sans, Geist, system-ui, sans-serif);
}

.home-page section {
  position: relative;
  padding: 96px 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}
.home-page .section-head { max-width: 560px; margin: 0 auto; }
.home-page h2 { margin: 0 0 14px; font-size: 32px; letter-spacing: -0.025em; color: var(--home-fg); font-weight: 650; }
.home-page .section-lead { margin: 0 auto; font-size: 15.5px; line-height: 1.65; color: var(--home-muted); max-width: 520px; }

/* hero */
.home-hero { padding: 0; height: 480px; overflow: hidden; }
.hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-scan { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: overlay;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) 1px, transparent 2px, transparent 3px); }
.hero-vignette { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%, transparent 38%, rgba(0,0,0,.7) 100%); }
.hero-copy { position: absolute; left: 0; right: 0; bottom: 46px; text-align: center; }
.hero-badge { display: inline-flex; border: 1px solid rgba(255,255,255,.22); color: rgba(255,255,255,.7);
  font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; padding: 4px 12px; border-radius: var(--vr-radius-full, 999px); background: transparent; }
.hero-typed { margin-top: 14px; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 13px; color: rgba(255,255,255,.75); }
.hero-caret { display: inline-block; width: 7px; height: 14px; background: #fff; margin-left: 3px; vertical-align: -2px; animation: hero-blink 1.1s steps(1) infinite; }
@keyframes hero-blink { 50% { opacity: 0; } }
.hero-actions { margin-top: 24px; display: flex; gap: 10px; justify-content: center; }
.btn-primary { background: #fff; color: #000; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 6px; text-decoration: none; }
.btn-ghost { border: 1px solid rgba(255,255,255,.28); color: #fff; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; }

/* component system / browser frame */
.browser-frame { max-width: 980px; margin: 44px auto 0; border: 1px solid rgba(255,255,255,.14); border-radius: 12px; overflow: hidden; text-align: left; box-shadow: 0 24px 60px rgba(0,0,0,.5); }
.browser-chrome { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-bottom: 1px solid var(--home-line); background: #0b0b0b; }
.browser-dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,.16); }
.browser-url { flex: 1; text-align: center; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 11px; color: rgba(255,255,255,.3); }
.dashboard { display: grid; grid-template-columns: 208px 1fr; min-height: 430px; background: #050505; }
.db-sidebar { border-right: 1px solid var(--home-line); padding: 14px 10px; display: grid; gap: 3px; align-content: start; }
.db-brand { display: flex; align-items: center; gap: 9px; padding: 4px 8px 12px; font-size: 13.5px; color: var(--home-fg); }
.db-brand-mark { width: 18px; height: 18px; border-radius: 5px; background: #fff; }
.db-search { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 9px; border: 1px solid rgba(255,255,255,.1); border-radius: 7px; color: #666; font-size: 12.5px; background: transparent; }
.db-search kbd { margin-left: auto; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 10px; padding: 1px 5px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; }
.db-nav-title { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #555; padding: 8px 8px 3px; }
.db-nav-link { display: flex; align-items: center; height: 30px; padding: 0 9px; border-radius: 7px; font-size: 12.5px; color: #9a9a9a; text-decoration: none; }
.db-nav-link--active { background: #161616; color: #fff; }
.db-main { display: grid; grid-template-rows: 52px 1fr; }
.db-topbar { display: flex; align-items: center; gap: 12px; padding: 0 18px; border-bottom: 1px solid var(--home-line); }
.db-crumb { display: flex; align-items: center; gap: 7px; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 11px; }
.db-crumb a { color: #777; text-decoration: none; }
.db-crumb span:last-child { color: var(--home-fg); }
.db-crumb-sep { color: #333; }
.db-avatar { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,.15); }
.db-content { padding: 18px; display: grid; gap: 14px; align-content: start; }
.db-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.db-stat { border: 1px solid var(--home-line); border-radius: 10px; padding: 13px 14px; background: #0c0c0c; display: grid; gap: 8px; }
.db-stat-label { font-size: 11.5px; color: #777; }
.db-stat-num { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 23px; color: var(--home-fg); font-weight: 600; }
.db-panel { border: 1px solid var(--home-line); border-radius: 10px; background: #0c0c0c; overflow: hidden; padding: 0; }
.db-panel-head { padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,.07); }
.db-panel-head h3 { margin: 0; font-size: 13px; color: #eee; }
.db-table { width: 100%; border-collapse: collapse; }
.db-table vr-table-head, .db-table vr-table-cell { padding: 11px 18px; font-size: 12.5px; }
.db-table vr-table-head { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: #666; border-bottom: 1px solid rgba(255,255,255,.07); }
.db-table vr-table-cell { color: #9a9a9a; border-bottom: 1px solid rgba(255,255,255,.04); }
.db-table .db-pkg-name { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); color: #ededed; }
.db-table .end { text-align: right; }

/* ai cards */
.ai-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; max-width: 980px; margin: 50px auto 0; }
.ai-card { background: #080808; border: 1px solid var(--home-line); border-radius: 16px; padding: 30px 24px; transition: border-color .18s, transform .18s, background .18s; }
.ai-card:hover { border-color: rgba(255,255,255,.26); background: #0c0c0c; transform: translateY(-4px); }
.ai-icon { width: 46px; height: 46px; margin: 0 auto 20px; border: 1px solid rgba(255,255,255,.14); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 19px; color: #fff; background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0)); }
.ai-title { margin: 0 0 12px; font-size: 14.5px; color: #f4f4f4; text-align: center; }
.ai-body { margin: 0; font-size: 12.5px; line-height: 1.6; color: #838383; text-align: center; }

/* signals */
.signals-demo { max-width: 640px; margin: 46px auto 0; }
.code-panel { border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: #070707; overflow: hidden; text-align: left; padding: 0; }
.code-bar { display: flex; gap: 6px; align-items: center; padding: 11px 15px; border-bottom: 1px solid var(--home-line); background: #0c0c0c; }
.code-file { margin-left: 10px; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 11px; color: #666; }
.code-block { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 13px; line-height: 2; color: #cfcfcf; padding: 22px 24px; margin: 0; }
.code-block .ck { color: #fff; }
.code-block .cf { color: #fff; }
.code-block .cc { color: #5f5f5f; }
.signals-flow { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 30px; }
.flow-node { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 12px; padding: 9px 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 8px; color: #eee; background: #0c0c0c; }
.flow-arrow { color: #555; font-size: 15px; }

/* proof strip */
.home-proof { padding: 0; }
.proof-strip { display: grid; grid-template-columns: repeat(4, 1fr); max-width: 880px; margin: 0 auto; }
.proof-cell { padding: 30px 20px; border-right: 1px solid rgba(255,255,255,.07); display: grid; gap: 9px; }
.proof-cell:last-child { border-right: none; }
.proof-num { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 34px; color: var(--home-fg); font-weight: 600; letter-spacing: -0.02em; }
.proof-label { font-size: 12px; color: #777; }

/* package widgets */
.packages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; max-width: 980px; margin: 44px auto 0; text-align: left; }
.pkg-card { border: 1px solid var(--home-line); border-radius: 12px; background: #070707; padding: 20px; transition: border-color .15s; }
.pkg-card:hover { border-color: rgba(255,255,255,.28); }
.pkg-top { display: flex; align-items: center; gap: 10px; }
.pkg-name { font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 12.5px; color: var(--home-fg); }
.pkg-badge { margin-left: auto; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 10px; padding: 3px 9px; border-radius: 6px; border: 1px solid rgba(255,255,255,.2); color: #e6e6e6; }
.pkg-badge--demo { opacity: .55; border-style: dashed; }
.pkg-area { margin: 14px 0 0; font-size: 12.5px; line-height: 1.5; color: #7e7e7e; }

/* get started */
.install-bar { display: inline-flex; align-items: center; gap: 14px; margin-top: 28px; padding: 14px 20px; border: 1px solid rgba(255,255,255,.18); border-radius: 8px; background: #0b0b0b; font-family: var(--vr-font-number, 'JetBrains Mono', monospace); font-size: 14px; color: #fff; }
.install-copy { font-size: 11px; color: #888; border: 1px solid rgba(255,255,255,.15); border-radius: 5px; padding: 3px 8px; cursor: pointer; }
.start-actions { margin-top: 24px; display: flex; gap: 12px; justify-content: center; }
.section-cta { margin-top: 32px; }

/* scroll reveal + animated divider */
.home-page section::after { content: ''; position: absolute; left: 50%; bottom: -1px; height: 1px; width: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); transform: translateX(-50%);
  transition: width 1.1s cubic-bezier(.2,.7,.2,1) .1s; }
.home-page section.in::after { width: 72%; }
.home-page .reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
.home-page section.in .reveal { opacity: 1; transform: none; }
.ai-card, .pkg-card, .proof-cell { opacity: 0; transform: translateY(22px) scale(.99); transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1); }
.home-page section.in .ai-card, .home-page section.in .pkg-card, .home-page section.in .proof-cell { opacity: 1; transform: none; }
.ai-grid .ai-card:nth-child(2) { transition-delay: .07s; }
.ai-grid .ai-card:nth-child(3) { transition-delay: .14s; }
.ai-grid .ai-card:nth-child(4) { transition-delay: .21s; }
.packages-grid .pkg-card:nth-child(3n+2) { transition-delay: .06s; }
.packages-grid .pkg-card:nth-child(3n) { transition-delay: .12s; }

@media (prefers-reduced-motion: reduce) {
  .home-page .reveal, .ai-card, .pkg-card, .proof-cell { opacity: 1 !important; transform: none !important; }
  .home-page section::after { transition: none; }
  .hero-caret { animation: none; }
}
```

- [ ] **Step 3: Build + run home tests**

Run: `pnpm --filter @vanrot/vanrot-site test site-polish`
Expected: all `site polish` home tests PASS.

Run: `pnpm --filter @vanrot/vanrot-site build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/vanrot-site/src/pages/home/home.page.css
git commit -m "feat(site): monochrome homepage styles + scroll-reveal"
```

---

## Task 5: Full suite + visual verification

**Files:**
- Possibly modify: `apps/vanrot-site/tests/site-pages.test.ts` (only if it asserts old homepage strings)

- [ ] **Step 1: Run the app's full test suite**

Run: `pnpm --filter @vanrot/vanrot-site test`
Expected: PASS. If `site-pages.test.ts` fails on an old homepage string (e.g. old eyebrow `'Signal-based UI framework'`, `'The Hitchhiker's Guide'`, or `db-*`/`dep-*` class names), update those assertions to the new structure. Show the failing assertion, then change it to match the new copy/markup. Re-run.

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter @vanrot/vanrot-site typecheck`
Run: `pnpm --filter @vanrot/vanrot-site lint`
Expected: both PASS. Fix any guard-clause / unused-import lint violations introduced.

- [ ] **Step 3: Visual check in the dev server**

Run: `pnpm --filter @vanrot/vanrot-site dev`
Open the homepage. Verify: hero decodes "VANROT" (not blank), typed subtitle types, each section reveals on scroll with the divider drawing in, dashboard renders via real `vr-*` components, package grid lists all packages from data, monochrome throughout (no orange). Toggle OS reduced-motion → animations off, content visible.

- [ ] **Step 4: Commit any test fixes**

```bash
git add apps/vanrot-site/tests/site-pages.test.ts
git commit -m "test(site): align homepage assertions with redesign"
```

---

## Task 6: Repo gate

- [ ] **Step 1: Run the full verify gate**

Run (repo root): `pnpm verify`
Expected: PASS — typecheck + test + build + `verify:size` + `verify:phase-docs`. The runtime size budget must still pass (the homepage adds no runtime deps). If `runtimeSize` copy (`<4kb`) disagrees with the real size-limit number, update the `runtimeSize` constant in `home.page.ts`.

- [ ] **Step 2: Final commit (if anything changed)**

```bash
git add -A
git commit -m "chore(site): finalize homepage redesign"
```

---

## Self-Review Coverage Map (spec → task)

- Monochrome design language, drop brand orange → Task 1 (copy), Task 4 (CSS: no `--vr-color-brand`).
- Section order Hero → Component system → AI+Secure → Signals → Proof → Packages → Get started → Task 3 (template + order assertion).
- ASCII hero v5 (deterministic, fonts.ready guard, reduced-motion) → Task 2.
- Component CTA "Browse UI components → /docs/components" → Task 1 copy + Task 3 markup.
- AI cards: icon chip, title centered, body centered → Task 3 markup + Task 4 CSS.
- Signals code + flow → Task 3 + Task 4.
- Proof strip (data-driven counts) → Task 1 stats + Task 3.
- Package widgets (real fields only) → Task 1 + Task 3 + Task 4.
- Dogfood real `vr-*` components → Task 3 (vr-sidebar/nav/breadcrumb/avatar/stat/card/table/badge).
- Scroll reveal + animated dividers → Task 2 (observer) + Task 4 (CSS).
- Single source of truth (package data, route hrefs, runtime size constant) → Task 1.
- No new runtime deps / canvas2D only → Task 2; verified Task 6 (`verify:size`).
