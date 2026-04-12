import React, { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useCrowd } from '../hooks/useCrowd';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

// Narendra Modi Stadium (Motera), Ahmedabad, India
const center = {
  lat: 23.0927,
  lng: 72.5956
};

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  "gate-a": { lat: 23.0940, lng: 72.5945 },
  "gate-b": { lat: 23.0915, lng: 72.5968 },
  "food-north": { lat: 23.0938, lng: 72.5960 },
  "food-south": { lat: 23.0916, lng: 72.5948 },
  "restroom-e": { lat: 23.0927, lng: 72.5975 },
  "restroom-w": { lat: 23.0927, lng: 72.5937 },
  "block-100": { lat: 23.0935, lng: 72.5952 },
  "block-200": { lat: 23.0920, lng: 72.5960 }
};

export const MapView: React.FC = () => {
  const getEnv = (key: string) => {
    return (window as any).envConfig?.[key] || import.meta.env[key];
  };

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

  if (!isLoaded) return <div aria-live="polite">Loading Map...</div>;

  return (
    <div aria-label="Interactive Stadium Map" role="region">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
      >
        {heatmapData.map(zone => {
          const position = ZONE_COORDS[zone.id] || center;
          return (
            <Marker
              key={zone.id}
              position={position}
              onClick={() => handleMarkerClick(zone.id)}
              icon={{
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                fillColor: zone.color,
                fillOpacity: 1,
                strokeColor: '#000',
                strokeWeight: 1,
                scale: 1.5,
              }}
              title={`${zone.name} — Wait: ~${zone.waitMinutes} mins`}
            />
          );
        })}
        
        {activeZone && activeZoneData && (
          <InfoWindow
            position={ZONE_COORDS[activeZone] || center}
            onCloseClick={handleInfoClose}
          >
            <div style={{ color: '#000', padding: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{activeZoneData.name}</h4>
              <p style={{ margin: '0' }}>
                Capacity: {activeZoneData.current}/{activeZoneData.capacity}
              </p>
              <p style={{ margin: '4px 0 0' }}>Wait: ~{activeZoneData.waitMinutes} mins</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
