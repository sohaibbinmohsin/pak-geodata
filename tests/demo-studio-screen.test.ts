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
  assert.ok(content.includes('Back to Overview') || content.includes('Back'), 'StudioScreen has back button');
  assert.ok(content.includes('GeoData Studio'), 'StudioScreen has GeoData Studio heading');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});

test('StudioScreen includes drawer, reverse geo drawer integration, and zero branding', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(content.includes('onClose'), 'StudioScreen accepts onClose prop');
  assert.ok(content.includes('selectedArea'), 'StudioScreen supports area inspection');
  assert.ok(content.includes('Reverse Geocoding') && content.includes('reverseGeoPoint'), 'StudioScreen supports reverse geocoding in drawer');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'StudioScreen contains no personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'StudioScreen contains no company branding');
});

test('StudioScreen defaults selectedCity to All Pakistan (null), positions heading next to back button, and integrates top search', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(
    content.includes('const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null);'),
    'StudioScreen must initialize selectedCity with null (All Pakistan)'
  );
  assert.ok(
    (content.includes('Back to Overview') || content.includes('Back')) && content.includes('GeoData Studio'),
    'StudioScreen positions Back button and GeoData Studio heading together on the left'
  );
  assert.ok(
    content.includes('h-9'),
    'StudioScreen uses uniform h-9 button heights in top row'
  );
  assert.ok(
    content.includes('order-3 sm:order-2'),
    'StudioScreen renders Omnibar search in second row on mobile and center on desktop'
  );
  assert.ok(
    content.includes('no-scrollbar'),
    'StudioScreen drawer hides scrollbars while remaining scrollable'
  );
  assert.ok(!content.includes('\u2014'), 'No em-dashes in StudioScreen');
  assert.ok(!content.includes('\u2013'), 'No en-dashes in StudioScreen');
});

test('StudioScreen uses dynamic PACKAGE_VERSION and unifies all controls in first row', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(
    content.includes('PACKAGE_VERSION'),
    'StudioScreen imports and uses dynamic PACKAGE_VERSION'
  );
  assert.ok(
    !content.includes('<span>v0.2.0</span>'),
    'StudioScreen does not contain hardcoded v0.2.0 in title badge'
  );
  assert.ok(
    !content.includes('top-14'),
    'StudioScreen does not contain a secondary top-14 container'
  );
  assert.ok(
    content.includes('showSuggestions={false}'),
    'StudioScreen disables suggestion chips row in Omnibar'
  );
});
