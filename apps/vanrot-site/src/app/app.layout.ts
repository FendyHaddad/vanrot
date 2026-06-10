import { route as siteRoute } from '../routes.ts';
import { setupAppShellInteractions } from './app-shell-interactions.widget.ts';

const appShellCopy = {
  menuLabel: 'Site menu',
  tagline: 'The signal-based framework with no virtual DOM, no hydration, and no magic.',
  installCommand: '$ npm create vanrot@latest',
  exploreTitle: 'Explore',
  ideTitle: 'In your IDE',
  ideBody:
    'The official JetBrains plugin ships template intelligence, diagnostics, and completions straight into your editor.',
  ideNote: 'Available on JetBrains Marketplace',
  startTitle: 'Get started',
  copyright: `© ${new Date().getFullYear()} Vankode`,
  signature: 'Built with Vanrot',
  wordmark: 'VANROT',
} as const;

const jetbrainsTools = [
  { name: 'IntelliJ IDEA', note: 'Ultimate & Community' },
  { name: 'WebStorm', note: 'The JavaScript IDE' },
] as const;

export class AppLayout {
  route = siteRoute;
  copy = appShellCopy;
  jetbrainsTools = jetbrainsTools;

  constructor() {
    setupAppShellInteractions();
  }
}
