import { mount } from '@vanrot/runtime';
// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.
import Counter from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(Counter, target);
