import { signal } from '@vanrot/runtime';

const copy: Record<string, string> = {
  'counter.eyebrow': 'Vanrot demo',
  'counter.title': 'Counter',
  'counter.summary': 'Signals update only the affected DOM text.',
  'counter.decrement': 'Decrease',
  'counter.increment': 'Increase',
  'counter.reset': 'Reset',
};

export class CounterComponent {
  count = signal(0);

  increment(): void {
    this.count.set(this.count() + 1);
  }

  decrement(): void {
    if (this.count() === 0) {
      return;
    }

    this.count.set(this.count() - 1);
  }

  reset(): void {
    this.count.set(0);
  }

  t(key: string): string {
    return copy[key] ?? key;
  }
}
