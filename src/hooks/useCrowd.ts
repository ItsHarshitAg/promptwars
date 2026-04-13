import { useMemo } from 'react';
import { useZoneData } from './useZoneData';
import { statusColor } from '../utils/zoneHelpers';
import type { Zone } from '../types';

export interface HeatmapZoneData extends Zone {
  color: string;
}

export function useCrowd() {
  const { zones, loading, error, lastUpdated } = useZoneData();

  const heatmapData: HeatmapZoneData[] = useMemo(() => {
    return zones.map(zone => ({
      ...zone,
      color: statusColor(zone.density),
    }));
  }, [zones]);

  return { zones, heatmapData, loading, error, lastUpdated };
}
