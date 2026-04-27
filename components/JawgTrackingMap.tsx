import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const jawgToken = import.meta.env.VITE_JAWG_ACCESS_TOKEN || '';

interface JawgTrackingMapProps {
  routeCoordinates: [number, number][];
  onRouteComplete?: () => void;
}

const JawgTrackingMap: React.FC<JawgTrackingMapProps> = ({ routeCoordinates, onRouteComplete }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const animationFrameRef = useRef<number>();
  const [carPosition, setCarPosition] = useState<[number, number]>(routeCoordinates[0]);

  useEffect(() => {
   if (!mapContainerRef.current) return;

    // Initialize map with Jawg.io streets style
   const map = new mapboxgl.Map({
     container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          jawg: {
            type: 'raster',
           tiles: [`https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=${jawgToken}`],
           tileSize: 256
          }
        },
       layers: [{
          id: 'jawg-layer',
          type: 'raster',
          source: 'jawg'
        }],
       glyphs: `https://fonts.jawg.io/{fontstack}/{range}.pbf?access-token=${jawgToken}`,
       sprite: `https://sprite.jawg.io/jawg-streets?access-token=${jawgToken}`
      },
     center: routeCoordinates[0],
      zoom: 15,
      pitch: 50,
      bearing: 0,
      antialias: true
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
     console.log('✅ Jawg tracking map loaded');

      // Draw colorful route line
     if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
             coordinates: routeCoordinates
            }
          }
        });
      }

      // Add green route line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
       layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3AC36C',
          'line-width': 8,
          'line-opacity': 1
        }
      });

      // Add route outline glow
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
       layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#2da85a',
          'line-width': 12,
          'line-opacity': 0.3
        }
      });

      // Create Jawg.io style car marker
     const carElement = document.createElement('div');
      carElement.className = 'jawg-car-marker';
      carElement.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 64 64">
          <!-- Outer rotating ring -->
          <circle cx="32" cy="32" r="28" fill="rgba(58, 195, 108, 0.2)" stroke="#3AC36C" stroke-width="2" stroke-dasharray="4 4">
            <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="8s" repeatCount="indefinite"/>
          </circle>
          <!-- Car body -->
          <ellipse cx="32" cy="32" rx="20" ry="12" fill="#3AC36C" stroke="#2da85a" stroke-width="2"/>
          <!-- Direction arrow -->
          <path d="M 32 20 L 36 32 L 32 29 L 28 32 Z" fill="#ffffff" stroke="#2da85a" stroke-width="1"/>
          <!-- Center dot -->
          <circle cx="32" cy="32" r="4" fill="#ffffff"/>
        </svg>
      `;
      carElement.style.cssText = 'width: 48px; height: 48px; filter: drop-shadow(0 4px 8px rgba(58, 195, 108, 0.4));';

      // Add car marker
     const marker = new mapboxgl.Marker({ element: carElement, anchor: 'center' })
        .setLngLat(routeCoordinates[0])
        .addTo(map);
      
      markerRef.current = marker;

      // Animate car along route
      animateCarAlongRoute(routeCoordinates);
    });

    // Camera follow car function
   const followCar = (lngLat: [number, number], heading: number) => {
     if (!mapRef.current) return;
      
      mapRef.current.easeTo({
       center: lngLat,
        bearing: heading,
        pitch: 50,
        duration: 1000,
        easing: (t) => t
      });
    };

    // Animate car function
   const animateCarAlongRoute = (coordinates: [number, number][]) => {
      let currentIndex = 0;
      let currentHeading = 0;

     const animate = () => {
       if (currentIndex >= coordinates.length - 1) {
         if (onRouteComplete) onRouteComplete();
         return;
        }

       const from = coordinates[currentIndex];
       const to = coordinates[currentIndex + 1];
        
        // Calculate heading
       const dx = to[0] - from[0];
       const dy = to[1] - from[1];
        currentHeading = Math.atan2(dx, dy) * (180 / Math.PI);

        // Interpolate position
       const startTime = performance.now();
       const duration = 2000; // 2 seconds per segment

       const interpolate = (currentTime: number) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / duration, 1);

          // Smooth easing
         const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

         const currentLng = from[0] + (to[0] - from[0]) * eased;
         const currentLat = from[1] + (to[1] - from[1]) * eased;
          
         const currentPos: [number, number] = [currentLng, currentLat];
         setCarPosition(currentPos);

         if (markerRef.current) {
            markerRef.current.setLngLat(currentPos);
            
            // Rotate car marker
           const element = markerRef.current.getElement();
           const container = element.querySelector('.car-rotate-container') as HTMLElement;
           if (container) {
             container.style.transform = `rotate(${currentHeading}deg)`;
            }
          }

          // Camera follows car
          followCar(currentPos, currentHeading);

         if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(interpolate);
          } else {
            currentIndex++;
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = requestAnimationFrame(interpolate);
      };

      animate();
    };

   return () => {
     if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
     if (markerRef.current) {
        markerRef.current.remove();
      }
     if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [routeCoordinates, onRouteComplete]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* ETA Card */}
      <div className="absolute top-20 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Estimated Arrival</span>
            <span className="text-sm font-bold text-[#3AC36C]">~5 mins</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#3AC36C] to-[#2da85a] transition-all duration-300"
              style={{ width: `${Math.min(((routeCoordinates.indexOf(carPosition) + 1) / routeCoordinates.length) * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Starting</span>
            <span className="text-xs text-gray-500">{((routeCoordinates.indexOf(carPosition) + 1) / routeCoordinates.length * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JawgTrackingMap;
