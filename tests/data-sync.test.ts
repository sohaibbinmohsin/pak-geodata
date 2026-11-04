import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('build pipeline synchronizes data to packages/pypi/pak_geodata/data', () => {
  const rootDir = process.cwd();
  const pypiDataDir = resolve(rootDir, 'packages/pypi/pak_geodata/data');

  assert.ok(existsSync(resolve(pypiDataDir, 'provinces.json')));
  assert.ok(existsSync(resolve(pypiDataDir, 'cities')));
  assert.ok(existsSync(resolve(pypiDataDir, 'areas')));

  const cityFiles = readdirSync(resolve(pypiDataDir, 'cities'));
  assert.equal(cityFiles.length, 7);

  const areaFiles = readdirSync(resolve(pypiDataDir, 'areas'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.json'));
  assert.equal(areaFiles.length, 79);

  const masterProvinces = readFileSync(resolve(rootDir, 'data/provinces.json'), 'utf-8');
  const pypiProvinces = readFileSync(resolve(pypiDataDir, 'provinces.json'), 'utf-8');
  assert.equal(pypiProvinces, masterProvinces);

  assert.ok(existsSync(resolve(rootDir, 'packages/pypi/LICENSE')));
  assert.ok(existsSync(resolve(rootDir, 'packages/pypi/LICENSE-DATA')));
  assert.ok(existsSync(resolve(rootDir, 'packages/pypi/ATTRIBUTION.md')));
});

test('build pipeline synchronizes data to packages/go/data', () => {
  const rootDir = process.cwd();
  const goDataDir = resolve(rootDir, 'packages/go/data');

  assert.ok(existsSync(resolve(goDataDir, 'provinces.json')));
  assert.ok(existsSync(resolve(goDataDir, 'cities')));
  assert.ok(existsSync(resolve(goDataDir, 'areas')));

  const cityFiles = readdirSync(resolve(goDataDir, 'cities'));
  assert.ok(cityFiles.length > 0);
  assert.equal(cityFiles.length, 7);

  const areaFiles = readdirSync(resolve(goDataDir, 'areas'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.json'));
  assert.equal(areaFiles.length, 79);

  const masterProvinces = readFileSync(resolve(rootDir, 'data/provinces.json'), 'utf-8');
  const goProvinces = readFileSync(resolve(goDataDir, 'provinces.json'), 'utf-8');
  assert.equal(goProvinces, masterProvinces);

  assert.ok(existsSync(resolve(rootDir, 'packages/go/LICENSE')));
  assert.ok(existsSync(resolve(rootDir, 'packages/go/LICENSE-DATA')));
  assert.ok(existsSync(resolve(rootDir, 'packages/go/ATTRIBUTION.md')));
});
