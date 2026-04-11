import { describe, it, expect } from 'vitest';
import { sanitiseInput } from '../utils/sanitiseInput';

describe('sanitiseInput', () => {
  it('strips HTML tags', () => {
    expect(sanitiseInput('<p>Hello</p><script>alert(1)</script>')).toBe('Hello');
  });

  it('limits to 500 characters', () => {
    const longString = 'a'.repeat(600);
    expect(sanitiseInput(longString)).toHaveLength(500);
  });

  it('returns empty string for empty input', () => {
    expect(sanitiseInput('')).toBe('');
  });

  it('preserves plain text without HTML', () => {
    expect(sanitiseInput('Where is the nearest restroom?')).toBe('Where is the nearest restroom?');
  });

  it('strips nested HTML and event handlers', () => {
    expect(sanitiseInput('<div onmouseover="alert(1)"><b>bold</b></div>')).toBe('bold');
  });
});
