import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  toEasternDigits,
  toLocationItem,
} from 'pak-geodata';
import MapCanvas from './MapCanvas';
import Omnibar from './Omnibar';
import CodeGenerator from './CodeGenerator';
import { PACKAGE_VERSION } from '../version';
import {
  type ReverseGeoPoint,
  formatCoordinates,
  formatDistance,
} from './reverseGeoUtils';

import { formatGpsCoordinates } from './codeSnippets';
import {
  ArrowLeft,
  Github,
  Star,
  Navigation,
  CheckCircle2,
  X,
  Copy,
  Check,
  MapPin,
  Building,
  Tag,
} from 'lucide-react';

export interface StudioScreenProps {
  onClose: () => void;
  className?: string;
}

export default function StudioScreen({ onClose, className = '' }: StudioScreenProps) {
  const allAreas = useMemo(() => getAllAreas(), []);

  // Bilingual controller state: 'en' | 'ur'
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  // Filter & selection states
  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);
  const [selectedArea, setSelectedArea] = useState<PakistanArea | null>(null);
  const [reverseGeoPoint, setReverseGeoPoint] = useState<ReverseGeoPoint | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Copy feedback states
  const [slugCopied, setSlugCopied] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);
  const slugTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coordsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current);
      if (coordsTimeoutRef.current) clearTimeout(coordsTimeoutRef.current);
    };
  }, []);

  // Scoped areas list based on active city filter
  const filteredAreas = useMemo(() => {
    if (!selectedCity) return allAreas;
    return allAreas.filter((a) => a.cityId === selectedCity.id);
  }, [allAreas, selectedCity]);

  // Synchronize area selection
  const handleSelectArea = useCallback((area: PakistanArea | null) => {
    setSelectedArea(area);
    setReverseGeoPoint(null);
    if (area && selectedCity && selectedCity.id !== area.cityId) {
      const city = getCityById(area.cityId);
      if (city) setSelectedCity(city);
    }
  }, [selectedCity]);

  // Handle map click reverse geocoding: sets reverseGeoPoint AND selects the nearest area, opening the right side drawer
  const handleReverseGeoChange = useCallback((point: ReverseGeoPoint | null) => {
    setReverseGeoPoint(point);
    if (point) {
      setSelectedArea(point.nearest);
      if (selectedCity && selectedCity.id !== point.nearest.cityId) {
        const city = getCityById(point.nearest.cityId);
        if (city) setSelectedCity(city);
      }
    }
  }, [selectedCity]);

  // Synchronize city selection
  const handleSelectCity = useCallback((city: PakistanCity | null) => {
    setSelectedCity(city);
    if (city && selectedArea && selectedArea.cityId !== city.id) {
      setSelectedArea(null);
      setReverseGeoPoint(null);
    }
    if (city && reverseGeoPoint && reverseGeoPoint.nearest.cityId !== city.id) {
      setReverseGeoPoint(null);
    }
  }, [selectedArea, reverseGeoPoint]);


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

  // Selected area metadata lookups
  const selectedAreaCity = useMemo(() => {
    if (!selectedArea) return null;
    return getCityById(selectedArea.cityId);
  }, [selectedArea]);

  const selectedAreaProvince = useMemo(() => {
    if (!selectedArea) return null;
    return getProvinceById(selectedArea.provinceId);
  }, [selectedArea]);

  const formattedCoords = useMemo(() => {
    if (!selectedArea) return '';
    return formatGpsCoordinates(selectedArea.coordinates.lat, selectedArea.coordinates.lng);
  }, [selectedArea]);

  // Clipboard copy helper
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopySlug = async () => {
    if (!selectedArea) return;
    const ok = await copyToClipboard(selectedArea.id);
    if (ok) {
      setSlugCopied(true);
      if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current);
      slugTimeoutRef.current = setTimeout(() => setSlugCopied(false), 2000);
    }
  };

  const handleCopyCoords = async () => {
    const coords = reverseGeoPoint?.clicked || selectedArea?.coordinates;
    if (!coords) return;
    const coordsStr = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    const ok = await copyToClipboard(coordsStr);
    if (ok) {
      setCoordsCopied(true);
      if (coordsTimeoutRef.current) clearTimeout(coordsTimeoutRef.current);
      coordsTimeoutRef.current = setTimeout(() => setCoordsCopied(false), 2000);
    }
  };

  // Keyboard escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArea || reverseGeoPoint) {
          setSelectedArea(null);
          setReverseGeoPoint(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArea, reverseGeoPoint, onClose]);


  return (
    <div
      className={`fixed inset-0 w-screen h-screen z-50 bg-[#0b0f17] overflow-hidden ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Full-Screen GeoData Studio"
    >
      {/* 100% Full-Bleed Map Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <MapCanvas
          areas={filteredAreas}
          selectedArea={selectedArea}
          selectedCity={selectedCity}
          reverseGeoPoint={reverseGeoPoint}
          onSelectArea={handleSelectArea}
          onReverseGeoChange={handleReverseGeoChange}
          lang={lang}
        />
      </div>


      {/* Top Floating Glass HUD Bar - Responsive 2-row layout on mobile, single row on desktop */}
      <header className="absolute top-3 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Back Button + GeoData Studio Heading (Order 1 on mobile & desktop) */}
        <div className="order-1 flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="pressable h-9 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-xl glass-chrome border border-white/10 hover:border-white/20 text-xs font-mono font-medium text-neutral-200 hover:text-white transition-all cursor-pointer shadow-xl"
            title="Back (Esc)"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Back</span>
          </button>

          <div className="h-9 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl glass-chrome border border-white/10 shadow-xl">
            <span className="text-base select-none" role="img" aria-label="Pakistan flag">🇵🇰</span>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-mono whitespace-nowrap hidden sm:inline">
              GeoData Studio
            </span>
            <span className="text-xs font-bold tracking-tight text-white font-mono whitespace-nowrap sm:hidden">
              GeoData
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>{PACKAGE_VERSION}</span>
            </div>
          </div>
        </div>

        {/* Right: Bilingual Segmented Toggle & Matched-Height GitHub Button (Order 2 on mobile, Order 3 on desktop) */}
        <div className="order-2 sm:order-3 flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <div
            role="radiogroup"
            aria-label="Language selector"
            className="h-9 inline-flex items-center p-0.5 sm:p-1 rounded-xl glass-chrome border border-white/10 shadow-xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'en'}
              onClick={() => setLang('en')}
              className={`pressable h-full px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer flex items-center ${
                lang === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
            >
              English
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'ur'}
              onClick={() => setLang('ur')}
              className={`pressable h-full px-2 sm:px-3 rounded-lg text-xs font-nastaliq transition-all duration-150 cursor-pointer flex items-center leading-tight ${
                lang === 'ur'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white border border-transparent'
              }`}
            >
              اردو
            </button>
          </div>

          <a
            href="https://github.com/sohaibbinmohsin/pak-geodata"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable h-9 inline-flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl glass-chrome border border-white/10 hover:border-white/20 text-xs font-medium text-neutral-200 hover:text-white transition-all shadow-xl"
            title="Star pak-geodata on GitHub"
          >
            <Github className="w-4 h-4 text-neutral-300" />
            <span className="hidden lg:inline">GitHub</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 hidden sm:inline" />
          </a>
        </div>

        {/* Center/Second Row: Search Omnibar with Option A City Filter to its Right (Order 3 full-width on mobile, Order 2 flex-1 on desktop) */}
        <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-2xl sm:mx-2 pointer-events-auto">
          <Omnibar
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            onSelectArea={handleSelectArea}
            onSelectCity={handleSelectCity}
            onSuggestionClick={handleSuggestionClick}
            showSuggestions={false}
            lang={lang}
            onSearchOpenChange={setIsSearchOpen}
          />
        </div>
      </header>


      {/* Floating Slide-in Area Inspector Drawer on the right */}
      {selectedArea && (
        <aside
          role="dialog"
          aria-label={`Area inspector for ${selectedArea.name}`}
          className={`absolute right-4 top-28 sm:top-20 bottom-4 w-96 max-w-[calc(100vw-2rem)] overflow-y-auto glass-chrome rounded-2xl border border-white/10 p-5 shadow-2xl z-30 space-y-4 animate-slide-up select-none pointer-events-auto no-scrollbar ${
            isSearchOpen ? 'hidden sm:block' : ''
          }`}
        >
          {/* Top Bar: Verification Badge & Close Button */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              {selectedArea.verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Data</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-neutral-300 text-[11px] font-mono">
                  Area Inspector
                </span>
              )}
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                • {selectedArea.cityId}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedArea(null);
                setReverseGeoPoint(null);
              }}
              className="pressable p-1 -mr-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close area inspector"
              title="Close inspector (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Administrative Hierarchy Breadcrumbs */}
          {hierarchyNames && (
            <nav
              aria-label="Administrative hierarchy breadcrumb"
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 flex-wrap px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10"
              dir={lang === 'ur' ? 'rtl' : 'ltr'}
            >
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans select-none">
                {lang === 'ur' ? 'انتظامی درجہ بندی:' : 'Hierarchy:'}
              </span>
              <span className="text-neutral-300 font-medium">{hierarchyNames.provinceName}</span>
              <span className="text-neutral-600 select-none">&gt;</span>
              <span className="text-neutral-300 font-medium">{hierarchyNames.cityName}</span>
              <span className="text-neutral-600 select-none">&gt;</span>
              <span className="text-emerald-400 font-semibold">{hierarchyNames.areaName}</span>
            </nav>
          )}

          {/* Header: English Name & Native Urdu Nastaliq */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug select-text">
              {selectedArea.name}
            </h2>
            {selectedArea.urduName && (
              <div
                dir="rtl"
                className="text-right font-nastaliq text-emerald-400 text-lg leading-relaxed select-text"
              >
                {selectedArea.urduName}
              </div>
            )}
          </div>

          {/* Canonical Slug Chip with 1-Click Copy */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 shrink-0">
                Slug:
              </span>
              <code
                className="text-xs font-mono text-emerald-300 truncate select-text"
                title={`Canonical slug: ${selectedArea.id}`}
              >
                {selectedArea.id}
              </code>
            </div>
            <button
              type="button"
              onClick={handleCopySlug}
              className={`pressable shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono ${
                slugCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
              }`}
              aria-label={slugCopied ? 'Slug copied' : 'Copy canonical slug'}
              title="Copy slug"
            >
              {slugCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                  <span className="text-[10px] font-semibold text-emerald-300">Copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Badges Row: City, Province, Type, Postal Code */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{selectedAreaCity?.name || selectedArea.cityId}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
              <Building className="w-3 h-3 text-neutral-400" />
              <span>{selectedAreaProvince?.name || selectedArea.provinceId}</span>
            </span>

            {selectedArea.type && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 capitalize font-mono text-[11px]">
                {selectedArea.type.replace(/_/g, ' ')}
              </span>
            )}

            {selectedArea.postalCode && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 font-mono text-[11px]"
                title="Pakistan Post 5-Digit Postal Code"
              >
                <span>📮</span>
                <span>{selectedArea.postalCode}</span>
              </span>
            )}

            {locationItem && (
              <span className="inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                {locationItem.type}
              </span>
            )}
          </div>

          {/* GPS Coordinates with Copy Button */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span
                className="font-mono text-neutral-300 select-text truncate"
                title={`GPS Coordinates: ${formattedCoords}`}
              >
                {formattedCoords}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCoords}
              className={`pressable shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono ${
                coordsCopied
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
              }`}
              aria-label={coordsCopied ? 'Coordinates copied' : 'Copy coordinates'}
              title="Copy GPS coordinates"
            >
              {coordsCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400 animate-pop" />
                  <span className="text-[10px] font-semibold text-cyan-300">Copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Colloquial Aliases Tags */}
          {selectedArea.aliases && selectedArea.aliases.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-neutral-500" />
                <span>Colloquial Aliases ({selectedArea.aliases.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedArea.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center text-xs font-mono text-neutral-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md"
                  >
                    "{alias}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Reverse Geocoding Banner when opened from map tap (after colloquial aliases) */}
          {reverseGeoPoint && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2.5 animate-pop select-none shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {lang === 'ur' ? 'ریورس جیو کوڈنگ' : 'Reverse Geocoding'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
                  &lt; 0.4 ms
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">GPS:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 select-text">{formatCoordinates(reverseGeoPoint.clicked)}</span>
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy GPS coordinates"
                    >
                      {coordsCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">Distance:</span>
                  <span className="text-cyan-300 font-semibold">{formatDistance(reverseGeoPoint.distanceKm)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Code Generator (TypeScript / Python) */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Live Client Code
            </div>
            <CodeGenerator area={selectedArea} lang={lang} reverseGeoPoint={reverseGeoPoint} />
          </div>
        </aside>
      )}
    </div>
  );
}

