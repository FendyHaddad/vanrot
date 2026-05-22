// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { createScreen } from '../src/screen.js';

describe('createScreen', () => {
  it('expects text in the target', () => {
    const target = document.createElement('div');
    target.textContent = 'Saved';
    const screen = createScreen(target);

    screen.expect.text('Saved');
  });

  it('fails when expected text is missing', () => {
    const target = document.createElement('div');
    const screen = createScreen(target);

    expect(() => screen.expect.text('Saved')).toThrow();
  });

  it('clicks a button by label', async () => {
    const target = document.createElement('div');
    const button = document.createElement('button');
    const handleClick = vi.fn();
    button.textContent = 'Save';
    button.addEventListener('click', handleClick);
    target.append(button);
    const screen = createScreen(target);

    await screen.click.button('Save');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fails clearly when the button is missing', async () => {
    const target = document.createElement('div');
    const screen = createScreen(target);

    await expect(screen.click.button('Save')).rejects.toThrow('Button not found: Save');
  });
});
