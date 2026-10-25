import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  isPointInBoundingBox,
  haversineDistanceMeters,
  PAKISTAN_BOUNDING_BOX,
  BoundingBox
} from '../pipeline/validators/spatial.js';
import {
  buildOverpassQuery,
  parseOverpassResponse,
  fetchOverpassCandidates,
  OverpassResponse
} from '../pipeline/extractors/overpass.js';
import { verifyAllData } from './verify.js';

test('spatial: isPointInBoundingBox correctly evaluates points inside and outside box', () => {
  const box: BoundingBox = {
    minLat: 31.30,
    maxLat: 31.70,
    minLng: 74.15,
    maxLng: 74.55
  };

  // Inside
  assert.equal(isPointInBoundingBox(31.5204, 74.3587, box), true);
  // On boundary
  assert.equal(isPointInBoundingBox(31.30, 74.15, box), true);
  assert.equal(isPointInBoundingBox(31.70, 74.55, box), true);
  // Outside lat
  assert.equal(isPointInBoundingBox(31.29, 74.35, box), false);
  assert.equal(isPointInBoundingBox(31.71, 74.35, box), false);
  // Outside lng
  assert.equal(isPointInBoundingBox(31.50, 74.14, box), false);
  assert.equal(isPointInBoundingBox(31.50, 74.56, box), false);
});

test('spatial: PAKISTAN_BOUNDING_BOX encompasses national bounds', () => {
  assert.equal(PAKISTAN_BOUNDING_BOX.minLat, 23.5);
  assert.equal(PAKISTAN_BOUNDING_BOX.maxLat, 37.1);
  assert.equal(PAKISTAN_BOUNDING_BOX.minLng, 60.8);
  assert.equal(PAKISTAN_BOUNDING_BOX.maxLng, 77.8);

  // Lahore is inside
  assert.equal(isPointInBoundingBox(31.5204, 74.3587, PAKISTAN_BOUNDING_BOX), true);
  // Karachi is inside
  assert.equal(isPointInBoundingBox(24.8607, 67.0011, PAKISTAN_BOUNDING_BOX), true);
  // Islamabad is inside
  assert.equal(isPointInBoundingBox(33.6844, 73.0479, PAKISTAN_BOUNDING_BOX), true);
  // Delhi is outside
  assert.equal(isPointInBoundingBox(28.6139, 77.2090, PAKISTAN_BOUNDING_BOX), true); // wait, lng 77.2 is < 77.8, but outside Pakistan politically; bounding box is rectangular envelope
  // London is outside
  assert.equal(isPointInBoundingBox(51.5074, -0.1278, PAKISTAN_BOUNDING_BOX), false);
});

test('spatial: haversineDistanceMeters accurately calculates distance', () => {
  // Identical point should be 0 distance
  assert.equal(haversineDistanceMeters(31.5204, 74.3587, 31.5204, 74.3587), 0);

  // Badshahi Mosque (31.5882, 74.3105) to Minar-e-Pakistan (31.5925, 74.3095)
  // Distance is approximately ~500m (around 480m - 520m)
  const dist = haversineDistanceMeters(31.5882, 74.3105, 31.5925, 74.3095);
  assert.ok(dist > 450 && dist < 550, `Expected ~500m, got ${dist}`);

  // Lahore (31.5204, 74.3587) to Islamabad (33.6844, 73.0479)
  // Great-circle distance is roughly ~260-280 km
  const lahoreToIsb = haversineDistanceMeters(31.5204, 74.3587, 33.6844, 73.0479);
  assert.ok(lahoreToIsb > 260000 && lahoreToIsb < 285000, `Expected ~270km, got ${lahoreToIsb}`);
});

test('overpass: buildOverpassQuery generates formatted Overpass QL with bbox', () => {
  const box: BoundingBox = {
    minLat: 31.30,
    maxLat: 31.70,
    minLng: 74.15,
    maxLng: 74.55
  };

  const query = buildOverpassQuery(box);
  assert.ok(query.includes('[out:json]'), 'Must request json output format');
  assert.ok(query.includes('31.3,74.15,31.7,74.55'), 'Must contain formatted bbox coords');
  assert.ok(query.includes('node["place"'), 'Must query node place');
  assert.ok(query.includes('way["place"'), 'Must query way place');
  assert.ok(query.includes('relation["place"'), 'Must query relation place');
  assert.ok(query.includes('out center tags;'), 'Must request center and tags');

  // Custom timeout and types
  const customQuery = buildOverpassQuery(box, {
    timeoutSeconds: 45,
    placeTypes: ['suburb', 'neighbourhood']
  });
  assert.ok(customQuery.includes('[timeout:45]'));
  assert.ok(customQuery.includes('suburb|neighbourhood'));
});

test('overpass: parseOverpassResponse extracts and normalizes candidates', () => {
  const mockRawResponse: OverpassResponse = {
    elements: [
      {
        type: 'node' as const,
        id: 101,
        lat: 31.5102,
        lon: 74.3441,
        tags: {
          name: 'Gulberg III',
          'name:en': 'Gulberg 3',
          'name:ur': 'گلبرگ 3',
          place: 'suburb',
          'addr:postcode': '54660'
        }
      },
      {
        type: 'way' as const,
        id: 202,
        center: { lat: 31.4705, lon: 74.4101 },
        tags: {
          name: 'DHA Phase 5',
          place: 'neighbourhood'
        }
      },
      {
        // Missing name tag -> should be ignored
        type: 'node' as const,
        id: 303,
        lat: 31.5000,
        lon: 74.3000,
        tags: {
          place: 'suburb'
        }
      },
      {
        // Way missing center -> should be ignored
        type: 'way' as const,
        id: 404,
        tags: {
          name: 'Broken Way',
          place: 'suburb'
        }
      }
    ]
  };

  const candidates = parseOverpassResponse(mockRawResponse);
  assert.equal(candidates.length, 2);

  // Candidate 1 (Node)
  assert.equal(candidates[0].id, 'node/101');
  assert.equal(candidates[0].osmId, 101);
  assert.equal(candidates[0].osmType, 'node');
  assert.equal(candidates[0].name, 'Gulberg 3'); // prefers name:en if present or name
  assert.equal(candidates[0].urduName, 'گلبرگ 3');
  assert.equal(candidates[0].type, 'suburb');
  assert.equal(candidates[0].postalCode, '54660');
  assert.equal(candidates[0].coordinates.lat, 31.5102);
  assert.equal(candidates[0].coordinates.lng, 74.3441);

  // Candidate 2 (Way)
  assert.equal(candidates[1].id, 'way/202');
  assert.equal(candidates[1].osmId, 202);
  assert.equal(candidates[1].osmType, 'way');
  assert.equal(candidates[1].name, 'DHA Phase 5');
  assert.equal(candidates[1].urduName, undefined);
  assert.equal(candidates[1].coordinates.lat, 31.4705);
  assert.equal(candidates[1].coordinates.lng, 74.4101);
});

test('overpass: fetchOverpassCandidates handles rate limiting retry and mock fetch', async () => {
  let callCount = 0;
  const mockFetch = async () => {
    callCount++;
    if (callCount === 1) {
      // Simulate 429 Too Many Requests
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({})
      };
    }
    // Simulate successful response
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        elements: [
          {
            type: 'node',
            id: 999,
            lat: 31.5204,
            lon: 74.3587,
            tags: { name: 'Old Anarkali', place: 'neighbourhood' }
          }
        ]
      })
    };
  };

  const candidates = await fetchOverpassCandidates('mock-query', {
    fetchFn: mockFetch as unknown as typeof fetch,
    retryDelayMs: 10,
    maxRetries: 3
  });

  assert.equal(callCount, 2, 'Should have retried once after 429');
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].name, 'Old Anarkali');
});

function createTestDataset(fixtures: {
  provinces?: any[];
  cities?: Record<string, any[]>;
  areas?: Record<string, any[]>;
}): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pak-geodata-verify-test-'));
  const provinces = fixtures.provinces ?? [
    {
      id: 'punjab',
      name: 'Punjab',
      urduName: 'پنجاب',
      capitalCityId: 'lahore',
      type: 'province'
    }
  ];
  fs.writeFileSync(path.join(tmpDir, 'provinces.json'), JSON.stringify(provinces, null, 2));

  const citiesDir = path.join(tmpDir, 'cities');
  fs.mkdirSync(citiesDir, { recursive: true });
  const citiesMap = fixtures.cities ?? {
    'punjab.json': [
      {
        id: 'lahore',
        name: 'Lahore',
        urduName: 'لاہور',
        provinceId: 'punjab',
        district: 'Lahore',
        coordinates: { lat: 31.5204, lng: 74.3587 },
        postalCodeRange: ['54000', '54999'],
        bounds: { minLat: 31.30, maxLat: 31.70, minLng: 74.15, maxLng: 74.55 }
      }
    ]
  };
  for (const [filename, content] of Object.entries(citiesMap)) {
    fs.writeFileSync(path.join(citiesDir, filename), JSON.stringify(content, null, 2));
  }

  if (fixtures.areas) {
    for (const [subPath, content] of Object.entries(fixtures.areas)) {
      const filePath = path.join(tmpDir, 'areas', subPath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }
  }

  return tmpDir;
}

test('verifier: verifyAllData passes cleanly on repository master data', async () => {
  const result = await verifyAllData({ silent: true });
  assert.equal(result.success, true, `Expected success but got errors: ${result.errors.join('; ')}`);
  assert.equal(result.errors.length, 0);
  assert.equal(result.stats.provinces, 7);
  assert.ok(result.stats.cities >= 30, `Expected >= 30 cities, got ${result.stats.cities}`);
});

test('verifier: detects coordinates outside Pakistan bounds', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-out-of-pakistan',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Invalid Lat Area',
          coordinates: { lat: 10.5, lng: 74.3587 }, // Outside Pakistan minLat 23.5
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('outside Pakistan bounds') || e.includes('CoordinatesSchema')));
});

test('verifier: detects coordinates outside city bounding box', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-outside-bounds',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Outside Lahore Box',
          coordinates: { lat: 32.5, lng: 74.35 }, // Inside Pakistan, but outside Lahore bounds (maxLat 31.70)
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('outside city bounds')));
});

test('verifier: detects duplicate IDs across areas and cities', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-model-town',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Model Town',
          coordinates: { lat: 31.4850, lng: 74.3200 },
          verified: true
        },
        {
          id: 'lahore-model-town', // Duplicate ID
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Model Town Duplicate',
          coordinates: { lat: 31.4900, lng: 74.3250 },
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('Duplicate area ID')));
});

test('verifier: enforces canonical slug prefix <cityId>-<area-slug>', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'model-town', // Missing lahore- prefix
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Model Town',
          coordinates: { lat: 31.4850, lng: 74.3200 },
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('does not start with city prefix') || e.includes('canonical slug')));
});

test('verifier: detects postal code out of city range', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-gulberg',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Gulberg',
          postalCode: '44000', // Islamabad postal code, Lahore is 54000-54999
          coordinates: { lat: 31.5102, lng: 74.3441 },
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('postalCode') && e.includes('range')));
});

test('verifier: detects referential integrity errors', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-gulberg',
          cityId: 'non-existent-city',
          provinceId: 'punjab',
          name: 'Gulberg',
          coordinates: { lat: 31.5102, lng: 74.3441 },
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('references unknown cityId')));
});

test('verifier: detects proximity collisions < 150m with matching tokens', async () => {
  const tmpDir = createTestDataset({
    areas: {
      'punjab/lahore.json': [
        {
          id: 'lahore-gulberg-3-a',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Gulberg III Main',
          coordinates: { lat: 31.51020, lng: 74.34410 },
          verified: true
        },
        {
          id: 'lahore-gulberg-3-b',
          cityId: 'lahore',
          provinceId: 'punjab',
          name: 'Gulberg III Center',
          // Coordinates only ~35 meters apart and sharing "gulberg" token
          coordinates: { lat: 31.51040, lng: 74.34430 },
          verified: true
        }
      ]
    }
  });

  const result = await verifyAllData({ dataDir: tmpDir, silent: true });
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('Proximity collision') || e.includes('collision detector')));
});

