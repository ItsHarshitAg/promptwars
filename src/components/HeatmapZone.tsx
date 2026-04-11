import React, { useCallback } from 'react';
import type { Zone } from '../types';

interface Props {
  zone: Zone & { color: string };
  onClick?: (zoneId: string) => void;
}

export const HeatmapZone: React.FC<Props> = React.memo(({ zone, onClick }) => {
  const handleClick = useCallback(() => {
    if (onClick) onClick(zone.id);
  }, [onClick, zone.id]);

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: zone.color,
        padding: '1rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        textAlign: 'left',
        margin: '0.5rem 0'
      }}
      aria-label={`Zone ${zone.name}, Current capacity: ${zone.current} out of ${zone.capacity}. Wait time is approximately ${zone.waitMinutes} minutes.`}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{zone.name}</h3>
      <p style={{ margin: '4px 0' }}>Capacity: {zone.current}/{zone.capacity}</p>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Wait Time: ~{zone.waitMinutes} mins</p>
    </button>
  );
});

HeatmapZone.displayName = 'HeatmapZone';
