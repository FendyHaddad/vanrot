import { describe, expect, it } from 'vitest';
import * as behavior from '../../src/index.js';

describe('@vanrot/behavior exports', () => {
  it('exposes the migrated behavior helpers at the package root', () => {
    expect(behavior.createFormController).toBeTypeOf('function');
    expect(behavior.createTableController).toBeTypeOf('function');
    expect(behavior.connectTableFilter).toBeTypeOf('function');
    expect(behavior.createOverlayController).toBeTypeOf('function');
    expect(behavior.createTabsController).toBeTypeOf('function');
    expect(behavior.createTooltipController).toBeTypeOf('function');
    expect(behavior.createToastController).toBeTypeOf('function');
    expect(behavior.createCommandMenuController).toBeTypeOf('function');
    expect(behavior.positionLayer).toBeTypeOf('function');
  });

  it('supports explicit subpath source modules', async () => {
    await expect(import('../../src/form.js')).resolves.toMatchObject({
      createFormController: expect.any(Function),
    });
    await expect(import('../../src/table.js')).resolves.toMatchObject({
      createTableController: expect.any(Function),
      connectTableFilter: expect.any(Function),
    });
    await expect(import('../../src/tooltip.js')).resolves.toMatchObject({
      createTooltipController: expect.any(Function),
    });
    await expect(import('../../src/all.js')).resolves.toMatchObject({
      createCommandMenuController: expect.any(Function),
      positionLayer: expect.any(Function),
    });
  });
});
