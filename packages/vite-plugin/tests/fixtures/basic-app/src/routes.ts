import { defineRoutes } from '@vanrot/router';
import { HomePage } from './pages/home/home.page.ts';

export const route = defineRoutes({
  home: {
    path: '/',
    label: 'Home',
    page: HomePage,
  },
  about: {
    path: '/about',
    label: 'About',
    loadPage: () => import('./pages/about/about.page.ts').then(({ AboutPage }) => AboutPage),
  },
});
