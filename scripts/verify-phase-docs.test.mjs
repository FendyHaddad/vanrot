import { describe, expect, it } from 'vitest';
import {
  checkCompletedPhasePlans,
  checkMaturityRows,
  checkPostProductionIdeas,
  checkPresentationRoadmap,
  parseMaturityRoadmapPhases,
} from './verify-phase-docs.mjs';

describe('phase documentation verification', () => {
  it('parses completed and pending phases from the feature maturity roadmap', () => {
    const phases = parseMaturityRoadmapPhases(`
| Done | Phase | Track | Modules And Submodules | Tick When |
|---|---:|---|---|---|
| [x] | Phase 11 | Production roadmap and standards foundation | ledger | done |
| [ ] | Phase 12 | Core framework hardening | core | later |
`);

    expect(phases).toEqual([
      { done: true, number: 11, title: 'Production roadmap and standards foundation' },
      { done: false, number: 12, title: 'Core framework hardening' },
    ]);
  });

  it('fails when a completed phase plan still has unchecked tasks', () => {
    const failures = checkCompletedPhasePlans(
      [{ done: true, number: 3, title: 'Compiler MVP' }],
      new Map([[3, '- [x] complete\n- [ ] stale task\n']]),
    );

    expect(failures).toEqual([
      'Phase 3 is done in docs/superpowers/feature-maturity.md but docs/superpowers/plans/Phase-03.md still has unchecked tasks.',
    ]);
  });

  it('fails when a completed phase plan file is missing', () => {
    const failures = checkCompletedPhasePlans(
      [{ done: true, number: 11, title: 'Production roadmap and standards foundation' }],
      new Map(),
    );

    expect(failures).toEqual([
      'Phase 11 is done in docs/superpowers/feature-maturity.md but docs/superpowers/plans/Phase-11.md is missing.',
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
      'Phase 4 is done in docs/superpowers/feature-maturity.md but feature maturity row "Vite transform integration" is still Planned.',
    ]);
  });

  it('fails when the presentation roadmap does not match feature maturity status', () => {
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
      'Phase 4 is done in docs/superpowers/feature-maturity.md but docs/vanrot-presentation.html does not mark it as done.',
      'Phase 5 is the next pending phase but docs/vanrot-presentation.html does not mark it as active.',
    ]);
  });

  it('fails when post-production editor tooling still treats the shipped IntelliJ plugin foundation as future work', () => {
    const failures = checkPostProductionIdeas(`
## Later Candidate: IntelliJ And Editor Tooling

- After post-production implementation and distribution hardening, build a real IntelliJ plugin or language service for Angular-like behavior.
- 27C IntelliJ plugin or language-service prototype
`);

    expect(failures).toEqual([
      'docs/superpowers/post-production-implementation-ideas.md still describes the shipped IntelliJ plugin foundation as future work.',
      'docs/superpowers/post-production-implementation-ideas.md editor tooling section must record the shipped `editors/intellij` foundation and `com.vankode.vanrot` plugin metadata.',
    ]);
  });
});
