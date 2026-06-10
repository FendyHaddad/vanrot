import { createRoutes, defineRoutes } from '@vanrot/router';
import { HomePage } from './pages/home/home.page.ts';

const routes = createRoutes();

const home = routes.page({
  path: '/',
  label: 'Home',
  page: HomePage,
});

export const route = defineRoutes(routes, [home]);
