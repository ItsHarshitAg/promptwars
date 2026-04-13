import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';

interface HistoryEntry {
  density: number;
  ts: number;
}

/** Returns last 15 density readings per zone, sorted oldest→newest. */
export const useZoneHistory = (): Record<string, number[]> => {
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const histRef = ref(db, 'historyZones');
    const unsubscribe = onValue(histRef, snapshot => {
      const raw = snapshot.val() as Record<string, Record<string, HistoryEntry>> | null;
      if (!raw) return;
      const result: Record<string, number[]> = {};
      for (const [zoneId, entries] of Object.entries(raw)) {
        result[zoneId] = Object.values(entries)
          .sort((a, b) => a.ts - b.ts)
          .slice(-15)
          .map(e => e.density);
      }
      setHistory(result);
    });
    return () => unsubscribe();
  }, []);

  return history;
};
