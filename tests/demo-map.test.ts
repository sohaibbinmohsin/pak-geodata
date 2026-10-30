import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('MapCanvas uses clean tile provider without broken CartoDB dark_all watermark', () => {
  const mapPath = resolve(process.cwd(), 'apps/demo/src/components/MapCanvas.tsx');
  const content = readFileSync(mapPath, 'utf8');

  assert.ok(!content.includes('cartocdn.com/dark_all'), 'Must not use watermarked CartoDB dark_all endpoint');
  assert.ok(
    content.includes('tile.openstreetmap.org') ||
      content.includes('cartocdn.com/rastertiles/voyager') ||
      content.includes('basemaps.cartocdn.com/light_all'),
    'Must use free watermark-free tile endpoint'
  );
});

test('MapCanvas tile layer includes OpenStreetMap attribution and zero em-dashes', () => {
  const mapPath = resolve(process.cwd(), 'apps/demo/src/components/MapCanvas.tsx');
  const content = readFileSync(mapPath, 'utf8');

  assert.ok(
    content.includes('OpenStreetMap') && content.includes('contributors'),
    'Must include OpenStreetMap contributors attribution'
  );
  assert.ok(!content.includes('\u2014'), 'MapCanvas must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'MapCanvas must contain zero en-dashes');
});
