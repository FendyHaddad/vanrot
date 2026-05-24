import { signal } from '@vanrot/runtime';

const alertCopy = {
  message: 'Heads up',
} as const;

export class UiAlert {
  message = signal(alertCopy.message);
}
