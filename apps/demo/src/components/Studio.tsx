import { useState, useMemo, useCallback } from 'react';
import {
  type PakLocationItem,
  type PakistanArea,
  type PakistanCity,
  getAllAreas,
  getCityById,
  getProvinceById,
  getCityName,
  getAreaName,
  searchAreas,
  findAreasByPostalCode,
  getNearestArea,
  haversineDistanceKm,
  toEasternDigits,
  toLocationItem,
} from 'pak-geodata';
import MapCanvas from './MapCanvas';
import Omnibar from './Omnibar';
import CityPills from './CityPills';
import AreaInspector from './AreaInspector';
import {
  type ReverseGeoPoint,
  formatCoordinates,
  formatDistance,
} from './reverseGeoUtils';
import { Compass, Navigation, Layers, CheckCircle2, RotateCcw } from 'lucide-react';

export interface StudioProps {
  className?: string;
}

export default function Studio({ className = '' }: StudioProps) {
  const allAreas = useMemo(() => getAllAreas(), []);

  // Bilingual controller state: 'en' | 'ur'
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  // Filter & selection states
  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);
  const [selectedArea, setSelectedArea] = useState<PakistanArea | null>(() => {
    return allAreas.find((a) => a.id === 'lahore-gulberg-3') || allAreas[0] || null;
  });
  const [reverseGeoPoint, setReverseGeoPoint] = useState<ReverseGeoPoint | null>(null);

  // Scoped areas list based on active city filter
  const filteredAreas = useMemo(() => {
    if (!selectedCity) return allAreas;
    return allAreas.filter((a) => a.cityId === selectedCity.id);
  }, [allAreas, selectedCity]);

  // Synchronize area selection
  const handleSelectArea = useCallback((area: PakistanArea | null) => {
    setSelectedArea(area);
    if (area) {
      setReverseGeoPoint(null);
      if (selectedCity && selectedCity.id !== area.cityId) {
        const city = getCityById(area.cityId);
        if (city) setSelectedCity(city);
      }
    }
  }, [selectedCity]);

  // Synchronize city selection
  const handleSelectCity = useCallback((city: PakistanCity | null) => {
    setSelectedCity(city);
    if (city && selectedArea && selectedArea.cityId !== city.id) {
      setSelectedArea(null);
    }
    if (city && reverseGeoPoint && reverseGeoPoint.nearest.cityId !== city.id) {
      setReverseGeoPoint(null);
    }
  }, [selectedArea, reverseGeoPoint]);

  // Sample Reverse Geocode benchmark point (Liberty Market / Gulberg III centroid)
  const handleSampleReverseGeo = useCallback(() => {
    const sampleCoords = { lat: 31.5125, lng: 74.3441 };
    const t0 = performance.now();
    const nearest = getNearestArea(sampleCoords);
    const computationTimeMs = performance.now() - t0;

    if (nearest) {
      const distanceKm = haversineDistanceKm(sampleCoords, nearest.coordinates);
      setReverseGeoPoint({
        clicked: sampleCoords,
        nearest,
        distanceKm,
        computationTimeMs,
      });
    }
  }, []);

  // Handle suggestion chip clicks by searching and selecting the top matching area
  const handleSuggestionClick = useCallback((query: string) => {
    let results = searchAreas(query, { cityId: selectedCity?.id, limit: 1 });
    if (results.length === 0 && /^\d{2,5}$/.test(query)) {
      results = findAreasByPostalCode(query).filter((a) => !selectedCity || a.cityId === selectedCity.id);
    }
    if (results.length === 0) {
      results = searchAreas(query, { limit: 1 });
      if (results.length === 0 && /^\d{2,5}$/.test(query)) {
        results = findAreasByPostalCode(query);
      }
    }
    if (results.length > 0) {
      handleSelectArea(results[0]);
    }
  }, [selectedCity, handleSelectArea]);

  // Derive location item structure for hierarchy inspection
  const locationItem: PakLocationItem | null = useMemo(() => {
    if (!selectedArea) return null;
    return toLocationItem(selectedArea);
  }, [selectedArea]);

  // Hierarchy breadcrumb names
  const hierarchyNames = useMemo(() => {
    if (!selectedArea) return null;
    const province = getProvinceById(selectedArea.provinceId);
    const provinceName = lang === 'ur'
      ? (province?.urduName || province?.name || selectedArea.provinceId)
      : (province?.name || selectedArea.provinceId);
    const cityName = getCityName(selectedArea.cityId, lang);
    const areaName = lang === 'ur'
      ? toEasternDigits(selectedArea.urduName || selectedArea.name)
      : (selectedArea.name || getAreaName(selectedArea.cityId, selectedArea.id, 'en'));

    return { provinceName, cityName, areaName };
  }, [selectedArea, lang]);

  return (
    <section
      id="studio"
      className={`relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 ${className}`}
    >
      {/* Studio Header & Bilingual Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Visualizer & Inspector</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Interactive Geospatial Studio
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            {lang === 'ur'
              ? 'پاکستان بھر کے تصدیق شدہ اضلاع، علاقوں اور پوسٹل کوڈز کا معائنہ کریں۔'
              : 'Explore canonical areas, administrative hierarchy breadcrumbs, and real-time reverse geocoding across Pakistan.'}
          </p>
        </div>

        {/* Segmented Language Toggle: [ English | اردو ] */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 hidden sm:inline">Language:</span>
          <div
            role="tablist"
            aria-label="Language selector"
            className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10"
          >
            <button
              type="button"
              role="tab"
              aria-selected={lang === 'en'}
              onClick={() => setLang('en')}
              className={`pressable px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                lang === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
            >
              English
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={lang === 'ur'}
              onClick={() => setLang('ur')}
              className={`pressable px-3.5 py-1.5 rounded-lg text-xs font-nastaliq transition-all duration-150 cursor-pointer leading-tight ${
                lang === 'ur'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* City Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
              <span>{lang === 'ur' ? 'شہر منتخب کریں' : 'Filter by City'}</span>
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => handleSelectCity(null)}
                  className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'تمام شہر دکھائیں' : 'Reset city filter'}</span>
                </button>
              )}
            </div>
            <CityPills
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
              allAreas={allAreas}
              lang={lang}
              className="p-0"
            />
          </div>

          {/* Omnibar Search with Quick Suggestion Chips */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-neutral-400 px-1">
              <span>{lang === 'ur' ? 'کثیر لسانی تلاش' : 'Multi-Script Search'}</span>
            </div>
            <Omnibar
              selectedCity={selectedCity}
              selectedArea={selectedArea}
              onSelectArea={handleSelectArea}
              onSelectCity={handleSelectCity}
              onSuggestionClick={handleSuggestionClick}
              showSuggestions={true}
            />
          </div>

          {/* Reverse Geocoding Playground Trigger & Tester Card */}
          <div className="glass-chrome rounded-2xl border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                  {lang === 'ur' ? 'ریورس جیو کوڈنگ ٹیسٹر' : 'Reverse Geocoding Tester'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                &lt; 0.4 ms
              </span>
            </div>

            {reverseGeoPoint ? (
              <div className="space-y-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Clicked GPS:</span>
                  <span className="text-neutral-200">{formatCoordinates(reverseGeoPoint.clicked)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Nearest Area:</span>
                    <span className="text-emerald-400 font-medium">
                      {lang === 'ur'
                        ? toEasternDigits(reverseGeoPoint.nearest.urduName || reverseGeoPoint.nearest.name)
                        : reverseGeoPoint.nearest.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Distance:</span>
                    <span>{formatDistance(reverseGeoPoint.distanceKm)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectArea(reverseGeoPoint.nearest)}
                    className="pressable px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    Inspect Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setReverseGeoPoint(null)}
                    className="pressable text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 space-y-2.5">
                <p className="leading-relaxed">
                  {lang === 'ur'
                    ? 'نقشے پر کسی بھی جگہ کلک کریں تاکہ قریب ترین تصدیق شدہ علاقہ، فاصلہ اور رفتار فوراً معلوم ہو سکے۔'
                    : 'Click anywhere on the interactive map canvas to test real-time offline reverse geocoding with zero network latency.'}
                </p>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={handleSampleReverseGeo}
                    className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Try Sample Point (Lahore)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualizer, Map Canvas & Area Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Hierarchy Breadcrumb Bar */}
          {hierarchyNames && (
            <div className="glass-subtle rounded-xl border border-white/10 px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans select-none shrink-0">
                  {lang === 'ur' ? 'انتظامی درجہ بندی:' : 'Hierarchy Breadcrumb:'}
                </span>
                <span className="text-neutral-400 truncate">{hierarchyNames.provinceName}</span>
                <span className="text-neutral-600 select-none">&gt;</span>
                <span className="text-neutral-300 font-medium truncate">{hierarchyNames.cityName}</span>
                <span className="text-neutral-600 select-none">&gt;</span>
                <span className="text-emerald-400 font-semibold truncate">{hierarchyNames.areaName}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedArea?.verified && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
                {locationItem && (
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                    {locationItem.type}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interactive Map Canvas Container */}
          <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl glass-chrome">
            <MapCanvas
              areas={filteredAreas}
              selectedArea={selectedArea}
              selectedCity={selectedCity}
              reverseGeoPoint={reverseGeoPoint}
              onSelectArea={handleSelectArea}
              onReverseGeoChange={setReverseGeoPoint}
            />
          </div>

          {/* Embedded Area Inspector & Bilingual Code Generator */}
          {selectedArea ? (
            <AreaInspector
              area={selectedArea}
              lang={lang}
              isEmbedded={true}
              onClose={() => setSelectedArea(null)}
            />
          ) : (
            <div className="glass-chrome rounded-2xl border border-white/15 p-8 text-center space-y-2 select-none">
              <Layers className="w-8 h-8 text-neutral-500 mx-auto mb-2 opacity-60" />
              <div className="text-sm font-semibold text-white">No Area Selected</div>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Select a marker on the map canvas or use the search omnibar to inspect administrative hierarchy breadcrumbs, canonical slug identifiers, and bilingual client code.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
