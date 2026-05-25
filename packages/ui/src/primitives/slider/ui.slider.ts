import { signal } from '@vanrot/runtime';

const sliderCopy = {
  label: 'Slider',
} as const;

export class UiSlider {
  label = signal(sliderCopy.label);
}
