import Header from './components/Header';
import Hero from './components/Hero';
import Studio from './components/Studio';
import Capabilities from './components/Capabilities';
import Recipes from './components/Recipes';
import Coverage from './components/Coverage';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden flex flex-col">
      <Header />
      <main className="flex flex-col flex-1">
        <Hero />
        <Studio />
        <Capabilities />
        <Recipes />
        <Coverage />
      </main>
      <Footer />
    </div>
  );
}
