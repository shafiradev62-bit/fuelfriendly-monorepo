import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import bearing from '@turf/bearing';
import { point } from '@turf/helpers';
import 'leaflet/dist/leaflet.css';
import '../styles/jawg-tracking.css';

type Coordinate = [number, number];

interface RouteFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: 'LineString';
    coordinates: Coordinate[];
  };
}

interface RouteCollection {
  type: 'FeatureCollection';
  features: RouteFeature[];
}

interface JawgVehicleTrackingMapProps {
  jawgToken?: string;
  routeGeoJson?: RouteCollection;
  speedKmh?: number;
  className?: string;
  theme?: 'light' | 'sunny';
}

const defaultJawgToken = import.meta.env.VITE_JAWG_ACCESS_TOKEN || 'oRvhpMN09wWHEPAjB2BLP6bwDgZZUkHlAwQ1T1OH7aHUe0Z9rlFkpBu3IpYIcePV';

export const sampleGasToUserRoute: RouteCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { routeName: 'Gas Station to User' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-90.0578, 35.1465],
          [-90.0544, 35.1457],
          [-90.0503, 35.1449],
          [-90.0465, 35.1437],
          [-90.0422, 35.1418],
          [-90.0381, 35.1397],
          [-90.0336, 35.1371]
        ]
      }
    }
  ]
};

const JawgVehicleTrackingMap: React.FC<JawgVehicleTrackingMapProps> = ({
  jawgToken = defaultJawgToken,
  routeGeoJson = sampleGasToUserRoute,
  speedKmh = 40,
  className = '',
  theme = 'light'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const segmentIndexRef = useRef(0);
  const segmentProgressRef = useRef(0);
  const segmentDurationMsRef = useRef(1);
  const isPanningRef = useRef(false);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stepLabel, setStepLabel] = useState('Step 1 / 1');

  const coordinates = useMemo(() => {
    const line = routeGeoJson?.features?.[0]?.geometry?.coordinates || [];
    return line.filter((c) => Array.isArray(c) && c.length === 2) as Coordinate[];
  }, [routeGeoJson]);

  const latLngs = useMemo(() => coordinates.map(([lng, lat]) => L.latLng(lat, lng)), [coordinates]);

  useEffect(() => {
    if (!mapContainerRef.current || latLngs.length < 2) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    });
    mapRef.current = map;

    const jawgStyle = theme === 'sunny' ? 'jawg-sunny' : 'jawg-light';
    if (jawgToken) {
      L.tileLayer(`https://tile.jawg.io/${jawgStyle}/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
        maxZoom: 22,
        attribution: '© Jawg Maps © OpenStreetMap contributors'
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    }

    L.polyline(latLngs, {
      color: '#3AC36C', // Changed to brand green
      weight: 5,
      opacity: 0.9,
      dashArray: '10, 10' // Dash style to indicate path
    }).addTo(map);

    // Add Station (Start) Marker
    const stationIcon = L.divIcon({
      className: 'station-div-icon',
      html: `
        <div style="background-color: white; border-radius: 50%; padding: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid #3AC36C; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3AC36C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22v-8"/><path d="M7 22v-8"/><path d="M11 22v-8"/><path d="M15 22v-8"/><path d="M19 22v-8"/><path d="M4 14l3-3"/><path d="M8 14l3-3"/><path d="M12 14l3-3"/><path d="M16 14l3-3"/><rect x="2" y="3" width="20" height="8" rx="2" ry="2"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker(latLngs[0], { icon: stationIcon })
      .addTo(map)
      .bindPopup('<b>Fuel Station</b><br/>Fuel Friend departs from here')
      .on('mouseover', function (e) { this.openPopup(); })
      .on('mouseout', function (e) { this.closePopup(); });

    // Add User (End) Marker
    const userIcon = L.divIcon({
      className: 'user-div-icon',
      html: `
        <div style="background-color: #3b82f6; border-radius: 50%; padding: 6px; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); border: 2.5px solid white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(latLngs[latLngs.length - 1], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Location</b><br/>Delivery destination')
      .on('mouseover', function (e) { this.openPopup(); })
      .on('mouseout', function (e) { this.closePopup(); });


    const carIcon = L.divIcon({
      className: 'car-div-icon',
      html: `<div class="car-icon-container"><img src="/car.png" alt="car" style="will-change: transform; transform: translateZ(0); backface-visibility: hidden; width: 36px; height: 36px; drop-shadow: 0 4px 6px rgba(0,0,0,0.1); image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;" /></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const carMarker = L.marker(latLngs[0], { icon: carIcon, interactive: false, zIndexOffset: 1000 }).addTo(map);
    carMarkerRef.current = carMarker;
    map.fitBounds(L.latLngBounds(latLngs), { padding: [45, 45] });

    const speedMps = (speedKmh * 1000) / 3600;
    const totalSegments = latLngs.length - 1;

    const getRemainingMeters = (index: number, currentPosition: L.LatLng) => {
      const nextPoint = latLngs[Math.min(index + 1, latLngs.length - 1)];
      let remaining = currentPosition.distanceTo(nextPoint);
      for (let i = index + 1; i < latLngs.length - 1; i += 1) {
        remaining += latLngs[i].distanceTo(latLngs[i + 1]);
      }
      return remaining;
    };

    const updateSegmentDuration = (segmentIndex: number) => {
      const currentPoint = latLngs[segmentIndex];
      const nextPoint = latLngs[segmentIndex + 1];
      const distanceMeters = currentPoint.distanceTo(nextPoint);
      const baseMs = (distanceMeters / speedMps) * 1000;
      segmentDurationMsRef.current = Math.max(500, baseMs);
    };

    updateSegmentDuration(0);
    setStepLabel(`Step 1 / ${totalSegments}`);

    const animate = (timestamp: number) => {
      if (!mapRef.current || !carMarkerRef.current) return;
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const deltaMs = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      let segmentIndex = segmentIndexRef.current;
      let segmentProgress = segmentProgressRef.current + deltaMs / segmentDurationMsRef.current;

      while (segmentProgress >= 1 && segmentIndex < totalSegments - 1) {
        segmentProgress -= 1;
        segmentIndex += 1;
        updateSegmentDuration(segmentIndex);
      }

      segmentIndexRef.current = segmentIndex;
      segmentProgressRef.current = Math.min(segmentProgress, 1);

      const from = latLngs[segmentIndex];
      const to = latLngs[Math.min(segmentIndex + 1, latLngs.length - 1)];
      const lat = from.lat + (to.lat - from.lat) * segmentProgressRef.current;
      const lng = from.lng + (to.lng - from.lng) * segmentProgressRef.current;
      const currentPosition = L.latLng(lat, lng);
      carMarkerRef.current.setLatLng(currentPosition);

      const heading = bearing(point([from.lng, from.lat]), point([to.lng, to.lat]));
      const carElement = carMarkerRef.current.getElement()?.querySelector('.car-icon-container') as HTMLElement | null;
      if (carElement) {
        carElement.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        carElement.style.transform = `rotate(${heading}deg) translateZ(0)`;
      }

      const remainingMeters = getRemainingMeters(segmentIndex, currentPosition);
      const eta = remainingMeters / speedMps / 60;
      setEtaMinutes(eta);

      const progress = ((segmentIndex + segmentProgressRef.current) / totalSegments) * 100;
      setProgressPercent(Math.max(0, Math.min(progress, 100)));
      setStepLabel(`Step ${Math.min(segmentIndex + 1, totalSegments)} / ${totalSegments}`);

      const mapSize = mapRef.current.getSize();
      const markerPoint = mapRef.current.latLngToContainerPoint(currentPosition);
      const edgePadding = 85;
      const nearEdge =
        markerPoint.x < edgePadding ||
        markerPoint.y < edgePadding ||
        markerPoint.x > mapSize.x - edgePadding ||
        markerPoint.y > mapSize.y - edgePadding;

      if (nearEdge && !isPanningRef.current) {
        isPanningRef.current = true;
        mapRef.current.panTo(currentPosition, { animate: true, duration: 0.35 });
        window.setTimeout(() => {
          isPanningRef.current = false;
        }, 250);
      }

      if (segmentIndex >= totalSegments - 1 && segmentProgressRef.current >= 1) {
        setProgressPercent(100);
        setEtaMinutes(0);
        setStepLabel(`Step ${totalSegments} / ${totalSegments}`);
        return;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      carMarkerRef.current = null;
      lastFrameRef.current = 0;
      segmentIndexRef.current = 0;
      segmentProgressRef.current = 0;
      segmentDurationMsRef.current = 1;
      isPanningRef.current = false;
    };
  }, [latLngs, jawgToken, speedKmh, theme]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainerRef} className="jawg-tracking-map" />
      <div className="tracking-overlay">
        <div className="tracking-card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">Estimated Time</span>
            <span className="text-sm font-bold text-gray-900">
              {etaMinutes <= 1 ? '< 1 min' : `${Math.ceil(etaMinutes)} mins`}
            </span>
          </div>
          <div className="tracking-stepper">
            <div className="tracking-stepper-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-gray-500">{stepLabel}</span>
            <span className="text-[11px] text-gray-500">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JawgVehicleTrackingMap;
