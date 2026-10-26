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
    <header className={`fixed top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-40 pointer-events-none flex flex-col items-center gap-1.5 ${className}`}>
      {/* Main Glass Chrome Capsule */}
      <div className="glass-chrome pointer-events-auto w-full max-w-7xl rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 shadow-2xl transition-all">
        
        {/* Left: Brand, Live Beacon & Attribution */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none select-none" role="img" aria-label="Pakistan flag">🇵🇰</span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
              pak-geodata
            </span>
          </div>

          {/* Live Emerald Beacon */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>100% Offline &amp; Typed</span>
          </div>

          {/* Attribution Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-400 pl-3 border-l border-white/10">
            <span className="text-neutral-500">by</span>
            <a
              href="https://sohaibbinmohsin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable text-neutral-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-2 hover:decoration-white font-medium"
              title="Founder: Sohaib Bin Mohsin"
            >
              Sohaib Bin Mohsin
            </a>
            <span className="text-neutral-600">/</span>
            <a
              href="https://themohsinproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable text-neutral-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-2 hover:decoration-white font-medium"
              title="Organization: The Mohsin Project Global"
            >
              The Mohsin Project Global
            </a>
          </div>
        </div>

        {/* Center: Dynamic Quick Stats Ticker */}
        <div className="order-3 lg:order-2 flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-semibold text-white">{provincesCount}</span>
            <span className="text-neutral-400 text-[11px]">Provinces</span>
          </div>
          <span className="text-neutral-600 select-none">•</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-semibold text-white">{citiesCount}</span>
            <span className="text-neutral-400 text-[11px]">Cities</span>
          </div>
          <span className="text-neutral-600 select-none">•</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-semibold text-white">{areasCount}</span>
            <span className="text-neutral-400 text-[11px]">Areas</span>
          </div>
          <span className="text-neutral-600 select-none">•</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-semibold text-emerald-400">0</span>
            <span className="text-neutral-400 text-[11px]">Runtime Deps</span>
          </div>
        </div>

        {/* Right: Registries & GitHub Links */}
        <div className="order-2 lg:order-3 flex items-center flex-wrap sm:flex-nowrap gap-2">
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
              <span className="text-[10px] text-neutral-400 font-mono">v0.1.0</span>
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
              <span className="text-[10px] text-neutral-400 font-mono">v0.1.0</span>
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

      {/* Attribution Capsule for Mobile Viewports */}
      <div className="glass-chrome pointer-events-auto md:hidden px-3 py-1 rounded-full text-[10px] text-neutral-400 flex items-center gap-1.5 shadow-lg">
        <span className="text-neutral-500">by</span>
        <a
          href="https://sohaibbinmohsin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="pressable text-neutral-300 hover:text-white underline decoration-white/20 underline-offset-2"
        >
          Sohaib Bin Mohsin
        </a>
        <span className="text-neutral-600">/</span>
        <a
          href="https://themohsinproject.org"
          target="_blank"
          rel="noopener noreferrer"
          className="pressable text-neutral-300 hover:text-white underline decoration-white/20 underline-offset-2"
        >
          The Mohsin Project Global
        </a>
      </div>
    </header>
  );
}
