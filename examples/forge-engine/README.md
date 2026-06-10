# Forge Native Engine Example

This example shows the Vanrot-native engine shape without a Vite config.

Use it as a reference for:

- `engine: 'forge'` in `vanrot.config.ts`
- `vr dev` and `vr build` dispatching through @vanrot/forge
- role files staying split across `.page.ts`, `.page.html`, and `.page.css`
- route ownership staying in page role files

This folder is a workspace example package, but it intentionally has no build or test scripts yet. It documents the native engine file shape without adding another required verification target to the monorepo.
