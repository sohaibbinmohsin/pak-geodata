import { useState } from 'react';
import { getAllProvinces, getAllCities, getAllAreas } from 'pak-geodata';
import { Copy, Check, Github, Star } from 'lucide-react';

export interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [copiedTarget, setCopiedTarget] = useState<'npm' | 'pypi' | null>(null);

  // Dynamic metrics computed from pak-geodata
  const provincesCount = getAllProvinces().length;
  const citiesCount = getAllCities().length;
  const areasCount = getAllAreas().length;

  const handleCopy = async (command: string, target: 'npm' | 'pypi') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = command;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedTarget(target);
      setTimeout(() => {
        setCopiedTarget((current) => (current === target ? null : current));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0f17]/80 border-b border-white/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Branding & Offline Status Beacon */}
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
            title="pak-geodata home"
          >
            <span className="text-xl leading-none select-none" role="img" aria-label="Pakistan flag">🇵🇰</span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
              pak-geodata
            </span>
          </a>

          {/* Version badge with green pulsing dot */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>v0.2.0</span>
          </div>

          {/* 100% Offline beacon with dynamic dataset metrics tooltip */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-[11px] font-mono"
            title={`${provincesCount} provinces, ${citiesCount} cities, ${areasCount} areas: 100% offline`}
          >
            <span className="text-emerald-400 font-medium">100% Offline</span>
          </div>
        </div>

        {/* Center: Smooth Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <a
            href="#studio"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Studio
          </a>
          <a
            href="#capabilities"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#recipes"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Recipes
          </a>
          <a
            href="#coverage"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Coverage
          </a>
        </nav>

        {/* Right: Quick Install Pills & GitHub */}
        <div className="flex items-center gap-2">
          {/* NPM Pill */}
          <div className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 text-xs overflow-hidden transition-all duration-200 hover:border-white/20">
            <a
              href="https://www.npmjs.com/package/pak-geodata"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
              title="View on NPM Registry"
            >
              <span className="font-mono font-bold text-rose-400 text-[11px]">npm</span>
              <span className="text-[10px] text-neutral-400 font-mono">v0.2.0</span>
            </a>
            <div className="h-4 w-px bg-white/10" />
            <button
              type="button"
              onClick={() => handleCopy('npm i pak-geodata', 'npm')}
              className="pressable px-2.5 py-1.5 flex items-center gap-1.5 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              title="Copy: npm i pak-geodata"
              aria-label="Copy npm install command"
            >
              {copiedTarget === 'npm' ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200">
                  <span className="font-mono text-[11px] hidden xl:inline">npm i pak-geodata</span>
                  <Copy className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>

          {/* PyPI Pill */}
          <div className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 text-xs overflow-hidden transition-all duration-200 hover:border-white/20">
            <a
              href="https://pypi.org/project/pak-geodata/"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
              title="View on PyPI Registry"
            >
              <span className="font-mono font-bold text-sky-400 text-[11px]">PyPI</span>
              <span className="text-[10px] text-neutral-400 font-mono">v0.2.0</span>
            </a>
            <div className="h-4 w-px bg-white/10" />
            <button
              type="button"
              onClick={() => handleCopy('pip install pak-geodata', 'pypi')}
              className="pressable px-2.5 py-1.5 flex items-center gap-1.5 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              title="Copy: pip install pak-geodata"
              aria-label="Copy pip install command"
            >
              {copiedTarget === 'pypi' ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200">
                  <span className="font-mono text-[11px] hidden xl:inline">pip install pak-geodata</span>
                  <Copy className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>

          {/* GitHub Star Link */}
          <a
            href="https://github.com/sohaibbinmohsin/pak-geodata"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-medium text-neutral-200 hover:text-white transition-all shadow-sm"
            title="View pak-geodata on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded font-mono">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>Star</span>
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <nav className="flex md:hidden items-center justify-around px-4 py-2 border-t border-white/5 text-xs text-neutral-300">
        <a href="#studio" className="hover:text-white transition-colors py-1 px-2">Studio</a>
        <a href="#capabilities" className="hover:text-white transition-colors py-1 px-2">Capabilities</a>
        <a href="#recipes" className="hover:text-white transition-colors py-1 px-2">Recipes</a>
        <a href="#coverage" className="hover:text-white transition-colors py-1 px-2">Coverage</a>
      </nav>
    </header>
  );
}
