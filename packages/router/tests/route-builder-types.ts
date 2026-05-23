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

const login = routes.page({
  path: '/login',
  label: 'Login',
  page: createTestPage('login'),
});

routes.page({
  path: '/account',
  label: 'Account',
  page: createTestPage('account'),
  canEnter: () => login,
});

routes.layout({
  path: '/admin',
  label: 'Admin',
  layout: createTestLayout('admin'),
  canEnter: [
    () => true,
    () => routes.redirectTo(login, { query: { returnTo: '/admin' } }),
  ],
});

routes.redirect({
  path: '/old-login',
  label: 'Old login',
  to: login,
});

routes.redirect({
  path: '/bad',
  label: 'Bad',
  to: login,
  // @ts-expect-error Redirect routes must not render pages.
  page: createTestPage('bad'),
});

routes.page({
  path: '/bad-page',
  label: 'Bad page',
  page: createTestPage('bad-page'),
  // @ts-expect-error Page routes do not accept redirect targets.
  to: login,
});

const product = routes.page({
  path: '/product/:productId',
  label: 'Product',
  loadPage: async () => createTestPage('product'),
  preload: routes.preload.intent(),
  keepAlive: routes.keepAlive.sessionDay(),
});

routes.page({
  path: '/product-static',
  label: 'Static product',
  page: createTestPage('product-static'),
  preload: routes.preload.none(),
  keepAlive: routes.keepAlive.none(),
});

routes.redirect({
  path: '/old-product',
  label: 'Old product',
  to: product,
  // @ts-expect-error Redirect routes must not declare preload policy.
  preload: routes.preload.intent(),
});

routes.redirect({
  path: '/old-product-detail',
  label: 'Old product detail',
  to: product,
  // @ts-expect-error Redirect routes must not declare keepAlive policy.
  keepAlive: routes.keepAlive.sessionDay(),
});
