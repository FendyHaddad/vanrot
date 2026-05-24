import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppLayout } from './app/app.layout.ts';
import { route as siteRoute } from './routes.ts';
import './styles/vanrot-tokens.css';
import './styles/vanrotstyles.css';
import './styles/site.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

provideRouter(siteRoute);
mount(AppLayout, target);
