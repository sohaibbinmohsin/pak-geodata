import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { verifyAllData } from './verify.js';

interface AreaJson {
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

interface CityJson {
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

function toCamelCase(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function findJsonFiles(dir: string): string[] {
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

async function main() {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const npmSrcDir = resolve(rootDir, 'packages/npm/src');
  const pypiDataDir = resolve(rootDir, 'packages/pypi/pak_geodata/data');

  console.log('=== Step 1: Validating all repository geodata ===');
  const verifyResult = await verifyAllData();
  if (!verifyResult.success) {
    console.error('Data verification failed. Aborting build.');
    process.exit(1);
  }

  console.log('\n=== Step 2: Synchronizing data to packages/pypi ===');
  if (existsSync(pypiDataDir)) {
    rmSync(pypiDataDir, { recursive: true, force: true });
  }
  mkdirSync(pypiDataDir, { recursive: true });
  cpSync(dataDir, pypiDataDir, { recursive: true });
  console.log('✔ Master data synchronized to packages/pypi/pak_geodata/data/');

  const rootLicense = resolve(rootDir, 'LICENSE');
  if (existsSync(rootLicense)) {
    cpSync(rootLicense, resolve(rootDir, 'packages/npm/LICENSE'));
    cpSync(rootLicense, resolve(rootDir, 'packages/pypi/LICENSE'));
    console.log('✔ LICENSE synchronized to npm and pypi packages');
  }

  console.log('\n=== Step 3: Generating modular TypeScript datasets for packages/npm ===');

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

  // 2. Areas per city
  const areaFiles = findJsonFiles(resolve(dataDir, 'areas'));
  const cityAreaMap = new Map<string, AreaJson[]>();
  const cityAreaCounts: Record<string, number> = {};

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
  console.log('✔ TypeScript data modules generated for packages/npm/src/data/');

  console.log('\n=== Step 4: Compiling packages/npm distribution ===');
  const npmDir = resolve(rootDir, 'packages/npm');
  execSync('node build.js', { cwd: npmDir, stdio: 'inherit' });

  // Verify hierarchy subpath build artifacts
  const hierarchyEsm = resolve(npmDir, 'dist/hierarchy.js');
  const hierarchyCjs = resolve(npmDir, 'dist/hierarchy.cjs');
  const hierarchyDts = resolve(npmDir, 'dist/hierarchy.d.ts');
  if (!existsSync(hierarchyEsm) || !existsSync(hierarchyCjs) || !existsSync(hierarchyDts)) {
    throw new Error('Hierarchy build artifacts are missing from packages/npm/dist');
  }

  console.log('\n=== Build Summary ===');
  console.log(`Provinces:            ${verifyResult.stats.provinces}`);
  console.log(`Cities:               ${verifyResult.stats.cities}`);
  console.log(`Total Verified Areas: ${verifyResult.stats.areas}`);
  console.log('Areas breakdown by city:');
  for (const slug of citySlugs) {
    const cityName = slug.charAt(0).toUpperCase() + slug.slice(1);
    console.log(`  - ${cityName.padEnd(16)}: ${cityAreaCounts[slug]} areas`);
  }
  console.log('\nDistribution artifacts generated:');
  console.log('  ✔ packages/npm/dist/ (ESM + CommonJS bundles + DTS declarations)');
  console.log('  ✔ packages/npm/dist/hierarchy (Subpath hierarchy exports: ESM, CJS, DTS)');
  console.log('  ✔ packages/npm/dist/areas/ (Modular subpath areas)');
  console.log('  ✔ packages/pypi/pak_geodata/data/ (Synchronized JSON datasets)');
  console.log('\n✔ Full production build succeeded with 0 errors.');
}

main().catch((err) => {
  console.error('Fatal build failure:', err);
  process.exit(1);
});
