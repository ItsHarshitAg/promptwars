import React, { useCallback } from 'react';
import { useCrowd } from '../hooks/useCrowd';
import { HeatmapZone } from '../components/HeatmapZone';
import { AlertPanel } from '../components/AlertPanel';
import DashboardIcon from '@mui/icons-material/Dashboard';

export const HomeScreen: React.FC = () => {
  const { heatmapData, loading, error } = useCrowd();

  const handleZoneClick = useCallback((zoneId: string) => {
    console.log('Zone clicked:', zoneId);
  }, []);

  return (
    <main style={{ padding: '16px' }}>
      <h1>
        <DashboardIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Dashboard
      </h1>
      <AlertPanel />
      {error && <p role="alert" style={{ color: '#c62828' }}>{error}</p>}
      <section aria-labelledby="heatmap-heading" style={{ marginTop: '24px' }}>
        <h2 id="heatmap-heading">Live Stadium Heatmap</h2>
        {loading ? (
          <p aria-live="polite" role="status">Loading crowd data...</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {heatmapData.map(zone => (
              <HeatmapZone key={zone.id} zone={zone} onClick={handleZoneClick} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
