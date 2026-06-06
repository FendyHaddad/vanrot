import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const formattersArticle = {
  "key": "formatters",
  "section": "framework",
  "path": "/docs/formatters",
  "label": "Formatters",
  "title": "Formatters And Template Pipes",
  "summary": "Vanrot template pipes are compiler-owned interpolation formatters backed by @vanrot/formatters, .pipe.ts role files, named presets, locale context, terminal diagnostics, and focused pipe tests.",
  "status": "production-ready",
  "sections": [
    {
      "id": "formatters-boundary",
      "title": "Compiler-owned formatting",
      "body": "Template pipes are a compiler feature, not a runtime trick. A component template can request display-only formatting with a small interpolation expression, the compiler validates the pipe name, arguments, variant, and source span, then generated output calls @vanrot/formatters only when the template actually uses pipes. The formatter package stays pure and synchronous so @vanrot/runtime does not grow and application logic does not move into HTML.",
      "points": [
        "Use template pipes for display-only formatting inside interpolation.",
        "Keep data fetching, async work, mutation, validation decisions, and business workflows outside pipes.",
        "Use @vanrot/forms or form resources for asynchronous state, then pipe the resolved value.",
        "Generated output imports @vanrot/formatters only for templates that use pipe expressions."
      ],
      "code": {
        "title": "Template interpolation",
        "code": "<td>{{ row.amount | currency }}</td>\\n<td>{{ row.description | truncate(20) }}</td>\\n<td>{{ claim.status | claimStatus }}</td>"
      }
    },
    {
      "id": "template-syntax",
      "title": "Template pipes",
      "body": "Pipe syntax is available only inside interpolation. The compiler parses the base expression first, then applies pipe calls from left to right so each pipe receives the previous pipe's result. Arguments use a JavaScript-call shape because it reads cleanly in templates and keeps numbers, strings, booleans, arrays, object literals, and imported constants recognizable. Namespace variants use dot syntax for built-in variants and app presets.",
      "points": [
        "Use {{ value | pipeName }} when a pipe has no arguments.",
        "Use {{ value | pipeName(arg1, arg2) }} for explicit options such as truncate(20) or currency('MYR').",
        "Use {{ value | namespace.variant }} for built-in variants and custom presets such as date.monthDayYear or mask.malaysiaPhone.",
        "Use direct string arguments for one-off formats and named constants or presets when a format is shared.",
        "Use chaining only when each step clearly consumes the previous step's output."
      ],
      "code": {
        "title": "Syntax shapes",
        "code": "{{ createdAt | date.monthDayYear }}\\n{{ createdAt | date('dd/MM/yyyy') }}\\n{{ total | number.thousands }}\\n{{ invoiceTotal | currency('MYR') }}\\n{{ description | fallback('No description') | truncate(80) }}"
      }
    },
    {
      "id": "built-in-suite",
      "title": "Built-in pipe suite",
      "body": "@vanrot/formatters ships the common display helpers most app screens reach for first: text casing, truncation, fallback text, initials, date and time rendering, relative time, duration, number display, currency, percent, compact notation, file sizes, list joining, counts, plural labels, masks, and form-message rendering. These helpers are pure and synchronous, which keeps generated output predictable and keeps formatting work out of application markup.",
      "points": [
        "Text pipes include uppercase, lowercase, titlecase, sentencecase, truncate, fallback, and initials.",
        "Date and time pipes include date, time, datetime, relativeTime, and duration. date accepts built-in variants, direct pattern strings, or app presets.",
        "Number pipes include number, currency, percent, compact, and filesize. number.thousands and number.cents cover the common separator and cents cases.",
        "List and count pipes include join, count, and plural for labels such as 1 item or 4 items.",
        "Mask and form-message pipes cover phone-like display masks and validation message display.",
        "Built-ins are the default toolbox; app-specific labels and one-off business formats belong in .pipe.ts files."
      ],
      "code": {
        "title": "Built-ins",
        "code": "{{ user.name | titlecase }}\\n{{ createdAt | date.monthDayYear }}\\n{{ approvedAt | datetime('dd/MM/yyyy HH:mm') }}\\n{{ total | currency('MYR') }}\\n{{ total | number.cents }}\\n{{ attachmentsSize | filesize }}\\n{{ items | plural('item', 'items') }}\\n{{ phone | mask('+60 ##-### ####') }}\\n{{ field.messages | messages }}"
      }
    },
    {
      "id": "built-in-arguments",
      "title": "Built-in arguments and variants",
      "body": "Most built-ins work with no arguments, but the high-value ones accept arguments because real products need more than one display convention. date, time, and datetime accept pattern strings; currency accepts an ISO currency code and falls back to formatting.currency; truncate accepts a character limit; fallback accepts replacement copy; join accepts a separator; plural accepts singular and optional plural labels; mask accepts a display pattern; number also has built-in variants for thousands separators and cents.",
      "points": [
        "Use date.monthDayYear, date.dayMonthYear, date.monthYear, date.short, and date.long for common date variants.",
        "Use date('MM/dd/yyyy'), date('dd/MM/yyyy'), date('MM/yy'), or date('dd/MM/yy') when a one-off pattern is clearer than a preset.",
        "Use number.thousands for grouped whole numbers and number.cents when the screen should force two decimal places.",
        "Use currency with no argument when the app default currency is enough, or currency('USD') when the column needs to override it.",
        "Use mask('###-###-####') for local one-off masks and a named mask preset for country or business-wide masks."
      ],
      "code": {
        "title": "Argument-heavy pipes",
        "code": "{{ createdAt | date('MM/dd/yyyy') }}\\n{{ createdAt | date('dd/MM/yy') }}\\n{{ reportMonth | date('MM/yy') }}\\n{{ amount | number.thousands }}\\n{{ amount | number.cents }}\\n{{ amount | currency }}\\n{{ amount | currency('USD') }}\\n{{ description | truncate(20) }}\\n{{ phone | mask('###-###-####') }}"
      }
    },
    {
      "id": "pipe-role-files",
      "title": ".pipe.ts role files",
      "body": "Custom pipes live in .pipe.ts role files. The Vite plugin discovers these files, extracts exported pipe metadata, watches them during development, and passes the registry to the compiler. This keeps domain-specific display rules close to application source while still making the compiler aware of names, presets, duplicates, invalid definitions, and unsupported async handlers. A custom pipe is still only a formatter: it should map a resolved value into display output.",
      "points": [
        "Use definePipe for a custom synchronous formatter.",
        "Use enumPipe when backend status values or domain enums need stable display labels.",
        "Keep enums in separate domain files when that keeps the application model cleaner.",
        "Do not call APIs, read browser state, mutate signals, or hide validation workflows inside a pipe.",
        "Return display-ready values that templates can render directly."
      ],
      "code": {
        "title": "Domain pipe",
        "code": "import { definePipe } from '@vanrot/formatters';\\nimport { ClaimStatus } from './claim-status';\\n\\nexport const claimStatus = definePipe('claimStatus', (status) => {\\n  switch (status) {\\n    case ClaimStatus.Approved:\\n      return 'Approved';\\n    case ClaimStatus.Rejected:\\n      return 'Rejected';\\n    case ClaimStatus.PendingReview:\\n      return 'Pending review';\\n    default:\\n      return 'Unknown';\\n  }\\n});"
      }
    },
    {
      "id": "presets",
      "title": "Named presets",
      "body": "Presets let an application turn string-heavy formatter arguments into named constants. This matters in enterprise apps where country-specific masks, financial formats, claim numbers, invoice dates, or business-specific display conventions repeat across many screens. The exported constant name becomes the variant name, so export const invoice = datePattern('dd/MM/yyyy') is consumed as {{ createdAt | date.invoice }}. Direct strings still remain available when a one-off format is clearer.",
      "points": [
        "Use datePattern for reusable date and time variants.",
        "Use numberPattern for reusable number display variants.",
        "Use maskPattern for country-specific or business-specific display masks.",
        "Name the exported constant after the template variant you want to read.",
        "Prefer named presets for shared app conventions and direct string arguments for isolated local formats."
      ],
      "code": {
        "title": "Preset file",
        "code": "import { datePattern, maskPattern, numberPattern } from '@vanrot/formatters';\\n\\nexport const invoice = datePattern('dd/MM/yyyy');\\nexport const claimAmount = numberPattern('0,0.00');\\nexport const malaysiaPhone = maskPattern('+60 ##-### ####');\\n\\n// Template usage:\\n// {{ createdAt | date.invoice }}\\n// {{ total | number.claimAmount }}\\n// {{ phone | mask.malaysiaPhone }}"
      }
    },
    {
      "id": "custom-enum-pipes",
      "title": "Enum and backend value display",
      "body": "Backend status values often arrive as terse enum values because that is the right shape for storage and APIs. Templates should not spread switch statements or repeated string maps across pages. Put the enum in a domain file when that keeps the model clean, import it into a .pipe.ts file, and expose one pipe that owns the display wording.",
      "points": [
        "Use definePipe when the mapping needs custom branching, fallback logic, or formatting context.",
        "Use enumPipe when the enum-to-label mapping is a simple lookup table.",
        "Keep the fallback explicit so new backend values do not render as raw API codes.",
        "Test custom status pipes directly because they are part of the user's visible workflow."
      ],
      "code": {
        "title": "Status label pipe",
        "code": "import { definePipe } from '@vanrot/formatters';\\nimport { ClaimStatus } from './claim-status';\\n\\nexport const claimStatus = definePipe('claimStatus', (status) => {\\n  switch (status) {\\n    case ClaimStatus.Approved:\\n      return 'Approved';\\n    case ClaimStatus.Rejected:\\n      return 'Rejected';\\n    case ClaimStatus.PendingReview:\\n      return 'Pending review';\\n    default:\\n      return 'Unknown';\\n  }\\n});"
      }
    },
    {
      "id": "formatting-context",
      "title": "Formatting context",
      "body": "Generated output creates a pipe context from vanrot.config.ts formatting defaults. The context carries locale, timezone, and currency so built-in and custom pipes can format consistently without hard-coding those values in every template. Pipe handlers receive the context as their second argument, which is useful when a custom formatter should respect the app's locale or default currency.",
      "points": [
        "Set formatting.locale, formatting.timezone, and formatting.currency in vanrot.config.ts.",
        "Use the context in custom pipes when display output depends on locale, timezone, or currency.",
        "Avoid hard-coded locale and currency values in .pipe.ts files unless the business rule is intentionally fixed.",
        "Leave context values unset when the project should use Vanrot defaults: en-US, UTC, and USD."
      ],
      "code": {
        "title": "Config and context",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  formatting: {\\n    locale: 'en-MY',\\n    timezone: 'Asia/Kuala_Lumpur',\\n    currency: 'MYR',\\n  },\\n});\\n\\nexport const money = definePipe('money', (value, ctx) => {\\n  return new Intl.NumberFormat(ctx.locale, {\\n    style: 'currency',\\n    currency: ctx.currency,\\n  }).format(Number(value));\\n});"
      }
    },
    {
      "id": "compiler-diagnostics",
      "title": "Compiler diagnostics",
      "body": "Pipe errors are reported as compiler diagnostics with stable codes, source locations, code frames, suggestions, and docs paths. The compiler fails unknown pipes, unknown variants, duplicate names, duplicate presets, invalid arguments, invalid definitions, and async pipe handlers before a broken formatter reaches the browser. The Vite plugin surfaces the same errors in the terminal during startup and rebuild so the developer sees the failing file and line immediately.",
      "points": [
        "VR_PIPE_UNKNOWN reports a pipe name that is not built in and not exported by a discovered .pipe.ts file.",
        "VR_PIPE_UNKNOWN_VARIANT reports a missing namespace preset such as date.invoice.",
        "VR_PIPE_INVALID_ARGUMENT reports argument shapes the compiler cannot lower safely.",
        "VR_PIPE_INVALID_DEFINITION reports exports that look like pipe metadata but are not built with the approved helpers.",
        "VR_PIPE_ASYNC reports async custom pipes because pipes are pure synchronous display helpers.",
        "Terminal output includes the template file, line, column, code frame, diagnostic code, and a suggestion when one is available."
      ],
      "code": {
        "title": "Terminal-facing error",
        "code": "src/claims/summary.page.html:12:19 VR_PIPE_UNKNOWN\\nUnknown template pipe: claimStauts\\n\\n12 | <td>{{ claim.status | claimStauts }}</td>\\n   |                   ^^^^^^^^^^^\\nSuggestion: Did you mean claimStatus?"
      }
    },
    {
      "id": "vite-tooling",
      "title": "Vite discovery and rebuilds",
      "body": "@vanrot/vite-plugin discovers .pipe.ts files during config resolution and reports pipe diagnostics through the terminal during startup and rebuild. The plugin also watches pipe files that affect a compiled component so changing a custom pipe or preset invalidates the right modules. Future Forge, editor completions, and richer static analysis can reuse the same role-file convention without changing the template syntax.",
      "points": [
        "Use .pipe.ts files under the configured source root for app-level pipe definitions.",
        "Fix duplicate exported names before relying on generated output.",
        "Expect terminal diagnostics to include file path, line, column, code, and a docs path.",
        "Use the same .pipe.ts convention in Vite today and future Forge projects later."
      ],
      "code": {
        "title": "Discovered app files",
        "code": "src/claims/business.pipe.ts\\nsrc/claims/summary.page.ts\\nsrc/claims/summary.page.html\\nvanrot.config.ts"
      }
    },
    {
      "id": "testing",
      "title": "Testing formatter behavior",
      "body": "Formatter tests should cover the pipe function directly and at least one compiled template path when syntax, registry behavior, or diagnostics matter. @vanrot/formatters exposes createPipeTest for focused unit tests, while compiler and Vite tests verify that pipe expressions lower into generated output with the expected registry. This keeps domain display rules testable without requiring a full app boot.",
      "points": [
        "Test custom pipe outputs with representative backend values and enum defaults.",
        "Test named presets once at the pipe-file boundary instead of repeating every template.",
        "Use compiler tests when a template depends on chaining, arguments, source spans, or diagnostics.",
        "Use Vite plugin tests for discovery, duplicate reporting, async rejection, watched files, and terminal diagnostics.",
        "Use one realistic compiled template test for custom pipes that are central to a user workflow."
      ],
      "code": {
        "title": "Focused pipe test",
        "code": "import { createPipeTest } from '@vanrot/formatters/testing';\\nimport { claimStatus } from '../src/business.pipe';\\n\\nconst testPipe = createPipeTest(claimStatus);\\n\\nexpect(testPipe('APPROVED')).toBe('Approved');\\nexpect(testPipe('PENDING_REVIEW')).toBe('Pending review');"
      }
    }
  ]
} as const;

const sectionLinks = formattersArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FormattersPage {
  title(): string {
    return formattersArticle.title;
  }

  summary(): string {
    return formattersArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersArticle.sections[0].body;
  section1Body = formattersArticle.sections[1].body;
  section2Body = formattersArticle.sections[2].body;
  section3Body = formattersArticle.sections[3].body;
  section4Body = formattersArticle.sections[4].body;
  section5Body = formattersArticle.sections[5].body;
  section6Body = formattersArticle.sections[6].body;
  section7Body = formattersArticle.sections[7].body;
  section8Body = formattersArticle.sections[8].body;
  section9Body = formattersArticle.sections[9].body;
  section10Body = formattersArticle.sections[10].body;
  section0Points = formattersArticle.sections[0].points ?? [];
  section1Points = formattersArticle.sections[1].points ?? [];
  section2Points = formattersArticle.sections[2].points ?? [];
  section3Points = formattersArticle.sections[3].points ?? [];
  section4Points = formattersArticle.sections[4].points ?? [];
  section5Points = formattersArticle.sections[5].points ?? [];
  section6Points = formattersArticle.sections[6].points ?? [];
  section7Points = formattersArticle.sections[7].points ?? [];
  section8Points = formattersArticle.sections[8].points ?? [];
  section9Points = formattersArticle.sections[9].points ?? [];
  section10Points = formattersArticle.sections[10].points ?? [];
  section0Code = formattersArticle.sections[0].code?.code ?? '';
  section1Code = formattersArticle.sections[1].code?.code ?? '';
  section2Code = formattersArticle.sections[2].code?.code ?? '';
  section3Code = formattersArticle.sections[3].code?.code ?? '';
  section4Code = formattersArticle.sections[4].code?.code ?? '';
  section5Code = formattersArticle.sections[5].code?.code ?? '';
  section6Code = formattersArticle.sections[6].code?.code ?? '';
  section7Code = formattersArticle.sections[7].code?.code ?? '';
  section8Code = formattersArticle.sections[8].code?.code ?? '';
  section9Code = formattersArticle.sections[9].code?.code ?? '';
  section10Code = formattersArticle.sections[10].code?.code ?? '';
}
