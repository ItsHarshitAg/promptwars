import { useState, useMemo } from 'react';
import { useCrowd } from '../hooks/useCrowd';
import { MapView } from '../components/MapView';

function getZoneTypeLabel(id: string): string {
  if (id.includes('gate')) return 'Entry / exit';
  if (id.includes('food')) return 'Food & drink';
  if (id.includes('restroom')) return 'Facilities';
  return 'Seating';
}

function statusColor(density: number): string {
  if (density > 0.8) return '#E24B4A';
  if (density >= 0.5) return '#EF9F27';
  return '#639922';
}

export default function NavigationScreen() {
  const { zones, loading } = useCrowd();
  const [selectedId, setSelectedId] = useState('');

  const selectedZone = useMemo(
    () => zones.find(z => z.id === selectedId) ?? null,
    [zones, selectedId]
  );

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* ── Left sidebar ── */}
      <aside
        aria-label="Zone navigation sidebar"
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: '0.5px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500, color: 'var(--text-h)' }}>
            Navigate
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted)' }}>
            Select a destination to find the least crowded route
          </p>
        </div>

        {/* Destination selector */}
        <div style={{ padding: '0 20px 16px', flexShrink: 0 }}>
          <label
            htmlFor="zone-select"
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 8,
            }}
          >
            Where do you want to go?
          </label>
          <select
            id="zone-select"
            aria-label="Select destination zone"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              width: '100%',
              height: 36,
              borderRadius: 8,
              border: '0.5px solid var(--border-color)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              padding: '0 8px',
              cursor: 'pointer',
            }}
          >
            <option value="">— Select a zone —</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        {/* Zone list */}
        <ul
          aria-label="Stadium zones"
          style={{ flex: 1, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}
        >
          {loading ? (
            <li style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)' }}>
              Loading zones…
            </li>
          ) : (
            zones.map(zone => {
              const isSelected = zone.id === selectedId;
              const color = statusColor(zone.density);
              return (
                <li key={zone.id} style={{ borderBottom: '0.5px solid var(--border-color)' }}>
                  <button
                    onClick={() => setSelectedId(zone.id)}
                    aria-label={`Navigate to ${zone.name}, ~${zone.waitMinutes} min wait`}
                    aria-pressed={isSelected}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '12px 20px',
                      border: 'none',
                      borderLeft: isSelected ? '2px solid #185FA5' : '2px solid transparent',
                      paddingLeft: isSelected ? 18 : 20,
                      background: isSelected ? 'rgba(24,95,165,0.07)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {zone.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {getZoneTypeLabel(zone.id)}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                      ~{zone.waitMinutes} min
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Legend */}
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Crowd level
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {([['#639922', 'Clear'], ['#EF9F27', 'Busy'], ['#E24B4A', 'Critical']] as [string, string][]).map(
              ([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)' }}>
                  <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </aside>

      {/* ── Right map panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div
          style={{
            height: 40,
            flexShrink: 0,
            background: 'var(--bg)',
            borderBottom: '0.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <span style={{ fontSize: 13, color: selectedZone ? 'var(--text-h)' : 'var(--muted)', fontWeight: selectedZone ? 500 : 400 }}>
            {selectedZone ? selectedZone.name : 'No destination selected'}
          </span>
          {selectedZone && (
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              ~{selectedZone.waitMinutes} min wait · {selectedZone.current}/{selectedZone.capacity} capacity
            </span>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
          <MapView />
        </div>
      </div>
    </div>
  );
}

