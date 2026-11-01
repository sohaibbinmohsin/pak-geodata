import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Hero component renders headline, install snippets, and dynamic metrics', () => {
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const content = readFileSync(heroPath, 'utf8');

  assert.ok(content.includes('Canonical Geographic Intelligence for Pakistan'), 'Hero has required headline');
  assert.ok(content.includes('npm i pak-geodata'), 'Hero includes npm install snippet');
  assert.ok(content.includes('pip install pak-geodata'), 'Hero includes pip install snippet');
  assert.ok(!content.includes('\u2014'), 'Hero must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Hero must contain zero en-dashes');
});

test('Hero component includes feature badge, technical subhead, metrics ticker, and studio jump', () => {
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const content = readFileSync(heroPath, 'utf8');

  assert.ok(content.includes('100% Offline & Typed Foundation'), 'Hero includes feature badge');
  assert.ok(content.includes('Standardized administrative hierarchies'), 'Hero includes technical subhead');
  assert.ok(content.includes('#studio'), 'Hero includes anchor jump to studio');
  assert.ok(content.includes('Provinces & Territories'), 'Hero includes provinces metric label');
  assert.ok(content.includes('Verified Cities'), 'Hero includes verified cities metric label');
  assert.ok(content.includes('Foundational Areas'), 'Hero includes foundational areas metric label');
  assert.ok(content.includes('Runtime Dependencies'), 'Hero includes runtime dependencies metric label');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Hero must not contain personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'Hero must not contain company branding');
});

test('Hero component replaces terminal window dots with NPM and Python/PyPI icons', () => {
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const content = readFileSync(heroPath, 'utf8');

  // Must not have decorative macOS window dots
  assert.ok(!content.includes('bg-red-500/80'), 'Hero must not contain red window dot');
  assert.ok(!content.includes('bg-amber-500/80'), 'Hero must not contain amber window dot');

  // Must contain NPM and Python/PyPI logos/SVGs
  assert.ok(content.includes('aria-label="NPM logo"'), 'Hero includes NPM logo');
  assert.ok(content.includes('aria-label="Python logo"'), 'Hero includes Python logo');
  assert.ok(content.includes('data-testid="npm-icon"'), 'Hero includes NPM test id');
  assert.ok(content.includes('data-testid="python-icon"'), 'Hero includes Python test id');

  // No em-dashes or en-dashes
  assert.ok(!content.includes('\u2014'), 'Hero must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Hero must contain zero en-dashes');
});

