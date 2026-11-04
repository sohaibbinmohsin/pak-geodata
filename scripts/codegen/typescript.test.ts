import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateTypeScriptData } from './typescript.js';

test('generateTypeScriptData emits provinces, cities, and city area files', async () => {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const tempOutDir = resolve(rootDir, 'node_modules/.cache/test-ts-codegen');

  const result = await generateTypeScriptData(dataDir, tempOutDir, {});
  assert.equal(result.provincesCount, 7);
  assert.equal(result.citiesCount, 79);
  assert.equal(result.areasCount, 3953);

  assert.ok(existsSync(resolve(tempOutDir, 'data/provinces.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/cities.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/areas/index.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/areas/lahore.ts')));
});
