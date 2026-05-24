// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiCard } from './ui.card.ts';

const cardCopy = {
  title: 'Card',
  description: 'A focused October surface.',
} as const;

testComponent(UiCard).can('render its title and description', function (screen) {
  screen.expect.text(cardCopy.title);
  screen.expect.text(cardCopy.description);
});
