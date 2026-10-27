import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNearestArea, isPointInBoundingBox } from '../src/geo.js';

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
  assert.equal(nearest.id, 'lahore-dha-phase-4');
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
  assert.ok(nearest.id.startsWith('karachi-clifton'));
});

test('getNearestArea fallback: point outside all city bounding boxes falls back to all areas', () => {
  // Coordinates in central Balochistan desert (outside any verified city bounding box)
  const remoteCoords = { lat: 28.5, lng: 66.0 };
  const nearest = getNearestArea(remoteCoords);
  // Should not return null simply because it is outside city boxes; finds nearest area in Pakistan
  assert.ok(nearest);
  assert.ok(nearest.id.length > 0);
});

test('getNearestArea fallback: point inside a city with 0 areas falls back to all areas', () => {
  // Muzaffarabad center coordinates (inside Muzaffarabad bounds, but Muzaffarabad has 0 verified areas in dataset)
  const muzaffarabadCoords = { lat: 34.37, lng: 73.4711 };
  const nearest = getNearestArea(muzaffarabadCoords);
  assert.ok(nearest);
  // Nearest verified area is in Islamabad or Rawalpindi (~60km away)
  assert.ok(nearest.cityId === 'islamabad' || nearest.cityId === 'rawalpindi');
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
