import { describe, expect, it } from 'vitest';
import {
  checkFinalTddInventory,
  parseFinalTddInventoryRows,
} from './verify-final-tdd-inventory.mjs';

describe('final TDD inventory verification', () => {
  it('parses inventory rows with tested markers', () => {
    const rows = parseFinalTddInventoryRows(`
## \`@vanrot/runtime\`

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [x] | reactive | \`signal()\` | Production-Ready | Covers reads and writes. | Phase 2 | Existing runtime tests. |
`);

    expect(rows).toEqual([
      {
        area: 'reactive',
        item: '`signal()`',
        line: 6,
        maturity: 'Production-Ready',
        notes: 'Existing runtime tests.',
        ownerPhase: 'Phase 2',
        section: '`@vanrot/runtime`',
        tested: '[x]',
      },
    ]);
  });

  it('fails when an inventory table has no tested column', () => {
    const failures = checkFinalTddInventory(`
## \`@vanrot/runtime\`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|
| reactive | \`signal()\` | Production-Ready | Covers reads and writes. | Phase 2 | Existing runtime tests. |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:4 inventory table for `@vanrot/runtime` is missing the Tested column.',
    ]);
  });

  it('fails when non-deferred inventory work is not ticked', () => {
    const failures = checkFinalTddInventory(`
## \`@vanrot/runtime\`

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [ ] | reactive | \`signal()\` | Production-Ready | Covers reads and writes. | Phase 2 | Existing runtime tests. |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:6 `@vanrot/runtime` `signal()` is Production-Ready but Tested is [ ].',
    ]);
  });

  it('fails when deferred post-production work is ticked early', () => {
    const failures = checkFinalTddInventory(`
## \`@vanrot/testing\`

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [x] | API | \`testPage(...)\` | Deferred | Future coverage. | Phase 18 | Deferred from Phase 10. |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:6 `@vanrot/testing` `testPage(...)` is Deferred but Tested is [x].',
    ]);
  });

  it('fails when deferred work is outside post-production phases', () => {
    const failures = checkFinalTddInventory(`
## \`@vanrot/cli\`

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [ ] | command | \`vr inspect\` | Deferred | Future command. | Phase 14 | Tracked in feature maturity. |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:6 `@vanrot/cli` `vr inspect` is Deferred outside post-production phases.',
    ]);
  });

  it('fails when audit-needed rows remain after final audit', () => {
    const failures = checkFinalTddInventory(`
## Examples And Fixtures

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [x] | generated convention | no UI markup in TypeScript | Audit-Needed | Must be enforced broadly. | Phase 26 | Needs release proof. |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:6 Examples And Fixtures no UI markup in TypeScript is still Audit-Needed.',
    ]);
  });

  it('fails when an inventory row does not match its table header', () => {
    const failures = checkFinalTddInventory(`
## \`@vanrot/runtime\`

| Tested | Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|---|---|---|---|---|---|---|
| [x] | reactive | \`signal()\` | Production-Ready | Covers reads and writes. | Phase 2 |
`);

    expect(failures).toEqual([
      'docs/superpowers/final-tdd-inventory.md:6 `@vanrot/runtime` inventory row has 6 cells but expected 7.',
    ]);
  });
});
