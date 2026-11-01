import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('StudioScreen component renders full-bleed HUD with back button and controls', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(content.includes('fixed inset-0'), 'StudioScreen takes full fixed viewport');
  assert.ok(content.includes('MapCanvas'), 'StudioScreen includes MapCanvas');
  assert.ok(content.includes('Omnibar'), 'StudioScreen includes Omnibar');
  assert.ok(content.includes('CityPills'), 'StudioScreen includes CityPills');
  assert.ok(content.includes('Back to Overview') || content.includes('Back'), 'StudioScreen has back button');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});

test('StudioScreen includes drawer, reverse geo card, and zero branding', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(content.includes('onClose'), 'StudioScreen accepts onClose prop');
  assert.ok(content.includes('AreaInspector') || content.includes('selectedArea'), 'StudioScreen supports area inspection');
  assert.ok(content.includes('Reverse Geocoding') || content.includes('reverseGeoPoint') || content.includes('getNearestArea'), 'StudioScreen supports reverse geocoding');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'StudioScreen contains no personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'StudioScreen contains no company branding');
});
