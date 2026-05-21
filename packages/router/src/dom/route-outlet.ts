import { effect, mount, onDestroy, type AppHandle, type Dispose } from '@vanrot/runtime';
import { resolveRoutePage } from '../route/page-loader.js';
import { getCurrentMatch } from '../route/router-state.js';

export function createRouterOutlet(host: Element): Dispose {
  let mountedPage: AppHandle | null = null;
  let version = 0;

  const dispose = effect(() => {
    const match = getCurrentMatch();
    const currentVersion = ++version;

    mountedPage?.destroy();
    mountedPage = null;
    host.replaceChildren();

    if (match === null) {
      host.append(createRouterMessage('No route matched.'));
      return;
    }

    void resolveRoutePage(match.route)
      .then((page) => {
        if (currentVersion !== version) {
          return;
        }

        mountedPage = mount(page, host);
      })
      .catch((error: unknown) => {
        if (currentVersion !== version) {
          return;
        }

        host.replaceChildren(createRouterMessage(errorMessage(error)));
      });

    return () => {
      version += 1;
      mountedPage?.destroy();
      mountedPage = null;
      host.replaceChildren();
    };
  });

  onDestroy(dispose);

  return dispose;
}

function createRouterMessage(message: string): Text {
  return document.createTextNode(message);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load route page.';
}
