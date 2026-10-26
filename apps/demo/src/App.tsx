import { useState, useMemo } from 'react';
import Header from './components/Header';
import MapCanvas from './components/MapCanvas';
import { getAllAreas, type PakistanArea, type PakistanCity } from 'pak-geodata';

export default function App() {
  const allAreas = useMemo(() => getAllAreas(), []);

  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);
  const [selectedArea, setSelectedArea] = useState<PakistanArea | null>(null);

  // Ready for Task 4 CityPills & Omnibar integration
  void setSelectedCity;

  const filteredAreas = useMemo(() => {
    if (!selectedCity) return allAreas;
    return allAreas.filter((area) => area.cityId === selectedCity.id);
  }, [allAreas, selectedCity]);

  return (
    <div className="relative w-screen h-screen bg-[#0b0f17] overflow-hidden">
      {/* Floating Glass Header */}
      <Header />

      {/* Full-Screen Interactive Leaflet Map Canvas */}
      <MapCanvas
        areas={filteredAreas}
        selectedArea={selectedArea}
        selectedCity={selectedCity}
        onSelectArea={(area) => {
          setSelectedArea(area);
        }}
        onMapClick={(coords) => {
          // Ready for Task 5 reverse geocoding playground
          console.debug('Map canvas clicked at:', coords);
        }}
      />
    </div>
  );
}
