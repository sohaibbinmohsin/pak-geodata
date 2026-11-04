import { BookOpen } from 'lucide-react';
import { PACKAGE_VERSION } from '../version';

export interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0f17]/80 border-b border-white/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Container */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 pressable hover:opacity-90 transition-opacity"
            title="GeoData home"
          >
            <span className="text-xl leading-none select-none" role="img" aria-label="Pakistan flag">🇵🇰</span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
              GeoData
            </span>
          </a>

          {/* Version badge with green pulsing dot */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{PACKAGE_VERSION}</span>
          </div>
        </div>


        {/* Right: Docs Link */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/sohaibbinmohsin/pak-geodata#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-medium text-neutral-200 hover:text-white transition-all shadow-sm"
            title="Read pak-geodata documentation on GitHub"
            aria-label="pak-geodata documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
            <span>Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
}
