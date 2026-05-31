import { type ComponentType } from '@vanrot/runtime';
import { createRoutes, defineRoutes } from '@vanrot/router';
import { profilePage } from './profile.page.ts';

const routes = createRoutes();

const account = routes.page({
  path: '/account/:accountId',
  label: 'Account',
  page: profilePage as unknown as ComponentType,
});

export const ssrRoutes = defineRoutes({ account });
