import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Capabilities from './components/Capabilities';
import Recipes from './components/Recipes';
import Coverage from './components/Coverage';
import Footer from './components/Footer';
import StudioScreen from './components/StudioScreen';

export default function App() {
  const [view, setView] = useState<'landing' | 'studio'>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#studio'
      ? 'studio'
      : 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        if (window.location.hash === '#studio') {
          setView('studio');
        } else {
          setView('landing');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openStudio = () => {
    setView('studio');
    if (typeof window !== 'undefined') {
      window.location.hash = '#studio';
    }
  };

  const closeStudio = () => {
    setView('landing');
    if (typeof window !== 'undefined' && window.location.hash === '#studio') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  if (view === 'studio') {
    return <StudioScreen onClose={closeStudio} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden flex flex-col">
      <Header />
      <main className="flex flex-col flex-1">
        <Hero onOpenStudio={openStudio} />
        <Capabilities />
        <Recipes />
        <Coverage />
      </main>
      <Footer />
    </div>
  );
}
