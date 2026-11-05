import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { basename, join, resolve } from 'node:path';

export interface AreaJson {
  id: string;
  cityId: string;
  provinceId: string;
  name: string;
  aliases: string[];
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
  sources: string[];
  urduName?: string;
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

export interface CodegenResult {
  provincesCount: number;
  citiesCount: number;
  areasCount: number;
}

export function toCamelCase(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
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

export async function generateTypeScriptData(
  dataDir: string,
  npmSrcDir: string,
  cityAreaCounts: Record<string, number> = {}
): Promise<CodegenResult> {
  // Ensure base output directory exists
  mkdirSync(resolve(npmSrcDir, 'data'), { recursive: true });

  // 1. Provinces
  const provincesRaw = JSON.parse(
    readFileSync(resolve(dataDir, 'provinces.json'), 'utf-8')
  );
  const provincesTs = `import type { PakistanProvince } from "../types.js";\n\nexport const provinces: readonly PakistanProvince[] = ${JSON.stringify(
    provincesRaw,
    null,
    2
  )};\n`;
  writeFileSync(resolve(npmSrcDir, 'data/provinces.ts'), provincesTs, 'utf-8');
  const provincesCount = Array.isArray(provincesRaw) ? provincesRaw.length : 0;

  // 2. Areas per city
  const areaFiles = findJsonFiles(resolve(dataDir, 'areas'));
  const cityAreaMap = new Map<string, AreaJson[]>();
  let areasCount = 0;

  const npmAreasDataDir = resolve(npmSrcDir, 'data/areas');
  if (existsSync(npmAreasDataDir)) {
    rmSync(npmAreasDataDir, { recursive: true, force: true });
  }
  mkdirSync(npmAreasDataDir, { recursive: true });

  const npmAreasSubpathDir = resolve(npmSrcDir, 'areas');
  if (existsSync(npmAreasSubpathDir)) {
    rmSync(npmAreasSubpathDir, { recursive: true, force: true });
  }
  mkdirSync(npmAreasSubpathDir, { recursive: true });

  for (const filePath of areaFiles) {
    const citySlug = basename(filePath, '.json');
    const content = JSON.parse(readFileSync(filePath, 'utf-8')) as AreaJson[];
    cityAreaMap.set(citySlug, content);
    cityAreaCounts[citySlug] = content.length;
    areasCount += content.length;

    const varName = `${toCamelCase(citySlug)}Areas`;
    const cityTsContent = `import type { PakistanArea } from "../../types.js";\n\nexport const ${varName}: readonly PakistanArea[] = ${JSON.stringify(
      content,
      null,
      2
    )};\n`;
    writeFileSync(resolve(npmAreasDataDir, `${citySlug}.ts`), cityTsContent, 'utf-8');

    // Subpath tree-shaking entry point
    const subpathContent = `export { ${varName} } from "../data/areas/${citySlug}.js";\nexport type { PakistanArea } from "../types.js";\n`;
    writeFileSync(resolve(npmAreasSubpathDir, `${citySlug}.ts`), subpathContent, 'utf-8');
  }

  // 3. Aggregate areas index.ts
  const citySlugs = Array.from(cityAreaMap.keys()).sort();
  const importLines = citySlugs
    .map((slug) => `import { ${toCamelCase(slug)}Areas } from "./${slug}.js";`)
    .join('\n');
  const exportList = citySlugs.map((slug) => `${toCamelCase(slug)}Areas`).join(', ');
  const spreadList = citySlugs.map((slug) => `  ...${toCamelCase(slug)}Areas`).join(',\n');

  const areasIndexTs = `import type { PakistanArea } from "../../types.js";\n${importLines}\n\nexport { ${exportList} };\n\nexport const allAreas: readonly PakistanArea[] = [\n${spreadList}\n];\n`;
  writeFileSync(resolve(npmAreasDataDir, 'index.ts'), areasIndexTs, 'utf-8');

  // 4. Cities with dynamic totalAreasCount
  const cityFiles = readdirSync(resolve(dataDir, 'cities'))
    .filter((f) => f.endsWith('.json'))
    .sort();

  const allCities: CityJson[] = [];
  for (const f of cityFiles) {
    const citiesInFile = JSON.parse(
      readFileSync(resolve(dataDir, 'cities', f), 'utf-8')
    ) as CityJson[];
    for (const city of citiesInFile) {
      const enrichedCity: CityJson = {
        ...city,
        totalAreasCount: cityAreaCounts[city.id] || 0
      };
      allCities.push(enrichedCity);
    }
  }

  const citiesTs = `import type { PakistanCity } from "../types.js";\n\nexport const cities: readonly PakistanCity[] = ${JSON.stringify(
    allCities,
    null,
    2
  )};\n`;
  writeFileSync(resolve(npmSrcDir, 'data/cities.ts'), citiesTs, 'utf-8');
  const citiesCount = allCities.length;

  return {
    provincesCount,
    citiesCount,
    areasCount
  };
}
