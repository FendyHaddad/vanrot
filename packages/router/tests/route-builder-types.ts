import { createRoutes } from '../src/index.js';
import { createTestLayout, createTestPage } from '../src/test/test-pages.js';

const routes = createRoutes();

routes.page({
  path: '/',
  label: 'Home',
  page: createTestPage('home'),
});

routes.layout({
  path: '/shop',
  label: 'Shop',
  layout: createTestLayout('shop'),
});

routes.page({
  path: '/broken-page',
  label: 'Broken page',
  // @ts-expect-error Page routes cannot define layout render targets.
  layout: createTestLayout('broken-page'),
});

routes.layout({
  path: '/broken-layout',
  label: 'Broken layout',
  // @ts-expect-error Layout routes cannot define page render targets.
  page: createTestPage('broken-layout'),
});
