import { expect } from 'vitest';

export interface Screen {
  click: {
    button(label: string): Promise<void>;
  };
  expect: {
    text(value: string): void;
  };
}

export function createScreen(target: Element): Screen {
  return {
    click: {
      async button(label: string): Promise<void> {
        const button = findButtonByLabel(target, label);

        if (button === null) {
          throw new Error(`Button not found: ${label}`);
        }

        button.click();
      },
    },
    expect: {
      text(value: string): void {
        expect(target.textContent ?? '').toContain(value);
      },
    },
  };
}

function findButtonByLabel(target: Element, label: string): HTMLButtonElement | null {
  const buttons = Array.from(target.querySelectorAll('button'));

  return buttons.find((button) => button.textContent?.trim() === label) ?? null;
}
