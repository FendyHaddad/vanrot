import { describe, expect, it } from 'vitest';
import {
  formatSiteFormatFailures,
  scanTemplateIndentation,
} from './verify-site-format.mjs';

describe('verify-site-format', () => {
  it('fails when nested closing tags share the same indentation', () => {
    const failures = scanTemplateIndentation(
      'component-input.page.html',
      [
        '<section class="content">',
        '  <section class="preview">',
        '  </section>',
        '  </section>',
      ].join('\n'),
    );

    expect(failures).toEqual([
      {
        file: 'component-input.page.html',
        line: 4,
        tag: 'section',
        indent: 2,
      },
    ]);
  });

  it('passes when nested closing tags are indented by structure', () => {
    const failures = scanTemplateIndentation(
      'component-input.page.html',
      [
        '<section class="content">',
        '  <section class="preview">',
        '  </section>',
        '</section>',
      ].join('\n'),
    );

    expect(failures).toEqual([]);
  });

  it('formats readable failures', () => {
    expect(
      formatSiteFormatFailures([
        {
          file: 'component-input.page.html',
          line: 4,
          tag: 'section',
          indent: 2,
        },
      ]),
    ).toBe(
      'Site format verification failed.\n- component-input.page.html:4 nested </section> closing tags share indent 2.\nIndent nested closing tags so source-owned examples model readable Vanrot templates.',
    );
  });
});
