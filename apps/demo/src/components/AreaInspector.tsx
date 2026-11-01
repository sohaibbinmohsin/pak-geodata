import { useState, useEffect } from 'react';
import {
  type PakistanArea,
  getCityById,
  getProvinceById,
} from 'pak-geodata';
import {
  X,
  Copy,
  Check,
  Navigation,
  Tag,
  CheckCircle2,
  MapPin,
  Building,
} from 'lucide-react';
import CodeGenerator from './CodeGenerator';
import { formatGpsCoordinates } from './codeSnippets';

export interface AreaInspectorProps {
  area: PakistanArea;
  onClose: () => void;
  className?: string;
}

export default function AreaInspector({
  area,
  onClose,
  className = '',
}: AreaInspectorProps) {
  const [slugCopied, setSlugCopied] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const city = getCityById(area.cityId);
  const province = getProvinceById(area.provinceId);

  const formattedCoords = formatGpsCoordinates(
    area.coordinates.lat,
    area.coordinates.lng
  );

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
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      return false;
    }
  };

  const handleCopySlug = async () => {
    const ok = await copyToClipboard(area.id);
    if (ok) {
      setSlugCopied(true);
      setTimeout(() => setSlugCopied(false), 2000);
    }
  };

  const handleCopyCoords = async () => {
    const coordsStr = `${area.coordinates.lat.toFixed(6)}, ${area.coordinates.lng.toFixed(6)}`;
    const ok = await copyToClipboard(coordsStr);
    if (ok) {
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    }
  };

  return (
    <aside
      role="dialog"
      aria-label={`Area inspector for ${area.name}`}
      className={`fixed inset-x-0 bottom-0 sm:bottom-5 sm:left-6 sm:inset-x-auto sm:max-w-md sm:w-[440px] z-40 pointer-events-auto glass-chrome rounded-t-3xl sm:rounded-2xl border border-white/15 shadow-2xl p-4 sm:p-5 max-h-[85vh] sm:max-h-[calc(100vh-140px)] overflow-y-auto space-y-4 animate-slide-up select-none ${className}`}
    >
      {/* Mobile Drawer Grab Handle */}
      <div className="sm:hidden flex justify-center -mt-1 mb-1">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Top Bar: Verification Badge & Close Button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          {area.verified ? (
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
            • {area.cityId}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="pressable p-1 -mr-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close area inspector"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Header: English Name & Native Urdu Nastaliq */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug select-text">
          {area.name}
        </h2>
        {area.urduName && (
          <div
            dir="rtl"
            className="text-right font-nastaliq text-emerald-400 text-lg leading-relaxed select-text"
          >
            {area.urduName}
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
            title={`Canonical slug: ${area.id}`}
          >
            {area.id}
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
        {/* City Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{city?.name || area.cityId}</span>
        </span>

        {/* Province Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
          <Building className="w-3 h-3 text-neutral-400" />
          <span>{province?.name || area.provinceId}</span>
        </span>

        {/* Type Badge */}
        {area.type && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 capitalize font-mono text-[11px]">
            {area.type.replace(/_/g, ' ')}
          </span>
        )}

        {/* Postal Code Badge */}
        {area.postalCode && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 font-mono text-[11px]"
            title="Pakistan Post 5-Digit Postal Code"
          >
            <span>📮</span>
            <span>{area.postalCode}</span>
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
      {area.aliases && area.aliases.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-neutral-500" />
            <span>Colloquial Aliases ({area.aliases.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {area.aliases.map((alias) => (
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

      {/* Embedded Live TS/Python Code Generator */}
      <div className="pt-2 border-t border-white/10">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
          Live Client Code
        </div>
        <CodeGenerator area={area} />
      </div>
    </aside>
  );
}
