import { useState, useEffect } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase/config';

interface HistoryEntry {
  density: number;
  ts: number;
}

/** Returns last 15 density readings per zone, sorted oldest→newest.
 *  Uses limitToLast(15) so Firebase only sends 15 nodes per zone. */
export const useZoneHistory = (): Record<string, number[]> => {
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const histRef = query(ref(db, 'historyZones'), limitToLast(15));
    const unsubscribe = onValue(histRef, snapshot => {
      const raw = snapshot.val() as Record<string, Record<string, HistoryEntry>> | null;
      if (!raw) return;
      const result: Record<string, number[]> = {};
      for (const [zoneId, entries] of Object.entries(raw)) {
        result[zoneId] = Object.values(entries)
          .sort((a, b) => a.ts - b.ts)
          .map(e => e.density);
      }
      setHistory(result);
    });
    return () => unsubscribe();
  }, []);

  return history;
};
