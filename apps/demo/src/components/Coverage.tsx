import { useState, useMemo } from 'react';
import {
  getAllProvinces,
  getAllCities,
  getAreasByCity,
  toWesternDigits,
  CITY_COLLOQUIAL_ALIASES,
} from 'pak-geodata';
import {
  Database,
  MapPin,
  CheckCircle2,
  Search,
  Layers,
} from 'lucide-react';

export interface CoverageProps {
  className?: string;
}

const FLAGSHIP_CITY_IDS = new Set(['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad']);

export default function Coverage({ className = '' }: CoverageProps) {
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const provinces = useMemo(() => getAllProvinces(), []);
  const allCities = useMemo(() => getAllCities(), []);

  // Pre-index area names, aliases, and Urdu names per city for O(1) keyword and alias search
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
      const cityAreas = getAreasByCity(city.id);
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
  }, [allCities]);

  // Filtered cities list with background alias and area matching
  const filteredCities = useMemo(() => {
    let result = allCities;

    if (selectedProvinceFilter !== 'all') {
      result = result.filter((c) => c.provinceId === selectedProvinceFilter);
    }

    if (!searchQuery.trim()) {
      return [...result].sort((a, b) => {
        const aFlag = FLAGSHIP_CITY_IDS.has(a.id) ? 1 : 0;
        const bFlag = FLAGSHIP_CITY_IDS.has(b.id) ? 1 : 0;
        if (aFlag !== bFlag) return bFlag - aFlag;
        return a.name.localeCompare(b.name);
      });
    }

    const q = toWesternDigits(searchQuery).toLowerCase().trim();
    const num = parseInt(q, 10);
    const isNum = !isNaN(num) && /^\d+$/.test(q);

    const matchedList: (typeof allCities)[0][] = [];

    for (const c of result) {
      let isMatch = false;

      // 1. Direct city name, slug, district, or Urdu name
      if (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.urduName.includes(q)
      ) {
        isMatch = true;
      }

      // 2. Postal code range match
      if (!isMatch && isNum && c.postalCodeRange) {
        const min = parseInt(c.postalCodeRange[0], 10);
        const max = parseInt(c.postalCodeRange[1], 10);
        if (!isNaN(min) && !isNaN(max) && min <= num && num <= max) {
          isMatch = true;
        }
      }

      // 3. City colloquial aliases (e.g. isb, khi, lhe, pindi, fsd, lyallpur)
      if (!isMatch) {
        const cityAliases = CITY_COLLOQUIAL_ALIASES[c.id] || [];
        const matchedCityAlias = cityAliases.find(
          (al) => al.toLowerCase().includes(q) || q.includes(al.toLowerCase())
        );
        if (matchedCityAlias) {
          isMatch = true;
        }
      }

      // 4. Area aliases & area names within this city
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
        matchedList.push(c);
      }
    }

    // Sort: flagship cities first, then alphabetical
    return matchedList.sort((a, b) => {
      const aFlag = FLAGSHIP_CITY_IDS.has(a.id) ? 1 : 0;
      const bFlag = FLAGSHIP_CITY_IDS.has(b.id) ? 1 : 0;
      if (aFlag !== bFlag) return bFlag - aFlag;
      return a.name.localeCompare(b.name);
    });
  }, [allCities, selectedProvinceFilter, searchQuery, cityKeywordsMap]);

  return (
    <section
      id="coverage"
      className={`relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden ${className}`}
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 w-full min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
          <Database className="w-3.5 h-3.5" />
          <span>Dataset Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight break-words">
          Comprehensive Metropolitan Coverage
        </h2>
        <p className="text-xs sm:text-base text-neutral-400 mt-3 leading-relaxed break-words">
          Curated across {provinces.length} provinces and {allCities.length} verified cities with district bounds and postal codes.
        </p>
      </div>

      {/* All Cities Master Dataset Directory */}
      <div className="glass-chrome rounded-2xl border border-white/10 overflow-hidden w-full min-w-0 max-w-full">
        {/* Table Controls Bar: Title & Search */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div className="w-full md:w-auto min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
              <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Full City Directory ({allCities.length} Verified Cities)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 break-words">
              Showing {filteredCities.length} of {allCities.length} verified cities with bounding box coordinates and 5-digit postal code ranges.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64 min-w-0">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, alias, area, postal..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {selectedProvinceFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedProvinceFilter('all')}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 border border-white/10 transition-colors shrink-0"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Province Filter Chips */}
        <div className="px-3 py-2.5 sm:px-6 bg-black/20 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto w-full min-w-0 max-w-full no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setSelectedProvinceFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              selectedProvinceFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-neutral-400 border border-white/5 hover:border-white/15 hover:text-white'
            }`}
          >
            All ({allCities.length})
          </button>
          {provinces.map((prov) => {
            const isSelected = selectedProvinceFilter === prov.id;
            const count = allCities.filter((c) => c.provinceId === prov.id).length;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => setSelectedProvinceFilter(prov.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-neutral-400 border border-white/5 hover:border-white/15 hover:text-white'
                }`}
              >
                {prov.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Mobile Responsive Cards List (< 768px) */}
        <div className="block md:hidden divide-y divide-white/5 max-h-[560px] overflow-y-auto w-full min-w-0 no-scrollbar">
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              No cities match your search criteria.
            </div>
          ) : (
            filteredCities.map((city) => {
              const isFlagship = FLAGSHIP_CITY_IDS.has(city.id);
              const cityAreas = getAreasByCity(city.id);
              const areasCount = cityAreas.length;
              const provinceName = provinces.find((p) => p.id === city.provinceId)?.name || city.provinceId;

              return (
                <div key={city.id} className="p-3.5 sm:p-4 space-y-2.5 hover:bg-white/[0.02] transition-colors w-full min-w-0">
                  {/* Top row: City name (English bold white, Urdu in Nastaliq text-emerald-300), Flagship badge */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                      <span className="font-sans font-bold text-white text-base truncate">
                        {city.name}
                      </span>
                      <span className="font-nastaliq text-emerald-300 text-sm" dir="rtl">
                        {city.urduName}
                      </span>
                    </div>
                    {isFlagship && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                        Flagship
                      </span>
                    )}
                  </div>

                  {/* Second row: Province name, District name, and City slug */}
                  <div className="text-xs text-neutral-400 flex items-center flex-wrap gap-1.5 font-sans min-w-0 break-words">
                    <span className="text-neutral-300">{provinceName}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-300">{city.district} District</span>
                    <span className="text-neutral-600">·</span>
                    <span className="font-mono text-neutral-500 text-[11px]">{city.id}</span>
                  </div>

                  {/* Third row: Postal code range pill */}
                  <div className="flex items-center gap-2 text-xs flex-wrap min-w-0">
                    <span className="text-neutral-500 text-[11px] font-mono">Postal Range:</span>
                    {city.postalCodeRange ? (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-mono text-[11px]">
                        {city.postalCodeRange[0]} - {city.postalCodeRange[1]}
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-mono text-[11px]">N/A</span>
                    )}
                  </div>

                  {/* Bottom row: GPS Centroid and Status badge */}
                  <div className="flex items-center justify-between pt-1.5 text-xs flex-wrap gap-2 min-w-0">
                    <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="truncate">
                        {city.coordinates.lat.toFixed(4)}° N, {city.coordinates.lng.toFixed(4)}° E
                      </span>
                    </span>

                    {areasCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{areasCount} verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-500 text-[11px] shrink-0">
                        Bounds ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Responsive Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-[#0f141f] font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">City &amp; Script</th>
                <th className="py-3 px-4">Province</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Postal Range</th>
                <th className="py-3 px-4">GPS Centroid</th>
                <th className="py-3 px-4">Bounding Box (Lat / Lng)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">
                    No cities match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const isFlagship = FLAGSHIP_CITY_IDS.has(city.id);
                  const cityAreas = getAreasByCity(city.id);
                  const areasCount = cityAreas.length;
                  const provinceName = provinces.find((p) => p.id === city.provinceId)?.name || city.provinceId;

                  return (
                    <tr
                      key={city.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* City & Script */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans font-semibold text-white text-sm">
                            {city.name}
                          </span>
                          <span className="font-nastaliq text-neutral-400 text-xs" dir="rtl">
                            {city.urduName}
                          </span>
                          {isFlagship && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              Flagship
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {city.id}
                        </div>
                      </td>

                      {/* Province */}
                      <td className="py-3.5 px-4 text-neutral-300 font-sans">
                        {provinceName}
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 text-neutral-300 font-sans">
                        {city.district}
                      </td>

                      {/* Postal Range */}
                      <td className="py-3.5 px-4 text-neutral-300 font-mono">
                        {city.postalCodeRange ? (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                            {city.postalCodeRange[0]} - {city.postalCodeRange[1]}
                          </span>
                        ) : (
                          <span className="text-neutral-500">N/A</span>
                        )}
                      </td>

                      {/* GPS Centroid */}
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                        {city.coordinates.lat.toFixed(4)}° N, {city.coordinates.lng.toFixed(4)}° E
                      </td>

                      {/* Bounding Box */}
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                        {city.bounds ? (
                          <span>
                            [{city.bounds.minLat.toFixed(2)}, {city.bounds.minLng.toFixed(2)}] to [{city.bounds.maxLat.toFixed(2)}, {city.bounds.maxLng.toFixed(2)}]
                          </span>
                        ) : (
                          <span className="text-neutral-500">N/A</span>
                        )}
                      </td>

                      {/* Areas Status */}
                      <td className="py-3.5 px-4 text-right">
                        {areasCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{areasCount} verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-500 text-[11px]">
                            Bounds ready
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
