import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

describe('vr ui', () => {
  it('lists registry-backed UI components', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'list'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot UI components');
    expect(reporter.output()).toContain('input');
    expect(reporter.output()).toContain('vr-input');
    expect(reporter.output()).toContain('table');
    expect(reporter.output()).toContain('vr-table');
  });

  it('prints component help from the rich registry', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'input', '--help'], {
      cwd: process.cwd(),
      reporter,
    });
    const output = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(output).toContain('vr-input');
    expect(output).toContain('Docs: /docs/components/inputs');
    expect(output).toContain('Dotted tokens');
    expect(output).toContain('type: text, email, password, number, search, tel, url');
    expect(output).toContain('Booleans');
    expect(output).toContain('required: Marks the field required for validation.');
    expect(output).toContain('Examples');
    expect(output).toContain('<vr-input type.email size.md name="email" placeholder="Email"></vr-input>');
  });

  it('prints Phase 16F anatomy in component help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'dialog', '--help'], {
      cwd: process.cwd(),
      reporter,
    });
    const output = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(output).toContain('vr-dialog');
    expect(output).toContain('Docs: /docs/components/dialogs');
    expect(output).toContain('Anatomy');
    expect(output).toContain('vr-dialog-trigger: Registers the element that opens the dialog.');
    expect(output).toContain('vr-dialog-content: Renders the accessible dialog surface.');
  });

  it('prints Phase 16G component help from the rich registry', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'commandMenu', '--help'], {
      cwd: process.cwd(),
      reporter,
    });
    const output = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(output).toContain('vr-command-menu');
    expect(output).toContain('Docs: /docs/components/command-menu');
    expect(output).toContain('density: comfortable, compact, dense');
    expect(output).toContain('vr-command-menu-item: Represents one selectable command.');
    expect(output).toContain('select: Emitted when an enabled command item is selected.');
  });
});
