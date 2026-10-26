import { useLayoutEffect, useEffect, useRef, useState, useMemo } from 'react';
import { getAllAreas, getCityById, type PakistanArea, type PakistanCity } from 'pak-geodata';

export interface CityPillsProps {
  selectedCity: PakistanCity | null;
  onSelectCity: (city: PakistanCity | null) => void;
  allAreas?: readonly PakistanArea[];
  className?: string;
}

const TARGET_CITY_IDS = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad'] as const;

export default function CityPills({
  selectedCity,
  onSelectCity,
  allAreas,
  className = '',
}: CityPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Dynamic area counts per city
  const counts = useMemo(() => {
    const areaList = allAreas || getAllAreas();
    const map: Record<string, number> = {
      all: areaList.length,
    };
    for (const area of areaList) {
      map[area.cityId] = (map[area.cityId] || 0) + 1;
    }
    return map;
  }, [allAreas]);

  // City pill items ordered by major hubs
  const pills = useMemo(() => {
    const list: Array<{ id: string; label: string; count: number; city: PakistanCity | null }> = [
      { id: 'all', label: 'All', count: counts.all || 189, city: null },
    ];
    for (const cityId of TARGET_CITY_IDS) {
      const city = getCityById(cityId);
      if (city) {
        list.push({
          id: city.id,
          label: city.name,
          count: counts[city.id] || 0,
          city,
        });
      }
    }
    return list;
  }, [counts]);

  const activeId = selectedCity ? selectedCity.id : 'all';

  // Smooth sliding spring capsule indicator positioning
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = () => {
    const container = containerRef.current;
    const activeBtn = pillRefs.current.get(activeId);
    if (container && activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        opacity: 1,
      });
    }
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeId, pills]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeId]);

  return (
    <nav
      aria-label="Filter areas by city"
      className={`pointer-events-auto max-w-full overflow-x-auto py-1 px-1 ${className}`}
    >
      <div
        ref={containerRef}
        className="glass-chrome relative inline-flex items-center gap-1 p-1 rounded-full shadow-xl"
        role="tablist"
      >
        {/* Apple-style Gliding Spring Capsule */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 pointer-events-none shadow-sm"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out',
          }}
          aria-hidden="true"
        />

        {pills.map((pill) => {
          const isActive = pill.id === activeId;
          return (
            <button
              key={pill.id}
              ref={(el) => {
                if (el) pillRefs.current.set(pill.id, el);
                else pillRefs.current.delete(pill.id);
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCity(pill.city)}
              className={`pressable relative z-10 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none transition-colors duration-150 ${
                isActive
                  ? 'text-emerald-300 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-semibold'
                    : 'bg-white/5 text-neutral-400 border border-white/5'
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
