import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Header component contains strictly GeoData title, version, and GitHub', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(content.includes('GeoData'), 'Header must display GeoData title');
  assert.ok(content.includes('v0.2.0'), 'Header must display version tag');
  assert.ok(content.includes('https://github.com/sohaibbinmohsin/pak-geodata'), 'Header must link to GitHub');
  assert.ok(!content.includes('npm i pak-geodata'), 'Header must not contain install snippets');
  assert.ok(!content.includes('#studio'), 'Header must not contain navigation anchor links');
  assert.ok(!content.includes('100% Offline'), 'Header must not contain offline badge');
  assert.ok(!content.includes('\u2014'), 'Header must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Header must contain zero en-dashes');
});

test('Header component does not contain personal names or company names', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Header must not contain personal name');
  assert.ok(!content.includes('The Mohsin Project'), 'Header must not contain company name');
});

test('Header brand logo clicks scroll smoothly to top', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(content.includes('scrollTo'), 'Header brand logo includes scrollTo for top navigation');
  assert.ok(content.includes('smooth'), 'Header brand logo includes smooth scroll behavior');
});
