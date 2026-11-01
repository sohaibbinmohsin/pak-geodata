import {
  ShieldCheck,
  Languages,
  Zap,
  Boxes,
  Cpu,
  CheckCircle2,
  Terminal,
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
  visualBox: {
    header: string;
    items: { label: string; value: string }[];
  };
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
    visualBox: {
      header: 'Runtime Footprint & Security',
      items: [
        { label: 'NPM Production Dependencies', value: '0 packages' },
        { label: 'PyPI Runtime Dependencies', value: '0 packages (pure standard library)' },
        { label: 'Supply Chain Surface', value: 'Untainted' },
        { label: 'Edge Worker Cold Start', value: '< 1 ms' },
      ],
    },
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
    visualBox: {
      header: 'Orthographic Unification Rules',
      items: [
        { label: 'Eastern Numerals', value: '۰-۹ unified to standard 0-9' },
        { label: 'Arabic Letter Variants', value: 'ي/ى -> ی  ·  ك -> ک  ·  ه -> ہ' },
        { label: 'Diacritic Stripping', value: 'Tashkeel / Aerab stripped automatically' },
        { label: 'Query Matching', value: 'Phonetic and dialect fault-tolerant' },
      ],
    },
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
    visualBox: {
      header: 'Geodesic Spatial Performance',
      items: [
        { label: 'Resolution Engine', value: 'Spherical Haversine distance formula' },
        { label: 'Execution Speed', value: '< 0.4 ms on standard mobile hardware' },
        { label: 'Network Requirement', value: '0 HTTP requests (100% offline)' },
        { label: 'Rate Limiting', value: 'None (unrestricted local CPU execution)' },
      ],
    },
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
      'Delivers all 7 provinces and 40 cities with full bilingual metadata in < 5 KB',
      'Eliminates heavy neighborhood polygon bloat from initial web app bundles',
      'Seamless on-demand code-splitting for detailed city-level polygons',
    ],
    visualBox: {
      header: 'Subpath Tree-Shaking Architecture',
      items: [
        { label: 'Subpath Import', value: "from 'pak-geodata/hierarchy'" },
        { label: 'Subpath Bundle Size', value: '< 5 KB uncompressed (< 2.5 KB gzipped)' },
        { label: 'Available Entities', value: '7 provinces, 40 cities, postal ranges' },
        { label: 'Granular Splitting', value: 'Load neighborhood geometry on demand' },
      ],
    },
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
              className="glass-chrome rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group"
            >
              <div>
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
                <ul className="space-y-2.5 mb-6">
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

              {/* Technical Architecture Metric Box */}
              <div className="rounded-xl bg-black/40 border border-white/10 p-4 mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {item.visualBox.header}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {item.visualBox.items.map((metric, mIdx) => (
                    <div
                      key={mIdx}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col justify-center"
                    >
                      <span className="text-[10px] text-neutral-400">{metric.label}</span>
                      <span className="text-neutral-200 font-semibold truncate">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
