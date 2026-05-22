import { mount } from '@vanrot/runtime';
import { CounterComponent } from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(CounterComponent, target);
