import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNearestArea, isPointInBoundingBox } from '../src/geo.js';
import { getAllAreas } from '../src/index.js';

const allAreas = getAllAreas();

test('isPointInBoundingBox correctly evaluates containment', () => {
  const box = {
    minLat: 31.3,
    maxLat: 31.7,
    minLng: 74.15,
    maxLng: 74.55
  };
  assert.equal(isPointInBoundingBox({ lat: 31.5204, lng: 74.3587 }, box), true);
  assert.equal(isPointInBoundingBox({ lat: 31.30, lng: 74.15 }, box), true);
  assert.equal(isPointInBoundingBox({ lat: 31.70, lng: 74.55 }, box), true);
  assert.equal(isPointInBoundingBox({ lat: 31.29, lng: 74.35 }, box), false);
  assert.equal(isPointInBoundingBox({ lat: 31.50, lng: 74.56 }, box), false);
  assert.equal(isPointInBoundingBox({ lat: 0, lng: 0 }, undefined), false);
});

test('getNearestArea spatial pruning: point inside Lahore bounds scopes to Lahore areas', () => {
  // Lahore DHA coordinates
  const lahoreCoords = { lat: 31.4697, lng: 74.3986 };
  const nearest = getNearestArea(lahoreCoords);
  assert.ok(nearest);
  assert.equal(nearest.cityId, 'lahore');
  assert.ok(nearest.id.startsWith('lahore-'));
});

test('getNearestArea spatial pruning: point inside Islamabad bounds scopes to Islamabad areas', () => {
  // Islamabad F-6 coordinates
  const isbCoords = { lat: 33.7299, lng: 73.0746 };
  const nearest = getNearestArea(isbCoords);
  assert.ok(nearest);
  assert.equal(nearest.cityId, 'islamabad');
  assert.equal(nearest.id, 'islamabad-sector-f-6');
});

test('getNearestArea spatial pruning: point inside Karachi bounds scopes to Karachi areas', () => {
  // Karachi Clifton coordinates
  const khiCoords = { lat: 24.8138, lng: 67.03 };
  const nearest = getNearestArea(khiCoords);
  assert.ok(nearest);
  assert.equal(nearest.cityId, 'karachi');
  assert.ok(nearest.id.startsWith('karachi-'));
});

test('getNearestArea fallback: point outside all city bounding boxes falls back to all areas', () => {
  // Coordinates in central Balochistan desert (outside any verified city bounding box)
  const remoteCoords = { lat: 28.5, lng: 66.0 };
  const nearest = getNearestArea(remoteCoords);
  // Should not return null simply because it is outside city boxes; finds nearest area in Pakistan
  assert.ok(nearest);
  assert.ok(nearest.id.length > 0);
});

test('getNearestArea: Attock center coordinates correctly resolve to attock area', () => {
  const attockCoords = { lat: 33.76, lng: 72.36 };
  const nearest = getNearestArea(attockCoords);
  assert.ok(nearest);
  assert.equal(nearest.cityId, 'attock');
});

test('getNearestArea fallback: candidate areas subset with 0 areas in matching city falls back to candidate pool', () => {
  // Attock center coordinates, but candidate areas only contain Lahore areas
  const attockCoords = { lat: 33.76, lng: 72.36 };
  const lahoreSubset = allAreas.filter((a) => a.cityId === 'lahore');
  const nearest = getNearestArea(attockCoords, undefined, lahoreSubset);
  assert.ok(nearest);
  assert.equal(nearest.cityId, 'lahore');
});

test('getNearestArea options: cityId explicitly overrides spatial pruning', () => {
  // Coordinates in Lahore, but caller explicitly requests Karachi
  const lahoreCoords = { lat: 31.4697, lng: 74.3986 };
  const nearestInKarachi = getNearestArea(lahoreCoords, { cityId: 'karachi' });
  assert.ok(nearestInKarachi);
  assert.equal(nearestInKarachi.cityId, 'karachi');
});

test('getNearestArea options: maxDistanceKm is respected', () => {
  const remoteCoords = { lat: 28.5, lng: 66.0 };
  const nearest = getNearestArea(remoteCoords, { maxDistanceKm: 5 });
  assert.equal(nearest, null);
});

test('getNearestArea spatial pruning respects provinceId when coords are inside a different province city box', () => {
  // Islamabad coordinates (inside Islamabad city bounding box, provinceId: 'islamabad-ict')
  // Caller explicitly filters by provinceId: 'punjab' (which borders Islamabad)
  const isbCoords = { lat: 33.7299, lng: 73.0746 };
  const nearestInPunjab = getNearestArea(isbCoords, { provinceId: 'punjab' });

  assert.ok(nearestInPunjab, 'Must find nearest area in Punjab rather than returning null');
  assert.equal(nearestInPunjab.provinceId, 'punjab');
  assert.equal(nearestInPunjab.cityId, 'rawalpindi');
});

test('getNearestArea spatial pruning: handles twin cities overlapping bounding boxes correctly', () => {
  // Commercial Market Rawalpindi coordinates fall inside both Islamabad and Rawalpindi bounding boxes
  const commercialMarketCoords = { lat: 33.642, lng: 73.072 };
  const nearest = getNearestArea(commercialMarketCoords);

  assert.ok(nearest, 'Should find nearest area');
  assert.equal(nearest.id, 'rawalpindi-commercial-market', 'Must return Rawalpindi area instead of Islamabad');
  assert.equal(nearest.cityId, 'rawalpindi');
});
