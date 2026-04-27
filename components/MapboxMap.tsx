import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// NO CSS STYLES - SUPER CLEAN MAP
// All marker styles removed

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const jawgToken = import.meta.env.VITE_JAWG_ACCESS_TOKEN || '';

const getJawgStyle = () => ({
  version: 8,
  sources: {
    jawg: {
      type: 'raster',
      tiles: [`https://tile.jawg.io/jawg-light/{z}/{x}/{y}.png?access-token=${jawgToken}`],
      tileSize: 256,
      attribution: '© Jawg Maps'
    }
  },
  layers: [
    {
      id: 'jawg-layer',
      type: 'raster',
      source: 'jawg'
    }
  ]
});

interface MapboxMapProps {
  stations: any[];
  userLocation: { lat: number; lon: number } | null;
  onStationSelect: (station: any) => void;
  selectedOrder?: any;
  isUK?: boolean;
  fuelType?: 'regular' | 'premium' | 'diesel';
}

// NO EXTENDED STATION DATA - SUPER CLEAN MAP
// ExtendedStation interface removed

const MapboxMap: React.FC<MapboxMapProps> = ({ userLocation, stations = [], onStationSelect, isUK, fuelType }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  // Use a ref to keep onStationSelect stable inside async popup callbacks
  const onStationSelectRef = useRef(onStationSelect);
  useEffect(() => { onStationSelectRef.current = onStationSelect; }, [onStationSelect]);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    // Reset error state
    setMapError(null);
    setIsMapLoading(true);

    try {
      // Check if Mapbox is available
      if (!mapboxgl || !mapboxgl.Map) {
        throw new Error('Mapbox GL library not available');
      }

      // Check if access token is available
      if (!mapboxgl.accessToken) {
        console.warn('Mapbox access token not set, using fallback');
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getJawgStyle() as any,
        center: [userLocation.lon, userLocation.lat],
        zoom: 12,
        pitch: 48,
        bearing: -18,
        antialias: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 19,
        fadeDuration: 0,
        crossSourceCollisions: true,
        failIfMajorPerformanceCaveat: false, // Allow fallback for low-end devices
        preserveDrawingBuffer: true // Better for mobile WebView
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map. Please check your connection.');
        setIsMapLoading(false);
      });

      // Handle style loading errors
      map.current.on('style.error', (e) => {
        console.error('Mapbox style error:', e);
        setMapError('Failed to load map style.');
        setIsMapLoading(false);
      });

      // Handle successful load
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapLoading(false);
        setIsMapReady(true);
      });

      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enableRotation();
      map.current.touchPitch.enable();

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
      setIsMapLoading(false);
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error("Error removing map:", e);
        }
        map.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!map.current || !userLocation || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Station markers rendered first – user marker added AFTER so it always renders on top

    // Add station markers with Price Alerts FIRST (so user marker renders on top)
    const isUKMap = isUK;
    const currency = isUKMap ? '£' : '$';

    stations.forEach((station) => {
      if (!station.lat || !station.lon) return;

      const price = station.fuelPrices?.[fuelType || 'regular'] || station.fuelPrices?.regular;
      const displayPrice = price ? `${currency}${price}` : 'N/A';

      // Create cartoon pin container
      const el = document.createElement('div');
      el.className = 'custom-station-marker';

      // We combine a red map pin shape with a cartoon emoji inside, and a price tag hovering at the top!
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
          <!-- Price Alert Badge -->
          <div style="background-color: white; color: #ef4444; font-weight: 800; font-size: 13px; padding: 3px 8px; border-radius: 12px; border: 2px solid #ef4444; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: -10px; z-index: 10; white-space: nowrap;">
            ${displayPrice}
          </div>
          
          <!-- Red Pin with Cartoon Icon -->
          <div style="width: 42px; height: 42px; background-color: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white; box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease;">
             <span style="transform: rotate(45deg); font-size: 20px; display: block; margin-top: -2px; margin-left: -2px;">⛽</span>
          </div>
        </div>
      `;

      // Interactivity: Hover & Click
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.1)'; el.style.zIndex = '10'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; el.style.zIndex = ''; });

      // Create a popup to show location info instead of immediate navigation
      const popupHtml = `
        <div style="padding: 8px 6px 4px; text-align: center; min-width: 160px;">
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 2px 0; color: #111827;">${station.name || 'Fuel Station'}</h4>
          <p style="font-size: 11px; color: #9CA3AF; margin: 0 0 4px 0;">${station.address || ''}</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 4px 8px; margin: 0 0 8px 0; font-size: 12px; color: #059669; font-weight: 700;">${displayPrice}/gal</div>
          <button id="btn-${station.id}" style="background: linear-gradient(135deg, #3AC36C, #2ecd6f); color: white; border: none; padding: 8px 0; border-radius: 9999px; font-weight: 700; cursor: pointer; width: 100%; font-size: 13px; box-shadow: 0 2px 8px rgba(58,195,108,0.4); transition: opacity 0.2s;">Order Here</button>
        </div>
      `;
      const popup = new mapboxgl.Popup({ offset: 30, closeButton: false }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([station.lon, station.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle the button click inside the popup using stable ref
      popup.on('open', () => {
        const btn = document.getElementById(`btn-${station.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onStationSelectRef.current) onStationSelectRef.current(station);
            popup.remove();
          };
        }
      });

      markersRef.current.push(marker);
    });

    // Add user marker LAST so it always renders on top of all station pins
    const userEl = document.createElement('div');
    userEl.style.zIndex = '9999';
    userEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 44px; height: 44px; background-color: #059669; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(5, 150, 105, 0.5); border: 3px solid white; display: flex; justify-content: center; align-items: center; overflow: hidden;">
           <div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #059669;">
             <span style="font-size: 20px;">👦🏻</span>
           </div>
        </div>
        <div style="background-color: white; color: #1f2937; font-weight: bold; font-size: 13px; padding: 2px 10px; border-radius: 12px; margin-top: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.25); white-space: nowrap;">Me</div>
      </div>
    `;
    const userMarker = new mapboxgl.Marker({ element: userEl, anchor: 'bottom', pitchAlignment: 'viewport', rotationAlignment: 'viewport' })
      .setLngLat([userLocation.lon, userLocation.lat])
      .addTo(map.current);
    markersRef.current.push(userMarker);

    // Draw route line to the nearest station (first in list)
    if (stations.length > 0) {
      const closest = stations[0];
      const routeId = 'recommended-route';
      const routeData = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [userLocation.lon, userLocation.lat],
            [closest.lon, closest.lat]
          ]
        }
      };

      if (map.current.getSource(routeId)) {
        (map.current.getSource(routeId) as mapboxgl.GeoJSONSource).setData(routeData);
      } else {
        map.current.addSource(routeId, {
          type: 'geojson',
          data: routeData
        });

        map.current.addLayer({
          id: routeId + '-bg',
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981',
            'line-width': 6,
            'line-opacity': 0.3
          }
        });

        map.current.addLayer({
          id: routeId + '-dash',
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#059669',
            'line-width': 3,
            'line-dasharray': [2, 3],
            'line-opacity': 0.9
          }
        });
      }
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, stations, fuelType, isUK, isMapReady]);
  // NOTE: onStationSelect intentionally excluded from deps - it's an inline arrow fn in parent
  // that changes reference on every render, which would clear all markers on every click



  return (
    <div className="w-full h-full relative" style={{ minHeight: '420px' }}>
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">🗺️</div>
            <p className="text-sm text-gray-600">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Reload Map
            </button>
          </div>
        </div>
      ) : isMapLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      ) : null}
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '420px' }}
      />
    </div>
  );
};

export default MapboxMap;
