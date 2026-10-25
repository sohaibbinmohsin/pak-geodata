import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAllProvinces,
  getProvinceById,
  getAllCities,
  getCitiesByProvince,
  getCityById,
  getAllAreas,
  getAreasByCity,
  findAreaByPostalCode,
  findAreasByPostalCode,
  searchAreas,
  haversineDistanceKm,
  getNearestArea
} from '../src/index.js';

import { lahoreAreas } from '../src/areas/lahore.js';
import { karachiAreas } from '../src/areas/karachi.js';
import { islamabadAreas } from '../src/areas/islamabad.js';
import { rawalpindiAreas } from '../src/areas/rawalpindi.js';
import { faisalabadAreas } from '../src/areas/faisalabad.js';

test('getAllProvinces returns all 7 provinces/territories', () => {
  const provinces = getAllProvinces();
  assert.equal(provinces.length, 7);
  const ids = provinces.map((p) => p.id);
  assert.ok(ids.includes('punjab'));
  assert.ok(ids.includes('sindh'));
  assert.ok(ids.includes('kpk'));
  assert.ok(ids.includes('balochistan'));
  assert.ok(ids.includes('islamabad-ict'));
  assert.ok(ids.includes('ajk'));
  assert.ok(ids.includes('gilgit-baltistan'));
});

test('getProvinceById finds existing province and handles nonexistent', () => {
  const punjab = getProvinceById('punjab');
  assert.ok(punjab);
  assert.equal(punjab?.name, 'Punjab');
  assert.equal(punjab?.capitalCityId, 'lahore');

  const unknown = getProvinceById('atlantis');
  assert.equal(unknown, undefined);
});

test('getAllCities returns all 40 verified cities', () => {
  const cities = getAllCities();
  assert.equal(cities.length, 40);
  const lahore = cities.find((c) => c.id === 'lahore');
  assert.ok(lahore);
  assert.equal(lahore?.district, 'Lahore');
});

test('getCitiesByProvince filters correctly', () => {
  const sindhCities = getCitiesByProvince('sindh');
  assert.ok(sindhCities.length > 0);
  assert.ok(sindhCities.every((c) => c.provinceId === 'sindh'));
  assert.ok(sindhCities.some((c) => c.id === 'karachi'));

  const empty = getCitiesByProvince('nonexistent-province');
  assert.deepEqual(empty, []);
});

test('getCityById returns city details or undefined', () => {
  const lhr = getCityById('lahore');
  assert.ok(lhr);
  assert.equal(lhr?.id, 'lahore');
  assert.equal(lhr?.provinceId, 'punjab');

  const invalid = getCityById('invalid-city-id');
  assert.equal(invalid, undefined);
});

test('getAreasByCity returns areas for verified flagship cities', () => {
  const lhrAreas = getAreasByCity('lahore');
  assert.equal(lhrAreas.length, 50);
  assert.ok(lhrAreas.every((a) => a.cityId === 'lahore'));

  const khiAreas = getAreasByCity('karachi');
  assert.equal(khiAreas.length, 51);
  assert.ok(khiAreas.every((a) => a.cityId === 'karachi'));

  const isbAreas = getAreasByCity('islamabad');
  assert.equal(isbAreas.length, 36);
  assert.ok(isbAreas.every((a) => a.cityId === 'islamabad'));

  const rwpAreas = getAreasByCity('rawalpindi');
  assert.equal(rwpAreas.length, 28);
  assert.ok(rwpAreas.every((a) => a.cityId === 'rawalpindi'));

  const fsdAreas = getAreasByCity('faisalabad');
  assert.equal(fsdAreas.length, 24);
  assert.ok(fsdAreas.every((a) => a.cityId === 'faisalabad'));

  const unknown = getAreasByCity('unknown-city');
  assert.deepEqual(unknown, []);
});

test('getAllAreas aggregates all 189 golden areas', () => {
  const all = getAllAreas();
  assert.equal(all.length, 189);
});

test('subpath export modules export expected area lists', () => {
  assert.equal(lahoreAreas.length, 50);
  assert.equal(karachiAreas.length, 51);
  assert.equal(islamabadAreas.length, 36);
  assert.equal(rawalpindiAreas.length, 28);
  assert.equal(faisalabadAreas.length, 24);
});

test('findAreaByPostalCode resolves area by 5-digit postal code', () => {
  const area = findAreaByPostalCode('54792');
  assert.ok(area);
  assert.equal(area?.postalCode, '54792');
  assert.ok(area?.id.startsWith('lahore-dha-'));

  const clifton = findAreaByPostalCode('75600');
  assert.ok(clifton);
  assert.equal(clifton?.cityId, 'karachi');

  const missing = findAreaByPostalCode('00000');
  assert.equal(missing, undefined);
});

test('findAreasByPostalCode returns all areas matching postal code', () => {
  const dhaAreas = findAreasByPostalCode('54792');
  assert.ok(dhaAreas.length >= 8);
  assert.ok(dhaAreas.every((a) => a.postalCode === '54792'));
});

test('searchAreas finds DHA Phase 5 via alias "dha 5"', () => {
  const results = searchAreas('dha 5', { cityId: 'lahore' });
  assert.ok(results.length > 0);
  assert.equal(results[0].id, 'lahore-dha-phase-5');
});

test('searchAreas scopes search by cityId when provided', () => {
  const isbResults = searchAreas('dha 2', { cityId: 'islamabad' });
  assert.ok(isbResults.length > 0);
  assert.equal(isbResults[0].id, 'islamabad-dha-phase-2');
  assert.equal(isbResults[0].cityId, 'islamabad');
});

test('searchAreas finds areas via Urdu name query', () => {
  const results = searchAreas('کلفٹن', { cityId: 'karachi' });
  assert.ok(results.length > 0);
  assert.ok(results.some((a) => a.id === 'karachi-clifton-block-1'));
});

test('searchAreas ranks exact matches over substring matches', () => {
  const results = searchAreas('Gulberg 3', { cityId: 'lahore' });
  assert.ok(results.length > 0);
  assert.equal(results[0].id, 'lahore-gulberg-3');
});

test('searchAreas respects limit option', () => {
  const results = searchAreas('block', { cityId: 'karachi', limit: 5 });
  assert.equal(results.length, 5);
});

test('haversineDistanceKm calculates spatial distance accurately', () => {
  const lahoreCenter = { lat: 31.5204, lng: 74.3587 };
  const karachiCenter = { lat: 24.8607, lng: 67.0011 };

  const distToSelf = haversineDistanceKm(lahoreCenter, lahoreCenter);
  assert.equal(distToSelf, 0);

  const lhrToKhi = haversineDistanceKm(lahoreCenter, karachiCenter);
  // Expected distance roughly 1025 - 1035 km
  assert.ok(lhrToKhi > 1000 && lhrToKhi < 1050, `Distance was ${lhrToKhi} km`);
});

test('getNearestArea returns closest area to given coordinates', () => {
  // Centroid very close to DHA Phase 5 Lahore (31.458, 74.412)
  const coords = { lat: 31.4581, lng: 74.4121 };
  const nearest = getNearestArea(coords);
  assert.ok(nearest);
  assert.equal(nearest?.id, 'lahore-dha-phase-5');
});

test('getNearestArea filters by cityId and respects maxDistanceKm', () => {
  const lahoreCoords = { lat: 31.4698, lng: 74.3985 };

  // Nearest in Islamabad when querying from Lahore should return null if maxDistanceKm is small
  const isbNearest = getNearestArea(lahoreCoords, { cityId: 'islamabad', maxDistanceKm: 10 });
  assert.equal(isbNearest, null);

  // But with no maxDistanceKm, it returns nearest area in Islamabad
  const isbAnyNearest = getNearestArea(lahoreCoords, { cityId: 'islamabad' });
  assert.ok(isbAnyNearest);
  assert.equal(isbAnyNearest?.cityId, 'islamabad');
});
