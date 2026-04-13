import { describe, it, expect } from 'vitest';
import { calculateQueueWaitTime } from '../utils/queuePredictor';

describe('calculateQueueWaitTime — bracket accuracy', () => {
  it('returns 0 wait for density < 0.2', () => {
    const { waitMinutes } = calculateQueueWaitTime(10, 100);
    expect(waitMinutes).toBe(0);
  });

  it('returns wait between 2–10 for density 0.2–0.5', () => {
    const { waitMinutes } = calculateQueueWaitTime(30, 100); // 0.3 density
    expect(waitMinutes).toBeGreaterThanOrEqual(2);
    expect(waitMinutes).toBeLessThan(10);
  });

  it('returns wait between 10–20 for density 0.5–0.8', () => {
    const { waitMinutes } = calculateQueueWaitTime(65, 100); // 0.65 density
    expect(waitMinutes).toBeGreaterThanOrEqual(10);
    expect(waitMinutes).toBeLessThan(20);
  });

  it('returns wait between 20–30 for density 0.8–0.9', () => {
    const { waitMinutes } = calculateQueueWaitTime(85, 100); // 0.85 density
    expect(waitMinutes).toBeGreaterThanOrEqual(20);
    expect(waitMinutes).toBeLessThan(30);
  });

  it('returns wait >= 30 for density >= 0.9', () => {
    const { waitMinutes } = calculateQueueWaitTime(95, 100); // 0.95 density
    expect(waitMinutes).toBeGreaterThanOrEqual(30);
  });

  it('returns exact values at bracket boundaries', () => {
    // density = exactly 0.2
    expect(calculateQueueWaitTime(20, 100).waitMinutes).toBe(2);
    // density = exactly 0.5
    expect(calculateQueueWaitTime(50, 100).waitMinutes).toBe(10);
    // density = exactly 0.8
    expect(calculateQueueWaitTime(80, 100).waitMinutes).toBe(20);
    // density = exactly 0.9
    expect(calculateQueueWaitTime(90, 100).waitMinutes).toBe(30);
  });

  it('handles negative capacity safely', () => {
    const { density, waitMinutes } = calculateQueueWaitTime(50, -10);
    expect(density).toBe(0);
    expect(waitMinutes).toBe(0);
  });

  it('handles both current and capacity as 0', () => {
    const { density, waitMinutes } = calculateQueueWaitTime(0, 0);
    expect(density).toBe(0);
    expect(waitMinutes).toBe(0);
  });

  it('returns full density for current far exceeding capacity', () => {
    const { density } = calculateQueueWaitTime(10000, 100);
    expect(density).toBe(1.0);
  });
});
