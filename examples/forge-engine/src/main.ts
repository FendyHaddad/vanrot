import { mount } from '@vanrot/runtime';
import { HomePage } from './pages/home/home.page.ts';

mount(HomePage, {
  target: document.querySelector('#app'),
});
