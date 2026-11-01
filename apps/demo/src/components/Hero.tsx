import { useState, useRef, useEffect } from 'react';
import { getAllProvinces, getAllCities, getAllAreas } from 'pak-geodata';
import {
  Copy,
  Check,
  ArrowRight,
  MapPin,
  Building2,
  Compass,
  Cpu,
} from 'lucide-react';

function NpmIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NPM logo"
      data-testid="npm-icon"
    >
      <rect x="3" y="3" width="18" height="18" fill="#FFFFFF" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
        fill="#CB3837"
      />
    </svg>
  );
}

function PythonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="16 16 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Python logo"
      data-testid="python-icon"
    >
      <defs>
        <linearGradient id="hero-python-blue" x1="19.075" y1="18.782" x2="34.898" y2="34.658" gradientUnits="userSpaceOnUse">
          <stop stopColor="#387EB8" />
          <stop offset="1" stopColor="#3776AB" />
        </linearGradient>
        <linearGradient id="hero-python-yellow" x1="28.809" y1="28.882" x2="45.803" y2="45.163" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE052" />
          <stop offset="1" stopColor="#FFD43B" />
        </linearGradient>
      </defs>
      <path
        fill="url(#hero-python-blue)"
        d="M31.885 16c-8.124 0-7.617 3.523-7.617 3.523l.01 3.65h7.752v1.095H21.197S16 23.678 16 31.876c0 8.196 4.537 7.906 4.537 7.906h2.708v-3.804s-.146-4.537 4.465-4.537h7.688s4.32.07 4.32-4.175v-7.019S40.374 16 31.885 16zm-4.275 2.454a1.394 1.394 0 1 1 0 2.79 1.393 1.393 0 0 1-1.395-1.395c0-.771.624-1.395 1.395-1.395z"
      />
      <path
        fill="url(#hero-python-yellow)"
        d="M32.115 47.833c8.124 0 7.617-3.523 7.617-3.523l-.01-3.65H31.97v-1.095h10.832S48 40.155 48 31.958c0-8.197-4.537-7.906-4.537-7.906h-2.708v3.803s.146 4.537-4.465 4.537h-7.688s-4.32-.07-4.32 4.175v7.019s-.656 4.247 7.833 4.247zm4.275-2.454a1.393 1.393 0 0 1-1.395-1.395 1.394 1.394 0 1 1 1.395 1.395z"
      />
    </svg>
  );
}

export interface HeroProps {
  className?: string;
  onOpenStudio?: () => void;
}

export default function Hero({ className = '', onOpenStudio }: HeroProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<'npm' | 'pypi' | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Dynamic metrics computed from pak-geodata
  const provincesCount = getAllProvinces().length;
  const citiesCount = getAllCities().length;
  const areasCount = getAllAreas().length;

  const handleCopy = async (command: string, target: 'npm' | 'pypi') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = command;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      setCopiedSnippet(target);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedSnippet((curr) => (curr === target ? null : curr));
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const metrics = [
    {
      value: provincesCount,
      label: 'Provinces & Territories',
      detail: 'ISO 3166-2:PK administrative divisions',
      icon: Building2,
    },
    {
      value: citiesCount,
      label: 'Verified Cities',
      detail: 'Standardized bounding boxes and tehsils',
      icon: MapPin,
    },
    {
      value: areasCount,
      label: 'Foundational Areas',
      detail: 'Golden metro postal centroids and aliases',
      icon: Compass,
    },
    {
      value: '0',
      label: 'Runtime Dependencies',
      detail: 'Pure standard library and zero overhead',
      icon: Cpu,
    },
  ];

  return (
    <section className={`relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}>
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Feature badge with pulsing emerald beacon */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium shadow-sm mb-6 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>100% Offline & Typed Foundation</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
            Canonical Geographic Intelligence for Pakistan
          </span>
        </h1>

        {/* Technical Subhead */}
        <p className="max-w-3xl text-base sm:text-lg lg:text-xl text-neutral-300 font-normal leading-relaxed mb-8 sm:mb-10">
          Standardized administrative hierarchies, multi-script area aliases, and sub-millisecond reverse geocoding for TypeScript and Python. Zero runtime dependencies.
        </p>

        {/* Dual Terminal Install Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mb-8">
          {/* NPM Card */}
          <div className="glass-chrome rounded-xl border border-white/10 p-3 sm:p-4 text-left transition-all hover:border-white/20">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <NpmIcon className="w-4 h-4 shrink-0 rounded-[3px]" />
                <span className="font-mono text-[11px] font-semibold text-rose-400">npm</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('npm i pak-geodata', 'npm')}
                className="pressable inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Copy npm install command"
                title="Copy npm install command"
              >
                {copiedSnippet === 'npm' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-200 select-all overflow-x-auto py-1">
              <span className="text-emerald-400 select-none">$</span>
              <span>npm i pak-geodata</span>
            </div>
          </div>

          {/* PyPI Card */}
          <div className="glass-chrome rounded-xl border border-white/10 p-3 sm:p-4 text-left transition-all hover:border-white/20">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <PythonIcon className="w-4 h-4 shrink-0" />
                <span className="font-mono text-[11px] font-semibold text-sky-400">pip</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('pip install pak-geodata', 'pypi')}
                className="pressable inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Copy pip install command"
                title="Copy pip install command"
              >
                {copiedSnippet === 'pypi' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-200 select-all overflow-x-auto py-1">
              <span className="text-sky-400 select-none">$</span>
              <span>pip install pak-geodata</span>
            </div>
          </div>
        </div>

        {/* Action button to explore Studio */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.hash = '#studio';
              }
              onOpenStudio?.();
            }}
            className="pressable inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0b0f17] font-semibold text-sm transition-all shadow-glow-emerald cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Card Live Metrics Ticker */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.label}
                className="glass-subtle rounded-xl border border-white/10 p-4 sm:p-5 text-left transition-all hover:border-emerald-500/30 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    {metric.value}
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-200 mb-1">
                  {metric.label}
                </div>
                <div className="text-[11px] text-neutral-400 leading-snug">
                  {metric.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
