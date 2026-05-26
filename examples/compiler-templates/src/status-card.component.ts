import { signal } from '@vanrot/runtime';

export class StatusCardComponent {
  status = signal<'ready' | 'idle'>('ready');
  items = signal([
    { id: 'runtime', label: 'Runtime' },
    { id: 'compiler', label: 'Compiler' },
  ]);
}
