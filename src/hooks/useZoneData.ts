import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import type { Zone } from '../types';
import { calculateQueueWaitTime } from '../utils/queuePredictor';

interface RawZone {
  id?: string;
  name: string;
  capacity: number;
  current: number;
  density?: number;
  waitMinutes?: number;
}

export function useZoneData() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const zonesRef = ref(db, 'zones');
    const unsubscribe = onValue(
      zonesRef,
      (snapshot) => {
        const data: Record<string, RawZone> | null = snapshot.val();
        if (data) {
          const parsed: Zone[] = Object.entries(data).map(([key, raw]) => {
            const { density, waitMinutes } = calculateQueueWaitTime(raw.current, raw.capacity);
            return {
              id: raw.id ?? key,
              name: raw.name,
              capacity: raw.capacity,
              current: raw.current,
              density,
              waitMinutes,
            };
          });
          setZones(parsed);
        } else {
          setZones([]);
        }
        setError(null);
        setLastUpdated(new Date());
        setLoading(false);
      },
      (err) => {
        console.error('Firebase real-time DB error:', err);
        setError('Failed to load zone data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { zones, loading, error, lastUpdated };
}
