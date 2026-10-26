import { useState, useMemo } from 'react';
import Header from './components/Header';
import MapCanvas from './components/MapCanvas';
import CityPills from './components/CityPills';
import Omnibar from './components/Omnibar';
import ReverseGeoCard, { type ReverseGeoPoint } from './components/ReverseGeoCard';
import AreaInspector from './components/AreaInspector';
import { getAllAreas, getCityById, type PakistanArea, type PakistanCity } from 'pak-geodata';

export default function App() {
  const allAreas = useMemo(() => getAllAreas(), []);

  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);
  const [selectedArea, setSelectedArea] = useState<PakistanArea | null>(null);
  const [reverseGeoPoint, setReverseGeoPoint] = useState<ReverseGeoPoint | null>(null);

  const filteredAreas = useMemo(() => {
    if (!selectedCity) return allAreas;
    return allAreas.filter((area) => area.cityId === selectedCity.id);
  }, [allAreas, selectedCity]);

  const handleSelectArea = (area: PakistanArea | null) => {
    setSelectedArea(area);
    if (area) {
      setReverseGeoPoint(null);
    }
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
    // If reverse geo point is from another city, clear it
    if (city && reverseGeoPoint && reverseGeoPoint.nearest.cityId !== city.id) {
      setReverseGeoPoint(null);
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

      {/* Floating Area Inspector Drawer */}
      {selectedArea && (
        <AreaInspector
          area={selectedArea}
          onClose={() => setSelectedArea(null)}
        />
      )}

      {/* Floating Reverse Geocode Result Card */}
      {reverseGeoPoint && !selectedArea && (
        <div className="fixed bottom-5 left-4 sm:left-6 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 pointer-events-none">
          <ReverseGeoCard
            point={reverseGeoPoint}
            onSelectArea={handleSelectArea}
            onDismiss={() => setReverseGeoPoint(null)}
          />
        </div>
      )}

      {/* Full-Screen Interactive Leaflet Map Canvas */}
      <MapCanvas
        areas={filteredAreas}
        selectedArea={selectedArea}
        selectedCity={selectedCity}
        reverseGeoPoint={reverseGeoPoint}
        onSelectArea={handleSelectArea}
        onReverseGeoChange={setReverseGeoPoint}
      />
    </div>
  );
}
