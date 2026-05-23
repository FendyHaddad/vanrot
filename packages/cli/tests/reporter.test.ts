import { describe, expect, it } from 'vitest';
import { parseOutputMode, renderJsonEvent, renderJsonLineEvent } from '../src/reporter/modes.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('createMemoryReporter', () => {
  it('pads status labels to the shared content column', () => {
    const reporter = createMemoryReporter();

    reporter.success('vanrot.config.ts found');
    reporter.warning('src/app.component.html', 'Raw user-facing text found in template.');
    reporter.error('Node.js version too old', 'requires 18.0.0 or later');
    reporter.nextSteps(['upgrade Node.js to 18+']);

    expect(reporter.output()).toBe(
      [
        'success   vanrot.config.ts found',
        'warning   src/app.component.html',
        '          Raw user-facing text found in template.',
        'error     Node.js version too old',
        '          requires 18.0.0 or later',
        'next      upgrade Node.js to 18+',
      ].join('\n'),
    );
  });

  it('renders headings with optional metadata on one stable line', () => {
    const reporter = createMemoryReporter();

    reporter.heading('Vanrot Doctor', '2 findings');

    expect(reporter.output()).toBe('Vanrot Doctor  2 findings\n');
  });

  it('skips next output when no next steps exist', () => {
    const reporter = createMemoryReporter();

    reporter.nextSteps([]);

    expect(reporter.output()).toBe('');
  });
});

describe('output modes', () => {
  it('parses quiet, verbose, color, json, jsonl, and non-interactive flags', () => {
    const parsed = parseOutputMode([
      '--quiet',
      '--verbose',
      '--no-color',
      '--json',
      '--no-interactive',
    ]);

    expect(parsed).toEqual({
      args: [],
      mode: {
        quiet: true,
        verbose: true,
        color: false,
        interactive: false,
        structured: 'json',
      },
      error: undefined,
    });
  });

  it('rejects json and jsonl together', () => {
    const parsed = parseOutputMode(['build', '--json', '--jsonl']);

    expect(parsed.error).toEqual({
      code: 'VR_JSON_MODE_CONFLICT',
      message: '--json and --jsonl cannot be used together',
      nextStep: 'Choose either --json or --jsonl.',
    });
  });

  it('renders final json and jsonl events deterministically', () => {
    const event = { type: 'result' as const, command: 'doctor', exitCode: 1 };

    expect(renderJsonEvent(event)).toBe(
      '{\n  "type": "result",\n  "command": "doctor",\n  "exitCode": 1\n}',
    );
    expect(renderJsonLineEvent(event)).toBe('{"type":"result","command":"doctor","exitCode":1}');
  });
});
