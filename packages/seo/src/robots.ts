import { seoRobotsDirective } from './constants.js';
import type { SeoRobotsDirective } from './types.js';

export interface SeoRobotsPolicy {
  userAgent?: string;
  allow?: string[];
  disallow?: string[];
  directives?: SeoRobotsDirective[];
  sitemap?: string;
}

export function defineRobotsPolicy(policy: SeoRobotsPolicy): Readonly<SeoRobotsPolicy> {
  const normalized: SeoRobotsPolicy = { ...policy };

  if (policy.allow) {
    normalized.allow = [...policy.allow];
  }

  if (policy.disallow) {
    normalized.disallow = [...policy.disallow];
  }

  if (policy.directives) {
    normalized.directives = [...policy.directives];
  }

  return Object.freeze(normalized);
}

export function generateRobotsTxt(policy: SeoRobotsPolicy): string {
  const lines = [`User-agent: ${policy.userAgent ?? '*'}`];
  const allow = policy.allow?.length ? policy.allow : ['/'];

  for (const path of allow) {
    lines.push(`Allow: ${path}`);
  }

  for (const path of policy.disallow ?? []) {
    lines.push(`Disallow: ${path}`);
  }

  if (policy.directives?.includes(seoRobotsDirective.index)) {
    lines.push('Index: true');
  }

  if (policy.directives?.includes(seoRobotsDirective.follow)) {
    lines.push('Follow: true');
  }

  if (policy.sitemap) {
    lines.push(`Sitemap: ${policy.sitemap}`);
  }

  return lines.join('\n');
}
