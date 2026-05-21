import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.
import App from './app/app.component.ts';
import { route as appRoute } from './routes.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

provideRouter(appRoute);
mount(App, target);
