import { mount } from '@vanrot/runtime';
import AppComponent from './app/app.component';

const target = document.querySelector('#app');

if (!(target instanceof HTMLElement)) {
  throw new Error('Missing app target.');
}

mount(AppComponent, target);
