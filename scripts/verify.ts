import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  ProvinceSchema,
  CitySchema,
  AreaSchema,
  Province,
  City,
  Area
} from '../pipeline/validators/schema.js';
import {
  isPointInBoundingBox,
  haversineDistanceMeters,
  PAKISTAN_BOUNDING_BOX
} from '../pipeline/validators/spatial.js';

export interface VerificationOptions {
  dataDir?: string;
  silent?: boolean;
  checkPackages?: boolean;
  rootDir?: string;
}

export interface EntityCounts {
  provinces: number;
  cities: number;
  areas: number;
}

export interface MultiPackageParityResult {
  success: boolean;
  errors: string[];
  packageStats: Record<string, EntityCounts>;
}

export interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    provinces: number;
    cities: number;
    areas: number;
  };
  packageStats?: Record<string, EntityCounts>;
}

function findJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractTokens(
  name: string,
  id: string,
  aliases: string[] = [],
  cityId?: string
): Set<string> {
  let localId = id;
  if (cityId && localId.startsWith(`${cityId}-`)) {
    localId = localId.slice(cityId.length + 1);
  }
  const combined = [name, localId, ...aliases].join(' ').toLowerCase();
  const words = combined.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const stopWords = new Set([
    'the',
    'and',
    'phase',
    'block',
    'sector',
    'street',
    'road',
    'town',
    'city',
    'scheme',
    ...(cityId ? [cityId.toLowerCase()] : [])
  ]);
  return new Set(words.filter((w) => !stopWords.has(w)));
}

export async function verifyAllData(
  options: VerificationOptions = {}
): Promise<VerificationResult> {
  const dataDir = options.dataDir
    ? path.resolve(options.dataDir)
    : path.resolve(process.cwd(), 'data');

  const errors: string[] = [];
  const warnings: string[] = [];

  const provincesFile = path.join(dataDir, 'provinces.json');
  const citiesDir = path.join(dataDir, 'cities');
  const areasDir = path.join(dataDir, 'areas');

  const provinces: Province[] = [];
  const cities: City[] = [];
  const areas: Area[] = [];

  const provinceIds = new Set<string>();
  const cityIds = new Set<string>();
  const areaIds = new Set<string>();

  // 1. Verify provinces.json
  if (!fs.existsSync(provincesFile)) {
    errors.push(`Missing provinces file at ${provincesFile}`);
  } else {
    try {
      const rawProvinces = JSON.parse(fs.readFileSync(provincesFile, 'utf8'));
      if (!Array.isArray(rawProvinces)) {
        errors.push(`provinces.json must contain an array of provinces`);
      } else {
        for (const prov of rawProvinces) {
          const parseResult = ProvinceSchema.safeParse(prov);
          if (!parseResult.success) {
            const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
            errors.push(`Province "${prov?.id || 'unknown'}" schema error: ${issues}`);
            continue;
          }
          if (provinceIds.has(prov.id)) {
            errors.push(`Duplicate province ID: ${prov.id}`);
          }
          provinceIds.add(prov.id);
          provinces.push(parseResult.data);
        }
      }
    } catch (err: unknown) {
      errors.push(`Failed to read/parse ${provincesFile}: ${String(err)}`);
    }
  }

  // 2. Verify cities/*.json
  const citiesByProvince = new Map<string, City[]>();
  const cityMap = new Map<string, City>();

  if (!fs.existsSync(citiesDir)) {
    errors.push(`Missing cities directory at ${citiesDir}`);
  } else {
    const cityFiles = fs
      .readdirSync(citiesDir)
      .filter((f) => f.endsWith('.json'));

    for (const file of cityFiles) {
      const provinceKey = file.replace('.json', '');
      const filePath = path.join(citiesDir, file);
      try {
        const rawCities = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(rawCities)) {
          errors.push(`City file ${file} must contain an array`);
          continue;
        }

        const currentProvinceCities: City[] = [];

        for (const city of rawCities) {
          const parseResult = CitySchema.safeParse(city);
          if (!parseResult.success) {
            const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
            const isCoordError = parseResult.error.issues.some((i) => i.path.includes('coordinates'));
            if (isCoordError) {
              errors.push(
                `City "${city?.id || 'unknown'}" coordinates outside Pakistan bounds: ${issues}`
              );
            } else {
              errors.push(
                `City "${city?.id || 'unknown'}" in ${file} schema error: ${issues}`
              );
            }
            continue;
          }

          const cityData = parseResult.data;

          if (cityIds.has(cityData.id)) {
            errors.push(`Duplicate city ID: ${cityData.id} (found in ${file})`);
          }
          if (provinceIds.has(cityData.id)) {
            errors.push(`City ID "${cityData.id}" collides with an existing province ID`);
          }
          cityIds.add(cityData.id);

          // Referential integrity: provinceId
          if (provinceIds.size > 0 && !provinceIds.has(cityData.provinceId)) {
            errors.push(
              `City ${cityData.id} references unknown provinceId: "${cityData.provinceId}"`
            );
          }
          if (cityData.provinceId !== provinceKey) {
            errors.push(
              `City ${cityData.id} provinceId "${cityData.provinceId}" does not match file name "${file}"`
            );
          }

          // Pakistan bounds
          if (
            !isPointInBoundingBox(
              cityData.coordinates.lat,
              cityData.coordinates.lng,
              PAKISTAN_BOUNDING_BOX
            )
          ) {
            errors.push(
              `City ${cityData.id} coordinates [${cityData.coordinates.lat}, ${cityData.coordinates.lng}] outside Pakistan bounds`
            );
          }

          // City bounds vs city centroid
          if (cityData.bounds) {
            if (
              !isPointInBoundingBox(
                cityData.coordinates.lat,
                cityData.coordinates.lng,
                cityData.bounds
              )
            ) {
              errors.push(
                `City ${cityData.id} centroid coordinates outside its own bounds`
              );
            }
          }

          // Postal code range check
          if (cityData.postalCodeRange) {
            const minCode = Number(cityData.postalCodeRange[0]);
            const maxCode = Number(cityData.postalCodeRange[1]);
            if (minCode > maxCode) {
              errors.push(
                `City ${cityData.id} postalCodeRange start (${minCode}) > end (${maxCode})`
              );
            }
          }

          cities.push(cityData);
          currentProvinceCities.push(cityData);
          cityMap.set(cityData.id, cityData);
        }

        citiesByProvince.set(provinceKey, currentProvinceCities);
      } catch (err: unknown) {
        errors.push(`Failed to read/parse city file ${filePath}: ${String(err)}`);
      }
    }
  }

  // 3. Verify Province Capital referential integrity
  for (const prov of provinces) {
    const provCities = citiesByProvince.get(prov.id);
    if (!provCities || !provCities.some((c) => c.id === prov.capitalCityId)) {
      errors.push(
        `Province "${prov.id}" capitalCityId "${prov.capitalCityId}" does not exist in province cities`
      );
    }
  }

  // 4. Verify areas/**/*.json
  const areaFiles = findJsonFiles(areasDir);
  const areasByCity = new Map<string, Area[]>();
  const globalAreaCoords = new Map<string, string>();

  for (const filePath of areaFiles) {
    try {
      const rawAreas = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(rawAreas)) {
        errors.push(`Area file ${filePath} must contain an array`);
        continue;
      }

      for (const area of rawAreas) {
        if (typeof area?.id === 'string') {
          if (cityIds.has(area.id)) {
            errors.push(`Area ID "${area.id}" collides with an existing city ID`);
          }
          if (provinceIds.has(area.id)) {
            errors.push(`Area ID "${area.id}" collides with an existing province ID`);
          }
        }

        const parseResult = AreaSchema.safeParse(area);
        if (!parseResult.success) {
          const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
          const isCoordError = parseResult.error.issues.some((i) => i.path.includes('coordinates'));
          if (isCoordError) {
            errors.push(
              `Area "${area?.id || 'unknown'}" coordinates outside Pakistan bounds: ${issues}`
            );
          } else {
            errors.push(
              `Area "${area?.id || 'unknown'}" in ${filePath} schema error: ${issues}`
            );
          }
          continue;
        }

        const areaData = parseResult.data;

        // Duplicate ID across areas
        if (areaIds.has(areaData.id)) {
          errors.push(`Duplicate area ID: ${areaData.id}`);
        }
        areaIds.add(areaData.id);

        // Global duplicate coordinates check across all areas/cities
        const coordKey = `${areaData.coordinates.lat.toFixed(6)},${areaData.coordinates.lng.toFixed(6)}`;
        const existingCoordAreaId = globalAreaCoords.get(coordKey);
        if (existingCoordAreaId) {
          errors.push(
            `Duplicate coordinates detected across areas: "${areaData.id}" and "${existingCoordAreaId}" share identical coordinates [${areaData.coordinates.lat}, ${areaData.coordinates.lng}]`
          );
        } else {
          globalAreaCoords.set(coordKey, areaData.id);
        }

        // Canonical slug format: must start with <cityId>-
        if (!areaData.id.startsWith(`${areaData.cityId}-`)) {
          errors.push(
            `Area ID "${areaData.id}" does not start with city prefix "${areaData.cityId}-" (canonical slug violation)`
          );
        }

        // Referential integrity: cityId
        const city = cityMap.get(areaData.cityId);
        if (!city) {
          errors.push(
            `Area "${areaData.id}" references unknown cityId: "${areaData.cityId}"`
          );
        } else {
          // Referential integrity: provinceId
          if (areaData.provinceId !== city.provinceId) {
            errors.push(
              `Area "${areaData.id}" provinceId "${areaData.provinceId}" does not match city "${city.id}" provinceId "${city.provinceId}"`
            );
          }

          // Pakistan bounds
          if (
            !isPointInBoundingBox(
              areaData.coordinates.lat,
              areaData.coordinates.lng,
              PAKISTAN_BOUNDING_BOX
            )
          ) {
            errors.push(
              `Area "${areaData.id}" coordinates [${areaData.coordinates.lat}, ${areaData.coordinates.lng}] outside Pakistan bounds`
            );
          }

          // City bounds
          if (city.bounds) {
            if (
              !isPointInBoundingBox(
                areaData.coordinates.lat,
                areaData.coordinates.lng,
                city.bounds
              )
            ) {
              errors.push(
                `Area "${areaData.id}" coordinates [${areaData.coordinates.lat}, ${areaData.coordinates.lng}] outside city bounds [${city.bounds.minLat}, ${city.bounds.minLng}, ${city.bounds.maxLat}, ${city.bounds.maxLng}] for city "${city.id}"`
              );
            }
          }

          // Postal code range check
          if (areaData.postalCode && city.postalCodeRange) {
            const codeNum = parseInt(areaData.postalCode, 10);
            const minRange = parseInt(city.postalCodeRange[0], 10);
            const maxRange = parseInt(city.postalCodeRange[1], 10);
            if (codeNum < minRange || codeNum > maxRange) {
              errors.push(
                `Area "${areaData.id}" postalCode "${areaData.postalCode}" out of city "${city.id}" postal code range [${city.postalCodeRange[0]}-${city.postalCodeRange[1]}]`
              );
            }
          }
        }

        areas.push(areaData);
        const cityAreas = areasByCity.get(areaData.cityId) ?? [];
        cityAreas.push(areaData);
        areasByCity.set(areaData.cityId, cityAreas);
      }
    } catch (err: unknown) {
      errors.push(`Failed to read/parse area file ${filePath}: ${String(err)}`);
    }
  }

  // 5. Proximity deduplication / collision detection per city
  for (const [cityId, cityAreaList] of areasByCity.entries()) {
    for (let i = 0; i < cityAreaList.length; i++) {
      const a1 = cityAreaList[i];
      const tokens1 = extractTokens(a1.name, a1.id, a1.aliases, cityId);

      for (let j = i + 1; j < cityAreaList.length; j++) {
        const a2 = cityAreaList[j];
        const dist = haversineDistanceMeters(
          a1.coordinates.lat,
          a1.coordinates.lng,
          a2.coordinates.lat,
          a2.coordinates.lng
        );

        if (dist === 0) {
          errors.push(
            `Proximity collision detector: Areas "${a1.id}" and "${a2.id}" in city "${cityId}" have identical coordinates`
          );
        } else if (dist < 150) {
          const tokens2 = extractTokens(a2.name, a2.id, a2.aliases, cityId);
          const matchingTokens: string[] = [];
          for (const t of tokens1) {
            if (tokens2.has(t)) {
              matchingTokens.push(t);
            }
          }

          if (matchingTokens.length > 0) {
            errors.push(
              `Proximity collision detector: Areas "${a1.id}" and "${a2.id}" in city "${cityId}" are only ${Math.round(dist)}m apart (< 150m) and share matching token(s): ${matchingTokens.join(', ')}`
            );
          }
        }
      }
    }
  }

  // 6. Multi-package parity verification gate across master, NPM, PyPI, Go, and Dart
  let packageStats: Record<string, EntityCounts> | undefined;
  const shouldCheckPackages = options.checkPackages ?? !options.dataDir;

  if (shouldCheckPackages) {
    const rootDir = options.rootDir || path.resolve(dataDir, '..');
    const parityResult = verifyMultiPackageParity(rootDir);
    packageStats = parityResult.packageStats;
    if (!parityResult.success) {
      errors.push(...parityResult.errors);
    }
  }

  const success = errors.length === 0;

  if (!options.silent) {
    if (success) {
      console.log('✔ Verification PASSED cleanly.');
      console.log(`  Provinces: ${provinces.length}`);
      console.log(`  Cities:    ${cities.length}`);
      console.log(`  Areas:     ${areas.length}`);
      if (shouldCheckPackages) {
        console.log(
          '✔ Multi-package parity gate PASSED across master, NPM, PyPI, Go, and Dart (7 provinces, 79 cities, 3953 areas).'
        );
      }
    } else {
      console.error(`✖ Verification FAILED with ${errors.length} error(s):`);
      for (const err of errors) {
        console.error(`  - ${err}`);
      }
    }
  }

  return {
    success,
    errors,
    warnings,
    stats: {
      provinces: provinces.length,
      cities: cities.length,
      areas: areas.length
    },
    packageStats
  };
}

export function countMasterJsonEntities(dataDir: string): EntityCounts {
  let provinces = 0;
  const provincesFile = path.join(dataDir, 'provinces.json');
  if (fs.existsSync(provincesFile)) {
    provinces = (JSON.parse(fs.readFileSync(provincesFile, 'utf8')) as unknown[]).length;
  }

  let cities = 0;
  const citiesDir = path.join(dataDir, 'cities');
  if (fs.existsSync(citiesDir)) {
    for (const f of fs.readdirSync(citiesDir)) {
      if (f.endsWith('.json')) {
        cities += (JSON.parse(fs.readFileSync(path.join(citiesDir, f), 'utf8')) as unknown[]).length;
      }
    }
  }

  let areas = 0;
  const areasDir = path.join(dataDir, 'areas');
  if (fs.existsSync(areasDir)) {
    const areaFiles = findJsonFiles(areasDir);
    for (const af of areaFiles) {
      areas += (JSON.parse(fs.readFileSync(af, 'utf8')) as unknown[]).length;
    }
  }

  return { provinces, cities, areas };
}

export function countNpmEntities(npmDataDir: string): EntityCounts {
  function parseTsArray(filePath: string): unknown[] {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const equalsPos = content.indexOf('=');
    if (equalsPos === -1) return [];
    const jsonStart = content.indexOf('[', equalsPos);
    const jsonEnd = content.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as unknown[];
    }
    return [];
  }

  const provinces = parseTsArray(path.join(npmDataDir, 'provinces.ts')).length;
  const cities = parseTsArray(path.join(npmDataDir, 'cities.ts')).length;

  let areas = 0;
  const areasDir = path.join(npmDataDir, 'areas');
  if (fs.existsSync(areasDir)) {
    for (const f of fs.readdirSync(areasDir)) {
      if (f.endsWith('.ts') && f !== 'index.ts') {
        areas += parseTsArray(path.join(areasDir, f)).length;
      }
    }
  }

  return { provinces, cities, areas };
}

export function countDartEntities(dartDataDir: string): EntityCounts {
  function countConstructors(filePath: string, entityConstructor: string): number {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(new RegExp(`\\b${entityConstructor}\\(`, 'g'));
    return matches ? matches.length : 0;
  }

  const provinces = countConstructors(
    path.join(dartDataDir, 'provinces.dart'),
    'PakistanProvince'
  );
  const cities = countConstructors(
    path.join(dartDataDir, 'cities.dart'),
    'PakistanCity'
  );
  const areas = countConstructors(
    path.join(dartDataDir, 'areas.dart'),
    'PakistanArea'
  );

  return { provinces, cities, areas };
}

export function verifyMultiPackageParity(
  rootDir: string = process.cwd()
): MultiPackageParityResult {
  const errors: string[] = [];
  const packageStats: Record<string, EntityCounts> = {};

  const EXPECTED: EntityCounts = {
    provinces: 7,
    cities: 79,
    areas: 3953
  };

  const targets = [
    {
      name: 'master',
      path: path.resolve(rootDir, 'data'),
      countFn: () => countMasterJsonEntities(path.resolve(rootDir, 'data'))
    },
    {
      name: 'pypi',
      path: path.resolve(rootDir, 'packages/pypi/pak_geodata/data'),
      countFn: () => countMasterJsonEntities(path.resolve(rootDir, 'packages/pypi/pak_geodata/data'))
    },
    {
      name: 'go',
      path: path.resolve(rootDir, 'packages/go/data'),
      countFn: () => countMasterJsonEntities(path.resolve(rootDir, 'packages/go/data'))
    },
    {
      name: 'npm',
      path: path.resolve(rootDir, 'packages/npm/src/data'),
      countFn: () => countNpmEntities(path.resolve(rootDir, 'packages/npm/src/data'))
    },
    {
      name: 'dart',
      path: path.resolve(rootDir, 'packages/dart/lib/src/data'),
      countFn: () => countDartEntities(path.resolve(rootDir, 'packages/dart/lib/src/data'))
    }
  ];

  for (const target of targets) {
    if (!fs.existsSync(target.path)) {
      errors.push(`Target "${target.name}" directory missing at ${target.path}`);
      continue;
    }

    try {
      const counts = target.countFn();
      packageStats[target.name] = counts;

      if (counts.provinces !== EXPECTED.provinces) {
        errors.push(
          `Target "${target.name}" province count mismatch: expected ${EXPECTED.provinces}, got ${counts.provinces}`
        );
      }
      if (counts.cities !== EXPECTED.cities) {
        errors.push(
          `Target "${target.name}" city count mismatch: expected ${EXPECTED.cities}, got ${counts.cities}`
        );
      }
      if (counts.areas !== EXPECTED.areas) {
        errors.push(
          `Target "${target.name}" area count mismatch: expected ${EXPECTED.areas}, got ${counts.areas}`
        );
      }
    } catch (err: unknown) {
      errors.push(`Failed to count entities in target "${target.name}": ${String(err)}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    packageStats
  };
}

// CLI execution handling
const isMain = Boolean(
  process.argv[1] &&
    (path.resolve(process.argv[1]).endsWith('scripts/verify.ts') ||
      path.resolve(process.argv[1]).endsWith('scripts/verify.js'))
);

if (isMain) {
  verifyAllData()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal verification error:', err);
      process.exit(1);
    });
}
