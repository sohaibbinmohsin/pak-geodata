import {
  ShieldCheck,
  Languages,
  Zap,
  Boxes,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export interface CapabilitiesProps {
  className?: string;
}

interface CapabilityItem {
  id: string;
  badge: string;
  badgeTone: 'emerald' | 'cyan' | 'amber' | 'purple';
  title: string;
  subhead: string;
  icon: typeof ShieldCheck;
  bullets: string[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'zero-deps',
    badge: 'Zero External Overhead',
    badgeTone: 'emerald',
    title: 'Zero Runtime Dependencies',
    subhead:
      'Pure standard library in Python, zero external npm dependencies in Node/browser. Untainted attack surface and sub-millisecond cold starts.',
    icon: ShieldCheck,
    bullets: [
      'Pure standard library in Python (math, re, json) with 0 pip dependencies',
      'Zero external npm dependencies in Node and browser runtimes',
      'Untainted attack surface with zero supply chain vulnerability vectors',
      'Sub-millisecond cold starts for edge workers and serverless handlers',
    ],
  },
  {
    id: 'urdu-normalization',
    badge: 'Bilingual Engine',
    badgeTone: 'cyan',
    title: 'Urdu Normalization Engine',
    subhead:
      'Native Arabic numeral unification (۰-۹ to 0-9), letter variant reconciliation (ي/ى to ی, ك to ک, ه to ہ), and diacritic stripping for fault-tolerant search.',
    icon: Languages,
    bullets: [
      'Native Arabic numeral unification (۰-۹ to 0-9) for postal and sector lookups',
      'Arabic letter variant reconciliation (ي/ى to ی, ك to ک, ه to ہ)',
      'Diacritic stripping (Zabar, Zer, Pesh, Tashdeed, Tatweel) for fault-tolerant search',
      'Multi-script normalization supporting simultaneous Urdu and English queries',
    ],
  },
  {
    id: 'sub-ms-reverse-geo',
    badge: '< 0.4 ms Latency',
    badgeTone: 'amber',
    title: 'Sub-Millisecond Reverse Geocoding',
    subhead:
      'Spherical Haversine spatial calculations resolving nearest neighborhoods in < 0.4 ms client-side with zero external API calls or rate limits.',
    icon: Zap,
    bullets: [
      'Spherical Haversine spatial calculations resolving nearest neighborhoods in < 0.4 ms',
      '100% offline client-side execution with zero external API calls or rate limits',
      'Designed for field operations, telemetry tracking, and low-connectivity dispatch',
      'Configurable maxDistanceKm threshold prevents out-of-boundary false associations',
    ],
  },
  {
    id: 'hierarchy-subpath',
    badge: '< 5 KB Bundle',
    badgeTone: 'purple',
    title: 'Lightweight Hierarchy Subpath (< 5 KB)',
    subhead:
      'Tree-shakable subpath import pak-geodata/hierarchy providing all provinces, cities, and bilingual names without loading heavy neighborhood datasets into memory.',
    icon: Boxes,
    bullets: [
      'Tree-shakable subpath import pak-geodata/hierarchy for ultra-fast load times',
      'Delivers all 7 provinces and 79 cities with full bilingual metadata in < 5 KB',
      'Eliminates heavy neighborhood polygon bloat from initial web app bundles',
      'Seamless on-demand code-splitting for detailed city-level polygons',
    ],
  },
];

export default function Capabilities({ className = '' }: CapabilitiesProps) {
  return (
    <section
      id="capabilities"
      className={`relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 ${className}`}
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
          <Cpu className="w-3.5 h-3.5" />
          <span>Architectural Foundation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Built for Production Resilience
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 mt-3 leading-relaxed">
          Engineered from the ground up for zero-overhead performance, offline reliability, and native bilingual intelligence.
        </p>
      </div>

      {/* 4 Architectural Foundation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {CAPABILITIES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="glass-chrome rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col hover:border-white/20 transition-all duration-200 group"
            >
              {/* Card Top: Glowing Icon Pill & Badge */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                    item.badgeTone === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20'
                      : item.badgeTone === 'cyan'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20'
                      : item.badgeTone === 'amber'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                    item.badgeTone === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : item.badgeTone === 'cyan'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : item.badgeTone === 'amber'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Title & Subhead */}
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                {item.subhead}
              </p>

              {/* Bullet Points */}
              <ul className="space-y-2.5">
                {item.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        item.badgeTone === 'emerald'
                          ? 'text-emerald-400'
                          : item.badgeTone === 'cyan'
                          ? 'text-cyan-400'
                          : item.badgeTone === 'amber'
                          ? 'text-amber-400'
                          : 'text-purple-400'
                      }`}
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
