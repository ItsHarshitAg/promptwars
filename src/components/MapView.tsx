import React, { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { useCrowd } from '../hooks/useCrowd';
import { getEnv } from '../utils/env';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

// Narendra Modi Stadium (Motera), Ahmedabad, India
const center = {
  lat: 23.0927,
  lng: 72.5956
};

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  "gate-a":      { lat: 23.0940, lng: 72.5945 },
  "gate-b":      { lat: 23.0915, lng: 72.5968 },
  "food-north":  { lat: 23.0938, lng: 72.5960 },
  "food-south":  { lat: 23.0916, lng: 72.5948 },
  "restroom-e":  { lat: 23.0927, lng: 72.5975 },
  "restroom-w":  { lat: 23.0927, lng: 72.5937 },
  "block-100":   { lat: 23.0935, lng: 72.5952 },
  "block-200":   { lat: 23.0920, lng: 72.5960 }
};



// "You are here" — main north entrance
const VISITOR_POS = { lat: 23.0943, lng: 72.5952 };

// Corridor route waypoints per zone (entrance → through ring corridor → destination)
const ROUTE_PATHS: Record<string, Array<{ lat: number; lng: number }>> = {
  "gate-a":     [VISITOR_POS, { lat: 23.0942, lng: 72.5948 }, ZONE_COORDS["gate-a"]],
  "gate-b":     [VISITOR_POS, { lat: 23.0930, lng: 72.5958 }, { lat: 23.0918, lng: 72.5966 }, ZONE_COORDS["gate-b"]],
  "food-north": [VISITOR_POS, { lat: 23.0940, lng: 72.5955 }, ZONE_COORDS["food-north"]],
  "food-south": [VISITOR_POS, { lat: 23.0930, lng: 72.5950 }, { lat: 23.0919, lng: 72.5949 }, ZONE_COORDS["food-south"]],
  "restroom-e": [VISITOR_POS, { lat: 23.0932, lng: 72.5960 }, { lat: 23.0928, lng: 72.5971 }, ZONE_COORDS["restroom-e"]],
  "restroom-w": [VISITOR_POS, { lat: 23.0930, lng: 72.5944 }, { lat: 23.0928, lng: 72.5938 }, ZONE_COORDS["restroom-w"]],
  "block-100":  [VISITOR_POS, { lat: 23.0937, lng: 72.5953 }, ZONE_COORDS["block-100"]],
  "block-200":  [VISITOR_POS, { lat: 23.0932, lng: 72.5957 }, ZONE_COORDS["block-200"]],
};

// ── Stadium SVG floor plan ────────────────────────────────────────────────
// SVG viewBox 480×360 scaled to FLOOR_BOUNDS. Zone positions computed from coords.
const FLOOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">
  <ellipse cx="240" cy="180" rx="225" ry="165" fill="#E8F0F8" stroke="#4A7FC0" stroke-width="2.5" opacity="0.7"/>
  <ellipse cx="240" cy="180" rx="168" ry="122" fill="#D2DEEE" stroke="#6090B8" stroke-width="1.5" opacity="0.6"/>
  <ellipse cx="240" cy="180" rx="112" ry="82" fill="#7BC67E" stroke="#27A148" stroke-width="1.5" opacity="0.65"/>
  <ellipse cx="240" cy="180" rx="56" ry="41" fill="none" stroke="#4CAF50" stroke-width="0.8" opacity="0.5"/>
  <line x1="240" y1="98" x2="240" y2="262" stroke="#4CAF50" stroke-width="0.8" opacity="0.5"/>
  <line x1="128" y1="180" x2="352" y2="180" stroke="#4CAF50" stroke-width="0.8" opacity="0.5"/>
  <line x1="136" y1="72" x2="198" y2="113" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="282" y1="72" x2="244" y2="107" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="416" y1="178" x2="360" y2="179" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="64" y1="178" x2="122" y2="179" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="162" y1="282" x2="254" y2="247" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="362" y1="290" x2="290" y2="250" stroke="#6090B8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <circle cx="130" cy="50" r="15" fill="#185FA5" opacity="0.9"/>
  <text x="130" y="55" text-anchor="middle" fill="white" font-size="8" font-family="system-ui" font-weight="600">GATE A</text>
  <circle cx="362" cy="300" r="15" fill="#185FA5" opacity="0.9"/>
  <text x="362" y="305" text-anchor="middle" fill="white" font-size="8" font-family="system-ui" font-weight="600">GATE B</text>
  <rect x="262" y="44" width="40" height="22" rx="4" fill="#E67C00" opacity="0.9"/>
  <text x="282" y="59" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">FOOD N</text>
  <rect x="142" y="280" width="40" height="22" rx="4" fill="#E67C00" opacity="0.9"/>
  <text x="162" y="295" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">FOOD S</text>
  <rect x="418" y="167" width="40" height="22" rx="4" fill="#00A99D" opacity="0.9"/>
  <text x="438" y="182" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">WC EAST</text>
  <rect x="22" y="167" width="40" height="22" rx="4" fill="#00A99D" opacity="0.9"/>
  <text x="42" y="182" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">WC WEST</text>
  <rect x="178" y="87" width="48" height="22" rx="4" fill="#7B3F9E" opacity="0.85"/>
  <text x="202" y="102" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">BLOCK 100</text>
  <rect x="260" y="238" width="48" height="22" rx="4" fill="#7B3F9E" opacity="0.85"/>
  <text x="284" y="253" text-anchor="middle" fill="white" font-size="7" font-family="system-ui" font-weight="600">BLOCK 200</text>
  <circle cx="240" cy="24" r="6" fill="#E53935" opacity="0.9"/>
  <text x="255" y="29" fill="#E53935" font-size="8" font-family="system-ui" font-weight="700">YOU ARE HERE</text>
</svg>`;

// Inline SVG overlay rendered as a CSS absolute element — GroundOverlay doesn't support data: URLs

// ── Props ─────────────────────────────────────────────────────────────────
interface MapViewProps {
  selectedZoneId?: string;
  showFloorPlan?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ selectedZoneId, showFloorPlan = false }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: getEnv('VITE_GOOGLE_MAPS_KEY') || getEnv('VITE_GOOGLE_MAPS_API_KEY') || ''
  });

  const { heatmapData } = useCrowd();
  const [activeZone, setActiveZone] = React.useState<string | null>(null);

  const handleMarkerClick = useCallback((zoneId: string) => {
    setActiveZone(zoneId);
  }, []);

  const handleInfoClose = useCallback(() => {
    setActiveZone(null);
  }, []);

  const activeZoneData = useMemo(
    () => heatmapData.find(z => z.id === activeZone),
    [heatmapData, activeZone]
  );

  const routePath = useMemo(
    () => selectedZoneId ? (ROUTE_PATHS[selectedZoneId] ?? null) : null,
    [selectedZoneId]
  );

  if (!isLoaded) return <div aria-live="polite" style={{ padding: 16 }}>Loading Map...</div>;

  return (
    <div aria-label="Interactive Stadium Map" role="region" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floor plan SVG overlay — rendered as a CSS layer so it actually appears */}
      {showFloorPlan && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '6%',
            left: '6%',
            width: '88%',
            height: '88%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          dangerouslySetInnerHTML={{
            __html: FLOOR_SVG.replace('<svg ', '<svg width="100%" height="100%" '),
          }}
        />
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
      >

        {/* Markers */}
        {heatmapData.map(zone => {
          const position = ZONE_COORDS[zone.id] || center;
          const isSelected = zone.id === selectedZoneId;
          return (
            <Marker
              key={zone.id}
              position={position}
              onClick={() => handleMarkerClick(zone.id)}
              icon={{
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                fillColor: zone.color,
                fillOpacity: 1,
                strokeColor: isSelected ? '#185FA5' : '#000',
                strokeWeight: isSelected ? 3 : 1,
                scale: isSelected ? 1.9 : 1.5,
              }}
              title={`${zone.name} — Wait: ~${zone.waitMinutes} mins`}
            />
          );
        })}

        {/* Route polyline */}
        {routePath && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#185FA5',
              strokeWeight: 3,
              strokeOpacity: 0.85,
              geodesic: true,
            }}
          />
        )}

        {/* Info window */}
        {activeZone && activeZoneData && (
          <InfoWindow
            position={ZONE_COORDS[activeZone] || center}
            onCloseClick={handleInfoClose}
          >
            <div style={{ color: '#000', padding: '8px', minWidth: 140 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>{activeZoneData.name}</h4>
              <p style={{ margin: '0', fontSize: 13 }}>
                Capacity: {activeZoneData.current}/{activeZoneData.capacity}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Wait: ~{activeZoneData.waitMinutes} mins</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

