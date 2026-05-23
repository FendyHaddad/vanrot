import { describe, expect, it } from 'vitest';
import { diagnoseRouterTemplateUsage } from '../../src/router/router-template-diagnostics.js';
import { parseTemplate } from '../../src/template/parse-template.js';

function diagnosticsFor(templateSource: string, templatePath: string) {
  return diagnoseRouterTemplateUsage(parseTemplate(templateSource, templatePath).nodes, templatePath);
}

describe('router template diagnostics', () => {
  it('reports multiple root routers in app layout', () => {
    const diagnostics = diagnosticsFor('<vr-router></vr-router><vr-router></vr-router>', 'app.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_ROUTER_MULTIPLE_ROOTS']);
    expect(diagnostics[0]?.message).toBe('App layout templates can contain only one <vr-router />.');
  });

  it('reports root router outside app layout', () => {
    const diagnostics = diagnosticsFor('<vr-router></vr-router>', 'shop.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_ROUTER_OUTSIDE_APP_LAYOUT']);
  });

  it('reports outlet outside route layout', () => {
    const diagnostics = diagnosticsFor('<vr-outlet></vr-outlet>', 'home.page.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain('VR_OUTLET_OUTSIDE_LAYOUT');
  });

  it('reports page templates that contain outlets', () => {
    const diagnostics = diagnosticsFor('<article><vr-outlet></vr-outlet></article>', 'product.page.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain('VR_PAGE_HAS_OUTLET');
  });

  it('reports route layouts without outlets', () => {
    const diagnostics = diagnosticsFor('<section>Shop</section>', 'shop.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_LAYOUT_MISSING_OUTLET']);
  });

  it('reports route layouts with multiple outlets', () => {
    const diagnostics = diagnosticsFor(
      '<section><vr-outlet></vr-outlet><vr-outlet></vr-outlet></section>',
      'shop.layout.html',
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_LAYOUT_MULTIPLE_OUTLETS']);
  });
});
