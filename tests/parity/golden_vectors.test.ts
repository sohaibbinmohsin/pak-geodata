import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Import TypeScript implementation
import {
  getAllProvinces,
  getAllCities,
  getAllAreas,
  findAreaByPostalCode,
  getNearestArea,
  searchAreas,
  haversineDistanceKm
} from '../../packages/npm/src/index.js';

interface GoldenVectors {
  datasetCounts: {
    provinces: number;
    cities: number;
    areas: number;
  };
  postalCodeLookups: Array<{
    postalCode: string;
    expectedCityId: string;
    expectedAreaId: string;
    expectedAreaName: string;
    aliases?: string[];
  }>;
  spatialReverseGeocoding: Array<{
    description: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    expectedAreaId: string;
    expectedCityId: string;
    maxDistanceKm: number;
  }>;
  urduSearches: Array<{
    query: string;
    mustMatchKeyword: string;
    expectedCityIds: string[];
  }>;
  colloquialAliases: Array<{
    alias: string;
    expectedCityId: string;
  }>;
}

const rootDir = process.cwd();
const vectorsPath = resolve(rootDir, 'tests/parity/golden_vectors.json');
const vectors: GoldenVectors = JSON.parse(readFileSync(vectorsPath, 'utf-8'));

/**
 * Execute a python code snippet with PYTHONPATH configured to packages/pypi
 * and parse the returned JSON string.
 */
function runPython<T = unknown>(code: string): T {
  const stdout = execFileSync('python3', ['-c', code], {
    cwd: rootDir,
    env: {
      ...process.env,
      PYTHONPATH: resolve(rootDir, 'packages/pypi')
    },
    encoding: 'utf-8'
  });
  return JSON.parse(stdout.trim()) as T;
}

describe('Cross-Language Golden Vectors Parity Suite (TypeScript & Python)', () => {
  describe('Dataset Count Parity Gate', () => {
    test('TypeScript package holds exact entity counts (7 provinces, 79 cities, 3953 areas)', () => {
      const provinces = getAllProvinces();
      const cities = getAllCities();
      const areas = getAllAreas();

      assert.equal(provinces.length, vectors.datasetCounts.provinces);
      assert.equal(cities.length, vectors.datasetCounts.cities);
      assert.equal(areas.length, vectors.datasetCounts.areas);
    });

    test('Python package holds exact entity counts (7 provinces, 79 cities, 3953 areas)', () => {
      const counts = runPython<{ provinces: number; cities: number; areas: number }>(`
import json, pak_geodata as pg
print(json.dumps({
    'provinces': len(pg.get_all_provinces()),
    'cities': len(pg.get_all_cities()),
    'areas': len(pg.get_all_areas())
}))
`);
      assert.equal(counts.provinces, vectors.datasetCounts.provinces);
      assert.equal(counts.cities, vectors.datasetCounts.cities);
      assert.equal(counts.areas, vectors.datasetCounts.areas);
    });

    test('All 5 dataset repositories maintain exact count parity', () => {
      // 1. Master Data
      const masterProvinces = JSON.parse(
        readFileSync(resolve(rootDir, 'data/provinces.json'), 'utf-8')
      ).length;
      let masterCities = 0;
      for (const f of readdirSync(resolve(rootDir, 'data/cities'))) {
        if (f.endsWith('.json')) {
          masterCities += JSON.parse(
            readFileSync(resolve(rootDir, 'data/cities', f), 'utf-8')
          ).length;
        }
      }
      let masterAreas = 0;
      function walkJson(dir: string) {
        for (const ent of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, ent.name);
          if (ent.isDirectory()) walkJson(full);
          else if (ent.isFile() && ent.name.endsWith('.json')) {
            masterAreas += JSON.parse(readFileSync(full, 'utf-8')).length;
          }
        }
      }
      walkJson(resolve(rootDir, 'data/areas'));

      assert.equal(masterProvinces, 7);
      assert.equal(masterCities, 79);
      assert.equal(masterAreas, 3953);

      // 2. PyPI Data
      const pypiProvinces = JSON.parse(
        readFileSync(resolve(rootDir, 'packages/pypi/pak_geodata/data/provinces.json'), 'utf-8')
      ).length;
      let pypiCities = 0;
      for (const f of readdirSync(resolve(rootDir, 'packages/pypi/pak_geodata/data/cities'))) {
        if (f.endsWith('.json')) {
          pypiCities += JSON.parse(
            readFileSync(resolve(rootDir, 'packages/pypi/pak_geodata/data/cities', f), 'utf-8')
          ).length;
        }
      }
      let pypiAreas = 0;
      function walkPypi(dir: string) {
        for (const ent of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, ent.name);
          if (ent.isDirectory()) walkPypi(full);
          else if (ent.isFile() && ent.name.endsWith('.json')) {
            pypiAreas += JSON.parse(readFileSync(full, 'utf-8')).length;
          }
        }
      }
      walkPypi(resolve(rootDir, 'packages/pypi/pak_geodata/data/areas'));

      assert.equal(pypiProvinces, 7);
      assert.equal(pypiCities, 79);
      assert.equal(pypiAreas, 3953);

      // 3. Go Data
      const goProvinces = JSON.parse(
        readFileSync(resolve(rootDir, 'packages/go/data/provinces.json'), 'utf-8')
      ).length;
      let goCities = 0;
      for (const f of readdirSync(resolve(rootDir, 'packages/go/data/cities'))) {
        if (f.endsWith('.json')) {
          goCities += JSON.parse(
            readFileSync(resolve(rootDir, 'packages/go/data/cities', f), 'utf-8')
          ).length;
        }
      }
      let goAreas = 0;
      function walkGo(dir: string) {
        for (const ent of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, ent.name);
          if (ent.isDirectory()) walkGo(full);
          else if (ent.isFile() && ent.name.endsWith('.json')) {
            goAreas += JSON.parse(readFileSync(full, 'utf-8')).length;
          }
        }
      }
      walkGo(resolve(rootDir, 'packages/go/data/areas'));

      assert.equal(goProvinces, 7);
      assert.equal(goCities, 79);
      assert.equal(goAreas, 3953);

      // 4. Dart Data (Typed Const Collections)
      const dartProvincesText = readFileSync(
        resolve(rootDir, 'packages/dart/lib/src/data/provinces.dart'),
        'utf-8'
      );
      const dartProvincesCount = (dartProvincesText.match(/\bPakistanProvince\(/g) || []).length;

      const dartCitiesText = readFileSync(
        resolve(rootDir, 'packages/dart/lib/src/data/cities.dart'),
        'utf-8'
      );
      const dartCitiesCount = (dartCitiesText.match(/\bPakistanCity\(/g) || []).length;

      const dartAreasText = readFileSync(
        resolve(rootDir, 'packages/dart/lib/src/data/areas.dart'),
        'utf-8'
      );
      const dartAreasCount = (dartAreasText.match(/\bPakistanArea\(/g) || []).length;

      assert.equal(dartProvincesCount, 7);
      assert.equal(dartCitiesCount, 79);
      assert.equal(dartAreasCount, 3953);
    });
  });

  describe('Postal Code Resolution Parity', () => {
    for (const vector of vectors.postalCodeLookups) {
      test(`Postal code ${vector.postalCode} resolves identically in TypeScript and Python`, () => {
        // TypeScript lookup
        const tsArea = findAreaByPostalCode(vector.postalCode);
        assert.ok(tsArea, `TypeScript should resolve postal code ${vector.postalCode}`);
        assert.equal(tsArea.id, vector.expectedAreaId);
        assert.equal(tsArea.cityId, vector.expectedCityId);

        // Python lookup
        const pyArea = runPython<{ id: string; cityId: string; postalCode: string } | null>(`
import json, pak_geodata as pg
a = pg.find_area_by_postal_code('${vector.postalCode}')
if a:
    print(json.dumps({'id': a.id, 'cityId': a.city_id, 'postalCode': a.postal_code}))
else:
    print('null')
`);
        assert.ok(pyArea, `Python should resolve postal code ${vector.postalCode}`);
        assert.equal(pyArea.id, vector.expectedAreaId);
        assert.equal(pyArea.cityId, vector.expectedCityId);

        // Parity comparison between runtimes
        assert.equal(tsArea.id, pyArea.id);
        assert.equal(tsArea.cityId, pyArea.cityId);
      });
    }
  });

  describe('Spatial Reverse Geocoding Parity', () => {
    for (const vector of vectors.spatialReverseGeocoding) {
      test(`Reverse geocoding at [${vector.coordinates.lat}, ${vector.coordinates.lng}] (${vector.description}) matches identically in TypeScript and Python`, () => {
        // TypeScript reverse geocoding
        const tsNearest = getNearestArea(vector.coordinates);
        assert.ok(tsNearest, `TypeScript should find nearest area for [${vector.coordinates.lat}, ${vector.coordinates.lng}]`);
        assert.equal(tsNearest.id, vector.expectedAreaId);
        assert.equal(tsNearest.cityId, vector.expectedCityId);

        const tsDist = haversineDistanceKm(vector.coordinates, tsNearest.coordinates);
        assert.ok(
          tsDist <= vector.maxDistanceKm,
          `TypeScript distance ${tsDist}km should be within ${vector.maxDistanceKm}km`
        );

        // Python reverse geocoding
        const pyNearest = runPython<{ id: string; cityId: string; lat: number; lng: number } | null>(`
import json, pak_geodata as pg
a = pg.get_nearest_area(${vector.coordinates.lat}, ${vector.coordinates.lng})
if a and a.coordinates:
    print(json.dumps({'id': a.id, 'cityId': a.city_id, 'lat': a.coordinates.lat, 'lng': a.coordinates.lng}))
else:
    print('null')
`);
        assert.ok(pyNearest, `Python should find nearest area for [${vector.coordinates.lat}, ${vector.coordinates.lng}]`);
        assert.equal(pyNearest.id, vector.expectedAreaId);
        assert.equal(pyNearest.cityId, vector.expectedCityId);

        // Parity comparison between runtimes
        assert.equal(tsNearest.id, pyNearest.id);
        assert.equal(tsNearest.cityId, pyNearest.cityId);
      });
    }
  });

  describe('Multi-Script Urdu Searches Parity', () => {
    for (const vector of vectors.urduSearches) {
      test(`Urdu search for "${vector.query}" returns matching areas in TypeScript and Python`, () => {
        // TypeScript search
        const tsResults = searchAreas(vector.query, { limit: 5 });
        assert.ok(tsResults.length > 0, `TypeScript search for "${vector.query}" should return results`);
        const tsMatched = tsResults.some(
          (a) =>
            a.id.toLowerCase().includes(vector.mustMatchKeyword) ||
            a.name.toLowerCase().includes(vector.mustMatchKeyword)
        );
        assert.ok(
          tsMatched,
          `TypeScript results for "${vector.query}" should match keyword "${vector.mustMatchKeyword}"`
        );

        // Python search
        const pyResults = runPython<Array<{ id: string; name: string; cityId: string }>>(`
import json, pak_geodata as pg
results = pg.search_areas('''${vector.query}''', limit=5)
print(json.dumps([{'id': a.id, 'name': a.name, 'cityId': a.city_id} for a in results]))
`);
        assert.ok(pyResults.length > 0, `Python search for "${vector.query}" should return results`);
        const pyMatched = pyResults.some(
          (a) =>
            a.id.toLowerCase().includes(vector.mustMatchKeyword) ||
            a.name.toLowerCase().includes(vector.mustMatchKeyword)
        );
        assert.ok(
          pyMatched,
          `Python results for "${vector.query}" should match keyword "${vector.mustMatchKeyword}"`
        );
      });
    }
  });

  describe('Colloquial City Aliases Parity', () => {
    for (const vector of vectors.colloquialAliases) {
      test(`Colloquial alias "${vector.alias}" resolves exclusively to ${vector.expectedCityId} in TypeScript and Python`, () => {
        // TypeScript alias search
        const tsResults = searchAreas(vector.alias, { limit: 5 });
        assert.ok(tsResults.length > 0, `TypeScript search for "${vector.alias}" should return results`);
        for (const a of tsResults) {
          assert.equal(
            a.cityId,
            vector.expectedCityId,
            `TypeScript area ${a.id} should belong to ${vector.expectedCityId}`
          );
        }

        // Python alias search
        const pyResults = runPython<Array<{ id: string; cityId: string }>>(`
import json, pak_geodata as pg
results = pg.search_areas('${vector.alias}', limit=5)
print(json.dumps([{'id': a.id, 'cityId': a.city_id} for a in results]))
`);
        assert.ok(pyResults.length > 0, `Python search for "${vector.alias}" should return results`);
        for (const a of pyResults) {
          assert.equal(
            a.cityId,
            vector.expectedCityId,
            `Python area ${a.id} should belong to ${vector.expectedCityId}`
          );
        }
      });
    }
  });
});
