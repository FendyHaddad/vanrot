import { mount } from '@vanrot/runtime';
import App from './app.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

mount(App, target);
