import type {
  PakLocationItem,
  PakistanProvince,
  PakistanCity,
  PakistanArea
} from './types.js';
import { provinces } from './data/provinces.js';
import { cities } from './data/cities.js';
import { allAreas } from './data/areas/index.js';
import { toEasternDigits, normalizeUrduText } from './urdu.js';
import { searchAreas } from './search.js';

/**
 * Pre-indexed lookup map for O(1) city lookups.
 * Indexes canonical slug, English name, and Urdu name representations.
 */
export const cityLookupMap = new Map<string, PakistanCity>();

for (const c of cities) {
  cityLookupMap.set(c.id.toLowerCase().trim(), c);
  cityLookupMap.set(c.name.toLowerCase().trim(), c);
  if (c.urduName) {
    cityLookupMap.set(c.urduName.trim(), c);
    cityLookupMap.set(toEasternDigits(c.urduName).trim(), c);
    const normUrdu = normalizeUrduText(c.urduName);
    if (normUrdu) {
      cityLookupMap.set(normUrdu, c);
    }
  }
}

/**
 * Pre-indexed mapping of areas grouped by city ID.
 */
const areasByCityMap = new Map<string, PakistanArea[]>();
for (const a of allAreas) {
  const cKey = a.cityId.toLowerCase();
  const list = areasByCityMap.get(cKey) || [];
  list.push(a);
  areasByCityMap.set(cKey, list);
}

/**
 * Maps an area's slug so that Roman numerals in name (e.g. "Gulberg III")
 * produce aligned canonical slugs (e.g. "lahore-gulberg-iii").
 */
function canonicalAreaSlug(area: PakistanArea): string {
  const romanMatch = area.name.match(/\b([IVXLCDM]+)$/i);
  if (romanMatch) {
    const romanLower = romanMatch[1].toLowerCase();
    return area.id.replace(/-\d+$/, `-${romanLower}`);
  }
  return area.id;
}

/**
 * Pre-indexed compound lookup map for O(1) area lookups: `${cityKey}:${areaKey}`.
 * Indexes canonical slugs, Roman numeral variants, title names, and colloquial aliases.
 */
export const areaCompoundLookupMap = new Map<string, PakistanArea>();

for (const a of allAreas) {
  const cityId = a.cityId.toLowerCase();
  const city = cityLookupMap.get(cityId);

  const cityKeys = new Set<string>([cityId]);
  if (city?.name) {
    cityKeys.add(city.name.toLowerCase().trim());
  }

  const variants = new Set<string>();

  // 1. Raw area ID
  const rawId = a.id.toLowerCase().trim();
  variants.add(rawId);

  // 2. Slug without city prefix
  if (rawId.startsWith(`${cityId}-`)) {
    variants.add(rawId.slice(cityId.length + 1));
  }

  // 3. Canonical slug with Roman numeral alignment
  const canonSlug = canonicalAreaSlug(a).toLowerCase().trim();
  variants.add(canonSlug);
  if (canonSlug.startsWith(`${cityId}-`)) {
    variants.add(canonSlug.slice(cityId.length + 1));
  }

  // 4. Exact English name
  const rawName = a.name.toLowerCase().trim();
  variants.add(rawName);

  // 5. Slugified name
  const slugifiedName = rawName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  variants.add(slugifiedName);
  variants.add(`${cityId}-${slugifiedName}`);

  // 6. Aliases
  for (const alias of a.aliases) {
    const lowerAlias = alias.toLowerCase().trim();
    variants.add(lowerAlias);
    const slugAlias = lowerAlias.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    variants.add(slugAlias);
    variants.add(`${cityId}-${slugAlias}`);
  }

  // 7. Urdu names
  if (a.urduName) {
    variants.add(a.urduName.trim());
    variants.add(toEasternDigits(a.urduName).trim());
    const norm = normalizeUrduText(a.urduName);
    if (norm) {
      variants.add(norm);
    }
  }

  // 8. Known colloquial mappings
  if (cityId === 'lahore' && a.id === 'lahore-gulberg-3') {
    variants.add('gulberg');
    variants.add('lahore-gulberg');
  }

  // Populate compound map for every city key and area key combination
  for (const cKey of cityKeys) {
    for (const v of variants) {
      const compoundKey = `${cKey}:${v}`;
      if (!areaCompoundLookupMap.has(compoundKey)) {
        areaCompoundLookupMap.set(compoundKey, a);
      }
    }
  }
}

/**
 * Resolves a city name in the requested language ('en' or 'ur') from either
 * a slug or title-cased English name. Falls back to the input key if unverified.
 */
export function getCityName(key: string, lang: 'en' | 'ur' = 'en'): string {
  if (typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';
  const city = cityLookupMap.get(trimmed.toLowerCase());
  if (!city) return key;
  return lang === 'ur' ? toEasternDigits(city.urduName) : city.name;
}

/**
 * Resolves an area name in the requested language ('en' or 'ur') given a city key
 * and area key (slug, title name, or colloquial alias). Falls back to the input areaKey if unverified.
 */
export function getAreaName(cityKey: string, areaKey: string, lang: 'en' | 'ur' = 'en'): string {
  if (typeof areaKey !== 'string') return '';
  if (typeof cityKey !== 'string') return areaKey;
  const trimmedArea = areaKey.trim();
  const trimmedCity = cityKey.trim();
  if (!trimmedArea) return areaKey;
  if (!trimmedCity) return areaKey;

  let match = areaCompoundLookupMap.get(`${trimmedCity.toLowerCase()}:${trimmedArea.toLowerCase()}`);
  if (!match) {
    const city = cityLookupMap.get(trimmedCity.toLowerCase());
    if (city) {
      match = areaCompoundLookupMap.get(`${city.id}:${trimmedArea.toLowerCase()}`);
    }
  }

  if (!match) return areaKey;
  return lang === 'ur' ? toEasternDigits(match.urduName || match.name) : match.name;
}

/**
 * Converts a raw PakistanProvince, PakistanCity, or PakistanArea into a unified PakLocationItem.
 */
export function toLocationItem(
  entity: PakistanProvince | PakistanCity | PakistanArea
): PakLocationItem {
  if (!entity || typeof entity !== 'object') {
    throw new TypeError('Expected a valid location entity');
  }

  // 1. Province: has capitalCityId
  if ('capitalCityId' in entity) {
    return {
      id: entity.id,
      nameEn: entity.name,
      nameUr: toEasternDigits(entity.urduName),
      type: 'province',
      parentId: undefined,
      coordinates: undefined
    };
  }

  // 2. City: has district and provinceId without cityId
  if ('district' in entity && !('cityId' in entity)) {
    return {
      id: entity.id,
      nameEn: entity.name,
      nameUr: toEasternDigits(entity.urduName),
      type: 'district',
      parentId: entity.provinceId,
      coordinates: entity.coordinates
    };
  }

  // 3. Area: has cityId
  const area = entity as PakistanArea;
  return {
    id: canonicalAreaSlug(area),
    nameEn: area.name,
    nameUr: toEasternDigits(area.urduName || area.name),
    type: 'area',
    parentId: area.cityId,
    coordinates: area.coordinates
  };
}

/**
 * Returns all verified provinces as PakLocationItem hierarchy elements.
 */
export function getProvincesAsLocationItems(): PakLocationItem[] {
  return provinces.map(toLocationItem);
}

/**
 * Returns verified cities as PakLocationItem hierarchy elements, optionally filtered by province ID.
 */
export function getCitiesAsLocationItems(provinceId?: string): PakLocationItem[] {
  let list = cities;
  if (provinceId && typeof provinceId === 'string') {
    const provKey = provinceId.toLowerCase().trim();
    list = cities.filter((c) => c.provinceId.toLowerCase() === provKey);
  }
  return list.map(toLocationItem);
}

/**
 * Returns all verified areas in a given city as PakLocationItem hierarchy elements.
 */
export function getAreasAsLocationItems(cityKey: string): PakLocationItem[] {
  if (typeof cityKey !== 'string') return [];
  const trimmed = cityKey.trim();
  if (!trimmed) return [];
  const city = cityLookupMap.get(trimmed.toLowerCase());
  const cityId = city ? city.id : trimmed.toLowerCase();
  const areas = areasByCityMap.get(cityId) || [];
  return areas.map(toLocationItem);
}

/**
 * Searches areas within a specific city and returns ranked results as PakLocationItem[].
 */
export function searchLocationItems(
  cityKey: string,
  query: string,
  _lang?: 'en' | 'ur'
): PakLocationItem[] {
  if (typeof cityKey !== 'string' || typeof query !== 'string') return [];
  const trimmedCity = cityKey.trim();
  const trimmedQuery = query.trim();
  if (!trimmedCity || !trimmedQuery) return [];

  const city = cityLookupMap.get(trimmedCity.toLowerCase());
  if (!city) return [];

  const results = searchAreas(trimmedQuery, { cityId: city.id });
  return results.map(toLocationItem);
}
