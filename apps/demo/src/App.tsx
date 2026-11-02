import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Capabilities from './components/Capabilities';
import Recipes from './components/Recipes';
import Coverage from './components/Coverage';
import Footer from './components/Footer';
import StudioScreen from './components/StudioScreen';

export default function App() {
  const isStudioPath = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/studio' ||
      window.location.pathname === '/studio/' ||
      window.location.hash === '#studio'
    );
  };

  const [view, setView] = useState<'landing' | 'studio'>(() => {
    return isStudioPath() ? 'studio' : 'landing';
  });

  useEffect(() => {
    const handleNavigation = () => {
      if (isStudioPath()) {
        setView('studio');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  const openStudio = () => {
    setView('studio');
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#studio') {
        window.history.replaceState(null, '', '/studio');
      } else if (window.location.pathname !== '/studio') {
        window.history.pushState(null, '', '/studio');
      }
    }
  };

  const closeStudio = () => {
    setView('landing');
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/studio' || window.location.pathname === '/studio/') {
        window.history.pushState(null, '', '/');
      } else if (window.location.hash === '#studio') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
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
