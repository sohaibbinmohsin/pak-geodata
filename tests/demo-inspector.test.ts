import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCodeSnippet,
  formatGpsCoordinates,
  getCityExportVar,
} from '../apps/demo/src/components/codeSnippets.js';
import type { PakistanArea } from 'pak-geodata';

const sampleLahoreArea: PakistanArea = {
  id: 'lahore-dha-phase-5',
  cityId: 'lahore',
  provinceId: 'punjab',
  name: 'DHA Phase 5',
  urduName: 'ڈی ایچ اے فیز 5',
  aliases: ['DHA 5', 'Defence Phase 5'],
  postalCode: '54792',
  coordinates: {
    lat: 31.4581,
    lng: 74.4121,
  },
  type: 'housing_society',
  verified: true,
};

const sampleIslamabadArea: PakistanArea = {
  id: 'islamabad-sector-f-6',
  cityId: 'islamabad',
  provinceId: 'islamabad-ict',
  name: 'Sector F-6',
  urduName: 'سیکٹر ایف-6',
  aliases: ['F-6', 'Sector F6'],
  postalCode: '44000',
  coordinates: {
    lat: 33.7295,
    lng: 73.0746,
  },
  type: 'sector',
  verified: true,
};

describe('Area Inspector & Code Generator Utilities', () => {
  describe('getCityExportVar', () => {
    test('converts simple city slug to camelCase export variable', () => {
      assert.equal(getCityExportVar('lahore'), 'lahoreAreas');
      assert.equal(getCityExportVar('karachi'), 'karachiAreas');
      assert.equal(getCityExportVar('islamabad'), 'islamabadAreas');
      assert.equal(getCityExportVar('rawalpindi'), 'rawalpindiAreas');
      assert.equal(getCityExportVar('faisalabad'), 'faisalabadAreas');
    });

    test('handles hyphenated city slugs cleanly', () => {
      assert.equal(getCityExportVar('dera-ghazi-khan'), 'deraGhaziKhanAreas');
    });
  });

  describe('formatGpsCoordinates', () => {
    test('formats coordinates to 4 decimal places with cardinal directions', () => {
      assert.equal(formatGpsCoordinates(31.4581, 74.4121), '31.4581° N, 74.4121° E');
      assert.equal(formatGpsCoordinates(24.8607, 67.0011), '24.8607° N, 67.0011° E');
    });

    test('handles negative coordinates with S and W', () => {
      assert.equal(formatGpsCoordinates(-33.8688, -151.2093), '33.8688° S, 151.2093° W');
    });
  });

  describe('generateCodeSnippet', () => {
    test('generates TypeScript snippet with tree-shaking subpath export and searchAreas', () => {
      const snippet = generateCodeSnippet(sampleLahoreArea, 'typescript');
      assert.ok(snippet.includes("import { searchAreas, getNearestArea } from 'pak-geodata';"));
      assert.ok(snippet.includes("// Subpath tree-shaking (~24 KB):"));
      assert.ok(snippet.includes("import { lahoreAreas } from 'pak-geodata/areas/lahore';"));
      assert.ok(
        snippet.includes("const area = searchAreas('DHA Phase 5', { cityId: 'lahore' })[0];")
      );
    });

    test('generates TypeScript snippet for Islamabad area', () => {
      const snippet = generateCodeSnippet(sampleIslamabadArea, 'typescript');
      assert.ok(snippet.includes("import { islamabadAreas } from 'pak-geodata/areas/islamabad';"));
      assert.ok(
        snippet.includes("const area = searchAreas('Sector F-6', { cityId: 'islamabad' })[0];")
      );
    });

    test('generates Python snippet with search_areas', () => {
      const snippet = generateCodeSnippet(sampleLahoreArea, 'python');
      assert.ok(snippet.includes("from pak_geodata import search_areas, get_nearest_area"));
      assert.ok(snippet.includes("area = search_areas('DHA Phase 5', city_id='lahore')[0]"));
    });

    test('generates Python snippet for Islamabad area', () => {
      const snippet = generateCodeSnippet(sampleIslamabadArea, 'python');
      assert.ok(snippet.includes("from pak_geodata import search_areas, get_nearest_area"));
      assert.ok(snippet.includes("area = search_areas('Sector F-6', city_id='islamabad')[0]"));
    });

    test('escapes single quotes in area name', () => {
      const areaWithQuote: PakistanArea = {
        ...sampleLahoreArea,
        name: "St. John's Park",
      };
      const tsSnippet = generateCodeSnippet(areaWithQuote, 'typescript');
      assert.ok(tsSnippet.includes("searchAreas('St. John\\'s Park', { cityId: 'lahore' })"));

      const pySnippet = generateCodeSnippet(areaWithQuote, 'python');
      assert.ok(pySnippet.includes("search_areas('St. John\\'s Park', city_id='lahore')"));
    });
  });
});
