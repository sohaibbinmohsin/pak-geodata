import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  getNearestArea,
  haversineDistanceKm,
  getCityName,
  toEasternDigits,
  type PakistanArea,
  type PakistanCity,
} from 'pak-geodata';
import { clusterAreas } from './clusterUtils';
import type { ReverseGeoPoint } from './reverseGeoUtils';

export type { ReverseGeoPoint };

export interface MapCanvasProps {
  areas: readonly PakistanArea[];
  selectedArea: PakistanArea | null;
  selectedCity: PakistanCity | null;
  reverseGeoPoint?: ReverseGeoPoint | null;
  onSelectArea: (area: PakistanArea | null) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onReverseGeoChange?: (point: ReverseGeoPoint | null) => void;
  className?: string;
  lang?: 'en' | 'ur';
}

/**
 * Creates custom SVG glowing emerald pin icon for areas.
 */
function createPinIcon(isSelected: boolean = false): L.DivIcon {
  const size = isSelected ? 34 : 26;
  const height = isSelected ? 42 : 32;
  const anchorX = size / 2;
  const anchorY = height;

  const beaconHtml = isSelected
    ? '<span class="pak-pin-beacon-selected"></span>'
    : '<span class="pak-pin-beacon"></span>';

  return L.divIcon({
    className: 'pak-custom-marker',
    iconSize: [size, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -height + 4],
    tooltipAnchor: [0, -height + 4],
    html: `
      <div class="pak-pin-container ${isSelected ? 'is-selected' : ''}" style="width: ${size}px; height: ${height}px;">
        ${beaconHtml}
        <svg class="pak-pin-svg" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
          <path d="M14 0C6.268 0 0 6.268 0 14C0 23.5 14 34 14 34C14 34 28 23.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isSelected ? '#10b981' : '#059669'}" stroke="${isSelected ? '#6ee7b7' : 'rgba(255,255,255,0.45)'}" stroke-width="${isSelected ? '2' : '1.2'}"/>
          <circle cx="14" cy="13" r="${isSelected ? '5.5' : '4.5'}" fill="#ffffff" opacity="0.95"/>
          ${isSelected ? '<circle cx="14" cy="13" r="2.5" fill="#047857"/>' : ''}
        </svg>
      </div>
    `,
  });
}

/**
 * Creates custom glowing emerald circle icon with count number for clustered areas.
 */
function createClusterIcon(
  count: number,
  hasSelected: boolean = false,
  lang: 'en' | 'ur' = 'en'
): L.DivIcon {
  const size = count >= 100 ? 44 : count >= 10 ? 38 : 32;
  const fontSize = count >= 100 ? 11 : count >= 10 ? 12 : 13;
  const displayCount = lang === 'ur' ? toEasternDigits(String(count)) : String(count);

  return L.divIcon({
    className: 'pak-cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    tooltipAnchor: [0, -size / 2],
    html: `
      <div class="pak-cluster-container ${hasSelected ? 'has-selected' : ''}" style="width: ${size}px; height: ${size}px; font-size: ${fontSize}px;" role="button" aria-label="${count} areas in cluster">
        <span class="pak-cluster-beacon"></span>
        <span class="relative z-10 leading-none">${escapeHtml(displayCount)}</span>
      </div>
    `,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the dark glass popup element with English, Urdu Nastaliq, postal code, and inspect button.
 */
function createPopupElement(area: PakistanArea, onSelect: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-3.5 min-w-[220px] max-w-[280px] space-y-2 select-text';

  const typeLabel = area.type ? area.type.replace('_', ' ') : 'area';
  const cityLabel = area.cityId ? area.cityId.toUpperCase() : 'PAKISTAN';

  container.innerHTML = `
    <div class="flex items-start justify-between gap-2">
      <div>
        <div class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          ${escapeHtml(cityLabel)} • ${escapeHtml(typeLabel)}
        </div>
        <div class="text-sm font-semibold text-white tracking-tight leading-snug">
          ${escapeHtml(area.name)}
        </div>
      </div>
      ${
        area.postalCode
          ? `<span class="inline-flex items-center text-[10px] font-mono text-neutral-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
              ${escapeHtml(area.postalCode)}
            </span>`
          : ''
      }
    </div>

    ${
      area.urduName
        ? `<div class="text-right dir-rtl font-nastaliq text-emerald-300 text-sm pt-0.5 pb-1 border-t border-white/5 leading-relaxed">
            ${escapeHtml(area.urduName)}
          </div>`
        : ''
    }

    <div class="flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px]">
      <span class="font-mono text-[10px] text-neutral-400">
        ${area.coordinates.lat.toFixed(4)}°, ${area.coordinates.lng.toFixed(4)}°
      </span>
      <button type="button" class="inspect-btn inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-[11px] cursor-pointer">
        <span>Inspect</span>
        <span>→</span>
      </button>
    </div>
  `;

  const btn = container.querySelector('.inspect-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect();
    });
  }

  return container;
}

export default function MapCanvas({
  areas,
  selectedArea,
  selectedCity,
  reverseGeoPoint,
  onSelectArea,
  onMapClick,
  onReverseGeoChange,
  className = '',
  lang = 'en',
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  // Keep callback refs stable
  const onSelectAreaRef = useRef(onSelectArea);
  useEffect(() => {
    onSelectAreaRef.current = onSelectArea;
  }, [onSelectArea]);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const onReverseGeoChangeRef = useRef(onReverseGeoChange);
  useEffect(() => {
    onReverseGeoChangeRef.current = onReverseGeoChange;
  }, [onReverseGeoChange]);

  const selectedCityRef = useRef(selectedCity);
  useEffect(() => {
    selectedCityRef.current = selectedCity;
  }, [selectedCity]);

  const selectedAreaRef = useRef(selectedArea);
  useEffect(() => {
    selectedAreaRef.current = selectedArea;
  }, [selectedArea]);

  // Marker layers and tracking refs
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const reverseGeoLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const activeMarkerRef = useRef<L.Marker | null>(null);

  const prevCityIdRef = useRef<string | null | undefined>(selectedCity?.id);
  const prevAreaIdRef = useRef<string | null | undefined>(selectedArea?.id);

  const isSwitchingAreaRef = useRef(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // OpenStreetMap clean raster tiles with dark CSS filter styling
    const tileLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        className: 'dark-tiles',
        maxZoom: 19,
        detectRetina: true,
      }
    );

    const initialCenter: [number, number] = selectedAreaRef.current?.coordinates
      ? [selectedAreaRef.current.coordinates.lat, selectedAreaRef.current.coordinates.lng]
      : selectedCityRef.current?.coordinates
      ? [selectedCityRef.current.coordinates.lat, selectedCityRef.current.coordinates.lng]
      : [30.3753, 69.3451];
    const initialZoom = selectedAreaRef.current ? 14 : selectedCityRef.current ? 11 : 6;

    const mapInstance = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: [
        [23.0, 60.0],
        [37.5, 78.0],
      ],
      maxBoundsViscosity: 1.0,
      layers: [tileLayer],
    });

    if (!selectedAreaRef.current && selectedCityRef.current?.bounds) {
      mapInstance.fitBounds(
        [
          [selectedCityRef.current.bounds.minLat, selectedCityRef.current.bounds.minLng],
          [selectedCityRef.current.bounds.maxLat, selectedCityRef.current.bounds.maxLng],
        ],
        { padding: [80, 80] }
      );
    }


    // Dark sleek zoom controls in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    const layerGroup = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = layerGroup;

    const reverseGeoLayer = L.layerGroup().addTo(mapInstance);
    reverseGeoLayerRef.current = reverseGeoLayer;

    // Map click handler (outside markers)
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const coords = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      const t0 = performance.now();
      const cityId = selectedCityRef.current?.id;
      const nearest = getNearestArea(coords, cityId ? { cityId } : undefined);
      const computationTimeMs = performance.now() - t0;

      if (nearest) {
        const distanceKm = haversineDistanceKm(coords, nearest.coordinates);
        onReverseGeoChangeRef.current?.({
          clicked: coords,
          nearest,
          distanceKm,
          computationTimeMs,
        });
      } else {
        onReverseGeoChangeRef.current?.(null);
      }

      onMapClickRef.current?.(coords);
    });

    // Map popupclose handler to sync area deselection
    mapInstance.on('popupclose', (e: L.PopupEvent) => {
      if (isSwitchingAreaRef.current) return;
      if (activeMarkerRef.current && activeMarkerRef.current.getPopup() === e.popup) {
        onSelectAreaRef.current(null);
      }
    });

    // Invalidate size once DOM settles to ensure complete tile coverage
    const resizeTimer = setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);

    setMap(mapInstance);

    return () => {
      clearTimeout(resizeTimer);
      mapInstance.remove();
      setMap(null);
      markersLayerRef.current = null;
      reverseGeoLayerRef.current = null;
      markerMapRef.current.clear();
      activeMarkerRef.current = null;
    };
  }, []);

  // 2. Render Markers & Clusters dynamically based on zoom & collision proximity
  const renderMarkers = useCallback(() => {
    if (!map || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();
    markerMapRef.current.clear();
    activeMarkerRef.current = null;

    // Fast 2D layer projection for pixel collision check
    const project = (lat: number, lng: number) => {
      const pt = map.latLngToLayerPoint([lat, lng]);
      return { x: pt.x, y: pt.y };
    };

    const clusters = clusterAreas(areas, project, 45, selectedArea?.id);

    clusters.forEach((cluster) => {
      if (cluster.count === 1) {
        // Single Area: Render individual pin
        const area = cluster.areas[0];
        const isSelected = selectedArea?.id === area.id;
        const marker = L.marker([area.coordinates.lat, area.coordinates.lng], {
          icon: createPinIcon(isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        });

        // Hover tooltip
        const tooltipContent = area.urduName ? `${area.name} (${area.urduName})` : area.name;
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -34],
          className: 'pak-tooltip',
        });

        // Interactive popup
        const popupEl = createPopupElement(area, () => {
          onSelectAreaRef.current(area);
        });
        marker.bindPopup(popupEl, {
          offset: [0, -34],
          className: 'pak-popup',
        });

        // Marker click triggers selection & stops propagation to map
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          isSwitchingAreaRef.current = true;
          onSelectAreaRef.current(area);
          setTimeout(() => {
            isSwitchingAreaRef.current = false;
          }, 120);
        });

        layerGroup.addLayer(marker);
        markerMapRef.current.set(area.id, marker);

        if (isSelected) {
          activeMarkerRef.current = marker;
          if (!marker.isPopupOpen()) {
            marker.openPopup();
          }
        }
      } else {
        // Multi-Area Cluster: Render glowing circle with number
        const size = cluster.count >= 100 ? 44 : cluster.count >= 10 ? 38 : 32;
        const marker = L.marker([cluster.center.lat, cluster.center.lng], {
          icon: createClusterIcon(cluster.count, cluster.hasSelected, lang),
          zIndexOffset: cluster.hasSelected ? 950 : 500,
        });

        const cityIds = Array.from(new Set(cluster.areas.map((a) => a.cityId)));
        const cityLabel = cityIds.length === 1 ? getCityName(cityIds[0], lang) : (lang === 'ur' ? 'پاکستان' : 'Pakistan');
        const countLabel = lang === 'ur' ? toEasternDigits(String(cluster.count)) : String(cluster.count);
        const areasWord = lang === 'ur' ? 'علاقے' : 'areas';
        const zoomHint = lang === 'ur' ? 'زوم کرنے کے لیے کلک کریں' : 'Click to zoom in';
        const tooltipText = `${cityLabel} • ${countLabel} ${areasWord} • ${zoomHint}`;

        marker.bindTooltip(tooltipText, {
          direction: 'top',
          offset: [0, -size / 2],
          className: 'pak-tooltip',
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const corner1 = L.latLng(cluster.bounds.minLat, cluster.bounds.minLng);
          const corner2 = L.latLng(cluster.bounds.maxLat, cluster.bounds.maxLng);
          const bounds = L.latLngBounds(corner1, corner2);

          if (bounds.isValid() && !corner1.equals(corner2)) {
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
          } else {
            map.setView([cluster.center.lat, cluster.center.lng], Math.min(map.getZoom() + 3, 16));
          }
        });

        layerGroup.addLayer(marker);
      }
    });
  }, [map, areas, selectedArea, lang]);

  // 3. Keep markers synchronized across zoom, pan, and prop changes
  useEffect(() => {
    if (!map) return;

    renderMarkers();

    const handleViewChange = () => {
      renderMarkers();
    };

    map.on('zoomend', handleViewChange);
    map.on('moveend', handleViewChange);

    return () => {
      map.off('zoomend', handleViewChange);
      map.off('moveend', handleViewChange);
    };
  }, [map, renderMarkers]);

  // 4. Smooth Camera Flight for City and Area changes
  useEffect(() => {
    if (!map) return;

    const cityChanged = prevCityIdRef.current !== selectedCity?.id;
    const areaChanged = prevAreaIdRef.current !== selectedArea?.id;

    const prevCity = prevCityIdRef.current;
    prevCityIdRef.current = selectedCity?.id;
    prevAreaIdRef.current = selectedArea?.id;

    if (selectedArea && areaChanged) {
      // Smooth camera flight to area coordinates
      map.flyTo([selectedArea.coordinates.lat, selectedArea.coordinates.lng], 14, {
        duration: 1.0,
      });
    } else if (cityChanged && !selectedArea) {
      if (selectedCity?.bounds) {
        // Smooth camera flight to city bounding box
        map.flyToBounds(
          [
            [selectedCity.bounds.minLat, selectedCity.bounds.minLng],
            [selectedCity.bounds.maxLat, selectedCity.bounds.maxLng],
          ],
          { padding: [80, 80], duration: 1.2 }
        );
      } else if (selectedCity) {
        map.flyTo([selectedCity.coordinates.lat, selectedCity.coordinates.lng], 12, {
          duration: 1.2,
        });
      } else if (prevCity !== undefined) {
        // Cleared / "All" selected -> return to Pakistan overview
        map.flyTo([30.3753, 69.3451], 6, { duration: 1.2 });
      }
    }
  }, [map, selectedCity, selectedArea]);

  // 5. Render Glowing Cyan Radar Ping Marker & Animated Dashed Vector Line
  useEffect(() => {
    if (!map || !reverseGeoLayerRef.current) return;
    const layer = reverseGeoLayerRef.current;
    layer.clearLayers();

    if (!reverseGeoPoint) return;

    const { clicked, nearest } = reverseGeoPoint;

    // Glowing cyan radar ping marker
    const radarIcon = L.divIcon({
      className: 'pak-radar-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      html: `
        <div class="pak-radar-ping-container" aria-label="Clicked location">
          <div class="pak-radar-ripple"></div>
          <div class="pak-radar-ripple"></div>
          <div class="pak-radar-center"></div>
        </div>
      `,
    });

    const radarMarker = L.marker([clicked.lat, clicked.lng], {
      icon: radarIcon,
      zIndexOffset: 1200,
      interactive: false,
    });

    // Animated dashed cyan vector polyline connecting clicked -> nearest.coordinates
    const vectorPolyline = L.polyline(
      [
        [clicked.lat, clicked.lng],
        [nearest.coordinates.lat, nearest.coordinates.lng],
      ],
      {
        color: '#22d3ee',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '6, 8',
        className: 'pak-vector-line',
        interactive: false,
      }
    );

    layer.addLayer(radarMarker);
    layer.addLayer(vectorPolyline);
  }, [map, reverseGeoPoint]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full select-none z-0 ${className}`}
      role="region"
      aria-label="Interactive Pakistan Map"
    />
  );
}
