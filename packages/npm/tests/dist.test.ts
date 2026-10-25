import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('compiled ESM distribution exports correctly', async () => {
  const esm = await import('../dist/index.js');
  assert.equal(typeof esm.getAllProvinces, 'function');
  assert.equal(typeof esm.searchAreas, 'function');
  assert.equal(esm.getAllProvinces().length, 7);
  assert.equal(esm.getAllCities().length, 40);
  assert.equal(esm.getAllAreas().length, 189);

  const lahoreSub = await import('../dist/areas/lahore.js');
  assert.equal(lahoreSub.lahoreAreas.length, 50);
});

test('compiled CJS distribution requires correctly', () => {
  const cjs = require('../dist/index.cjs');
  assert.equal(typeof cjs.getAllProvinces, 'function');
  assert.equal(typeof cjs.searchAreas, 'function');
  assert.equal(cjs.getAllProvinces().length, 7);
  assert.equal(cjs.getAllCities().length, 40);
  assert.equal(cjs.getAllAreas().length, 189);

  const lhrAreas = cjs.getAreasByCity('lahore');
  assert.equal(lhrAreas.length, 50);

  const results = cjs.searchAreas('dha 5', { cityId: 'lahore' });
  assert.ok(results.length > 0);
  assert.equal(results[0].id, 'lahore-dha-phase-5');

  const lahoreSub = require('../dist/areas/lahore.cjs');
  assert.equal(lahoreSub.lahoreAreas.length, 50);
});
