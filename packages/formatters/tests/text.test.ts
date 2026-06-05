import { describe, expect, it } from 'vitest';
import {
  fallbackPipe,
  initialsPipe,
  lowercasePipe,
  sentencecasePipe,
  titlecasePipe,
  truncatePipe,
  uppercasePipe,
} from '../src/index.js';

describe('text pipes', () => {
  it('formats common casing helpers', () => {
    expect(uppercasePipe('vanrot')).toBe('VANROT');
    expect(lowercasePipe('Vanrot')).toBe('vanrot');
    expect(titlecasePipe('claims portal')).toBe('Claims Portal');
    expect(sentencecasePipe('CLAIMS PORTAL')).toBe('Claims portal');
  });

  it('truncates and falls back predictably', () => {
    expect(truncatePipe('Long customer description', 9)).toBe('Long cust...');
    expect(fallbackPipe('', 'N/A')).toBe('N/A');
    expect(fallbackPipe('Ready', 'N/A')).toBe('Ready');
  });

  it('creates initials from words', () => {
    expect(initialsPipe('Vankode Malaysia Berhad')).toBe('VMB');
  });
});
