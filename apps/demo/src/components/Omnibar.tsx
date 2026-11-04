import { useState, useEffect, useRef, useMemo } from 'react';
import {
  searchAreas,
  findAreasByPostalCode,
  getAllAreas,
  getAllCities,
  getCityById,
  CITY_COLLOQUIAL_ALIASES,
  type PakistanArea,
  type PakistanCity,
} from 'pak-geodata';
import { Search, X, CornerDownLeft, MapPin, ChevronDown } from 'lucide-react';

export const SUGGESTION_CHIPS = [
  { label: 'dha 5', query: 'dha 5', hint: 'Alias' },
  { label: '54000', query: '54000', hint: 'Postal' },
  { label: 'گلبرگ', query: 'گلبرگ', hint: 'Urdu' },
  { label: 'فیز ۳', query: 'فیز ۳', hint: 'Eastern Numerals' },
] as const;

export interface OmnibarProps {
  selectedCity: PakistanCity | null;
  selectedArea?: PakistanArea | null;
  onSelectArea: (area: PakistanArea) => void;
  onSelectCity?: (city: PakistanCity | null) => void;
  onSuggestionClick?: (query: string) => void;
  showSuggestions?: boolean;
  lang?: 'en' | 'ur';
  className?: string;
  onSearchOpenChange?: (isOpen: boolean) => void;
}

import { getMatchBadge, type MatchBadgeInfo } from './matchBadge';
export { getMatchBadge, type MatchBadgeInfo };

export default function Omnibar({
  selectedCity,
  selectedArea,
  onSelectArea,
  onSelectCity,
  onSuggestionClick,
  showSuggestions = true,
  lang = 'en',
  className = '',
  onSearchOpenChange,
}: OmnibarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Notify parent when search dropdown opens or closes
  useEffect(() => {
    onSearchOpenChange?.(isOpen && query.trim().length > 0);
  }, [isOpen, query, onSearchOpenChange]);

  // Scalable City Filter Dropdown state (Option A)
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allCities = useMemo(() => getAllCities(), []);
  const allAreas = useMemo(() => getAllAreas(), []);

  // Compute area counts per city
  const cityAreaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of allAreas) {
      map[a.cityId] = (map[a.cityId] || 0) + 1;
    }
    return map;
  }, [allAreas]);

  // Pre-index area names, aliases, and Urdu names per city for O(1) keyword and alias search in city dropdown
  const cityKeywordsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        areaNames: { name: string; lower: string }[];
        areaAliases: { alias: string; lower: string }[];
        areaUrdu: string[];
      }
    >();
    for (const city of allCities) {
      const cityAreas = allAreas.filter((a) => a.cityId === city.id);
      const areaNames: { name: string; lower: string }[] = [];
      const areaAliases: { alias: string; lower: string }[] = [];
      const areaUrdu: string[] = [];
      for (const a of cityAreas) {
        areaNames.push({ name: a.name, lower: a.name.toLowerCase() });
        if (a.urduName) areaUrdu.push(a.urduName);
        for (const al of a.aliases || []) {
          areaAliases.push({ alias: al, lower: al.toLowerCase() });
        }
      }
      map.set(city.id, { areaNames, areaAliases, areaUrdu });
    }
    return map;
  }, [allCities, allAreas]);

  // Filtered and sorted cities list for dropdown with background alias and area support
  const filteredCitiesList = useMemo(() => {
    const q = citySearchQuery.trim().toLowerCase();
    if (!q) {
      return [...allCities].sort((a, b) => {
        const countA = cityAreaCounts[a.id] || 0;
        const countB = cityAreaCounts[b.id] || 0;
        if (countB !== countA) return countB - countA;
        return a.name.localeCompare(b.name);
      });
    }

    const matched: PakistanCity[] = [];
    for (const c of allCities) {
      let isMatch = false;

      // 1. Direct name, slug, district, urduName, provinceId
      if (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.urduName && c.urduName.includes(q)) ||
        c.provinceId.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
      ) {
        isMatch = true;
      }

      // 2. City colloquial aliases (e.g. isb, khi, lhe, pindi, fsd, lyallpur)
      if (!isMatch) {
        const cityAliases = CITY_COLLOQUIAL_ALIASES[c.id] || [];
        const matchedCityAlias = cityAliases.find(
          (al) => al.toLowerCase().includes(q) || q.includes(al.toLowerCase())
        );
        if (matchedCityAlias) {
          isMatch = true;
        }
      }

      // 3. Area aliases and names in this city
      if (!isMatch) {
        const kw = cityKeywordsMap.get(c.id);
        if (kw) {
          const matchedAreaAlias = kw.areaAliases.find(
            (al) => al.lower.includes(q) || q.includes(al.lower)
          );
          if (matchedAreaAlias) {
            isMatch = true;
          } else {
            const matchedAreaName = kw.areaNames.find(
              (nm) => nm.lower.includes(q) || q.includes(nm.lower)
            );
            if (matchedAreaName) {
              isMatch = true;
            } else {
              const matchedUrdu = kw.areaUrdu.find((ur) => ur.includes(q) || q.includes(ur));
              if (matchedUrdu) {
                isMatch = true;
              }
            }
          }
        }
      }

      if (isMatch) {
        matched.push(c);
      }
    }

    return matched.sort((a, b) => {
      const countA = cityAreaCounts[a.id] || 0;
      const countB = cityAreaCounts[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [allCities, citySearchQuery, cityAreaCounts, cityKeywordsMap]);

  // Sync input text when selectedArea changes from external interaction (e.g. map click)
  useEffect(() => {
    if (selectedArea && !isOpen) {
      setQuery(selectedArea.name);
    }
  }, [selectedArea, isOpen]);

  // Real-time client-side search execution supporting aliases and cross-city fallback
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const cityOption = selectedCity ? { cityId: selectedCity.id } : undefined;
    let list = searchAreas(trimmed, { ...cityOption, limit: 12 });

    // Cross-city fallback: if a city filter is active but produced 0 results,
    // search globally so aliases in other cities (e.g. searching "Clifton" while in Lahore) still resolve
    if (selectedCity && list.length === 0) {
      const globalMatches = searchAreas(trimmed, { limit: 12 });
      if (globalMatches.length > 0) {
        list = globalMatches;
      }
    }

    // If query has digits (e.g. "54000" or "54"), merge postal code matches
    if (/^\d{2,5}$/.test(trimmed)) {
      const allPostalMatches = findAreasByPostalCode(trimmed);
      const scopedPostalMatches = selectedCity
        ? allPostalMatches.filter((a) => a.cityId === selectedCity.id)
        : allPostalMatches;

      const postalCandidates = scopedPostalMatches.length > 0 ? scopedPostalMatches : allPostalMatches;

      // Also match prefix postal codes if exact matches are few
      let prefixPostalMatches: PakistanArea[] = [];
      if (postalCandidates.length === 0) {
        const pool = selectedCity
          ? allAreas.filter((a) => a.cityId === selectedCity.id)
          : allAreas;
        prefixPostalMatches = pool.filter(
          (a) => a.postalCode && a.postalCode.startsWith(trimmed)
        );
      }

      const combined = [...postalCandidates, ...prefixPostalMatches];
      const existingIds = new Set(list.map((a) => a.id));
      const additions = combined.filter((a) => !existingIds.has(a.id));
      list = [...additions, ...list].slice(0, 12);
    }

    return list;
  }, [query, selectedCity, allAreas]);

  // Reset selectedIndex whenever results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view during arrow key navigation
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // Global Keyboard Shortcuts (⌘K, /, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K shortcut
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
        return;
      }

      // '/' shortcut to search when not typing in an input/textarea
      if (e.key === '/') {
        const target = document.activeElement;
        const isInputField =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.getAttribute('contenteditable') === 'true';

        if (!isInputField) {
          e.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Navigation inside input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
      } else if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && results.length > 0) {
        const chosen = results[selectedIndex] || results[0];
        if (chosen) {
          selectItem(chosen);
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (isCityDropdownOpen) {
        setIsCityDropdownOpen(false);
        return;
      }
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
  };


  const selectItem = (area: PakistanArea) => {
    if (selectedCity && area.cityId !== selectedCity.id && onSelectCity) {
      onSelectCity(getCityById(area.cityId) || null);
    }
    onSelectArea(area);
    setQuery(area.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestionQuery: string) => {
    // If a city filter is active, verify if query yields results within this city
    if (selectedCity && onSelectCity) {
      const scopedMatches = searchAreas(suggestionQuery, { cityId: selectedCity.id, limit: 1 });
      const scopedPostal = /^\d{2,5}$/.test(suggestionQuery)
        ? findAreasByPostalCode(suggestionQuery).filter((a) => a.cityId === selectedCity.id)
        : [];

      // If no matches in active city, switch to matching city or clear filter
      if (scopedMatches.length === 0 && scopedPostal.length === 0) {
        let match: PakistanArea | undefined;
        if (/^\d{2,5}$/.test(suggestionQuery)) {
          const postalList = findAreasByPostalCode(suggestionQuery);
          match = postalList[0];
        }
        if (!match) {
          const globalMatches = searchAreas(suggestionQuery, { limit: 1 });
          match = globalMatches[0];
        }

        if (match) {
          const matchingCity = getCityById(match.cityId);
          onSelectCity(matchingCity || null);
        } else {
          onSelectCity(null);
        }
      }
    }

    setQuery(suggestionQuery);
    setIsOpen(true);
    inputRef.current?.focus();
    onSuggestionClick?.(suggestionQuery);
  };

  void showSuggestions;
  void handleSuggestionClick;

  const placeholderText = selectedCity
    ? `Search in ${selectedCity.name} (e.g. F-6, Blue Area, 44000)...`
    : 'Search areas across Pakistan (e.g. DHA, ماڈل ٹاؤن, 54000)...';

  return (
    <div
      ref={containerRef}
      className={`relative w-full pointer-events-auto flex items-center gap-2 ${className}`}
    >
      {/* Search Input Capsule (flex-1) */}
      <div
        className={`glass-chrome relative flex-1 min-w-0 flex items-center gap-2 px-2.5 sm:px-3 h-9 rounded-xl transition-all duration-200 ${
          isOpen && results.length > 0
            ? 'ring-2 ring-emerald-500/40 border-emerald-500/50 shadow-2xl'
            : 'hover:border-white/20 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/50'
        }`}
      >
        <Search className="w-4 h-4 text-emerald-400 shrink-0 select-none" />

        {/* Real-time Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholderText}
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-neutral-500 focus:outline-none tracking-tight font-sans selection:bg-emerald-500/30"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="omnibar-results"
        />

        {/* Clear Button or Keyboard Shortcut Hint */}
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="pressable p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors select-none"
            title="Clear search (Esc)"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 select-none pointer-events-none">
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400 tracking-wide">
              ⌘K
            </kbd>
            <span className="text-[10px] text-neutral-600">or</span>
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Option A Scalable City Filter Selector on the RIGHT of search bar */}
      {onSelectCity && (
        <div className="relative shrink-0" ref={cityDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCityDropdownOpen((prev) => !prev)}
            className="pressable h-9 inline-flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl glass-chrome border border-white/10 hover:border-white/20 text-emerald-300 text-xs font-medium cursor-pointer transition-all select-none shadow-xl"
            title="Filter by city"
            aria-label={`Filter by city: currently ${selectedCity ? selectedCity.name : 'All Pakistan'}`}
            aria-expanded={isCityDropdownOpen}
            aria-haspopup="listbox"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold max-w-[70px] sm:max-w-[120px] truncate">
              {selectedCity ? selectedCity.name : (lang === 'ur' ? 'تمام پاکستان' : 'All Pakistan')}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">
              ({selectedCity ? (cityAreaCounts[selectedCity.id] || 0) : allAreas.length})
            </span>
            <ChevronDown className={`w-3 h-3 text-emerald-400 shrink-0 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* City Dropdown Menu Popover */}
          {isCityDropdownOpen && (
            <div
              role="dialog"
              aria-label="City filter menu"
              className="glass-chrome absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-white/15 shadow-2xl p-2 z-50 animate-pop text-left"
            >
              {/* Search city filter inside dropdown */}
              <div className="relative mb-2 px-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="Filter 79 cities..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  autoFocus
                />
              </div>

              {/* All Pakistan Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectCity(null);
                  setIsCityDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  !selectedCity
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span role="img" aria-label="Pakistan flag">🇵🇰</span>
                  <span>{lang === 'ur' ? 'تمام پاکستان' : 'All Pakistan'}</span>
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {allAreas.length} areas
                </span>
              </button>

              <div className="my-1.5 border-t border-white/10" />

              {/* Scrollable list of 79 cities */}
              <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1 divide-y divide-white/5 no-scrollbar">
                {filteredCitiesList.map((c) => {
                  const areaCount = cityAreaCounts[c.id] || 0;
                  const isCurrent = selectedCity?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCity(c);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{c.name}</span>
                        {c.urduName && (
                          <span className="text-[11px] font-nastaliq text-emerald-400/80 shrink-0">
                            {c.urduName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] text-neutral-500 uppercase">{c.provinceId}</span>
                        {areaCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                            {areaCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-600 font-mono">0</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}



      {/* Live Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="omnibar-results"
          className="glass-chrome absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/15 animate-pop"
          style={{ maxHeight: 'min(70vh, 420px)' }}
        >
          {results.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="px-3.5 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-neutral-400 select-none">
                <span className="font-medium text-neutral-300">
                  {results.length} {results.length === 1 ? 'area' : 'areas'} found
                  {selectedCity ? ` in ${selectedCity.name}` : ''}
                </span>
                <span className="font-mono text-[10px] text-neutral-500 hidden sm:inline">
                  ↑↓ navigate • ↵ select • esc close
                </span>
              </div>

              {/* Scrollable Results List */}
              <ul
                ref={listRef}
                role="listbox"
                className="overflow-y-auto divide-y divide-white/5 p-1.5 focus:outline-none no-scrollbar"
                style={{ maxHeight: '330px' }}
              >
                {results.map((area, index) => {
                  const isSelected = index === selectedIndex;
                  const badge = getMatchBadge(area, query);

                  return (
                    <li
                      key={area.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectItem(area)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`pressable p-2.5 rounded-xl transition-all duration-150 cursor-pointer select-none flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/35 text-white'
                          : 'hover:bg-white/5 border border-transparent text-neutral-300'
                      }`}
                    >
                      {/* Left: Names & Match Badges */}
                      <div className="flex flex-col gap-1 min-w-0">
                        {/* Primary English Name + Native Urdu Nastaliq */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                            {area.name}
                          </span>

                          {area.urduName && (
                            <span
                              className="font-nastaliq text-sm text-emerald-400 dir-rtl shrink-0 leading-none pt-0.5"
                              title={`Urdu: ${area.urduName}`}
                            >
                              {area.urduName}
                            </span>
                          )}
                        </div>

                        {/* Metadata Pills: Match Reason, City, Postal Code, Area Type */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Match Reason Badge (hide alias tags in search results) */}
                          {badge.type !== 'alias' && (
                            <span
                              className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border leading-none font-medium ${badge.colorClass}`}
                            >
                              {badge.label}
                            </span>
                          )}

                          {/* City Badge */}
                          <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-neutral-300 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded leading-none">
                            {area.cityId}
                          </span>

                          {/* Postal Code Badge */}
                          {area.postalCode && (
                            <span className="inline-flex items-center text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded leading-none">
                              📮 {area.postalCode}
                            </span>
                          )}

                          {/* Area Type */}
                          {area.type && (
                            <span className="text-[10px] font-mono text-neutral-500 hidden md:inline">
                              • {area.type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Selection Action Indicator */}
                      <div className="shrink-0 flex items-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded transition-opacity duration-150 ${
                            isSelected
                              ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 opacity-100'
                              : 'opacity-0'
                          }`}
                        >
                          <span className="hidden sm:inline">Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            /* Empty State */
            <div className="p-6 text-center space-y-1 select-none">
              <div className="text-sm font-medium text-neutral-300">
                No verified areas found
              </div>
              <div className="text-xs text-neutral-500">
                {selectedCity
                  ? `No areas in ${selectedCity.name} match "${query}". Try searching all cities.`
                  : `No areas match "${query}". Try searching by English name, Urdu, alias, or postal code.`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
