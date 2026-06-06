# Phase 30 Docs Page Components Spec

## Status

Approved for planning.

Phase 30 is a follow-up to Phase 24 Documentation And Web Presence. Phase 24 made the docs site useful and checkable, but
the current authoring model still leans too hard on centralized docs data files. That creates tech debt for humans editing
the site without AI because the docs do not dogfood Vanrot's own page conventions.

## Goal

Move Vanrot docs authoring to real page components while preserving the current UI design.

Every human-authored docs route should be represented by normal Vanrot role files:

- `.page.ts`
- `.page.html`
- `.page.css`

Structured registries may still exist for navigation, route metadata, AI export, search export, and drift checks, but they
must not be the primary authoring surface for narrative docs pages.

## Problem

The current docs architecture centralizes most guide content in docs data files and renders it through shared article
logic. That helps generated workflows, but it weakens the repo's own conventions:

- docs pages do not look like normal Vanrot pages in the source tree;
- adding a page requires touching data, navigation, route, AI, and test glue manually;
- parent and child framework docs can drift into data entries instead of real page boundaries;
- repeated UI blocks such as code examples are embedded in renderer logic instead of reusable docs components;
- CSS is scattered by page even when most docs styles are shared.

Phase 30 should fix the authoring model without redesigning the visible site.

## Approved Decisions

- Use real page components for docs pages.
- Preserve the current UI design.
- Preserve existing docs class names unless a class is clearly obsolete.
- Keep parent framework pages as real routes.
- Keep child framework pages as real routes.
- Do not represent child pages as parent-page anchors.
- Include changelog as a real docs page component.
- Extract reusable docs UI components for repeated article pieces.
- Move common docs styles into a shared docs CSS file.
- Keep page component CSS limited to page-specific exceptions.
- Keep generated docs/search/AI data as derived output, not the human authoring source.

## Planned File Structure

```text
apps/vanrot-site/src/pages/docs/
  shared/
    docs.css
    docs-article-shell.component.ts
    docs-article-shell.component.html
    docs-article-shell.component.css
    docs-section.component.ts
    docs-section.component.html
    docs-section.component.css
    docs-code-block.component.ts
    docs-code-block.component.html
    docs-code-block.component.css
    docs-note.component.ts
    docs-note.component.html
    docs-note.component.css
    docs-points-list.component.ts
    docs-points-list.component.html
    docs-points-list.component.css

  get-started/
    introduction/
      introduction.page.ts
      introduction.page.html
      introduction.page.css
    installation/
      installation.page.ts
      installation.page.html
      installation.page.css
    project-structure/
      project-structure.page.ts
      project-structure.page.html
      project-structure.page.css

  framework/
    runtime/
      runtime.page.ts
      runtime.page.html
      runtime.page.css
      signals/
        signals.page.ts
        signals.page.html
        signals.page.css
      inputs/
        inputs.page.ts
        inputs.page.html
        inputs.page.css
    compiler/
      compiler.page.ts
      compiler.page.html
      compiler.page.css
      inputs/
        inputs.page.ts
        inputs.page.html
        inputs.page.css
    cli/
      cli.page.ts
      cli.page.html
      cli.page.css
      project-intelligence/
        project-intelligence.page.ts
        project-intelligence.page.html
        project-intelligence.page.css

  changelog/
    changelog.page.ts
    changelog.page.html
    changelog.page.css
    changelog-entry.component.ts
    changelog-entry.component.html
    changelog-entry.component.css
```

The full migration should include every existing docs route, not only the sample folders above.

## Parent And Child Framework Pages

Framework docs should be modeled as a real route tree.

Parent pages are real overview pages:

- `/docs/runtime`
- `/docs/compiler`
- `/docs/cli`
- `/docs/routing`
- `/docs/forms`
- `/docs/formatters`

Child pages are real focused pages:

- `/docs/runtime/signals`
- `/docs/compiler/inputs`
- `/docs/cli/project-intelligence`
- `/docs/forms/arrays-wizards-errors`
- `/docs/formatters/enum-pipes`

Each parent and child route needs:

- a page component;
- a route entry;
- a navigation tree entry;
- route/render test coverage;
- AI/search export coverage when applicable;
- metadata coverage where the public docs surface requires it.

Parent pages may link to children, but child content must live in child page components.

## Shared Docs Components

Phase 30 should extract repeated docs UI into small reusable components.

Required shared components:

- article shell;
- article section;
- code block;
- note;
- points list.

The code block component should preserve the current code example UI, including title, line numbers, token styling, and
spacing. Page `.ts` files may own code strings or import local examples, but page `.html` files should decide where code
blocks render.

Changelog should use page components too. If the entry markup stays repetitive, use a `changelog-entry` component while
keeping changelog release data typed and reusable.

## Shared CSS

Most docs styles should move to a shared docs stylesheet:

```text
apps/vanrot-site/src/pages/docs/shared/docs.css
```

This shared stylesheet should own the common docs class system, including:

- `docs-article-layout`
- `docs-article`
- `docs-summary`
- `docs-section-grid`
- `docs-section`
- `code-snippet`
- `docs-code-title`
- `code-block`
- `code-line`
- `code-line-number`
- `code-line-content`
- `docs-note`
- `docs-article-bookmarks`
- `docs-changelog-*`
- `reference-*`
- `matrix-*`

Individual page CSS files should be minimal. They should contain only styles that are truly specific to that page or that
cannot belong to the shared docs stylesheet without harming other pages.

## Registry And Generated Data

Phase 30 should keep one typed docs page tree as the source of truth for route metadata and navigation:

```text
apps/vanrot-site/src/docs/docs-page-tree.ts
```

The tree should own:

- key;
- label;
- path;
- page component;
- section group;
- children.

These outputs should derive from the tree:

- `routes.ts` docs route entries;
- `site-navigation.ts`;
- AI-readable docs bundles;
- search/export docs data;
- route and navigation coverage tests.

If `site-data.json` remains, it should be generated or transitional. It should not be edited by hand as the source for
human-authored guide pages.

## Migration Strategy

Migrate in small slices:

1. Extract shared docs CSS and shared article/code components while preserving current DOM classes.
2. Convert a small route set such as introduction, one framework parent, one framework child, and changelog.
3. Add snapshot or rendered-output checks proving the converted routes still use the same visual shell.
4. Convert remaining framework parent and child pages by section.
5. Convert reference/example/changelog special pages only after their shared pieces are stable.
6. Remove or generate old data-only docs content once all migrated routes pass.

This should avoid a big-bang rewrite and keep visual regressions visible.

## Verification

Phase 30 is complete only when:

- each migrated docs route has `.page.ts`, `.page.html`, and `.page.css`;
- parent and child framework pages render as real routes;
- changelog renders through a real page component;
- common styles are centralized in shared docs CSS;
- page CSS files contain only page-specific exceptions;
- reusable article/code/note/list components preserve current class names;
- navigation and route tests prove every docs menu item resolves to a route;
- AI/search export checks prove generated docs data still covers public pages;
- browser inspection or screenshot comparison shows no intentional UI design change;
- `pnpm --filter @vanrot/vanrot-site test` passes;
- `pnpm verify:site-docs` passes;
- `pnpm verify` passes.

## Non-Goals

- Do not redesign the docs UI.
- Do not change public docs route paths except where an existing path is already wrong.
- Do not move docs behavior into `@vanrot/runtime`.
- Do not replace the docs site with a separate docs engine.
- Do not remove AI/search/reference outputs; make them derived from real pages instead.
- Do not use subagents, git worktrees, staging, commits, or pushes unless the user explicitly asks.

