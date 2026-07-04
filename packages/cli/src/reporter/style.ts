export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

const escapePrefix = '\u001b[';
const resetCode = `${escapePrefix}0m`;

export const brandColor: RgbColor = { red: 240, green: 90, blue: 61 };
export const brandGlow: RgbColor = { red: 255, green: 176, blue: 92 };

export function boldText(text: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }

  return `${escapePrefix}1m${text}${resetCode}`;
}

export function dimText(text: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }

  return `${escapePrefix}2m${text}${resetCode}`;
}

export function underlineText(text: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }

  return `${escapePrefix}4m${text}${resetCode}`;
}

export function paintText(text: string, enabled: boolean, color: RgbColor): string {
  if (!enabled) {
    return text;
  }

  return `${foregroundCode(color)}${text}${resetCode}`;
}

export function gradientText(
  text: string,
  enabled: boolean,
  from: RgbColor,
  to: RgbColor,
): string {
  if (!enabled) {
    return text;
  }

  const characters = [...text];
  const lastIndex = Math.max(characters.length - 1, 1);
  const painted = characters
    .map((character, index) => {
      if (character.trim() === '') {
        return character;
      }

      return `${foregroundCode(mixColors(from, to, index / lastIndex))}${character}`;
    })
    .join('');

  return `${painted}${resetCode}`;
}

function mixColors(from: RgbColor, to: RgbColor, ratio: number): RgbColor {
  return {
    red: mixChannel(from.red, to.red, ratio),
    green: mixChannel(from.green, to.green, ratio),
    blue: mixChannel(from.blue, to.blue, ratio),
  };
}

function mixChannel(from: number, to: number, ratio: number): number {
  return Math.round(from + (to - from) * ratio);
}

function foregroundCode(color: RgbColor): string {
  return `${escapePrefix}38;2;${color.red};${color.green};${color.blue}m`;
}
