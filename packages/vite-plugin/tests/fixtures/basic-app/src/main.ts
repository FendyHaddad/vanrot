import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppLayout } from './app/app.layout.ts';
import { route as appRoute } from './routes.ts';
import './styles/vanrot-tokens.css';
import './styles/vanrot-ui.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

provideRouter(appRoute);
mount(AppLayout, target);
