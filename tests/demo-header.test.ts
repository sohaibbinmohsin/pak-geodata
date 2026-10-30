import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Header component does not contain personal names or promotional marketing', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Header must not contain personal name');
  assert.ok(!content.includes('The Mohsin Project'), 'Header must not contain company name');
  assert.ok(content.includes('pak-geodata'), 'Header must display package name');
  assert.ok(content.includes('v0.2.0'), 'Header must display version tag');
  assert.ok(content.includes('#studio'), 'Header must link to studio anchor');
  assert.ok(!content.includes('\u2014'), 'Header must not contain em-dashes');
  assert.ok(!content.includes('\u2013'), 'Header must not contain en-dashes');
});

test('Header component includes navigation anchors, install buttons, and github link', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(content.includes('#studio'), 'Header must link to #studio');
  assert.ok(content.includes('#capabilities'), 'Header must link to #capabilities');
  assert.ok(content.includes('#recipes'), 'Header must link to #recipes');
  assert.ok(content.includes('#coverage'), 'Header must link to #coverage');
  assert.ok(content.includes('npm i pak-geodata'), 'Header must include npm copy command');
  assert.ok(content.includes('pip install pak-geodata'), 'Header must include pip copy command');
  assert.ok(content.includes('https://github.com/sohaibbinmohsin/pak-geodata'), 'Header must link to GitHub repository');
});

test('Header brand logo clicks scroll smoothly to top', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(content.includes('scrollTo'), 'Header brand logo includes scrollTo for top navigation');
  assert.ok(content.includes('smooth'), 'Header brand logo includes smooth scroll behavior');
});

