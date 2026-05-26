import type { NormalizedGraphManifest } from '../index.js';
import { createPanelState } from './state.js';

const metadataPath = '/__vanrot/devtools/metadata';
const statusElement = document.querySelector('#manifest-status');
const graphRoot = document.querySelector('#graph-root');

void loadPanel();

async function loadPanel(): Promise<void> {
  if (!(statusElement instanceof HTMLElement) || !(graphRoot instanceof HTMLElement)) {
    return;
  }

  try {
    const response = await fetch(await resolveMetadataUrl());
    const payload = (await response.json()) as NormalizedGraphManifest;
    const state = createPanelState(payload);
    renderState(state);
  } catch {
    renderState(
      createPanelState({
        status: 'missing',
        manifest: null,
        warnings: ['Vanrot metadata endpoint is unavailable. Start a Vanrot dev server.'],
      }),
    );
  }
}

async function resolveMetadataUrl(): Promise<string> {
  const inspectedOrigin = await readInspectedWindowOrigin();

  if (inspectedOrigin === null) {
    return metadataPath;
  }

  return `${inspectedOrigin}${metadataPath}`;
}

async function readInspectedWindowOrigin(): Promise<string | null> {
  if (typeof chrome === 'undefined' || chrome.devtools?.inspectedWindow?.eval === undefined) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.devtools?.inspectedWindow?.eval('location.origin', (result, exceptionInfo) => {
      if (exceptionInfo?.isException === true || typeof result !== 'string') {
        resolve(null);
        return;
      }

      resolve(result);
    });
  });
}

function renderState(state: ReturnType<typeof createPanelState>): void {
  if (!(statusElement instanceof HTMLElement) || !(graphRoot instanceof HTMLElement)) {
    return;
  }

  statusElement.textContent = `${state.summary.statusLabel} - ${state.summary.nodeCount} nodes, ${state.summary.edgeCount} edges`;
  graphRoot.replaceChildren();

  if (state.emptyState !== null) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = state.emptyState;
    graphRoot.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'route-list';
  for (const route of state.routes) {
    const item = document.createElement('li');
    item.textContent = `${route.ref} ${route.path} ${route.page ?? ''}`.trim();
    list.append(item);
  }
  graphRoot.append(list);
}
