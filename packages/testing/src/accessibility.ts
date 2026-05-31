import { expect } from 'vitest';

export interface AccessibilityAssertionsOptions {
  source?: string;
}

export interface RoleAssertionOptions {
  name?: string | RegExp;
}

export interface AccessibilityAssertions {
  readonly expect: {
    role(role: string, options?: RoleAssertionOptions): HTMLElement;
    enabled(role: string, options?: RoleAssertionOptions): void;
    disabled(role: string, options?: RoleAssertionOptions): void;
    focusOn(element: Element): void;
    focusMoves(from: HTMLElement, to: HTMLElement, action: () => void | Promise<void>): Promise<void>;
    semanticButton(element: Element): void;
  };
}

export function createAccessibilityAssertions(
  root: Element,
  options: AccessibilityAssertionsOptions = {},
): AccessibilityAssertions {
  return {
    expect: {
      role(role: string, roleOptions: RoleAssertionOptions = {}): HTMLElement {
        const element = findByRole(root, role, roleOptions);

        if (element === null) {
          throw new Error(message(options, `Expected role "${role}"${formatName(roleOptions)}.`));
        }

        return element;
      },
      enabled(role: string, roleOptions: RoleAssertionOptions = {}): void {
        const element = findByRole(root, role, roleOptions);

        if (element === null) {
          throw new Error(message(options, `Expected enabled role "${role}"${formatName(roleOptions)}.`));
        }

        expect(isDisabled(element), message(options, `Expected role "${role}" to be enabled.`)).toBe(
          false,
        );
      },
      disabled(role: string, roleOptions: RoleAssertionOptions = {}): void {
        const element = findByRole(root, role, roleOptions);

        if (element === null) {
          throw new Error(message(options, `Expected disabled role "${role}"${formatName(roleOptions)}.`));
        }

        expect(isDisabled(element), message(options, `Expected role "${role}" to be disabled.`)).toBe(
          true,
        );
      },
      focusOn(element: Element): void {
        expect(
          document.activeElement,
          message(options, `Expected focus on <${element.tagName.toLowerCase()}>.`),
        ).toBe(element);
      },
      async focusMoves(
        from: HTMLElement,
        to: HTMLElement,
        action: () => void | Promise<void>,
      ): Promise<void> {
        from.focus();
        await action();
        await Promise.resolve();

        expect(
          document.activeElement,
          message(
            options,
            `Expected focus to move from <${from.tagName.toLowerCase()}> to <${to.tagName.toLowerCase()}>.`,
          ),
        ).toBe(to);
      },
      semanticButton(element: Element): void {
        if (element.tagName.toLowerCase() === 'button') {
          return;
        }

        throw new Error(
          message(
            options,
            `Expected a semantic <button> for role "button", received <${element.tagName.toLowerCase()}>.`,
          ),
        );
      },
    },
  };
}

export function findByRole(
  root: Element,
  role: string,
  options: RoleAssertionOptions = {},
): HTMLElement | null {
  const elements =
    root instanceof HTMLElement
      ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
      : Array.from(root.querySelectorAll<HTMLElement>('*'));

  for (const element of elements) {
    if (readRole(element) !== role) {
      continue;
    }

    if (options.name !== undefined && !matchesName(readAccessibleName(element), options.name)) {
      continue;
    }

    return element;
  }

  return null;
}

function readRole(element: HTMLElement): string | null {
  const explicitRole = element.getAttribute('role');

  if (explicitRole !== null && explicitRole.length > 0) {
    return explicitRole;
  }

  const tagName = element.tagName.toLowerCase();

  if (tagName === 'button') {
    return 'button';
  }

  if (tagName === 'a' && element.hasAttribute('href')) {
    return 'link';
  }

  if (tagName === 'input') {
    return readInputRole(element as HTMLInputElement);
  }

  if (/^h[1-6]$/.test(tagName)) {
    return 'heading';
  }

  return null;
}

function readInputRole(input: HTMLInputElement): string {
  if (input.type === 'checkbox') {
    return 'checkbox';
  }

  if (input.type === 'radio') {
    return 'radio';
  }

  if (input.type === 'button' || input.type === 'submit' || input.type === 'reset') {
    return 'button';
  }

  return 'textbox';
}

function readAccessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label');

  if (ariaLabel !== null) {
    return ariaLabel.trim();
  }

  const labelledBy = element.getAttribute('aria-labelledby');

  if (labelledBy !== null) {
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter((value) => value.length > 0)
      .join(' ');
  }

  if (element instanceof HTMLInputElement && element.value.length > 0) {
    return element.value;
  }

  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function matchesName(actual: string, expected: string | RegExp): boolean {
  if (typeof expected === 'string') {
    return actual === expected;
  }

  return expected.test(actual);
}

function isDisabled(element: HTMLElement): boolean {
  if (element.getAttribute('aria-disabled') === 'true') {
    return true;
  }

  return 'disabled' in element && Boolean((element as { disabled?: boolean }).disabled);
}

function formatName(options: RoleAssertionOptions): string {
  if (options.name === undefined) {
    return '';
  }

  return ` named "${String(options.name)}"`;
}

function message(options: AccessibilityAssertionsOptions, text: string): string {
  if (options.source === undefined) {
    return text;
  }

  return `${options.source}: ${text}`;
}
