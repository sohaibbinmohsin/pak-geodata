import { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface RecipesProps {
  className?: string;
}

type RecipeTabId = 'emergency' | 'checkout' | 'pwa';

interface RecipeDefinition {
  id: RecipeTabId;
  tabLabel: string;
  tabIcon: typeof ShieldAlert;
  badge: string;
  badgeTone: 'emerald' | 'cyan' | 'purple';
  title: string;
  filename: string;
  scenario: string;
  benefits: { title: string; description: string }[];
  benchmark: string;
  codeSnippet: string;
  renderCode: () => JSX.Element;
}

const RECIPES: RecipeDefinition[] = [
  {
    id: 'emergency',
    tabLabel: 'Emergency & Field Ops',
    tabIcon: ShieldAlert,
    badge: 'Sanctuary PWA Pattern',
    badgeTone: 'cyan',
    title: 'Emergency & Rescue Dispatch',
    filename: 'dispatch-service.ts',
    scenario:
      'Offline GPS reverse geocoding to identify closest neighborhood and nearest district emergency service in < 0.4 ms. Designed for field operations in low-connectivity environments where network latency cannot be tolerated.',
    benefits: [
      {
        title: 'Zero Network Latency',
        description: 'Computes spherical distance 100% offline using pre-indexed spatial bounds in client memory.',
      },
      {
        title: 'Sub-Millisecond Execution',
        description: 'Spherical Haversine resolution executes in < 0.4 ms on standard mobile hardware.',
      },
      {
        title: 'Bilingual Field Broadcast',
        description: 'Resolves canonical English IDs and localized Urdu names for instant radio dispatch.',
      },
      {
        title: 'Bounded Radius Filtering',
        description: 'Constrains lookups to operational zones with maxDistanceKm safeguard.',
      },
    ],
    benchmark: '< 0.4 ms lookup',
    codeSnippet: `import {
  getNearestArea,
  getAreaName,
  haversineDistanceKm,
  type Coordinates,
} from 'pak-geodata';

// Field responder receives GPS coordinates from offline device sensor
const responderGps: Coordinates = { lat: 31.4697, lng: 74.3781 };

// Locate closest verified neighborhood within < 0.4 ms (zero network roundtrips)
const nearest = getNearestArea(responderGps, { maxDistanceKm: 15 });

if (nearest) {
  // Resolve localized Urdu name for emergency dispatch radio broadcast
  const urduName = getAreaName(nearest.cityId, nearest.id, 'ur');
  const distanceKm = haversineDistanceKm(responderGps, nearest.coordinates);

  console.log(\`[DISPATCH] Target Area: \${nearest.name} (\${urduName})\`);
  console.log(\`[DISPATCH] Postal Code: \${nearest.postalCode || 'N/A'}\`);
  console.log(\`[DISPATCH] Distance to Centroid: \${distanceKm.toFixed(2)} km\`);
}`,
    renderCode: () => (
      <>
        <div>
          <span className="text-purple-400">import</span> {'{'}
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getNearestArea</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getAreaName</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">haversineDistanceKm</span>,
        </div>
        <div className="pl-4">
          <span className="text-purple-400">type</span> <span className="text-amber-300">Coordinates</span>,
        </div>
        <div>
          {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'pak-geodata'</span>;
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // Field responder receives GPS coordinates from offline device sensor
        </div>
        <div>
          <span className="text-purple-400">const</span> responderGps: <span className="text-amber-300">Coordinates</span> = {'{ '}
          <span className="text-neutral-300">lat:</span> <span className="text-amber-400">31.4697</span>,{' '}
          <span className="text-neutral-300">lng:</span> <span className="text-amber-400">74.3781</span>{' }'};
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // Locate closest verified neighborhood within &lt; 0.4 ms (zero network roundtrips)
        </div>
        <div>
          <span className="text-purple-400">const</span> nearest = <span className="text-cyan-300">getNearestArea</span>(responderGps, {'{ '}
          <span className="text-neutral-300">maxDistanceKm:</span> <span className="text-amber-400">15</span>{' }'});
        </div>
        <br />
        <div>
          <span className="text-purple-400">if</span> (nearest) {'{'}
        </div>
        <div className="pl-4 text-neutral-500 italic">
          // Resolve localized Urdu name for emergency dispatch radio broadcast
        </div>
        <div className="pl-4">
          <span className="text-purple-400">const</span> urduName = <span className="text-cyan-300">getAreaName</span>(nearest.cityId, nearest.id, <span className="text-emerald-300">'ur'</span>);
        </div>
        <div className="pl-4">
          <span className="text-purple-400">const</span> distanceKm = <span className="text-cyan-300">haversineDistanceKm</span>(responderGps, nearest.coordinates);
        </div>
        <br />
        <div className="pl-4">
          <span className="text-cyan-300">console</span>.<span className="text-cyan-300">log</span>(
          <span className="text-emerald-300">`[DISPATCH] Target Area: ${'{'}nearest.name{'}'} (${'{'}urduName{'}'})`</span>
          );
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">console</span>.<span className="text-cyan-300">log</span>(
          <span className="text-emerald-300">`[DISPATCH] Postal Code: ${'{'}nearest.postalCode || 'N/A'{'}'}`</span>
          );
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">console</span>.<span className="text-cyan-300">log</span>(
          <span className="text-emerald-300">`[DISPATCH] Distance to Centroid: ${'{'}distanceKm.toFixed(2){'}'} km`</span>
          );
        </div>
        <div>{'}'}</div>
      </>
    ),
  },
  {
    id: 'checkout',
    tabLabel: 'Bilingual E-Commerce Checkout',
    tabIcon: ShoppingBag,
    badge: 'Enterprise E-Commerce',
    badgeTone: 'emerald',
    title: 'Bilingual Checkout Dropdowns',
    filename: 'checkout-cascading.ts',
    scenario:
      'Cascading Province -> City -> Area dropdowns that store canonical English keys in SQLite/Postgres while rendering localized native Urdu labels to customers.',
    benefits: [
      {
        title: 'Canonical Persistence Keys',
        description: 'Stores immutable slugs (punjab, lahore, lahore-gulberg-3) in Postgres and order tables.',
      },
      {
        title: 'Native Nastaliq Localization',
        description: 'Renders authentic Urdu script with Eastern Arabic numerals for local customer experiences.',
      },
      {
        title: 'Instant Hierarchical Filtering',
        description: 'Zero network waterfalls: getProvincesAsLocationItems, getCitiesAsLocationItems, and getAreasAsLocationItems execute synchronously.',
      },
      {
        title: 'Unified Location Schema',
        description: 'Standardized PakLocationItem interface ensures end-to-end type safety.',
      },
    ],
    benchmark: 'Instant Cascades',
    codeSnippet: `import {
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  type PakLocationItem,
} from 'pak-geodata';

// 1. Initial checkout load: render verified provinces
const provinces: PakLocationItem[] = getProvincesAsLocationItems();

// 2. Customer selects province -> cascading cities update instantly
function onProvinceChange(provinceId: string): PakLocationItem[] {
  return getCitiesAsLocationItems(provinceId);
}

// 3. Customer selects city -> cascading delivery areas update instantly
function onCityChange(cityKey: string): PakLocationItem[] {
  return getAreasAsLocationItems(cityKey);
}

// 4. Persistence format vs Display format:
// UI renders: item.nameUr ('پنجاب', 'لاہور', 'گلبرگ ۳')
// DB stores:  item.id ('punjab', 'lahore', 'lahore-gulberg-3')
export function buildOrderPayload(areaItem: PakLocationItem) {
  return {
    canonicalAreaId: areaItem.id,       // 'lahore-gulberg-3' stored in Postgres
    displayName: areaItem.nameEn,       // 'Gulberg III'
    localizedUrdu: areaItem.nameUr,     // 'گلبرگ ۳' for customer receipt
    coordinates: areaItem.coordinates,
  };
}`,
    renderCode: () => (
      <>
        <div>
          <span className="text-purple-400">import</span> {'{'}
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getProvincesAsLocationItems</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getCitiesAsLocationItems</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getAreasAsLocationItems</span>,
        </div>
        <div className="pl-4">
          <span className="text-purple-400">type</span> <span className="text-amber-300">PakLocationItem</span>,
        </div>
        <div>
          {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'pak-geodata'</span>;
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // 1. Initial checkout load: render verified provinces
        </div>
        <div>
          <span className="text-purple-400">const</span> provinces: <span className="text-amber-300">PakLocationItem</span>[] = <span className="text-cyan-300">getProvincesAsLocationItems</span>();
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // 2. Customer selects province -&gt; cascading cities update instantly
        </div>
        <div>
          <span className="text-purple-400">function</span> <span className="text-cyan-300">onProvinceChange</span>(provinceId: <span className="text-amber-300">string</span>): <span className="text-amber-300">PakLocationItem</span>[] {'{'}
        </div>
        <div className="pl-4">
          <span className="text-purple-400">return</span> <span className="text-cyan-300">getCitiesAsLocationItems</span>(provinceId);
        </div>
        <div>{'}'}</div>
        <br />
        <div className="text-neutral-500 italic">
          // 3. Customer selects city -&gt; cascading delivery areas update instantly
        </div>
        <div>
          <span className="text-purple-400">function</span> <span className="text-cyan-300">onCityChange</span>(cityKey: <span className="text-amber-300">string</span>): <span className="text-amber-300">PakLocationItem</span>[] {'{'}
        </div>
        <div className="pl-4">
          <span className="text-purple-400">return</span> <span className="text-cyan-300">getAreasAsLocationItems</span>(cityKey);
        </div>
        <div>{'}'}</div>
        <br />
        <div className="text-neutral-500 italic">
          // 4. Persistence format vs Display format:
        </div>
        <div className="text-neutral-500 italic">
          // UI renders: item.nameUr ('پنجاب', 'لاہور', 'گلبرگ ۳')
        </div>
        <div className="text-neutral-500 italic">
          // DB stores:  item.id ('punjab', 'lahore', 'lahore-gulberg-3')
        </div>
        <div>
          <span className="text-purple-400">export function</span> <span className="text-cyan-300">buildOrderPayload</span>(areaItem: <span className="text-amber-300">PakLocationItem</span>) {'{'}
        </div>
        <div className="pl-4">
          <span className="text-purple-400">return</span> {'{'}
        </div>
        <div className="pl-8">
          <span className="text-neutral-300">canonicalAreaId:</span> areaItem.id, <span className="text-neutral-500 italic">// 'lahore-gulberg-3' stored in Postgres</span>
        </div>
        <div className="pl-8">
          <span className="text-neutral-300">displayName:</span> areaItem.nameEn, <span className="text-neutral-500 italic">// 'Gulberg III'</span>
        </div>
        <div className="pl-8">
          <span className="text-neutral-300">localizedUrdu:</span> areaItem.nameUr, <span className="text-neutral-500 italic">// 'گلبرگ ۳' for customer receipt</span>
        </div>
        <div className="pl-8">
          <span className="text-neutral-300">coordinates:</span> areaItem.coordinates,
        </div>
        <div className="pl-4">{'}'};</div>
        <div>{'}'}</div>
      </>
    ),
  },
  {
    id: 'pwa',
    tabLabel: 'PWA Subpath Code-Splitting (< 5 KB)',
    tabIcon: Zap,
    badge: 'Tree-Shaken Hierarchy',
    badgeTone: 'purple',
    title: 'PWA Subpath Code-Splitting (< 5 KB)',
    filename: 'pwa-optimization.ts',
    scenario:
      'Progressive Web App bundle optimization using pak-geodata/hierarchy to load all administrative lookups without pulling 189 neighborhood datasets into initial bundle.',
    benefits: [
      {
        title: 'Featherweight Footprint',
        description: 'Adds < 5 KB gzipped to client bundles, keeping offline PWA startup times under 100 ms.',
      },
      {
        title: 'Dedicated Subpath Target',
        description: 'Isolated package export pak-geodata/hierarchy leaves polygon and area coordinates out of the initial chunk.',
      },
      {
        title: 'Zero Runtime Dependencies',
        description: '100% pure TypeScript and JavaScript standard library with zero external npm bloat.',
      },
      {
        title: 'On-Demand Area Hydration',
        description: 'Dynamically imports specific city modules (e.g. pak-geodata/areas/lahore) only when users navigate to that city.',
      },
    ],
    benchmark: '< 5 KB bundle',
    codeSnippet: `// Subpath import: Loads ONLY 7 provinces and 40 cities (< 5 KB gzipped)
// Does NOT bundle 189 area boundary datasets into client initial entry point
import {
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getCityName,
} from 'pak-geodata/hierarchy';

// Initialize top-level PWA navigation instantly
const provinces = getProvincesAsLocationItems();
const majorCities = getCitiesAsLocationItems('punjab');

// Dynamically import detailed area polygons only when user opens city view
async function loadCityAreas(citySlug: string) {
  // Subpath code-splitting: loads neighborhood data on demand
  const areaModule = await import(\`pak-geodata/areas/\${citySlug}\`);
  return areaModule.areas;
}`,
    renderCode: () => (
      <>
        <div className="text-neutral-500 italic">
          // Subpath import: Loads ONLY 7 provinces and 40 cities (&lt; 5 KB gzipped)
        </div>
        <div className="text-neutral-500 italic">
          // Does NOT bundle 189 area boundary datasets into client initial entry point
        </div>
        <div>
          <span className="text-purple-400">import</span> {'{'}
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getProvincesAsLocationItems</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getCitiesAsLocationItems</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-300">getCityName</span>,
        </div>
        <div>
          {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'pak-geodata/hierarchy'</span>;
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // Initialize top-level PWA navigation instantly
        </div>
        <div>
          <span className="text-purple-400">const</span> provinces = <span className="text-cyan-300">getProvincesAsLocationItems</span>();
        </div>
        <div>
          <span className="text-purple-400">const</span> majorCities = <span className="text-cyan-300">getCitiesAsLocationItems</span>(<span className="text-emerald-300">'punjab'</span>);
        </div>
        <br />
        <div className="text-neutral-500 italic">
          // Dynamically import detailed area polygons only when user opens city view
        </div>
        <div>
          <span className="text-purple-400">async function</span> <span className="text-cyan-300">loadCityAreas</span>(citySlug: <span className="text-amber-300">string</span>) {'{'}
        </div>
        <div className="pl-4 text-neutral-500 italic">
          // Subpath code-splitting: loads neighborhood data on demand
        </div>
        <div className="pl-4">
          <span className="text-purple-400">const</span> areaModule = <span className="text-purple-400">await import</span>(
          <span className="text-emerald-300">`pak-geodata/areas/${'{'}citySlug{'}'}`</span>
          );
        </div>
        <div className="pl-4">
          <span className="text-purple-400">return</span> areaModule.areas;
        </div>
        <div>{'}'}</div>
      </>
    ),
  },
];

export default function Recipes({ className = '' }: RecipesProps) {
  const [activeTab, setActiveTab] = useState<RecipeTabId>('emergency');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % RECIPES.length;
      setActiveTab(RECIPES[nextIndex].id);
      setCopied(false);
      tabButtonRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + RECIPES.length) % RECIPES.length;
      setActiveTab(RECIPES[prevIndex].id);
      setCopied(false);
      tabButtonRefs.current[prevIndex]?.focus();
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const activeRecipe = RECIPES.find((r) => r.id === activeTab) || RECIPES[0];

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeRecipe.codeSnippet);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = activeRecipe.codeSnippet;
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
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code recipe snippet:', err);
    }
  };

  return (
    <section
      id="recipes"
      className={`relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 ${className}`}
    >
      {/* Section Header */}
      <div className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>Production Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
          Real-World Engineering Recipes
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 mt-3 leading-relaxed">
          Copy-paste production patterns for emergency dispatch, bilingual checkout dropdowns, and PWA code splitting.
        </p>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div
          role="tablist"
          aria-label="Production recipe tabs"
          className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10"
        >
          {RECIPES.map((recipe, index) => {
            const Icon = recipe.tabIcon;
            const isActive = recipe.id === activeTab;
            return (
              <button
                key={recipe.id}
                ref={(el) => {
                  tabButtonRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                onClick={() => {
                  setActiveTab(recipe.id);
                  setCopied(false);
                }}
                className={`pressable inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white shadow-md border border-white/20 font-semibold'
                    : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? recipe.badgeTone === 'emerald'
                        ? 'text-emerald-400'
                        : recipe.badgeTone === 'cyan'
                        ? 'text-cyan-400'
                        : 'text-purple-400'
                      : 'text-neutral-500'
                  }`}
                />
                <span>{recipe.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panel: Two-Column Responsive Layout */}
      <div
        role="tabpanel"
        aria-label={activeRecipe.title}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Left Column: Explanatory Card & Architectural Benefits */}
        <div className="lg:col-span-5 glass-chrome rounded-2xl border border-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                  activeRecipe.badgeTone === 'emerald'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : activeRecipe.badgeTone === 'cyan'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                }`}
              >
                {activeRecipe.badge}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                {activeRecipe.benchmark}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeRecipe.title}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {activeRecipe.scenario}
            </p>
          </div>

          {/* Key Architectural Benefits */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Architectural Highlights</span>
            </div>

            <ul className="space-y-2.5">
              {activeRecipe.benefits.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{b.title}: </span>
                    <span className="text-neutral-400">{b.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Syntax-Highlighted Code Block with Window Controls */}
        <div className="lg:col-span-7 glass-subtle rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Code Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 select-none">
            <div className="flex items-center gap-2">
              {/* Window dots */}
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                <span>{activeRecipe.filename}</span>
              </div>
            </div>

            {/* 1-Click "Copy Snippet" Button with Checkmark Animation */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Code snippet copied' : 'Copy code snippet'}
              className={`pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
                  <span className="font-semibold text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Code Block */}
          <div className="p-4 sm:p-5 bg-black/75 overflow-x-auto flex-1 select-text">
            <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-200">
              <code>{activeRecipe.renderCode()}</code>
            </pre>
          </div>

          {/* Window Footer Tag */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-white/10 text-[11px] font-mono text-neutral-500">
            <span>TypeScript • pak-geodata v0.2.0</span>
            <span className="text-emerald-400">Production Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
