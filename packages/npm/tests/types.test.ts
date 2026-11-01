import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PakLocationItem, PakLocationType, ProvinceId, CityId } from '../src/types.js';

test('PakLocationItem interface accepts valid location structures', () => {
  const item: PakLocationItem = {
    id: 'lahore-gulberg-iii',
    nameEn: 'Gulberg III',
    nameUr: 'گلبرگ ۳',
    type: 'area',
    parentId: 'lahore',
    coordinates: {
      lat: 31.5123,
      lng: 74.3456
    }
  };
  assert.equal(item.nameEn, 'Gulberg III');
  assert.equal(item.nameUr, 'گلبرگ ۳');
  assert.equal(item.type, 'area');
  assert.equal(item.parentId, 'lahore');
});

test('ProvinceId and CityId type unions allow valid identifiers', () => {
  const province: ProvinceId = 'punjab';
  const city: CityId = 'lahore';
  const customCity: CityId = 'custom-city';
  const type: PakLocationType = 'province';
  assert.equal(province, 'punjab');
  assert.equal(city, 'lahore');
  assert.equal(customCity, 'custom-city');
  assert.equal(type, 'province');
});
