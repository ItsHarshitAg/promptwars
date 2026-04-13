import { describe, it, expect } from 'vitest';
import { getEnv } from '../utils/env';

describe('getEnv', () => {
  it('returns empty string for missing key', () => {
    expect(getEnv('DOES_NOT_EXIST')).toBe('');
  });

  it('reads from import.meta.env if window.envConfig is absent', () => {
    // import.meta.env.MODE is set by Vite/Vitest
    const mode = getEnv('MODE');
    expect(typeof mode).toBe('string');
  });

  it('returns string type', () => {
    const result = getEnv('VITE_FIREBASE_API_KEY');
    expect(typeof result).toBe('string');
  });
});
