import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCityName,
  getAreaName,
  toLocationItem,
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  searchLocationItems,
  cityLookupMap,
  areaCompoundLookupMap
} from '../src/hierarchy.js';
import type { PakistanProvince, PakistanCity, PakistanArea } from '../src/types.js';

test('getCityName resolves title-cased English key and slug in en and ur', () => {
  assert.equal(getCityName('Lahore', 'en'), 'Lahore');
  assert.equal(getCityName('Lahore', 'ur'), 'لاہور');
  assert.equal(getCityName('lahore', 'ur'), 'لاہور');
  assert.equal(getCityName('karachi', 'en'), 'Karachi');
  assert.equal(getCityName('karachi', 'ur'), 'کراچی');
  // Normalized Urdu queries with diacritics / tashkeel
  assert.equal(getCityName('لَاہَوْر', 'en'), 'Lahore');
  assert.equal(getCityName('لَاہَوْر', 'ur'), 'لاہور');
  // Default language is English
  assert.equal(getCityName('Lahore'), 'Lahore');
  // Fallback for unverified city
  assert.equal(getCityName('UnknownCity', 'ur'), 'UnknownCity');
  assert.equal(getCityName('UnknownCity', 'en'), 'UnknownCity');
  // Defensive input handling
  assert.equal(getCityName(''), '');
  assert.equal(getCityName(null as unknown as string), '');
});

test('getAreaName resolves area slug, title name, and alias with city key', () => {
  assert.equal(getAreaName('Lahore', 'Gulberg III', 'en'), 'Gulberg III');
  assert.equal(getAreaName('Lahore', 'Gulberg III', 'ur'), 'گلبرگ ۳');
  assert.equal(getAreaName('lahore', 'lahore-gulberg-iii', 'ur'), 'گلبرگ ۳');
  assert.equal(getAreaName('lahore', 'Gulberg', 'ur'), 'گلبرگ ۳');
  // Default language is English
  assert.equal(getAreaName('lahore', 'Gulberg'), 'Gulberg III');
  // Fallback for unverified area
  assert.equal(getAreaName('Lahore', 'Custom Colony', 'ur'), 'Custom Colony');
  assert.equal(getAreaName('UnknownCity', 'Custom Colony', 'ur'), 'Custom Colony');
  // Defensive input handling
  assert.equal(getAreaName('', 'Custom Colony'), 'Custom Colony');
  assert.equal(getAreaName('Lahore', ''), '');
  assert.equal(getAreaName('Lahore', null as unknown as string), '');
});

test('toLocationItem maps provinces, cities, and areas correctly', () => {
  const provItem = getProvincesAsLocationItems().find((p) => p.id === 'punjab');
  assert.ok(provItem);
  assert.equal(provItem.type, 'province');
  assert.equal(provItem.nameEn, 'Punjab');
  assert.equal(provItem.nameUr, 'پنجاب');
  assert.equal(provItem.parentId, undefined);

  const cityItem = getCitiesAsLocationItems('punjab').find((c) => c.id === 'lahore');
  assert.ok(cityItem);
  assert.equal(cityItem.type, 'district');
  assert.equal(cityItem.parentId, 'punjab');
  assert.ok(cityItem.coordinates);

  const areas = getAreasAsLocationItems('Lahore');
  assert.ok(areas.length > 0);
  const gulberg = areas.find((a) => a.id === 'lahore-gulberg-iii');
  assert.ok(gulberg);
  assert.equal(gulberg.type, 'area');
  assert.equal(gulberg.parentId, 'lahore');
});

test('toLocationItem handles individual entities directly', () => {
  const mockProvince: PakistanProvince = {
    id: 'sindh',
    name: 'Sindh',
    urduName: 'سندھ',
    capitalCityId: 'karachi',
    type: 'province'
  };
  const pItem = toLocationItem(mockProvince);
  assert.equal(pItem.id, 'sindh');
  assert.equal(pItem.nameEn, 'Sindh');
  assert.equal(pItem.nameUr, 'سندھ');
  assert.equal(pItem.type, 'province');
  assert.equal(pItem.parentId, undefined);

  const mockCity: PakistanCity = {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    urduName: 'راولپنڈی',
    provinceId: 'punjab',
    district: 'Rawalpindi',
    coordinates: { lat: 33.6, lng: 73.04 },
    totalAreasCount: 15
  };
  const cItem = toLocationItem(mockCity);
  assert.equal(cItem.id, 'rawalpindi');
  assert.equal(cItem.nameEn, 'Rawalpindi');
  assert.equal(cItem.nameUr, 'راولپنڈی');
  assert.equal(cItem.type, 'district');
  assert.equal(cItem.parentId, 'punjab');
  assert.deepEqual(cItem.coordinates, { lat: 33.6, lng: 73.04 });

  const mockArea: PakistanArea = {
    id: 'lahore-model-town',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'Model Town',
    urduName: 'ماڈل ٹاؤن',
    aliases: ['Model Town Lahore'],
    postalCode: '54700',
    coordinates: { lat: 31.48, lng: 74.32 },
    verified: true
  };
  const aItem = toLocationItem(mockArea);
  assert.equal(aItem.id, 'lahore-model-town');
  assert.equal(aItem.nameEn, 'Model Town');
  assert.equal(aItem.nameUr, 'ماڈل ٹاؤن');
  assert.equal(aItem.type, 'area');
  assert.equal(aItem.parentId, 'lahore');
});

test('toLocationItem throws TypeError for unrecognized location entity format', () => {
  assert.throws(
    // @ts-expect-error test unrecognized format
    () => toLocationItem({}),
    {
      name: 'TypeError',
      message: 'Unrecognized location entity format: expected province, city, or area object'
    }
  );
  assert.throws(
    // @ts-expect-error test unrecognized format
    () => toLocationItem({ title: 'Invalid Entity', id: 'unknown' }),
    {
      name: 'TypeError',
      message: 'Unrecognized location entity format: expected province, city, or area object'
    }
  );
  assert.throws(
    // @ts-expect-error test non-object
    () => toLocationItem(null),
    {
      name: 'TypeError',
      message: 'Expected a valid location entity'
    }
  );
});

test('searchLocationItems returns PakLocationItem array scoped to city', () => {
  const results = searchLocationItems('Lahore', 'Gulberg', 'ur');
  assert.ok(results.length > 0);
  assert.equal(results[0].type, 'area');
  assert.equal(results[0].parentId, 'lahore');
  assert.ok(results[0].nameUr.includes('گلبرگ'));

  // Unknown city or empty query returns empty list
  assert.deepEqual(searchLocationItems('UnknownCity', 'Gulberg'), []);
  assert.deepEqual(searchLocationItems('Lahore', ''), []);
  assert.deepEqual(searchLocationItems('', 'Gulberg'), []);
});

test('pre-indexed lookup maps are populated and accessible', () => {
  assert.ok(cityLookupMap.size > 0);
  assert.ok(areaCompoundLookupMap.size > 0);
  assert.ok(cityLookupMap.has('lahore'));
  assert.ok(cityLookupMap.has('karachi'));
  assert.ok(areaCompoundLookupMap.has('lahore:gulberg iii'));
  assert.ok(areaCompoundLookupMap.has('lahore:gulberg'));
});
