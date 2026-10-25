import type { Coordinates, NearestAreaOptions, PakistanArea } from './types.js';
import { allAreas } from './data/areas/index.js';

// Pre-indexed lookup map for O(1) candidate pool selection by city
const areasByCityMap = new Map<string, PakistanArea[]>();
for (const a of allAreas) {
  const cityKey = a.cityId.toLowerCase();
  const list = areasByCityMap.get(cityKey) || [];
  list.push(a);
  areasByCityMap.set(cityKey, list);
}

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 *
 * @param c1 - Starting coordinates (lat, lng)
 * @param c2 - Ending coordinates (lat, lng)
 * @returns Distance in kilometers
 */
export function haversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  if (c1.lat === c2.lat && c1.lng === c2.lng) {
    return 0;
  }

  const R = 6371; // Earth mean radius in kilometers
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1Rad = (c1.lat * Math.PI) / 180;
  const lat2Rad = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Finds the nearest verified PakistanArea to the given coordinates.
 *
 * @param coords - Coordinates to search near
 * @param options - Optional filters (cityId, provinceId, maxDistanceKm)
 * @param candidateAreas - Optional custom pool of areas (defaults to all verified areas)
 * @returns Closest PakistanArea or null if no area satisfies the criteria
 */
export function getNearestArea(
  coords: Coordinates,
  options?: NearestAreaOptions,
  candidateAreas: readonly PakistanArea[] = allAreas
): PakistanArea | null {
  let filtered = candidateAreas;

  if (options?.cityId && typeof options.cityId === 'string') {
    const cityId = options.cityId.toLowerCase().trim();
    if (candidateAreas === allAreas) {
      filtered = areasByCityMap.get(cityId) || [];
    } else {
      filtered = filtered.filter((a) => a.cityId.toLowerCase() === cityId);
    }
  }

  if (options?.provinceId && typeof options.provinceId === 'string') {
    const provinceId = options.provinceId.toLowerCase().trim();
    filtered = filtered.filter((a) => a.provinceId.toLowerCase() === provinceId);
  }

  if (filtered.length === 0) {
    return null;
  }

  let nearest: PakistanArea | null = null;
  let minDistance = Infinity;

  for (const area of filtered) {
    const dist = haversineDistanceKm(coords, area.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = area;
    }
  }

  if (options?.maxDistanceKm !== undefined && minDistance > options.maxDistanceKm) {
    return null;
  }

  return nearest;
}
