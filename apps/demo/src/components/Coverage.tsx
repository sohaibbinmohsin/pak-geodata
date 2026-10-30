import { useState, useMemo } from 'react';
import {
  getAllProvinces,
  getAllCities,
  getAllAreas,
  getAreasByCity,
  toWesternDigits,
} from 'pak-geodata';
import {
  Database,
  Building2,
  MapPin,
  CheckCircle2,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface CoverageProps {
  className?: string;
}

// ISO 3166-2:PK standardized province catalog base metadata
interface ProvinceBaseInfo {
  id: string;
  name: string;
  urduName: string;
  isoCode: string;
  type: string;
  capital: string;
}

const PROVINCES_BASE_CATALOG: ProvinceBaseInfo[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    urduName: 'پنجاب',
    isoCode: 'PK-PB',
    type: 'Province',
    capital: 'Lahore',
  },
  {
    id: 'sindh',
    name: 'Sindh',
    urduName: 'سندھ',
    isoCode: 'PK-SD',
    type: 'Province',
    capital: 'Karachi',
  },
  {
    id: 'kpk',
    name: 'Khyber Pakhtunkhwa',
    urduName: 'خیبر پختونخوا',
    isoCode: 'PK-KP',
    type: 'Province',
    capital: 'Peshawar',
  },
  {
    id: 'balochistan',
    name: 'Balochistan',
    urduName: 'بلوچستان',
    isoCode: 'PK-BA',
    type: 'Province',
    capital: 'Quetta',
  },
  {
    id: 'islamabad-ict',
    name: 'Islamabad Capital Territory',
    urduName: 'وفاقی دارالحکومت اسلام آباد',
    isoCode: 'PK-IS',
    type: 'Federal Capital',
    capital: 'Islamabad',
  },
  {
    id: 'ajk',
    name: 'Azad Jammu and Kashmir',
    urduName: 'آزاد جموں و کشمیر',
    isoCode: 'PK-JK',
    type: 'Autonomous Territory',
    capital: 'Muzaffarabad',
  },
  {
    id: 'gilgit-baltistan',
    name: 'Gilgit-Baltistan',
    urduName: 'گلگت بلتستان',
    isoCode: 'PK-GB',
    type: 'Autonomous Territory',
    capital: 'Gilgit',
  },
];

// Phase 1 Flagship Metros summary base metadata
interface FlagshipMetroBaseInfo {
  id: string;
  name: string;
  urduName: string;
  province: string;
  district: string;
  postalRange: string;
  centroid: string;
  bounds: string;
}

const FLAGSHIP_METROS_BASE: FlagshipMetroBaseInfo[] = [
  {
    id: 'karachi',
    name: 'Karachi',
    urduName: 'کراچی',
    province: 'Sindh',
    district: 'Karachi',
    postalRange: '74000 - 75999',
    centroid: '24.8607° N, 67.0011° E',
    bounds: '[24.75, 66.85] to [25.15, 67.35]',
  },
  {
    id: 'lahore',
    name: 'Lahore',
    urduName: 'لاہور',
    province: 'Punjab',
    district: 'Lahore',
    postalRange: '54000 - 54999',
    centroid: '31.5204° N, 74.3587° E',
    bounds: '[31.30, 74.15] to [31.70, 74.55]',
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    urduName: 'اسلام آباد',
    province: 'Islamabad Capital Territory',
    district: 'Islamabad',
    postalRange: '44000 - 45999',
    centroid: '33.6844° N, 73.0479° E',
    bounds: '[33.58, 72.85] to [33.78, 73.20]',
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    urduName: 'راولپنڈی',
    province: 'Punjab',
    district: 'Rawalpindi',
    postalRange: '46000 - 47999',
    centroid: '33.5651° N, 73.0169° E',
    bounds: '[33.45, 72.90] to [33.68, 73.18]',
  },
  {
    id: 'faisalabad',
    name: 'Faisalabad',
    urduName: 'فیصل آباد',
    province: 'Punjab',
    district: 'Faisalabad',
    postalRange: '38000 - 38999',
    centroid: '31.4504° N, 73.1350° E',
    bounds: '[31.32, 73.00] to [31.55, 73.22]',
  },
];

const FLAGSHIP_CITY_IDS = new Set(FLAGSHIP_METROS_BASE.map((m) => m.id));

export default function Coverage({ className = '' }: CoverageProps) {
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const provinces = useMemo(() => getAllProvinces(), []);
  const allCities = useMemo(() => getAllCities(), []);
  const allAreas = useMemo(() => getAllAreas(), []);

  // Dynamically derive province catalog counts from allCities and allAreas
  const provincesCatalog = useMemo(() => {
    return PROVINCES_BASE_CATALOG.map((prov) => {
      const citiesCount = allCities.filter((c) => c.provinceId === prov.id).length;
      const areasCount = allAreas.filter((a) => a.provinceId === prov.id).length;
      return {
        ...prov,
        citiesCount,
        areasCount,
      };
    });
  }, [allCities, allAreas]);

  // Dynamically derive flagship metros area counts from allAreas
  const flagshipMetros = useMemo(() => {
    return FLAGSHIP_METROS_BASE.map((metro) => ({
      ...metro,
      areasCount: allAreas.filter((a) => a.cityId === metro.id).length,
    }));
  }, [allAreas]);

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

      {/* Phase 1 Flagship Metros Status Ticker */}
      <div className="mb-10 p-5 sm:p-6 rounded-2xl glass-chrome border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Phase 1 Flagship Metros
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm text-neutral-300 mt-0.5 leading-relaxed">
              189 foundational areas verified across Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad. Expansion to secondary districts in progress.
            </p>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-xs text-neutral-400 font-mono">Provinces</div>
            <div className="text-base font-bold text-white font-mono">{provinces.length}</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-xs text-neutral-400 font-mono">Cities</div>
            <div className="text-base font-bold text-white font-mono">{allCities.length}</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-xs text-neutral-400 font-mono">Areas</div>
            <div className="text-base font-bold text-emerald-400 font-mono">{allAreas.length}</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-xs text-neutral-400 font-mono">Offline</div>
            <div className="text-base font-bold text-cyan-400 font-mono">100%</div>
          </div>
        </div>
      </div>

      {/* The 7 Provinces / Territories Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-400" />
            <span>The 7 Provinces &amp; Territories</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">ISO 3166-2:PK</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {provincesCatalog.map((prov) => {
            const isSelected = selectedProvinceFilter === prov.id;
            return (
              <div
                key={prov.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Filter by ${prov.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProvinceFilter((curr) => (curr === prov.id ? 'all' : prov.id));
                  }
                }}
                onClick={() =>
                  setSelectedProvinceFilter((curr) => (curr === prov.id ? 'all' : prov.id))
                }
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg'
                    : 'glass-chrome border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                    {prov.isoCode}
                  </span>
                  <span className="text-xs font-nastaliq text-neutral-300" dir="rtl">
                    {prov.urduName}
                  </span>
                </div>

                <div className="text-base font-bold text-white tracking-tight">{prov.name}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Capital: {prov.capital}</div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>{prov.citiesCount} cities</span>
                  <span
                    className={
                      prov.areasCount > 0 ? 'text-emerald-400 font-semibold' : 'text-neutral-500'
                    }
                  >
                    {prov.areasCount > 0 ? `${prov.areasCount} areas` : 'Bounds ready'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagship Metros Highlights Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Major Cities Summary (Phase 1 Flagships)</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono">
            {flagshipMetros.length} Metros · {allAreas.length} Areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flagshipMetros.map((metro) => (
            <div
              key={metro.id}
              className="glass-chrome rounded-2xl border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{metro.name}</span>
                    <span className="text-xs font-nastaliq text-neutral-400" dir="rtl">
                      {metro.urduName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {metro.areasCount} verified
                  </span>
                </div>

                <div className="text-xs text-neutral-400 mb-4">
                  {metro.district} District · {metro.province}
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-neutral-400">Postal Range</span>
                    <span className="text-cyan-300 font-semibold">{metro.postalRange}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-neutral-400">Centroid</span>
                    <span className="text-neutral-200">{metro.centroid}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-0.5">
                    <span className="text-neutral-400">Bounding Box</span>
                    <span className="text-neutral-300 text-[11px] truncate">{metro.bounds}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-mono">{metro.id}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phase 1 Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All 40 Cities Master Dataset Table */}
      <div className="glass-chrome rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Controls Bar: Filter Pills & Search */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
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

        {/* Scrollable Responsive Table */}
        <div className="overflow-x-auto max-h-[480px]">
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
              {filteredCities.map((city) => {
                const isFlagship = FLAGSHIP_CITY_IDS.has(city.id);
                const cityAreas = getAreasByCity(city.id);
                const areasCount = cityAreas.length;

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
                      {provinces.find((p) => p.id === city.provinceId)?.name || city.provinceId}
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
