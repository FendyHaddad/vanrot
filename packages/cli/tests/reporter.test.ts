import { describe, expect, it } from 'vitest';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('createMemoryReporter', () => {
  it('renders quiet premium sections and next steps', () => {
    const reporter = createMemoryReporter();

    reporter.heading('Vanrot Doctor', '2 warnings');
    reporter.warning('src/app.component.html', 'Raw user-facing text found in template.');
    reporter.nextSteps([
      'Replace visible text with an i18n key.',
      'Move early return to the top of the method.',
    ]);

    expect(reporter.output()).toContain('Vanrot Doctor');
    expect(reporter.output()).toContain('2 warnings');
    expect(reporter.output()).toContain('warning');
    expect(reporter.output()).toContain('src/app.component.html');
    expect(reporter.output()).toContain('> Replace visible text with an i18n key.');
  });
});
