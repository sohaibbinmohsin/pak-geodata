import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { PakistanArea, PakistanCity } from 'pak-geodata';

export interface MapCanvasProps {
  areas: readonly PakistanArea[];
  selectedArea: PakistanArea | null;
  selectedCity: PakistanCity | null;
  onSelectArea: (area: PakistanArea) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  className?: string;
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
  onSelectArea,
  onMapClick,
  className = '',
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

  // Marker layers and tracking refs
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const activeMarkerRef = useRef<L.Marker | null>(null);

  const prevCityIdRef = useRef<string | null | undefined>(undefined);
  const prevAreaIdRef = useRef<string | null | undefined>(undefined);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // CartoDB Dark Matter raster tiles
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );

    const mapInstance = L.map(containerRef.current, {
      center: [30.3753, 69.3451],
      zoom: 6,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 18,
      layers: [tileLayer],
    });

    // Dark sleek zoom controls in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    const layerGroup = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = layerGroup;

    // Map click handler (outside markers)
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
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
      markerMapRef.current.clear();
      activeMarkerRef.current = null;
    };
  }, []);

  // 2. Render Markers when `areas` changes
  useEffect(() => {
    if (!map || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();
    markerMapRef.current.clear();
    activeMarkerRef.current = null;

    areas.forEach((area) => {
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
        onSelectAreaRef.current(area);
      });

      layerGroup.addLayer(marker);
      markerMapRef.current.set(area.id, marker);

      if (isSelected) {
        activeMarkerRef.current = marker;
      }
    });

    // If selected area marker exists, keep its popup open
    if (selectedArea && markerMapRef.current.has(selectedArea.id)) {
      markerMapRef.current.get(selectedArea.id)?.openPopup();
    }
  }, [map, areas]);

  // 3. Update active marker styling when `selectedArea` changes
  useEffect(() => {
    if (!map) return;

    // Reset previous active marker
    if (activeMarkerRef.current) {
      activeMarkerRef.current.setIcon(createPinIcon(false));
      activeMarkerRef.current.setZIndexOffset(0);
      activeMarkerRef.current = null;
    }

    if (selectedArea && markerMapRef.current.has(selectedArea.id)) {
      const marker = markerMapRef.current.get(selectedArea.id)!;
      marker.setIcon(createPinIcon(true));
      marker.setZIndexOffset(1000);
      activeMarkerRef.current = marker;
      marker.openPopup();
    }
  }, [map, selectedArea]);

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

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full select-none z-0 ${className}`}
      role="region"
      aria-label="Interactive Pakistan Map"
    />
  );
}
