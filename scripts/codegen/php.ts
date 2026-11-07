import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs';
import { basename, join, resolve } from 'node:path';

export interface AreaJson {
  id: string;
  cityId: string;
  provinceId: string;
  name: string;
  urduName?: string;
  aliases: string[];
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: string;
  verified: boolean;
  sources?: unknown[];
}

export interface CityJson {
  id: string;
  name: string;
  urduName: string;
  provinceId: string;
  division?: string;
  district?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postalCodeRange?: [string, string];
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  totalAreasCount?: number;
}

export interface ProvinceJson {
  id: string;
  name: string;
  urduName: string;
  capitalCityId: string;
  type: string;
}

export interface CodegenResult {
  provincesCount: number;
  citiesCount: number;
  areasCount: number;
}

export function escapePhpString(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '0';
  if (typeof v === 'string') return `'${escapePhpString(v)}'`;
  if (Array.isArray(v)) {
    return '[' + v.map(formatValue).join(', ') + ']';
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `'${k}' => ${formatValue(val)}`);
    return '[' + entries.join(', ') + ']';
  }
  return 'null';
}

export function generatePhpProvinces(provinces: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const p of provinces) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(p.id)},\n`;
    out += `        'name' => ${formatValue(p.name)},\n`;
    out += `        'urduName' => ${formatValue(p.urduName)},\n`;
    out += `        'capitalCityId' => ${formatValue(p.capitalCityId)},\n`;
    out += `        'type' => ${formatValue(p.type)},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}

export function generatePhpCities(cities: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const c of cities) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(c.id)},\n`;
    out += `        'name' => ${formatValue(c.name)},\n`;
    out += `        'urduName' => ${formatValue(c.urduName)},\n`;
    out += `        'provinceId' => ${formatValue(c.provinceId)},\n`;
    out += `        'division' => ${formatValue(c.division)},\n`;
    out += `        'district' => ${formatValue(c.district)},\n`;
    out += `        'coordinates' => ${formatValue(c.coordinates)},\n`;
    out += `        'bounds' => ${formatValue(c.bounds)},\n`;
    out += `        'postalCodeRange' => ${formatValue(c.postalCodeRange)},\n`;
    out += `        'totalAreasCount' => ${formatValue(c.totalAreasCount)},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}

export function generatePhpAreas(areas: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const a of areas) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(a.id)},\n`;
    out += `        'cityId' => ${formatValue(a.cityId)},\n`;
    out += `        'provinceId' => ${formatValue(a.provinceId)},\n`;
    out += `        'name' => ${formatValue(a.name)},\n`;
    out += `        'urduName' => ${formatValue(a.urduName)},\n`;
    out += `        'postalCode' => ${formatValue(a.postalCode)},\n`;
    out += `        'coordinates' => ${formatValue(a.coordinates)},\n`;
    out += `        'aliases' => ${formatValue(a.aliases || [])},\n`;
    out += `        'type' => ${formatValue(a.type)},\n`;
    out += `        'verified' => ${formatValue(a.verified)},\n`;
    out += `        'sources' => ${formatValue(a.sources || [])},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}

export function findJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

export async function generatePhpData(
  dataDir: string,
  phpSrcDir: string,
  cityAreaCounts: Record<string, number> = {}
): Promise<CodegenResult> {
  const dataOutDir = resolve(phpSrcDir, 'Data');
  mkdirSync(dataOutDir, { recursive: true });

  // 1. Provinces
  const provincesRaw = JSON.parse(
    readFileSync(resolve(dataDir, 'provinces.json'), 'utf-8')
  ) as ProvinceJson[];
  const provincesPhp = generatePhpProvinces(provincesRaw);
  writeFileSync(resolve(dataOutDir, 'Provinces.php'), provincesPhp, 'utf-8');
  const provincesCount = provincesRaw.length;

  // 2. Areas
  const areaFiles = findJsonFiles(resolve(dataDir, 'areas')).sort();
  const allAreas: AreaJson[] = [];
  for (const filePath of areaFiles) {
    const citySlug = basename(filePath, '.json');
    const content = JSON.parse(readFileSync(filePath, 'utf-8')) as AreaJson[];
    cityAreaCounts[citySlug] = content.length;
    allAreas.push(...content);
  }
  const areasPhp = generatePhpAreas(allAreas);
  writeFileSync(resolve(dataOutDir, 'Areas.php'), areasPhp, 'utf-8');
  const areasCount = allAreas.length;

  // 3. Cities with totalAreasCount
  const cityFiles = readdirSync(resolve(dataDir, 'cities'))
    .filter((f) => f.endsWith('.json'))
    .sort();
  const allCities: CityJson[] = [];
  for (const f of cityFiles) {
    const citiesInFile = JSON.parse(
      readFileSync(resolve(dataDir, 'cities', f), 'utf-8')
    ) as CityJson[];
    for (const city of citiesInFile) {
      allCities.push({
        ...city,
        totalAreasCount: cityAreaCounts[city.id] || 0
      });
    }
  }
  const citiesPhp = generatePhpCities(allCities);
  writeFileSync(resolve(dataOutDir, 'Cities.php'), citiesPhp, 'utf-8');
  const citiesCount = allCities.length;

  return {
    provincesCount,
    citiesCount,
    areasCount
  };
}
