import type { PakistanArea } from 'pak-geodata';

export type CodeLanguage = 'typescript' | 'python';

/**
 * Returns camelCase variable name for city subpath export:
 * e.g. "lahore" -> "lahoreAreas", "islamabad" -> "islamabadAreas"
 */
export function getCityExportVar(cityId: string): string {
  const camel = cityId.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return `${camel}Areas`;
}

/**
 * Formats GPS coordinates to 4 decimal places with cardinal directions.
 * e.g. 31.4581, 74.4121 -> "31.4581° N, 74.4121° E"
 */
export function formatGpsCoordinates(lat: number, lng: number): string {
  const latCard = lat >= 0 ? 'N' : 'S';
  const lngCard = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latCard}, ${Math.abs(lng).toFixed(4)}° ${lngCard}`;
}

/**
 * Generates copyable, runnable code snippet for an area in TypeScript or Python.
 */
export function generateCodeSnippet(area: PakistanArea, language: CodeLanguage): string {
  const escapedName = area.name.replace(/'/g, "\\'");
  const citySlug = area.cityId;
  const exportVar = getCityExportVar(citySlug);

  if (language === 'typescript') {
    return [
      `import { searchAreas, getNearestArea } from 'pak-geodata';`,
      `// Subpath tree-shaking (~24 KB):`,
      `import { ${exportVar} } from 'pak-geodata/areas/${citySlug}';`,
      ``,
      `const area = searchAreas('${escapedName}', { cityId: '${area.cityId}' })[0];`,
    ].join('\n');
  }

  return [
    `from pak_geodata import search_areas, get_nearest_area`,
    ``,
    `area = search_areas('${escapedName}', city_id='${area.cityId}')[0]`,
  ].join('\n');
}
