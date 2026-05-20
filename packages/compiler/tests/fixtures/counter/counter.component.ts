import { signal } from '@vanrot/runtime';

export class CounterComponent {
  count = signal(0);
  saving = signal(false);

  increment() {
    this.count.update((value) => value + 1);
  }
}
