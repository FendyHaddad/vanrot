import { signal } from '@vanrot/runtime';

export class AppComponent {
  count = signal(0);

  increment(): void {
    this.count.update((value) => value + 1);
  }
}
