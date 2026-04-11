import { describe, it, expect } from 'vitest';
import { calculateQueueWaitTime } from '../utils/queuePredictor';

describe('calculateQueueWaitTime', () => {
  it('returns 0 density and wait for empty zone', () => {
    const { density, waitMinutes } = calculateQueueWaitTime(0, 100);
    expect(density).toBe(0);
    expect(waitMinutes).toBe(0);
  });

  it('returns correct density and wait for low capacity', () => {
    const { density, waitMinutes } = calculateQueueWaitTime(25, 100);
    expect(density).toBe(0.25);
    expect(waitMinutes).toBeGreaterThan(0);
  });

  it('returns correct density for medium capacity', () => {
    const { density } = calculateQueueWaitTime(60, 100);
    expect(density).toBe(0.6);
  });

  it('returns high wait times for high capacity (>80%)', () => {
    const { density, waitMinutes } = calculateQueueWaitTime(85, 100);
    expect(density).toBe(0.85);
    expect(waitMinutes).toBeGreaterThan(20);
  });

  it('caps density at 1.0 even if over current', () => {
    const { density } = calculateQueueWaitTime(120, 100);
    expect(density).toBe(1.0);
  });
});
