import { test } from 'node:test';
import assert from 'node:assert/strict';
import type {
  PakLocationItem,
  PakLocationType,
  ProvinceId,
  CityId,
  ProvenanceSource,
  PakistanAreaExtended,
  CityBounds,
  PakistanArea
} from '../src/types.js';

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

test('types: PakistanArea accepts legacy string sources and structured ProvenanceSource', async () => {
  // @ts-expect-error test import from types
  const { typesTest } = await import('../src/types.js').catch(() => ({}));
  // Import types dynamically or check type exports
  const typesMod = await import('../src/index.js');
  assert.ok(typesMod);

  const { ProvenanceSource } = {} as { ProvenanceSource: import('../src/types.js').ProvenanceSource };
  const legacyArea: import('../src/types.js').PakistanArea = {
    id: 'lahore-gulberg-3',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'Gulberg III',
    aliases: ['Gulberg 3'],
    coordinates: { lat: 31.512, lng: 74.345 },
    verified: true,
    sources: ['survey', 'curated'],
  };
  assert.equal(legacyArea.sources?.length, 2);

  const structuredSource: import('../src/types.js').ProvenanceSource = {
    provider: 'nga',
    id: '1372009',
    type: 'PPLX',
    verifiedAt: '2026-11-03',
  };

  const modernArea: import('../src/types.js').PakistanArea = {
    ...legacyArea,
    bounds: { minLat: 31.5, maxLat: 31.52, minLng: 74.33, maxLng: 74.36 },
    radiusKm: 1.8,
    sources: [structuredSource],
  };

  assert.equal(modernArea.radiusKm, 1.8);
  assert.equal((modernArea.sources?.[0] as import('../src/types.js').ProvenanceSource).provider, 'nga');
});
