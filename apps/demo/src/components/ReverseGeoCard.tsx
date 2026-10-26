import { useEffect } from 'react';
import type { PakistanArea } from 'pak-geodata';
import { X, ArrowRight, Zap, Navigation, MapPin } from 'lucide-react';
import {
  type ReverseGeoPoint,
  formatCoordinates,
  formatDistance,
  formatSpeedBadge,
} from './reverseGeoUtils';

export type { ReverseGeoPoint };
export { formatCoordinates, formatDistance, formatSpeedBadge };

export interface ReverseGeoCardProps {
  point: ReverseGeoPoint;
  onSelectArea: (area: PakistanArea) => void;
  onDismiss: () => void;
  className?: string;
}

export default function ReverseGeoCard({
  point,
  onSelectArea,
  onDismiss,
  className = '',
}: ReverseGeoCardProps) {
  const { clicked, nearest, distanceKm, computationTimeMs } = point;

  const formattedCoords = formatCoordinates(clicked);
  const formattedDist = formatDistance(distanceKm);
  const speedBadge = formatSpeedBadge(computationTimeMs);

  // Allow Escape key to dismiss reverse geocode card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <aside
      role="dialog"
      aria-label="Reverse geocoding result"
      className={`glass-chrome animate-pop rounded-2xl p-4 shadow-2xl pointer-events-auto border border-white/15 select-none ${className}`}
    >
      {/* Top Bar: Mode Header, Live Dot & Dismiss Button */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Reverse Geocoding Result
          </span>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="pressable p-1 -mr-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss reverse geocode result"
          title="Dismiss (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Clicked Coordinates & Vector Distance Row */}
      <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono text-neutral-300 truncate" title={`Coordinates: ${formattedCoords}`}>
            {formattedCoords}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
          <span>{formattedDist}</span>
        </div>
      </div>

      {/* Nearest Area Card Section */}
      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Nearest Area</span>
            </div>
            <div className="text-base font-semibold text-white tracking-tight leading-tight truncate">
              {nearest.name}
            </div>
          </div>

          {/* City Scope Badge */}
          <span className="shrink-0 inline-flex items-center text-[10px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-medium">
            {nearest.cityId}
          </span>
        </div>

        {/* Native Urdu Nastaliq Name */}
        {nearest.urduName && (
          <div className="text-right dir-rtl font-nastaliq text-base text-emerald-400 leading-none pt-0.5">
            {nearest.urduName}
          </div>
        )}

        {/* Additional metadata tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {nearest.postalCode && (
            <span className="inline-flex items-center text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded leading-none">
              📮 {nearest.postalCode}
            </span>
          )}
          {nearest.type && (
            <span className="text-[10px] font-mono text-neutral-500">
              • {nearest.type.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Speed Benchmark Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
          <span>{speedBadge}</span>
        </div>
      </div>

      {/* Inspect Area Button */}
      <button
        type="button"
        onClick={() => onSelectArea(nearest)}
        className="pressable w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group shadow-lg"
      >
        <span>Inspect Area</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </button>
    </aside>
  );
}
