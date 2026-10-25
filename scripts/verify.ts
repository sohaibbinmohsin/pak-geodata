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

function extractTokens(name: string, id: string, aliases: string[] = []): Set<string> {
  const combined = [name, id, ...aliases].join(' ').toLowerCase();
  const words = combined.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const stopWords = new Set(['the', 'and', 'phase', 'block', 'sector', 'street', 'road', 'town', 'city', 'scheme']);
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

  for (const filePath of areaFiles) {
    try {
      const rawAreas = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(rawAreas)) {
        errors.push(`Area file ${filePath} must contain an array`);
        continue;
      }

      for (const area of rawAreas) {
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

        // Duplicate ID
        if (areaIds.has(areaData.id)) {
          errors.push(`Duplicate area ID: ${areaData.id}`);
        }
        areaIds.add(areaData.id);

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
      const tokens1 = extractTokens(a1.name, a1.id, a1.aliases);

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
          const tokens2 = extractTokens(a2.name, a2.id, a2.aliases);
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

  const success = errors.length === 0;

  if (!options.silent) {
    if (success) {
      console.log('✔ Verification PASSED cleanly.');
      console.log(`  Provinces: ${provinces.length}`);
      console.log(`  Cities:    ${cities.length}`);
      console.log(`  Areas:     ${areas.length}`);
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
    }
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
