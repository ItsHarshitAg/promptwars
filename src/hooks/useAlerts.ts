import { useState, useEffect, useCallback } from 'react';
import { useZoneData } from './useZoneData';
import { shouldTriggerAlert } from '../utils/alertTrigger';
import type { Alert } from '../types';

export const useAlerts = () => {
  const { zones } = useZoneData();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    zones.forEach((zone) => {
      if (shouldTriggerAlert(zone.density)) {
        newAlerts.push({
          id: `alert-${zone.id}-${Date.now()}`,
          message: `${zone.name} is experiencing heavy crowds (Wait: ~${zone.waitMinutes}m).`,
          zoneId: zone.id,
          timestamp: Date.now(),
          read: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const filteredNew = newAlerts.filter(
          na => !prev.some(pa => pa.zoneId === na.zoneId && Date.now() - pa.timestamp < 60000)
        );
        return [...filteredNew, ...prev].slice(0, 5);
      });
    }
  }, [zones]);
  
  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return { alerts, dismissAlert };
};
