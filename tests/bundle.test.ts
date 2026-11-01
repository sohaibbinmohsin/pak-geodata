import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { statSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(resolve(process.cwd(), 'package.json'));

describe('Packaging, Subpath Exports & Distribution Bundles', () => {
  const distDir = resolve(process.cwd(), 'packages/npm/dist');
  const esmHierarchy = resolve(distDir, 'hierarchy.js');
  const cjsHierarchy = resolve(distDir, 'hierarchy.cjs');
  const dtsHierarchy = resolve(distDir, 'hierarchy.d.ts');

  test('hierarchy subpath build artifacts exist and are lightweight (< 25 KB unminified, < 10 KB gzipped)', () => {
    assert.ok(existsSync(esmHierarchy), 'hierarchy.js must exist');
    assert.ok(existsSync(cjsHierarchy), 'hierarchy.cjs must exist');
    assert.ok(existsSync(dtsHierarchy), 'hierarchy.d.ts must exist');

    const esmSize = statSync(esmHierarchy).size;
    assert.ok(esmSize < 25000, `hierarchy.js size (${esmSize} bytes) should be < 25 KB`);

    const gzippedSize = gzipSync(readFileSync(esmHierarchy)).length;
    assert.ok(gzippedSize < 10000, `hierarchy.js gzipped size (${gzippedSize} bytes) should be < 10 KB`);
  });

  test('hierarchy subpath export in package.json is correctly configured', () => {
    const pkgPath = resolve(process.cwd(), 'packages/npm/package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    assert.ok(pkg.exports, 'package.json must declare exports field');
    assert.deepEqual(pkg.exports['./hierarchy'], {
      types: './dist/hierarchy.d.ts',
      import: './dist/hierarchy.js',
      require: './dist/hierarchy.cjs'
    });
  });

  test('hierarchy subpath exports valid ESM and can be imported dynamically', async () => {
    const esm = await import(esmHierarchy);

    assert.equal(typeof esm.getCityName, 'function');
    assert.equal(typeof esm.getAreaName, 'function');
    assert.equal(typeof esm.toLocationItem, 'function');
    assert.equal(typeof esm.getProvincesAsLocationItems, 'function');
    assert.equal(typeof esm.getCitiesAsLocationItems, 'function');
    assert.equal(typeof esm.getAreasAsLocationItems, 'function');
    assert.equal(typeof esm.searchLocationItems, 'function');

    assert.equal(esm.getCityName('lahore', 'en'), 'Lahore');
    assert.equal(esm.getCityName('lahore', 'ur'), 'لاہور');

    const provinces = esm.getProvincesAsLocationItems();
    assert.equal(provinces.length, 7);
    assert.equal(provinces[0].type, 'province');

    const lahoreAreas = esm.getAreasAsLocationItems('lahore');
    assert.ok(lahoreAreas.length > 0);
    assert.equal(lahoreAreas[0].type, 'area');
    assert.equal(lahoreAreas[0].parentId, 'lahore');
  });

  test('hierarchy subpath exports valid CommonJS and can be required', () => {
    const cjs = require(cjsHierarchy);

    assert.equal(typeof cjs.getCityName, 'function');
    assert.equal(typeof cjs.getAreaName, 'function');
    assert.equal(typeof cjs.toLocationItem, 'function');
    assert.equal(typeof cjs.getProvincesAsLocationItems, 'function');
    assert.equal(typeof cjs.getCitiesAsLocationItems, 'function');
    assert.equal(typeof cjs.getAreasAsLocationItems, 'function');
    assert.equal(typeof cjs.searchLocationItems, 'function');

    assert.equal(cjs.getCityName('islamabad', 'en'), 'Islamabad');
    const searchResults = cjs.searchLocationItems('lahore', 'Gulberg');
    assert.ok(searchResults.length > 0);
    assert.equal(searchResults[0].parentId, 'lahore');
  });

  test('root package exports all hierarchy, urdu, and search utilities in ESM and CJS', async () => {
    const rootEsm = await import(resolve(distDir, 'index.js'));
    const rootCjs = require(resolve(distDir, 'index.cjs'));

    for (const mod of [rootEsm, rootCjs]) {
      // Urdu helpers
      assert.equal(typeof mod.normalizeUrduText, 'function');
      assert.equal(typeof mod.toWesternDigits, 'function');
      assert.equal(typeof mod.toEasternDigits, 'function');
      assert.equal(typeof mod.stripUrduDiacritics, 'function');

      // Hierarchy helpers
      assert.equal(typeof mod.getCityName, 'function');
      assert.equal(typeof mod.getAreaName, 'function');
      assert.equal(typeof mod.toLocationItem, 'function');
      assert.equal(typeof mod.getProvincesAsLocationItems, 'function');
      assert.equal(typeof mod.getCitiesAsLocationItems, 'function');
      assert.equal(typeof mod.getAreasAsLocationItems, 'function');
      assert.equal(typeof mod.searchLocationItems, 'function');

      // Search and geo
      assert.equal(typeof mod.searchAreas, 'function');
      assert.equal(typeof mod.getNearestArea, 'function');

      // Sanctuary overload test
      const sanctuaryResults = mod.searchAreas('Lahore', 'DHA', 'ur');
      assert.ok(Array.isArray(sanctuaryResults));
      assert.ok(sanctuaryResults.length > 0);
      assert.equal(sanctuaryResults[0].type, 'area');
      assert.equal(sanctuaryResults[0].parentId, 'lahore');

      // Classic overload test
      const classicResults = mod.searchAreas('DHA Phase 5', { cityId: 'lahore' });
      assert.ok(Array.isArray(classicResults));
      assert.ok(classicResults.length > 0);
      assert.equal(classicResults[0].id, 'lahore-dha-phase-5');
    }
  });
});
