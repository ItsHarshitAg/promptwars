import { useCallback, useState, useEffect } from 'react';
import { useCrowd } from '../hooks/useCrowd';
import { HeatmapZone } from '../components/HeatmapZone';
import { AlertPanel } from '../components/AlertPanel';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const REFRESH_INTERVAL_S = 120; // server seeds every 2 min

export const HomeScreen: React.FC = () => {
  const { heatmapData, loading, error, lastUpdated } = useCrowd();
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_S);

  useEffect(() => {
    if (!lastUpdated) return;
    setCountdown(REFRESH_INTERVAL_S);
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      const remaining = Math.max(0, REFRESH_INTERVAL_S - elapsed);
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

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
      {lastUpdated && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', marginTop: 12, borderRadius: 8,
          background: countdown <= 10 ? 'rgba(230, 81, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid',
          borderColor: countdown <= 10 ? 'rgba(230, 81, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)',
          fontSize: '0.9rem', transition: 'background 0.3s',
          color: 'inherit'
        }}>
          <AccessTimeIcon fontSize="small" style={{ color: countdown <= 10 ? '#ff9800' : '#90caf9' }} />
          <span>
            Last updated: <strong>{lastUpdated.toLocaleTimeString()}</strong>
          </span>
          <span style={{ marginLeft: 'auto', fontWeight: 500, color: countdown <= 10 ? '#ff9800' : '#90caf9' }}>
            Next refresh in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </span>
        </div>
      )}
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
