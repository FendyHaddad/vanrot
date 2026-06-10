import { describe, expect, it } from 'vitest';
import { planForgeReload } from '../src/index.js';

describe('Forge reload planner', () => {
  it('plans reload actions from Vanrot role ownership', () => {
    expect(planForgeReload('src/pages/home/home.page.html')).toMatchObject({
      action: 'route-refresh',
      ownerPath: 'src/pages/home/home.page.ts',
    });
    expect(planForgeReload('src/pages/home/home.page.css')).toMatchObject({
      action: 'style-patch',
      ownerPath: 'src/pages/home/home.page.ts',
    });
    expect(planForgeReload('src/pages/home/home.page.ts')).toMatchObject({
      action: 'route-refresh',
      ownerPath: 'src/pages/home/home.page.ts',
    });
    expect(planForgeReload('src/components/hero/hero.component.html')).toMatchObject({
      action: 'component-refresh',
      ownerPath: 'src/components/hero/hero.component.ts',
    });
    expect(planForgeReload('src/components/hero/hero.component.css')).toMatchObject({
      action: 'style-patch',
      ownerPath: 'src/components/hero/hero.component.ts',
    });
    expect(planForgeReload('src/components/hero/hero.component.ts')).toMatchObject({
      action: 'component-refresh',
      ownerPath: 'src/components/hero/hero.component.ts',
    });
    expect(planForgeReload('src/app/app.layout.html')).toMatchObject({
      action: 'layout-refresh',
      ownerPath: 'src/app/app.layout.ts',
    });
    expect(planForgeReload('vanrot.config.ts')).toEqual({
      action: 'server-restart',
      filePath: 'vanrot.config.ts',
    });
    expect(planForgeReload('src/unknown.ts')).toEqual({
      action: 'full-reload',
      filePath: 'src/unknown.ts',
    });
  });
});
