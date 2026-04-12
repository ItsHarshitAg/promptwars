import { useMemo } from 'react';
import { useZoneData } from './useZoneData';
import type { Zone } from '../types';

export interface HeatmapZoneData extends Zone {
  color: string;
}

export const useCrowd = () => {
  const { zones, loading, error, lastUpdated } = useZoneData();

  const heatmapData: HeatmapZoneData[] = useMemo(() => {
    return zones.map(zone => {
      let color = '#4caf50'; // green
      if (zone.density >= 0.8) color = '#f44336'; // red
      else if (zone.density >= 0.5) color = '#ff9800'; // orange
      
      return { ...zone, color };
    });
  }, [zones]);

  return { zones, heatmapData, loading, error, lastUpdated };
};
