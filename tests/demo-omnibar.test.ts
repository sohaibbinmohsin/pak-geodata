import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getMatchBadge } from '../apps/demo/src/components/matchBadge.js';
import { searchAreas, findAreasByPostalCode, type PakistanArea } from 'pak-geodata';

describe('Omnibar Search & Match Badge Recognition', () => {
  const sampleArea: PakistanArea = {
    id: 'lahore-dha-phase-5',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'DHA Phase 5',
    urduName: 'ڈی ایچ اے فیز 5',
    aliases: ['DHA 5', 'Defence Phase 5'],
    postalCode: '54792',
    coordinates: { lat: 31.4581, lng: 74.4121 },
    type: 'housing_society',
    verified: true,
    sources: ['survey', 'curated'],
  };

  test('recognizes postal code match when digits are entered', () => {
    const badgeExact = getMatchBadge(sampleArea, '54792');
    assert.equal(badgeExact.type, 'postal');
    assert.equal(badgeExact.label, 'Postal: 54792');

    const badgePrefix = getMatchBadge(sampleArea, '547');
    assert.equal(badgePrefix.type, 'postal');
    assert.equal(badgePrefix.label, 'Postal: 54792');
  });

  test('recognizes native Urdu script match', () => {
    const badgeUrdu = getMatchBadge(sampleArea, 'ڈی ایچ اے');
    assert.equal(badgeUrdu.type, 'urdu');
    assert.equal(badgeUrdu.label, 'Urdu: "ڈی ایچ اے فیز 5"');
  });

  test('recognizes colloquial alias match', () => {
    const badgeAlias = getMatchBadge(sampleArea, 'dha 5');
    assert.equal(badgeAlias.type, 'alias');
    assert.equal(badgeAlias.label, 'Alias: "DHA 5"');

    const badgeAlias2 = getMatchBadge(sampleArea, 'defence phase 5');
    assert.equal(badgeAlias2.type, 'alias');
    assert.equal(badgeAlias2.label, 'Alias: "Defence Phase 5"');
  });

  test('recognizes exact name and ID matches', () => {
    const badgeExact = getMatchBadge(sampleArea, 'DHA Phase 5');
    assert.equal(badgeExact.type, 'exact');
    assert.equal(badgeExact.label, 'Exact Match');

    const badgeId = getMatchBadge(sampleArea, 'lahore-dha-phase-5');
    assert.equal(badgeId.type, 'exact');
    assert.equal(badgeId.label, 'Exact Match');
  });

  test('recognizes prefix matches', () => {
    const badgePrefix = getMatchBadge(sampleArea, 'dha ph');
    assert.equal(badgePrefix.type, 'prefix');
    assert.equal(badgePrefix.label, 'Prefix Match');
  });

  test('falls back to match when no higher priority matches', () => {
    const areaWithoutAlias = { ...sampleArea, aliases: [] };
    const badgeFallback = getMatchBadge(areaWithoutAlias, 'phase');
    assert.equal(badgeFallback.type, 'match');
    assert.equal(badgeFallback.label, 'Match');
  });

  test('finds areas by postal code 54000', () => {
    const postalAreas = findAreasByPostalCode('54000');
    assert.ok(postalAreas.length > 0, 'Should find postal areas for 54000');
    const walledCity = postalAreas.find((a) => a.id === 'lahore-walled-city');
    assert.ok(walledCity, 'Walled city should have postal code 54000');
    if (walledCity) {
      const badge = getMatchBadge(walledCity, '54000');
      assert.equal(badge.type, 'postal');
      assert.equal(badge.label, 'Postal: 54000');
    }
  });

  test('finds areas by multi-script query in pak-geodata searchAreas', () => {
    const results = searchAreas('dha 5', { cityId: 'lahore' });
    assert.ok(results.length > 0);
    assert.equal(results[0].id, 'lahore-dha-phase-5');
  });
});
