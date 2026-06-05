import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/index.js';

const baseSource = {
  componentPath: 'src/orders.page.ts',
  componentSource: 'export class OrdersPage { amount = 25; createdAt = new Date(); }',
  templatePath: 'src/orders.page.html',
  stylePath: 'src/orders.page.css',
  styleSource: '',
};

describe('pipe diagnostics', () => {
  it('fails unknown pipes with source location and suggestion', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ amount | curreny }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_UNKNOWN',
        filePath: 'src/orders.page.html',
        line: 1,
        column: expect.any(Number),
        message: expect.stringContaining('currency'),
        docsPath: '/docs/formatters',
      }),
    );
  });

  it('fails unknown pipe variants', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ createdAt | date.monthDayyer }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_UNKNOWN_VARIANT',
        message: expect.stringContaining('date.monthDayyer'),
      }),
    );
  });

  it('fails knowably invalid pipe args', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ amount | truncate("twenty") }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_INVALID_ARGUMENT',
        message: expect.stringContaining('truncate'),
        codeFrame: expect.stringContaining('truncate("twenty")'),
      }),
    );
  });
});
