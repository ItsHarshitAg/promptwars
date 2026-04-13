import type { Zone } from '../types';

export function getZoneType(id: string): 'gate' | 'food' | 'restroom' | 'seating' {
  if (id.includes('gate')) return 'gate';
  if (id.includes('food')) return 'food';
  if (id.includes('restroom')) return 'restroom';
  return 'seating';
}

export function getZoneTypeLabel(id: string): string {
  const t = getZoneType(id);
  if (t === 'gate') return 'Entry / exit';
  if (t === 'food') return 'Food & drink';
  if (t === 'restroom') return 'Facilities';
  return 'Seating';
}

export function densityStatus(density: number): 'Critical' | 'Busy' | 'Clear' {
  if (density > 0.8) return 'Critical';
  if (density >= 0.5) return 'Busy';
  return 'Clear';
}

export function statusColor(density: number): string {
  if (density > 0.8) return '#E24B4A';
  if (density >= 0.5) return '#EF9F27';
  return '#639922';
}

export function alertAction(
  zone: Zone,
  zones: Zone[]
): { label: string; targetId: string | null } {
  const type = getZoneType(zone.id);
  if (type === 'food') {
    const alt = zones.filter(z => z.id.includes('food') && z.id !== zone.id);
    if (!alt.length) return { label: 'Check another area →', targetId: null };
    const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
    return { label: `Try ${best.name} →`, targetId: best.id };
  }
  if (type === 'gate') {
    const alt = zones.filter(z => z.id.includes('gate') && z.id !== zone.id);
    if (!alt.length) return { label: 'Check another gate →', targetId: null };
    const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
    return { label: `Try ${best.name} instead →`, targetId: best.id };
  }
  if (type === 'restroom') {
    const alt = zones.filter(z => z.id.includes('restroom') && z.id !== zone.id);
    if (!alt.length) return { label: 'Check facilities →', targetId: null };
    const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
    return { label: `Try ${best.name} →`, targetId: best.id };
  }
  return { label: 'Find alternate route →', targetId: null };
}
