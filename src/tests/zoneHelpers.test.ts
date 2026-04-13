import { describe, it, expect } from 'vitest';
import {
  getZoneType,
  getZoneTypeLabel,
  densityStatus,
  statusColor,
  alertAction,
} from '../utils/zoneHelpers';
import type { Zone } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeZone(id: string, density: number): Zone {
  return {
    id,
    name: id,
    current: Math.round(density * 100),
    capacity: 100,
    density,
    waitMinutes: 0,
  };
}

// ── getZoneType ────────────────────────────────────────────────────────────

describe('getZoneType', () => {
  it('classifies gate zones', () => {
    expect(getZoneType('gate-a')).toBe('gate');
    expect(getZoneType('gate-north')).toBe('gate');
  });

  it('classifies food zones', () => {
    expect(getZoneType('food-court-1')).toBe('food');
    expect(getZoneType('food-east')).toBe('food');
  });

  it('classifies restroom zones', () => {
    expect(getZoneType('restroom-west')).toBe('restroom');
    expect(getZoneType('restroom-e')).toBe('restroom');
  });

  it('defaults to seating for unknown ids', () => {
    expect(getZoneType('section-a')).toBe('seating');
    expect(getZoneType('vip-lounge')).toBe('seating');
  });
});

// ── getZoneTypeLabel ───────────────────────────────────────────────────────

describe('getZoneTypeLabel', () => {
  it('returns label for gate', () => {
    expect(getZoneTypeLabel('gate-a')).toBe('Entry / exit');
  });

  it('returns label for food', () => {
    expect(getZoneTypeLabel('food-court')).toBe('Food & drink');
  });

  it('returns label for restroom', () => {
    expect(getZoneTypeLabel('restroom-east')).toBe('Facilities');
  });

  it('returns Seating for unknown', () => {
    expect(getZoneTypeLabel('block-z')).toBe('Seating');
  });
});

// ── densityStatus ──────────────────────────────────────────────────────────

describe('densityStatus', () => {
  it('returns Clear for density below 0.5', () => {
    expect(densityStatus(0)).toBe('Clear');
    expect(densityStatus(0.49)).toBe('Clear');
  });

  it('returns Busy for density between 0.5 and 0.8', () => {
    expect(densityStatus(0.5)).toBe('Busy');
    expect(densityStatus(0.79)).toBe('Busy');
  });

  it('returns Critical for density above 0.8', () => {
    expect(densityStatus(0.81)).toBe('Critical');
    expect(densityStatus(1.0)).toBe('Critical');
  });

  it('threshold: exactly 0.8 is Busy not Critical', () => {
    expect(densityStatus(0.8)).toBe('Busy');
  });
});

// ── statusColor ────────────────────────────────────────────────────────────

describe('statusColor', () => {
  it('returns green color for Clear density', () => {
    expect(statusColor(0.3)).toBe('#639922');
  });

  it('returns orange color for Busy density', () => {
    expect(statusColor(0.6)).toBe('#EF9F27');
  });

  it('returns red color for Critical density', () => {
    expect(statusColor(0.9)).toBe('#E24B4A');
  });
});

// ── alertAction ────────────────────────────────────────────────────────────

describe('alertAction', () => {
  it('suggests alternative food zone', () => {
    const zone = makeZone('food-court-1', 0.9);
    const alt = makeZone('food-court-2', 0.4);
    const result = alertAction(zone, [zone, alt]);
    expect(result.label).toContain('food-court-2');
    expect(result.targetId).toBe('food-court-2');
  });

  it('suggests alternative gate zone', () => {
    const zone = makeZone('gate-a', 0.9);
    const alt = makeZone('gate-b', 0.3);
    const result = alertAction(zone, [zone, alt]);
    expect(result.label).toContain('gate-b');
    expect(result.targetId).toBe('gate-b');
  });

  it('suggests alternative restroom zone', () => {
    const zone = makeZone('restroom-west', 0.95);
    const alt = makeZone('restroom-east', 0.2);
    const result = alertAction(zone, [zone, alt]);
    expect(result.label).toContain('restroom-east');
    expect(result.targetId).toBe('restroom-east');
  });

  it('returns fallback label when no alternative food zone exists', () => {
    const zone = makeZone('food-court-1', 0.9);
    const { label, targetId } = alertAction(zone, [zone]);
    expect(label).toBe('Check another area →');
    expect(targetId).toBeNull();
  });

  it('returns fallback label when no alternative gate exists', () => {
    const zone = makeZone('gate-a', 0.9);
    const { label, targetId } = alertAction(zone, [zone]);
    expect(label).toBe('Check another gate →');
    expect(targetId).toBeNull();
  });

  it('picks the least dense alternative', () => {
    const zone = makeZone('gate-a', 0.9);
    const close = makeZone('gate-b', 0.7);
    const far = makeZone('gate-c', 0.2);
    const result = alertAction(zone, [zone, close, far]);
    expect(result.targetId).toBe('gate-c');
  });
});
