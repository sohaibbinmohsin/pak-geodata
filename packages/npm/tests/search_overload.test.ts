import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchAreas } from '../src/index.js';

test('searchAreas overload 1: Sanctuary signature (cityKey, query, lang)', () => {
  const items = searchAreas('Lahore', 'DHA', 'ur');
  assert.ok(Array.isArray(items));
  assert.ok(items.length > 0);
  assert.equal(items[0].type, 'area');
  assert.equal(items[0].parentId, 'lahore');
  assert.ok(items[0].nameEn.length > 0);
  assert.ok(items[0].nameUr.length > 0);
});

test('searchAreas overload 1: case-insensitive cityKey and English lang', () => {
  const items = searchAreas('lahore', 'Gulberg', 'en');
  assert.ok(Array.isArray(items));
  assert.ok(items.length > 0);
  assert.equal(items[0].type, 'area');
  assert.equal(items[0].parentId, 'lahore');
  assert.ok(items.some((item) => item.id.includes('gulberg')));
});

test('searchAreas overload 1: returns empty array for unknown cityKey', () => {
  const items = searchAreas('UnknownCity', 'DHA', 'en');
  assert.deepEqual(items, []);
});

test('searchAreas overload 2: Classic signature (query, options)', () => {
  const areas = searchAreas('DHA Phase 5', { cityId: 'lahore' });
  assert.ok(Array.isArray(areas));
  assert.ok(areas.length > 0);
  assert.equal(areas[0].id, 'lahore-dha-phase-5');
});

test('searchAreas overload 2: Classic signature without options', () => {
  const areas = searchAreas('Clifton');
  assert.ok(Array.isArray(areas));
  assert.ok(areas.length > 0);
  assert.ok(areas.some((a) => a.id.startsWith('karachi-clifton')));
});

test('searchAreas handles Eastern Arabic numerals and Arabic letter variants in queries', () => {
  // Eastern Arabic numeral '۳' matches Western digit '3' in candidate areas
  const easternResults = searchAreas('گلبرگ ۳', { cityId: 'lahore' });
  assert.ok(easternResults.length > 0);
  assert.equal(easternResults[0].id, 'lahore-gulberg-3');

  // Western numeral '3' matches candidate
  const westernResults = searchAreas('گلبرگ 3', { cityId: 'lahore' });
  assert.ok(westernResults.length > 0);
  assert.equal(westernResults[0].id, 'lahore-gulberg-3');

  // Arabic Kaf variant 'ك' matches Urdu 'ک'
  const arabicKafResults = searchAreas('كلفٹن', { cityId: 'karachi' });
  assert.ok(arabicKafResults.length > 0);
  assert.ok(arabicKafResults.some((a) => a.id.startsWith('karachi-clifton')));

  // Sanctuary overload with Eastern numerals
  const sanctuaryItems = searchAreas('Lahore', 'گلبرگ ۳', 'ur');
  assert.ok(sanctuaryItems.length > 0);
  assert.equal(sanctuaryItems[0].parentId, 'lahore');
});

test('searchAreas edge cases: invalid query types and limit option', () => {
  assert.deepEqual(searchAreas(null as any), []);
  assert.deepEqual(searchAreas('' as any), []);
  assert.deepEqual(searchAreas('   ' as any), []);
  assert.deepEqual(searchAreas('dha', { limit: 0 }), []);
});
