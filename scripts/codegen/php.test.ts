import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePhpProvinces,
  generatePhpCities,
  generatePhpAreas,
  escapePhpString,
  ProvinceJson,
  CityJson,
  AreaJson,
} from './php.js';

describe('PHP Codegen', () => {
  it('correctly escapes single quotes and backslashes in PHP strings', () => {
    assert.strictEqual(escapePhpString("O'Reilly"), "O\\'Reilly");
    assert.strictEqual(escapePhpString('C:\\Data\\Path'), 'C:\\\\Data\\\\Path');
    assert.strictEqual(escapePhpString("It's \\a\\ test'"), "It\\'s \\\\a\\\\ test\\'");
  });

  it('generates valid PHP return array code for provinces with Urdu script preserved', () => {
    const provinces: ProvinceJson[] = [
      { id: 'punjab', name: 'Punjab', urduName: 'پنجاب', capitalCityId: 'lahore', type: 'province' },
    ];
    const code = generatePhpProvinces(provinces);
    assert.match(code, /^<\?php/);
    assert.match(code, /declare\(strict_types=1\);/);
    assert.match(code, /namespace PakGeoData\\Data;/);
    assert.match(code, /return \[/);
    assert.match(code, /'id' => 'punjab'/);
    assert.match(code, /'urduName' => 'پنجاب'/);
  });

  it('generates valid PHP return array code for cities with bounds and coordinates', () => {
    const cities: CityJson[] = [
      {
        id: 'lahore',
        name: 'Lahore',
        urduName: 'لاہور',
        provinceId: 'punjab',
        coordinates: { lat: 31.5204, lng: 74.3587 },
        bounds: { minLat: 31.3, maxLat: 31.7, minLng: 74.1, maxLng: 74.5 },
        postalCodeRange: ['54000', '54999'],
        totalAreasCount: 575,
      },
    ];
    const code = generatePhpCities(cities);
    assert.match(code, /'name' => 'Lahore'/);
    assert.match(code, /'coordinates' => \['lat' => 31.5204, 'lng' => 74.3587\]/);
    assert.match(code, /'totalAreasCount' => 575/);
  });

  it('generates valid PHP return array code for areas with aliases and postal code', () => {
    const areas: AreaJson[] = [
      {
        id: 'lahore-dha-phase-5',
        cityId: 'lahore',
        provinceId: 'punjab',
        name: 'DHA Phase 5',
        urduName: 'ڈی ایچ اے فیز 5',
        postalCode: '54792',
        coordinates: { lat: 31.4697, lng: 74.4133 },
        aliases: ['dha 5', 'defence phase 5'],
        type: 'housing_scheme',
        verified: true,
        sources: ['survey'],
      },
    ];
    const code = generatePhpAreas(areas);
    assert.match(code, /'id' => 'lahore-dha-phase-5'/);
    assert.match(code, /'aliases' => \['dha 5', 'defence phase 5'\]/);
    assert.match(code, /'verified' => true/);
  });
});
