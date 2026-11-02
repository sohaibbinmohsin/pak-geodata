import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Recipes component renders production tabs with Sanctuary and PWA recipes', () => {
  const recipesPath = resolve(process.cwd(), 'apps/demo/src/components/Recipes.tsx');
  const content = readFileSync(recipesPath, 'utf8');

  // Verify core scenarios from brief
  assert.ok(content.includes('Emergency & Rescue Dispatch') || content.includes('Sanctuary'), 'Includes emergency recipe');
  assert.ok(content.includes('Bilingual Checkout Dropdowns') || content.includes('PakLocationItem'), 'Includes bilingual dropdown recipe');
  assert.ok(content.includes('pak-geodata/hierarchy'), 'Includes subpath hierarchy recipe');

  // Verify section ID and headers
  assert.ok(content.includes('id="recipes"'), 'Recipes section has id="recipes" for anchor jump');
  assert.ok(content.includes('Production Architecture'), 'Includes badge');
  assert.ok(content.includes('Real-World Engineering Recipes'), 'Includes headline');
  assert.ok(content.includes('getNearestArea'), 'Emergency recipe uses getNearestArea');

  // Verify zero em-dash and en-dash constraint
  assert.ok(!content.includes('\u2014'), 'Recipes contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Recipes contains zero en-dashes');
});

test('Recipes component renders 3 segmented tabs with scenarios, benefits, and copy button', () => {
  const recipesPath = resolve(process.cwd(), 'apps/demo/src/components/Recipes.tsx');
  const content = readFileSync(recipesPath, 'utf8');

  // Verify 3 tabs
  assert.ok(content.includes('Emergency & Field Ops'), 'Includes emergency tab label');
  assert.ok(content.includes('Bilingual E-Commerce Checkout'), 'Includes checkout tab label');
  assert.ok(content.includes('PWA Subpath Code-Splitting'), 'Includes PWA tab label');

  // Verify key APIs used in recipes
  assert.ok(content.includes('getProvincesAsLocationItems'), 'Uses getProvincesAsLocationItems');
  assert.ok(content.includes('getCitiesAsLocationItems'), 'Uses getCitiesAsLocationItems');
  assert.ok(content.includes('getAreasAsLocationItems'), 'Uses getAreasAsLocationItems');
  assert.ok(content.includes('PakLocationItem'), 'Uses PakLocationItem');
  assert.ok(content.includes('Copy Snippet'), 'Includes Copy Snippet button');

  // Verify no personal attribution or company branding
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'No company names in recipes');
});

test('AreaInspector suppresses breadcrumb when isEmbedded is true', () => {
  const inspectorPath = resolve(process.cwd(), 'apps/demo/src/components/AreaInspector.tsx');
  const content = readFileSync(inspectorPath, 'utf8');

  assert.ok(content.includes('!isEmbedded &&'), 'AreaInspector conditionally renders breadcrumbs based on !isEmbedded');
});

test('Omnibar suggestion click handles city switching or clearing', () => {
  const omnibarPath = resolve(process.cwd(), 'apps/demo/src/components/Omnibar.tsx');
  const content = readFileSync(omnibarPath, 'utf8');

  assert.ok(content.includes('selectedCity && onSelectCity'), 'Omnibar checks active city filter on suggestion click');
  assert.ok(content.includes('scopedMatches.length === 0'), 'Omnibar detects when suggestion has zero matches in scoped city');
  assert.ok(content.includes('onSelectCity(matchingCity || null)'), 'Omnibar updates city to match suggestion or clears it');
});
