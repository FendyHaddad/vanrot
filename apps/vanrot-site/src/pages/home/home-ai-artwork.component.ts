import { input } from '@vanrot/runtime';

type HomeAiArtworkVariant = 'manifest' | 'flow' | 'noeval' | 'deps';

export class HomeAiArtworkComponent {
  variant = input.default<HomeAiArtworkVariant>('manifest');
}
