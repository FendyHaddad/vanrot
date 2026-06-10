import { signal } from '@vanrot/runtime';

export class HomePage {
  title = signal('Forge native engine');
  buildTarget = signal('Vanrot-only dev and build');
}
