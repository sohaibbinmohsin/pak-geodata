import { getAllProvinces, getAllCities, getAllAreas } from 'pak-geodata';

export default function App() {
  const provinces = getAllProvinces();
  const cities = getAllCities();
  const areas = getAllAreas();

  return (
    <div className="relative w-screen h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="glass-chrome rounded-2xl p-8 max-w-lg w-full text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          pak-geodata demo initialized
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Pakistan Geographic Intelligence
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Clean scaffolding verified: <span className="text-white font-medium">{provinces.length} Provinces</span>,{' '}
          <span className="text-white font-medium">{cities.length} Cities</span>, and{' '}
          <span className="text-white font-medium">{areas.length} Golden Areas</span> wired directly from local monorepo.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button className="pressable px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-medium transition-colors">
            Explore Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
