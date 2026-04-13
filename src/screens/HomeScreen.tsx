import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrowd } from '../hooks/useCrowd';
import { useZoneHistory } from '../hooks/useZoneHistory';
import { Sparkline } from '../components/Sparkline';
import { StatCard } from '../components/StatCard';
import { AppNav } from '../components/AppNav';
import { getZoneTypeLabel, densityStatus, alertAction } from '../utils/zoneHelpers';
import type { Zone } from '../types';

type RecItem = { type: 'food' | 'restroom' | 'gate'; best: Zone; worst: Zone | null; targetId: string };

// ─── Component ──────────────────────────────────────────────────────────────

export function HomeScreen() {
  const navigate = useNavigate();
  const { zones, heatmapData, loading, error, lastUpdated } = useCrowd();
  const zoneHistory = useZoneHistory();

  // ── Summary stats ──
  const stats = useMemo(() => {
    if (!zones.length) return null;
    const busiest = zones.reduce((a, b) => (a.density > b.density ? a : b));
    const criticalCount = zones.filter(z => z.density > 0.8).length;
    const restroomZones = zones.filter(z => z.id.includes('restroom'));
    const bestRestroom = restroomZones.length
      ? restroomZones.reduce((a, b) => (a.density < b.density ? a : b))
      : null;
    const avgWait = Math.round(
      zones.reduce((s, z) => s + z.waitMinutes, 0) / zones.length
    );
    return { busiest, criticalCount, bestRestroom, avgWait };
  }, [zones]);

  // ── Critical zones for alert strips ──
  const alertZones = useMemo(() => zones.filter(z => z.density > 0.8), [zones]);

  // ── Contextual action per alert zone — memoized list ──
  const alertActions = useMemo(
    () => alertZones.map(zone => ({ zone, action: alertAction(zone, zones) })),
    [alertZones, zones]
  );

  // ── Smart recommendations ──
  const recommendations = useMemo((): RecItem[] => {
    if (!zones.length) return [];
    const foodZones = zones.filter(z => z.id.includes('food'));
    const restroomZones = zones.filter(z => z.id.includes('restroom'));
    const gateZones = zones.filter(z => z.id.includes('gate'));
    const recs: RecItem[] = [];

    if (foodZones.length) {
      const best = foodZones.reduce((a, b) => (a.density < b.density ? a : b));
      recs.push({ type: 'food', best, worst: null, targetId: best.id });
    }
    if (restroomZones.length >= 2) {
      const sorted = [...restroomZones].sort((a, b) => a.density - b.density);
      recs.push({ type: 'restroom', best: sorted[0], worst: sorted[sorted.length - 1], targetId: sorted[0].id });
    }
    if (gateZones.length >= 2) {
      const sorted = [...gateZones].sort((a, b) => a.density - b.density);
      recs.push({ type: 'gate', best: sorted[0], worst: sorted[sorted.length - 1], targetId: sorted[0].id });
    }
    return recs.slice(0, 3);
  }, [zones]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>

      <AppNav />

      {/* ── Page content ── */}
      <main className="hs-main">

        {/* ── Stat cards ── */}
        {!loading && stats && (
          <div className="stat-grid">
            <StatCard
              label="Busiest Zone"
              value={stats.busiest.name}
              sub={`${stats.busiest.current} / ${stats.busiest.capacity}`}
              valueColor={stats.busiest.density > 0.8 ? '#C0392B' : undefined}
            />
            <StatCard
              label="Active Alerts"
              value={stats.criticalCount}
              sub="zones over 80%"
            />
            <StatCard
              label="Best Restroom"
              value={stats.bestRestroom ? stats.bestRestroom.name : '—'}
              sub={stats.bestRestroom ? `~${stats.bestRestroom.waitMinutes} min wait` : 'No data'}
              valueColor={stats.bestRestroom ? '#27A148' : undefined}
            />
            <StatCard
              label="Avg Wait Time"
              value={`${stats.avgWait} min`}
              sub="across all zones"
            />
          </div>
        )}

        {/* ── Alert strips ── */}
        {alertZones.length > 0 && (
          <section
            aria-label="Active crowd alerts"
            aria-live="assertive"
            style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}
          >
            {alertActions.map(({ zone, action }) => (
                <div key={zone.id} className="alert-strip">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0392B', flexShrink: 0 }} />
                    <span>
                      <strong>{zone.name}</strong> is heavily crowded
                      <span style={{ color: '#E57373', marginLeft: 8 }}>· ~{zone.waitMinutes} min wait</span>
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/map')}
                    aria-label={`${action.label} — suggested alternative for ${zone.name}`}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 16 }}
                  >
                    {action.label}
                  </button>
                </div>
            ))}
          </section>
        )}

        {/* ── Live heatmap section ── */}
        <section aria-labelledby="heatmap-heading" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 id="heatmap-heading" style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-h)' }}>Live heatmap</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(39,161,72,0.15)', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#27A148' }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#27A148' }} />
              Live
            </div>
          </div>

          {error && <p role="alert" style={{ color: '#C0392B', fontSize: 13 }}>{error}</p>}

          {loading ? (
            <p aria-live="polite" role="status" style={{ fontSize: 13, color: 'var(--muted)' }}>Loading crowd data…</p>
          ) : (
            <div className="zone-grid">
              {heatmapData.map(zone => {
                const status = densityStatus(zone.density);
                const pillStyle =
                  status === 'Critical' ? { background: 'rgba(192,57,43,0.15)', color: '#E57373' }
                  : status === 'Busy'   ? { background: 'rgba(239,159,39,0.15)', color: '#EF9F27' }
                  :                       { background: 'rgba(39,161,72,0.15)',   color: '#27A148' };
                const barColor =
                  status === 'Critical' ? '#E24B4A' : status === 'Busy' ? '#EF9F27' : '#639922';
                const waitColor =
                  status === 'Critical' ? '#E57373' : status === 'Clear' ? '#27A148' : 'var(--text)';

                return (
                  <button
                    key={zone.id}
                    onClick={() => navigate('/map')}
                    aria-label={`${zone.name} — ${getZoneTypeLabel(zone.id)} — ${status}. View on map.`}
                    style={{ background: 'var(--surface)', border: '0.5px solid var(--border-color)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)', marginBottom: 2 }}>{zone.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{getZoneTypeLabel(zone.id)}</div>
                      </div>
                      <span style={{ ...pillStyle, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>{status}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: 'var(--border-color)', marginBottom: 8, overflow: 'hidden' }}>
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(zone.density * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${zone.name} capacity: ${Math.round(zone.density * 100)}%`}
                        style={{ height: '100%', borderRadius: 99, background: barColor, width: `${Math.min(zone.density * 100, 100)}%`, transition: 'width 0.5s ease' }}
                      />
                    </div>
                    {zoneHistory[zone.id] && zoneHistory[zone.id].length >= 2 && (
                      <div style={{ marginBottom: 8 }}>
                        <Sparkline data={zoneHistory[zone.id]} color={barColor} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>{zone.current} / {zone.capacity}</span>
                      <span style={{ color: waitColor, fontWeight: 500 }}>~{zone.waitMinutes} min</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Smart recommendations ── */}
        {recommendations.length > 0 && (
          <section aria-labelledby="recs-heading" style={{ marginBottom: 24 }}>
            <h2 id="recs-heading" style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 500, color: 'var(--text-h)' }}>Smart recommendations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="rec-row"
                >
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>
                    {rec.type === 'food' && (
                      <><strong style={{ color: 'var(--primary)' }}>{rec.best.name}</strong>{' '}has almost no queue right now —{' '}<strong style={{ color: 'var(--primary)' }}>{Math.round(rec.best.density * 100)}%</strong>{' '}capacity, ~{rec.best.waitMinutes} min wait</>
                    )}
                    {rec.type === 'restroom' && rec.worst && (
                      <><strong style={{ color: 'var(--primary)' }}>{rec.best.name}</strong>{' '}is the fastest option —{' '}<strong style={{ color: 'var(--primary)' }}>{Math.round(rec.best.density * 100)}%</strong>{' '}capacity, skip the {rec.worst.name} queue</>
                    )}
                    {rec.type === 'gate' && rec.worst && (
                      <><strong style={{ color: 'var(--primary)' }}>{rec.best.name}</strong>{' '}is your best exit —{' '}<strong style={{ color: 'var(--primary)' }}>{Math.round(rec.best.density * 100)}%</strong>{' '}capacity vs {rec.worst.name} at{' '}<strong style={{ color: 'var(--primary)' }}>{Math.round(rec.worst.density * 100)}%</strong></>
                    )}
                  </span>
                  <button
                    onClick={() => navigate('/map')}
                    aria-label={`Navigate to ${rec.best.name}`}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginLeft: 16, whiteSpace: 'nowrap' }}
                  >
                    Navigate there →
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        {lastUpdated && (
          <footer style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', paddingBottom: 24 }}>
            Last updated {lastUpdated.toLocaleTimeString()}
          </footer>
        )}

      </main>
    </div>
  );
}
 