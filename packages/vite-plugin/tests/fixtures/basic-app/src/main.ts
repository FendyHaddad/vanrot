import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppComponent } from './app/app.component.ts';
import { route as appRoute } from './routes.ts';
import './styles/vanrot-tokens.css';
import './styles/vanrot-ui.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

provideRouter(appRoute);
mount(AppComponent, target);
