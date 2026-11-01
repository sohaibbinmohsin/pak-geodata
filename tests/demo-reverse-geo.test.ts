import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCoordinates,
  formatDistance,
  formatSpeedBadge,
  DEFAULT_SPEED_BADGE,
} from '../apps/demo/src/components/reverseGeoUtils.js';
import { getNearestArea, haversineDistanceKm, type PakistanArea } from 'pak-geodata';

describe('Reverse Geocoding Playground Utilities & Calculation', () => {
  describe('formatCoordinates', () => {
    test('formats coordinates with 4 decimal places and cardinal directions', () => {
      assert.equal(
        formatCoordinates({ lat: 31.45124, lng: 74.39809 }),
        '31.4512° N, 74.3981° E'
      );
      assert.equal(
        formatCoordinates({ lat: 24.8607, lng: 67.0011 }),
        '24.8607° N, 67.0011° E'
      );
    });

    test('handles negative coordinates correctly', () => {
      assert.equal(
        formatCoordinates({ lat: -33.8688, lng: 151.2093 }),
        '33.8688° S, 151.2093° E'
      );
      assert.equal(
        formatCoordinates({ lat: 40.7128, lng: -74.006 }),
        '40.7128° N, 74.0060° W'
      );
    });
  });

  describe('formatDistance', () => {
    test('formats sub-kilometer distances in meters', () => {
      assert.equal(formatDistance(0.34), '340 m');
      assert.equal(formatDistance(0.42), '420 m');
      assert.equal(formatDistance(0.05), '50 m');
      assert.equal(formatDistance(0.005), '5 m');
      assert.equal(formatDistance(0), '0 m');
    });

    test('formats distances 1 km and above in kilometers with 1 decimal place', () => {
      assert.equal(formatDistance(1.0), '1.0 km');
      assert.equal(formatDistance(2.4), '2.4 km');
      assert.equal(formatDistance(2.44), '2.4 km');
      assert.equal(formatDistance(2.46), '2.5 km');
      assert.equal(formatDistance(15.67), '15.7 km');
    });

    test('rounds 0.9999 km up to 1.0 km cleanly', () => {
      assert.equal(formatDistance(0.9999), '1.0 km');
    });
  });

  describe('formatSpeedBadge', () => {
    test('returns default benchmark speed badge when under 0.4ms or undefined', () => {
      assert.equal(formatSpeedBadge(), DEFAULT_SPEED_BADGE);
      assert.equal(formatSpeedBadge(0.05), DEFAULT_SPEED_BADGE);
      assert.equal(formatSpeedBadge(0.39), DEFAULT_SPEED_BADGE);
      assert.equal(DEFAULT_SPEED_BADGE, '< 0.4 ms (Offline Client-Side)');
    });

    test('formats execution time if 0.4ms or greater', () => {
      assert.equal(formatSpeedBadge(1.23), '1.2 ms (Offline Client-Side)');
      assert.equal(formatSpeedBadge(0.4), '0.4 ms (Offline Client-Side)');
    });
  });

  describe('Spatial reverse geocoding integration', () => {
    test('computes nearest area and distance for DHA Phase 5 Lahore coordinates', () => {
      // Coords near DHA Phase 5 Lahore (31.4581, 74.4121)
      const clicked = { lat: 31.4585, lng: 74.4125 };
      const nearest = getNearestArea(clicked);
      assert.ok(nearest, 'Should find nearest area');
      assert.equal(nearest.id, 'lahore-dha-phase-5');
      assert.equal(nearest.name, 'DHA Phase 5');
      assert.equal(nearest.urduName, 'ڈی ایچ اے فیز 5');

      const distanceKm = haversineDistanceKm(clicked, nearest.coordinates);
      assert.ok(distanceKm < 0.2, `Distance should be under 200m, got ${distanceKm} km`);
      const formattedDist = formatDistance(distanceKm);
      assert.ok(formattedDist.endsWith(' m'), `Should be formatted in meters, got ${formattedDist}`);
    });

    test('computes nearest area and distance for Islamabad F-6 coordinates', () => {
      // Coords near F-6 Islamabad (33.7295, 73.0746)
      const clicked = { lat: 33.7292, lng: 73.0782 };
      const nearest = getNearestArea(clicked);
      assert.ok(nearest, 'Should find nearest area');
      assert.equal(nearest.id, 'islamabad-sector-f-6');
      assert.equal(nearest.name, 'Sector F-6');

      const distanceKm = haversineDistanceKm(clicked, nearest.coordinates);
      assert.ok(distanceKm < 0.2);
    });

    test('scopes reverse geocoding by cityId when city filter is active', () => {
      // Click near Lahore, but scope to Islamabad
      const clickedInLahore = { lat: 31.4581, lng: 74.4121 };
      const nearestInIslamabad = getNearestArea(clickedInLahore, { cityId: 'islamabad' });
      assert.ok(nearestInIslamabad, 'Should find nearest Islamabad area');
      assert.equal(nearestInIslamabad.cityId, 'islamabad');

      const distanceKm = haversineDistanceKm(clickedInLahore, nearestInIslamabad.coordinates);
      assert.ok(distanceKm > 250, 'Distance from Lahore to Islamabad should exceed 250km');
      const formatted = formatDistance(distanceKm);
      assert.ok(formatted.endsWith(' km'), 'Should be formatted in km');
    });
  });
});
