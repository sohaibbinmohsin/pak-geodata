import { useState, useEffect, useRef, useMemo } from 'react';
import {
  searchAreas,
  findAreasByPostalCode,
  getAllAreas,
  type PakistanArea,
  type PakistanCity,
} from 'pak-geodata';
import { Search, X, CornerDownLeft, MapPin } from 'lucide-react';

export interface OmnibarProps {
  selectedCity: PakistanCity | null;
  selectedArea?: PakistanArea | null;
  onSelectArea: (area: PakistanArea) => void;
  onSelectCity?: (city: PakistanCity | null) => void;
  className?: string;
}

import { getMatchBadge, type MatchBadgeInfo } from './matchBadge';
export { getMatchBadge, type MatchBadgeInfo };

export default function Omnibar({
  selectedCity,
  selectedArea,
  onSelectArea,
  onSelectCity,
  className = '',
}: OmnibarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync input text when selectedArea changes from external interaction (e.g. map click)
  useEffect(() => {
    if (selectedArea && !isOpen) {
      setQuery(selectedArea.name);
    }
  }, [selectedArea, isOpen]);

  // Real-time client-side search execution
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const cityOption = selectedCity ? { cityId: selectedCity.id } : undefined;
    let list = searchAreas(trimmed, { ...cityOption, limit: 12 });

    // If query has digits (e.g. "54000" or "54"), merge postal code matches
    if (/^\d{2,5}$/.test(trimmed)) {
      const allPostalMatches = findAreasByPostalCode(trimmed);
      const scopedPostalMatches = selectedCity
        ? allPostalMatches.filter((a) => a.cityId === selectedCity.id)
        : allPostalMatches;

      // Also match prefix postal codes if exact matches are few
      let prefixPostalMatches: PakistanArea[] = [];
      if (scopedPostalMatches.length === 0) {
        const pool = selectedCity
          ? getAllAreas().filter((a) => a.cityId === selectedCity.id)
          : getAllAreas();
        prefixPostalMatches = pool.filter(
          (a) => a.postalCode && a.postalCode.startsWith(trimmed)
        );
      }

      const combined = [...scopedPostalMatches, ...prefixPostalMatches];
      const existingIds = new Set(list.map((a) => a.id));
      const additions = combined.filter((a) => !existingIds.has(a.id));
      list = [...additions, ...list].slice(0, 12);
    }

    return list;
  }, [query, selectedCity]);

  // Reset selectedIndex whenever results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

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
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
  };

  const selectItem = (area: PakistanArea) => {
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

  const placeholderText = selectedCity
    ? `Search in ${selectedCity.name} (e.g. F-6, Blue Area, 44000)...`
    : 'Search 189 areas across Pakistan (e.g. DHA, ماڈل ٹاؤن, 54000)...';

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-xl pointer-events-auto ${className}`}
    >
      {/* Centered Floating Glass Capsule */}
      <div
        className={`glass-chrome relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-200 ${
          isOpen && results.length > 0
            ? 'ring-2 ring-emerald-500/40 border-emerald-500/50 shadow-2xl'
            : 'hover:border-white/20 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/50'
        }`}
      >
        <Search className="w-4 h-4 text-emerald-400 shrink-0 select-none" />

        {/* Selected City Scoping Badge */}
        {selectedCity && (
          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium shrink-0 select-none">
            <MapPin className="w-3 h-3" />
            <span>{selectedCity.name}</span>
            {onSelectCity && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCity(null);
                }}
                className="hover:text-white transition-colors cursor-pointer"
                title="Clear city scope"
                aria-label="Clear city scope"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

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
                className="overflow-y-auto divide-y divide-white/5 p-1.5 focus:outline-none"
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
                          {/* Match Reason Badge */}
                          <span
                            className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border leading-none font-medium ${badge.colorClass}`}
                          >
                            {badge.label}
                          </span>

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
