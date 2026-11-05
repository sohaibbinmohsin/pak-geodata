import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateDartData } from './dart.js';

test('generateDartData emits valid const Dart collections with 100% parity', async () => {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const tempOutDir = resolve(rootDir, 'node_modules/.cache/test-dart-codegen');

  const result = await generateDartData(dataDir, tempOutDir, {});
  assert.equal(result.provincesCount, 7);
  assert.equal(result.citiesCount, 79);
  assert.equal(result.areasCount, 3953);

  // Provinces verification
  const provincesPath = resolve(tempOutDir, 'src/data/provinces.dart');
  assert.ok(existsSync(provincesPath));
  const provincesDart = readFileSync(provincesPath, 'utf-8');
  assert.ok(provincesDart.includes('pakistanProvinces'));
  assert.ok(provincesDart.includes('PakistanProvince'));
  assert.ok(provincesDart.includes("urduName: 'پنجاب'"));

  // Cities verification
  const citiesPath = resolve(tempOutDir, 'src/data/cities.dart');
  assert.ok(existsSync(citiesPath));
  const citiesDart = readFileSync(citiesPath, 'utf-8');
  assert.ok(citiesDart.includes('pakistanCities'));
  assert.ok(citiesDart.includes('PakistanCity'));
  assert.ok(citiesDart.includes("id: 'lahore'"));
  assert.ok(citiesDart.includes("urduName: 'لاہور'"));
  assert.ok(citiesDart.includes('CityBounds('));
  assert.ok(citiesDart.includes('Coordinates('));

  // Areas verification
  const areasPath = resolve(tempOutDir, 'src/data/areas.dart');
  assert.ok(existsSync(areasPath));
  const areasDart = readFileSync(areasPath, 'utf-8');
  assert.ok(areasDart.includes('pakistanAreas'));
  assert.ok(areasDart.includes('lahore-dha-phase-5'));
  assert.ok(areasDart.includes('PakistanArea('));

  // Escaping verification for single quotes
  assert.ok(
    areasDart.includes("Doctor\\'s Colony") || areasDart.includes("Doctor\\'s"),
    'Single quotes in area names or aliases must be escaped'
  );
});
