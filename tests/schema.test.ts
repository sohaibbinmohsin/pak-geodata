import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CoordinatesSchema,
  AreaSchema,
  CitySchema,
  ProvinceSchema
} from '../pipeline/validators/schema.js';

test('CoordinatesSchema validates coordinates within Pakistan bounding box', () => {
  // Valid coordinates (Lahore)
  const valid = { lat: 31.5204, lng: 74.3587 };
  assert.deepEqual(CoordinatesSchema.parse(valid), valid);

  // Extremes within bounds
  assert.doesNotThrow(() => CoordinatesSchema.parse({ lat: 23.5, lng: 60.8 }));
  assert.doesNotThrow(() => CoordinatesSchema.parse({ lat: 37.1, lng: 77.8 }));

  // Below min latitude
  assert.throws(() => CoordinatesSchema.parse({ lat: 23.4, lng: 70.0 }));
  // Above max latitude
  assert.throws(() => CoordinatesSchema.parse({ lat: 37.2, lng: 70.0 }));
  // Below min longitude
  assert.throws(() => CoordinatesSchema.parse({ lat: 30.0, lng: 60.7 }));
  // Above max longitude
  assert.throws(() => CoordinatesSchema.parse({ lat: 30.0, lng: 77.9 }));
});

test('AreaSchema validates correct area structures and rejects invalid ones', () => {
  const validArea = {
    id: 'lahore-gulberg-3',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'Gulberg III',
    urduName: 'گلبرگ 3',
    aliases: ['Gulberg 3', 'Gulberg III'],
    postalCode: '54660',
    coordinates: { lat: 31.5102, lng: 74.3441 },
    type: 'neighborhood',
    verified: true,
    sources: ['osm']
  };

  const parsed = AreaSchema.parse(validArea);
  assert.equal(parsed.id, 'lahore-gulberg-3');
  assert.equal(parsed.aliases.length, 2);

  // Invalid ID format: missing hyphen prefix
  assert.throws(() => AreaSchema.parse({ ...validArea, id: 'gulberg3' }));
  // Invalid ID format: uppercase
  assert.throws(() => AreaSchema.parse({ ...validArea, id: 'Lahore-Gulberg' }));
  // Invalid postal code: not 5 digits
  assert.throws(() => AreaSchema.parse({ ...validArea, postalCode: '5466' }));
  assert.throws(() => AreaSchema.parse({ ...validArea, postalCode: '546601' }));
  assert.throws(() => AreaSchema.parse({ ...validArea, postalCode: 'ABCDE' }));
  // Invalid type enum
  assert.throws(() => AreaSchema.parse({ ...validArea, type: 'unknown_type' }));
  // Out of bounds coordinates
  assert.throws(() => AreaSchema.parse({
    ...validArea,
    coordinates: { lat: 20.0, lng: 70.0 }
  }));
});

test('CitySchema validates city structures and rejects invalid ones', () => {
  const validCity = {
    id: 'lahore',
    name: 'Lahore',
    urduName: 'لاہور',
    provinceId: 'punjab',
    division: 'Lahore Division',
    district: 'Lahore',
    coordinates: { lat: 31.5204, lng: 74.3587 },
    postalCodeRange: ['54000', '54999'],
    bounds: {
      minLat: 31.30,
      maxLat: 31.70,
      minLng: 74.15,
      maxLng: 74.55
    }
  };

  const parsed = CitySchema.parse(validCity);
  assert.equal(parsed.id, 'lahore');

  // Missing required field (district)
  const missingDistrict = { ...validCity };
  delete (missingDistrict as Record<string, unknown>).district;
  assert.throws(() => CitySchema.parse(missingDistrict));

  // Invalid postal code range element
  assert.throws(() => CitySchema.parse({
    ...validCity,
    postalCodeRange: ['5400', '54999']
  }));
});

test('ProvinceSchema validates province structures and rejects invalid types', () => {
  const validProvince = {
    id: 'punjab',
    name: 'Punjab',
    urduName: 'پنجاب',
    capitalCityId: 'lahore',
    type: 'province'
  };

  assert.doesNotThrow(() => ProvinceSchema.parse(validProvince));

  // Invalid type
  assert.throws(() => ProvinceSchema.parse({
    ...validProvince,
    type: 'state'
  }));
});

test('validates provinces.json', () => {
  assert.ok(fs.existsSync('data/provinces.json'), 'data/provinces.json must exist');
  const content = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));
  assert.ok(Array.isArray(content), 'provinces.json must be an array');
  assert.equal(content.length, 7, 'Must have exactly 7 provinces/territories');

  const expectedIds = [
    'punjab',
    'sindh',
    'kpk',
    'balochistan',
    'islamabad-ict',
    'ajk',
    'gilgit-baltistan'
  ];

  const foundIds = content.map((p: { id: string }) => p.id);
  for (const exp of expectedIds) {
    assert.ok(foundIds.includes(exp), `Missing province/territory: ${exp}`);
  }

  for (const prov of content) {
    assert.doesNotThrow(() => ProvinceSchema.parse(prov), `Failed validating province: ${prov.id}`);
  }
});

test('validates all cities/*.json files', () => {
  const citiesDir = 'data/cities';
  assert.ok(fs.existsSync(citiesDir), 'data/cities directory must exist');

  const requiredProvinceFiles = [
    'punjab.json',
    'sindh.json',
    'islamabad-ict.json',
    'kpk.json',
    'balochistan.json',
    'ajk.json',
    'gilgit-baltistan.json'
  ];

  for (const rf of requiredProvinceFiles) {
    assert.ok(fs.existsSync(path.join(citiesDir, rf)), `Missing city file: ${rf}`);
  }

  const files = fs.readdirSync(citiesDir);
  const allCityIds = new Set<string>();
  const citiesByProvince = new Map<string, Array<{ id: string }>>();

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const provinceKey = file.replace('.json', '');
    const cities = JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf8'));
    assert.ok(Array.isArray(cities), `${file} must contain an array`);
    assert.ok(cities.length > 0, `${file} must not be empty`);

    citiesByProvince.set(provinceKey, cities);

    for (const city of cities) {
      assert.doesNotThrow(() => CitySchema.parse(city), `Failed validating city ${city.id} in ${file}`);
      assert.ok(!allCityIds.has(city.id), `Duplicate city id: ${city.id}`);
      allCityIds.add(city.id);

      // Verify coordinates are within bounds if bounds are present
      if (city.bounds) {
        assert.ok(
          city.bounds.minLat < city.bounds.maxLat,
          `City ${city.id} minLat must be < maxLat`
        );
        assert.ok(
          city.bounds.minLng < city.bounds.maxLng,
          `City ${city.id} minLng must be < maxLng`
        );
        assert.ok(
          city.coordinates.lat >= city.bounds.minLat && city.coordinates.lat <= city.bounds.maxLat,
          `City ${city.id} centroid lat ${city.coordinates.lat} outside bounds [${city.bounds.minLat}, ${city.bounds.maxLat}]`
        );
        assert.ok(
          city.coordinates.lng >= city.bounds.minLng && city.coordinates.lng <= city.bounds.maxLng,
          `City ${city.id} centroid lng ${city.coordinates.lng} outside bounds [${city.bounds.minLng}, ${city.bounds.maxLng}]`
        );
      }

      // Verify postalCodeRange order if present
      if (city.postalCodeRange) {
        assert.ok(
          Number(city.postalCodeRange[0]) <= Number(city.postalCodeRange[1]),
          `City ${city.id} postal code start must be <= end`
        );
      }
    }
  }

  // Verify all province capitals exist in the respective province city files
  const provinces = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));
  for (const prov of provinces) {
    const provCities = citiesByProvince.get(prov.id);
    assert.ok(provCities, `No city file found for province ${prov.id}`);
    const capitalExists = provCities.some((c) => c.id === prov.capitalCityId);
    assert.ok(
      capitalExists,
      `Capital city '${prov.capitalCityId}' not found in province '${prov.id}'`
    );
  }

  // Verify major cities are present with bounds and postalCodeRange
  const majorCities = [
    'lahore',
    'karachi',
    'islamabad',
    'rawalpindi',
    'faisalabad',
    'multan',
    'peshawar',
    'quetta'
  ];

  for (const mc of majorCities) {
    assert.ok(allCityIds.has(mc), `Major city '${mc}' is missing from cities dataset`);
    let foundCity: any = null;
    for (const cities of citiesByProvince.values()) {
      const match = cities.find((c: any) => c.id === mc);
      if (match) {
        foundCity = match;
        break;
      }
    }
    assert.ok(foundCity, `Could not find city object for '${mc}'`);
    assert.ok(foundCity.bounds, `Major city '${mc}' must have bounding box defined`);
    assert.ok(foundCity.postalCodeRange, `Major city '${mc}' must have postalCodeRange defined`);
  }
});
