import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCrowd } from '../hooks/useCrowd';
import { useZoneHistory } from '../hooks/useZoneHistory';
import { useTheme } from '../hooks/useTheme';
import { Sparkline } from '../components/Sparkline';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import type { Zone } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getZoneType(id: string): 'gate' | 'food' | 'restroom' | 'seating' {
  if (id.includes('gate')) return 'gate';
  if (id.includes('food')) return 'food';
  if (id.includes('restroom')) return 'restroom';
  return 'seating';
}

function getZoneTypeLabel(id: string): string {
  const t = getZoneType(id);
  if (t === 'gate') return 'Entry / exit';
  if (t === 'food') return 'Food & drink';
  if (t === 'restroom') return 'Facilities';
  return 'Seating';
}

function densityStatus(density: number): 'Critical' | 'Busy' | 'Clear' {
  if (density > 0.8) return 'Critical';
  if (density >= 0.5) return 'Busy';
  return 'Clear';
}

// ─── Component ──────────────────────────────────────────────────────────────

export const HomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { zones, heatmapData, loading, error, lastUpdated } = useCrowd();
  const zoneHistory = useZoneHistory();
  const { theme, toggle: toggleTheme } = useTheme();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      // best-effort
    }
  }, [navigate]);

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

  // ── Contextual action per alert zone ──
  function alertAction(zone: Zone): { label: string; targetId: string | null } {
    const type = getZoneType(zone.id);
    if (type === 'food') {
      const alt = zones.filter(z => z.id.includes('food') && z.id !== zone.id);
      if (!alt.length) return { label: 'Check another area →', targetId: null };
      const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
      return { label: `Try ${best.name} →`, targetId: best.id };
    }
    if (type === 'gate') {
      const alt = zones.filter(z => z.id.includes('gate') && z.id !== zone.id);
      if (!alt.length) return { label: 'Check another gate →', targetId: null };
      const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
      return { label: `Try ${best.name} instead →`, targetId: best.id };
    }
    if (type === 'restroom') {
      const alt = zones.filter(z => z.id.includes('restroom') && z.id !== zone.id);
      if (!alt.length) return { label: 'Check facilities →', targetId: null };
      const best = alt.reduce((a, b) => (a.density < b.density ? a : b));
      return { label: `Try ${best.name} →`, targetId: best.id };
    }
    return { label: 'Find alternate route →', targetId: null };
  }

  // ── Smart recommendations ──
  type RecItem = { type: 'food' | 'restroom' | 'gate'; best: Zone; worst: Zone | null; targetId: string };

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

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Navigate', path: '/map' },
    { label: 'AI Chat', path: '/chat' },
    { label: 'Alerts', path: '/' },
  ] as const;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav
        aria-label="Primary navigation"
        style={{
          background: 'var(--bg)',
          borderBottom: '0.5px solid var(--border-color)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: '#27A148', display: 'inline-block' }} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px', color: 'var(--text-h)' }}>SmartStadium</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {navItems.map(item => {
            const isActive =
              item.label === 'Dashboard' || item.label === 'Alerts'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                aria-label={`Go to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  fontSize: 15,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--surface-alt)' : 'transparent',
                  color: isActive ? 'var(--text-h)' : 'var(--muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px', color: 'var(--muted)', marginLeft: 4 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            style={{
              fontSize: 13,
              padding: '6px 12px',
              borderRadius: 6,
              border: '0.5px solid var(--border-color)',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--muted)',
              marginLeft: 4,
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Stat cards ── */}
        {!loading && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>

            <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Busiest Zone</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: stats.busiest.density > 0.8 ? '#C0392B' : 'var(--text-h)', marginBottom: 4 }}>{stats.busiest.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{stats.busiest.current} / {stats.busiest.capacity}</div>
            </div>

            <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Active Alerts</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-h)', marginBottom: 4 }}>{stats.criticalCount}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>zones over 80%</div>
            </div>

            <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Best Restroom</div>
              {stats.bestRestroom ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#27A148', marginBottom: 4 }}>{stats.bestRestroom.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>~{stats.bestRestroom.waitMinutes} min wait</div>
                </>
              ) : (
                <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-h)' }}>—</div>
              )}
            </div>

            <div style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Avg Wait Time</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-h)', marginBottom: 4 }}>{stats.avgWait} min</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>across all zones</div>
            </div>

          </div>
        )}

        {/* ── Alert strips ── */}
        {alertZones.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {alertZones.map(zone => {
              const action = alertAction(zone);
              return (
                <div
                  key={zone.id}
                  style={{
                    background: 'var(--critical-bg)',
                    borderLeft: '3px solid #C0392B',
                    borderRadius: 0,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
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
              );
            })}
          </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
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
                      <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${Math.min(zone.density * 100, 100)}%`, transition: 'width 0.5s ease' }} />
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
                  style={{ background: 'var(--surface-alt)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
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
};
 