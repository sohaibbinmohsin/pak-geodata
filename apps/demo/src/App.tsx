import { useState, useMemo } from 'react';
import Header from './components/Header';
import MapCanvas from './components/MapCanvas';
import CityPills from './components/CityPills';
import Omnibar from './components/Omnibar';
import { getAllAreas, getCityById, type PakistanArea, type PakistanCity } from 'pak-geodata';

export default function App() {
  const allAreas = useMemo(() => getAllAreas(), []);

  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);
  const [selectedArea, setSelectedArea] = useState<PakistanArea | null>(null);

  const filteredAreas = useMemo(() => {
    if (!selectedCity) return allAreas;
    return allAreas.filter((area) => area.cityId === selectedCity.id);
  }, [allAreas, selectedCity]);

  const handleSelectArea = (area: PakistanArea | null) => {
    setSelectedArea(area);
    if (area && selectedCity && selectedCity.id !== area.cityId) {
      const targetCity = getCityById(area.cityId);
      if (targetCity) {
        setSelectedCity(targetCity);
      }
    }
  };

  const handleSelectCity = (city: PakistanCity | null) => {
    setSelectedCity(city);
    // If an area from another city was selected, deselect it
    if (city && selectedArea && selectedArea.cityId !== city.id) {
      setSelectedArea(null);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#0b0f17] overflow-hidden">
      {/* Floating Glass Header */}
      <Header />

      {/* Floating Top Controls: Omnibar & City Filter Pills */}
      <div className="fixed top-[138px] sm:top-[106px] lg:top-[74px] inset-x-3 sm:inset-x-4 z-30 pointer-events-none flex flex-col items-center gap-2">
        <Omnibar
          selectedCity={selectedCity}
          selectedArea={selectedArea}
          onSelectArea={handleSelectArea}
          onSelectCity={handleSelectCity}
        />
        <CityPills
          selectedCity={selectedCity}
          allAreas={allAreas}
          onSelectCity={handleSelectCity}
        />
      </div>

      {/* Full-Screen Interactive Leaflet Map Canvas */}
      <MapCanvas
        areas={filteredAreas}
        selectedArea={selectedArea}
        selectedCity={selectedCity}
        onSelectArea={handleSelectArea}
        onMapClick={(coords) => {
          // Ready for Task 5 reverse geocoding playground
          console.debug('Map canvas clicked at:', coords);
        }}
      />
    </div>
  );
}
