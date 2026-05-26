import {
  createRuntimeGraphSession,
  type RuntimeGraphEvent,
} from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('runtime graph devtools contract', () => {
  it('creates a disabled no-op runtime graph session by default', () => {
    const events: RuntimeGraphEvent[] = [];
    const session = createRuntimeGraphSession({
      enabled: false,
      emit: (event) => events.push(event),
    });

    session.recordNode({ id: 'signal:count', kind: 'signal', label: 'count' });
    session.recordEdge({ from: 'signal:count', to: 'effect:render', kind: 'signal-to-effect' });
    session.dispose();

    expect(session.schemaVersion).toBe(1);
    expect(events).toEqual([]);
  });

  it('emits runtime graph events when enabled', () => {
    const events: RuntimeGraphEvent[] = [];
    const session = createRuntimeGraphSession({
      enabled: true,
      emit: (event) => events.push(event),
    });

    session.recordNode({ id: 'signal:count', kind: 'signal', label: 'count' });

    expect(events).toEqual([
      {
        type: 'node',
        node: { id: 'signal:count', kind: 'signal', label: 'count' },
      },
    ]);
  });
});
