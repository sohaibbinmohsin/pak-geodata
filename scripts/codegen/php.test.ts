import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePhpProvinces, generatePhpCities, generatePhpAreas } from './php.js';

describe('PHP Codegen', () => {
  it('generates valid PHP return array code for provinces with Urdu script preserved', () => {
    const provinces = [
      { id: 'punjab', name: 'Punjab', urduName: 'پنجاب', capitalCityId: 'lahore', type: 'province' },
    ];
    const code = generatePhpProvinces(provinces as any);
    assert.match(code, /^<\?php/);
    assert.match(code, /declare\(strict_types=1\);/);
    assert.match(code, /namespace PakGeoData\\Data;/);
    assert.match(code, /return \[/);
    assert.match(code, /'id' => 'punjab'/);
    assert.match(code, /'urduName' => 'پنجاب'/);
  });

  it('generates valid PHP return array code for cities with bounds and coordinates', () => {
    const cities = [
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
    const code = generatePhpCities(cities as any);
    assert.match(code, /'name' => 'Lahore'/);
    assert.match(code, /'coordinates' => \['lat' => 31.5204, 'lng' => 74.3587\]/);
    assert.match(code, /'totalAreasCount' => 575/);
  });

  it('generates valid PHP return array code for areas with aliases and postal code', () => {
    const areas = [
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
    const code = generatePhpAreas(areas as any);
    assert.match(code, /'id' => 'lahore-dha-phase-5'/);
    assert.match(code, /'aliases' => \['dha 5', 'defence phase 5'\]/);
    assert.match(code, /'verified' => true/);
  });
});
