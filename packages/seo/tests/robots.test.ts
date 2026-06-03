import { describe, expect, it } from 'vitest';
import {
  defineRobotsPolicy,
  generateRobotsTxt,
  seoRobotsDirective,
} from '../src/index.js';

describe('@vanrot/seo robots output', () => {
  it('generates robots.txt from policy constants', () => {
    const policy = defineRobotsPolicy({
      userAgent: '*',
      directives: [seoRobotsDirective.index, seoRobotsDirective.follow],
      disallow: ['/admin'],
      sitemap: 'https://vanrot.vankode.com/sitemap.xml',
    });

    expect(generateRobotsTxt(policy)).toBe(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Index: true',
        'Follow: true',
        'Sitemap: https://vanrot.vankode.com/sitemap.xml',
      ].join('\n'),
    );
  });
});
