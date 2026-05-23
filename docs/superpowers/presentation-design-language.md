# Vanrot Presentation Design Language

Use this direction for future Vanrot presentations, visual companion screens, and high-level product explainers.

## Core Direction

Vanrot presentations should feel like a polished dark shadcn-style product surface: quiet, precise, editorial, and tool-like. The design should look intentional without feeling decorative.

## Visual Rules

- Use dark-only presentation surfaces.
- Prefer near-black backgrounds, charcoal panels, hairline borders, and muted secondary text.
- Use restrained vermilion or red-orange accenting for emphasis.
- Keep corners tight, around 8px or less.
- Use dense, readable layouts over oversized marketing sections.
- Use monospace blocks for CLI, code, command output, diagnostics, and system state.
- Keep typography tight and calm, with no negative letter spacing.
- Avoid decorative gradients, blobs, or atmospheric backgrounds.
- Avoid loud illustrations unless the slide is specifically about a visual asset.
- Make each slide feel like a product interface, not a pitch deck template.

## Content Rules

- Use short, direct headings.
- Prefer concrete product states over abstract claims.
- Show real commands, real outputs, real files, and real decisions.
- Use status words that feel human and controlled, such as `ready`, `made`, `good`, `fix`, and `stop`.
- When showing problems, include the next precise action.
- Keep copy minimal. Let the interface carry meaning.

## CLI Presentation Pattern

When presenting CLI design, compare ordinary output against Vanrot output. The Vanrot side should show:

- Short command verbs.
- Stable aligned output.
- Clear status labels.
- Helpful but restrained error messages.
- One suggested next command when repair is possible.
- No stack trace unless the user asks for details.

## Mood

The target is not playful, cute, or maximal. It should feel like a serious developer tool made by people with taste.
