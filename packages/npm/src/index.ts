import type {
  Coordinates,
  AreaType,
  PakistanArea,
  PakistanCity,
  PakistanProvince,
  ProvinceType,
  SearchOptions,
  NearestAreaOptions
} from './types.js';

import { provinces } from './data/provinces.js';
import { cities } from './data/cities.js';
import { allAreas } from './data/areas/index.js';

import { haversineDistanceKm, getNearestArea } from './geo.js';
import { searchAreas } from './search.js';

// Pre-indexed lookup maps for O(1) lookups
const provinceByIdMap = new Map<string, PakistanProvince>();
for (const p of provinces) {
  provinceByIdMap.set(p.id.toLowerCase(), p);
}

const cityByIdMap = new Map<string, PakistanCity>();
const citiesByProvinceMap = new Map<string, PakistanCity[]>();
for (const c of cities) {
  cityByIdMap.set(c.id.toLowerCase(), c);
  const provKey = c.provinceId.toLowerCase();
  const list = citiesByProvinceMap.get(provKey) || [];
  list.push(c);
  citiesByProvinceMap.set(provKey, list);
}

const areasByCityMap = new Map<string, PakistanArea[]>();
const areaByPostalCodeMap = new Map<string, PakistanArea>();
const areasByPostalCodeMap = new Map<string, PakistanArea[]>();

for (const a of allAreas) {
  const cityKey = a.cityId.toLowerCase();
  const cityList = areasByCityMap.get(cityKey) || [];
  cityList.push(a);
  areasByCityMap.set(cityKey, cityList);

  if (a.postalCode) {
    if (!areaByPostalCodeMap.has(a.postalCode)) {
      areaByPostalCodeMap.set(a.postalCode, a);
    }
    const postList = areasByPostalCodeMap.get(a.postalCode) || [];
    postList.push(a);
    areasByPostalCodeMap.set(a.postalCode, postList);
  }
}

/**
 * Returns all verified provinces and administrative territories of Pakistan.
 */
export function getAllProvinces(): PakistanProvince[] {
  return [...provinces];
}

/**
 * Finds a province by its unique identifier (e.g. "punjab", "sindh", "islamabad-ict").
 */
export function getProvinceById(id: string): PakistanProvince | undefined {
  if (typeof id !== 'string') return undefined;
  return provinceByIdMap.get(id.toLowerCase().trim());
}

/**
 * Returns all verified cities in Pakistan.
 */
export function getAllCities(): PakistanCity[] {
  return [...cities];
}

/**
 * Retrieves all cities belonging to a specified province.
 */
export function getCitiesByProvince(provinceId: string): PakistanCity[] {
  if (typeof provinceId !== 'string') return [];
  return [...(citiesByProvinceMap.get(provinceId.toLowerCase().trim()) || [])];
}

/**
 * Finds a city by its canonical slug identifier (e.g. "lahore", "karachi", "islamabad").
 */
export function getCityById(id: string): PakistanCity | undefined {
  if (typeof id !== 'string') return undefined;
  return cityByIdMap.get(id.toLowerCase().trim());
}

/**
 * Returns all verified areas across all cities in Pakistan.
 */
export function getAllAreas(): PakistanArea[] {
  return [...allAreas];
}

/**
 * Returns all verified areas within a given city.
 */
export function getAreasByCity(cityId: string): PakistanArea[] {
  if (typeof cityId !== 'string') return [];
  return [...(areasByCityMap.get(cityId.toLowerCase().trim()) || [])];
}

/**
 * Resolves the primary area associated with a 5-digit Pakistan Post postal code.
 */
export function findAreaByPostalCode(postalCode: string | number): PakistanArea | undefined {
  if (typeof postalCode !== 'string' && typeof postalCode !== 'number') return undefined;
  return areaByPostalCodeMap.get(String(postalCode).trim());
}

/**
 * Returns all areas sharing a given 5-digit Pakistan Post postal code.
 */
export function findAreasByPostalCode(postalCode: string | number): PakistanArea[] {
  if (typeof postalCode !== 'string' && typeof postalCode !== 'number') return [];
  return [...(areasByPostalCodeMap.get(String(postalCode).trim()) || [])];
}

// Re-export search and spatial utilities
export { searchAreas, haversineDistanceKm, getNearestArea };

// Re-export core types
export type {
  Coordinates,
  AreaType,
  PakistanArea,
  PakistanCity,
  PakistanProvince,
  ProvinceType,
  SearchOptions,
  NearestAreaOptions
};
