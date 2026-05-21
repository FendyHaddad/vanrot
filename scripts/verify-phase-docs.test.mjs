import { describe, expect, it } from 'vitest';
import {
  checkCompletedPhasePlans,
  checkMaturityRows,
  checkPresentationRoadmap,
  parseBrainstormPhases,
} from './verify-phase-docs.mjs';

describe('phase documentation verification', () => {
  it('parses completed and pending phases from the brainstorm tracker', () => {
    const phases = parseBrainstormPhases(`
| Done | Phase | Create | Tick when |
|---|---|---|---|
| [x] | Phase 3 - Compiler MVP | compiler | done |
| [ ] | Phase 4 - Vite integration | vite | later |
`);

    expect(phases).toEqual([
      { done: true, number: 3, title: 'Compiler MVP' },
      { done: false, number: 4, title: 'Vite integration' },
    ]);
  });

  it('fails when a completed phase plan still has unchecked tasks', () => {
    const failures = checkCompletedPhasePlans(
      [{ done: true, number: 3, title: 'Compiler MVP' }],
      new Map([[3, '- [x] complete\n- [ ] stale task\n']]),
    );

    expect(failures).toEqual([
      'Phase 3 is done in docs/brainstorm.md but docs/superpowers/plans/Phase-03.md still has unchecked tasks.',
    ]);
  });

  it('ignores unchecked tasks for phases that are not complete yet', () => {
    const failures = checkCompletedPhasePlans(
      [{ done: false, number: 5, title: 'CLI MVP' }],
      new Map([[5, '- [ ] write the CLI plan\n']]),
    );

    expect(failures).toEqual([]);
  });

  it('fails when a completed phase still has Planned maturity rows', () => {
    const failures = checkMaturityRows(
      [{ done: true, number: 4, title: 'Vite integration' }],
      `| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vite transform integration | vite-plugin | Phase 4 | demo | prod | Planned | not moved yet |
`,
    );

    expect(failures).toEqual([
      'Phase 4 is done in docs/brainstorm.md but feature maturity row "Vite transform integration" is still Planned.',
    ]);
  });

  it('fails when the presentation roadmap does not match brainstorm status', () => {
    const failures = checkPresentationRoadmap(
      [
        { done: true, number: 4, title: 'Vite integration' },
        { done: false, number: 5, title: 'CLI MVP' },
      ],
      `
<div class="phase-card active-phase">
  <div class="phase-num">Phase 4</div>
</div>
<div class="phase-card">
  <div class="phase-num">Phase 5</div>
</div>
`,
    );

    expect(failures).toEqual([
      'Phase 4 is done in docs/brainstorm.md but docs/vanrot-presentation.html does not mark it as done.',
      'Phase 5 is the next pending phase but docs/vanrot-presentation.html does not mark it as active.',
    ]);
  });
});
