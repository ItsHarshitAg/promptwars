import { describe, it, expect } from 'vitest';
import { shouldTriggerAlert } from '../utils/alertTrigger';

describe('shouldTriggerAlert', () => {
  it('returns false for density 0 (empty)', () => {
    expect(shouldTriggerAlert(0)).toBe(false);
  });

  it('returns false for density below 0.8', () => {
    expect(shouldTriggerAlert(0.5)).toBe(false);
  });

  it('returns false for density exactly 0.8', () => {
    expect(shouldTriggerAlert(0.8)).toBe(false);
  });

  it('returns true for density above 0.8', () => {
    expect(shouldTriggerAlert(0.85)).toBe(true);
  });

  it('returns true for density at 1.0 (full)', () => {
    expect(shouldTriggerAlert(1.0)).toBe(true);
  });
});
