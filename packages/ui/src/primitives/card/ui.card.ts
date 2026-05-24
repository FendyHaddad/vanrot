import { signal } from '@vanrot/runtime';

const cardCopy = {
  title: 'Card',
  description: 'A focused October surface.',
} as const;

export class UiCard {
  title = signal(cardCopy.title);
  description = signal(cardCopy.description);
}
