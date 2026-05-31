import { escapeHtml, type HydratableComponentModule, type ServerComponentModule } from '@vanrot/ssr';

export const profilePage = {
  renderToHtml(initialInputs: Record<string, unknown>) {
    const accountId = String(initialInputs['accountId'] ?? '');

    return {
      html: `<main data-vr-hydrate><button type="button">Account ${escapeHtml(accountId)}</button></main>`,
      ctx: { accountId },
    };
  },

  hydrateComponent(target: Element) {
    const events: string[] = [];
    const button = target.querySelector('button');
    const listener = () => events.push('open-account');

    button?.addEventListener('click', listener);

    return {
      destroy() {
        button?.removeEventListener('click', listener);
      },
      events,
    };
  },
} satisfies ServerComponentModule & HydratableComponentModule;
