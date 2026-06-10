# Vanrot Coding Conventions

## File Ownership

- `.html`: UI structure, static labels, section copy, authored user-visible prose.
- `.ts`: logic, imports, signals, computed values, inputs, typed data used by logic.
- `.css`: scoped styling for the component that renders the DOM.

Do not put UI markup in TypeScript. Do not put application logic in HTML.

## Page Components

Use role suffixes: `.page.ts`, `.component.ts`, `.layout.ts`, `.dialog.ts`, `.widget.ts`, `.form.ts`.

For page-local visual chunks:

- create a page-local child component;
- move the large template/SVG into the child `.component.html`;
- move visual styles into the child `.component.css`;
- keep the page template readable.

## Home Page Pattern

For `apps/vanrot-site/src/pages/home/home.page.*`:

- `home.page.html` owns brand copy, CTA labels, section headings, static details, and the page structure.
- `home.page.ts` owns package metrics, structured data required for logic, and imports only.
- `home.page.css` owns page layout.
- `home-ai-artwork.component.*` or equivalent owns large SVG visual variants.

## Shared Strings

Shared route names, paths, labels, command names, diagnostic codes, file suffixes, and generated copy live in one source of truth.

Literal strings are allowed at the owning source boundary. For page-authored UI copy, that boundary is normally the HTML template.

## Custom Tags

When a custom template tag is introduced for the site, update both:

- `web-types.json`
- `apps/vanrot-site/web-types.json`
