import { useState, useMemo } from 'react';
import {
  getAllProvinces,
  getAllCities,
  getAreasByCity,
  toWesternDigits,
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

  // Filtered cities list
  const filteredCities = useMemo(() => {
    let result = allCities;

    if (selectedProvinceFilter !== 'all') {
      result = result.filter((c) => c.provinceId === selectedProvinceFilter);
    }

    if (searchQuery.trim()) {
      const q = toWesternDigits(searchQuery).toLowerCase().trim();
      const num = parseInt(q, 10);
      const isNum = !isNaN(num) && /^\d+$/.test(q);
      result = result.filter((c) => {
        const matchesBasic =
          c.name.toLowerCase().includes(q) ||
          c.urduName.includes(q) ||
          c.district.toLowerCase().includes(q) ||
          (c.postalCodeRange &&
            (c.postalCodeRange[0].includes(q) || c.postalCodeRange[1].includes(q)));
        if (matchesBasic) return true;
        if (isNum && c.postalCodeRange) {
          const min = parseInt(c.postalCodeRange[0], 10);
          const max = parseInt(c.postalCodeRange[1], 10);
          if (!isNaN(min) && !isNaN(max) && min <= num && num <= max) {
            return true;
          }
        }
        return false;
      });
    }

    // Sort: flagship cities first, then alphabetical
    return [...result].sort((a, b) => {
      const aFlag = FLAGSHIP_CITY_IDS.has(a.id) ? 1 : 0;
      const bFlag = FLAGSHIP_CITY_IDS.has(b.id) ? 1 : 0;
      if (aFlag !== bFlag) return bFlag - aFlag;
      return a.name.localeCompare(b.name);
    });
  }, [allCities, selectedProvinceFilter, searchQuery]);

  return (
    <section
      id="coverage"
      className={`relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 ${className}`}
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
          <Database className="w-3.5 h-3.5" />
          <span>Dataset Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Comprehensive Metropolitan Coverage
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 mt-3 leading-relaxed">
          Curated across 7 provinces, 40 verified cities, and 189 foundational metropolitan areas with district bounds and postal codes.
        </p>
      </div>

      {/* All 40 Cities Master Dataset Directory */}
      <div className="glass-chrome rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Controls Bar: Title & Search */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Full City Directory (40 Verified Cities)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Showing {filteredCities.length} of {allCities.length} verified cities with bounding box coordinates and 5-digit postal code ranges.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, district, postal..."
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
        <div className="px-4 py-3 sm:px-6 bg-black/20 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto">
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
        <div className="block md:hidden divide-y divide-white/5 max-h-[560px] overflow-y-auto">
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
                <div key={city.id} className="p-4 space-y-2.5 hover:bg-white/[0.02] transition-colors">
                  {/* Top row: City name (English bold white, Urdu in Nastaliq text-emerald-300), Flagship badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans font-bold text-white text-base">
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
                  <div className="text-xs text-neutral-400 flex items-center flex-wrap gap-1.5 font-sans">
                    <span className="text-neutral-300">{provinceName}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-300">{city.district} District</span>
                    <span className="text-neutral-600">·</span>
                    <span className="font-mono text-neutral-500 text-[11px]">{city.id}</span>
                  </div>

                  {/* Third row: Postal code range pill */}
                  <div className="flex items-center gap-2 text-xs">
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
                  <div className="flex items-center justify-between pt-1.5 text-xs">
                    <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span>
                        {city.coordinates.lat.toFixed(4)}° N, {city.coordinates.lng.toFixed(4)}° E
                      </span>
                    </span>

                    {areasCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{areasCount} verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-500 text-[11px]">
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
                        <div className="flex items-center gap-2">
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
