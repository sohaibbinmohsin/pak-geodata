import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Capabilities cards highlight architecture without nested code blocks', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const content = readFileSync(capPath, 'utf8');

  assert.ok(content.includes('Zero Runtime Dependencies'), 'Highlights zero dependencies');
  assert.ok(content.includes('Urdu Normalization Engine'), 'Highlights Urdu normalizer');
  assert.ok(!content.includes('codeSnippet'), 'Capabilities must not contain codeSnippet objects');
  assert.ok(!content.includes('codePreview'), 'Capabilities must not contain codePreview objects');
  assert.ok(!content.includes('<pre'), 'Capabilities must not contain pre code blocks');
  assert.ok(!content.includes('<code>'), 'Capabilities must not contain inline code tags');
  assert.ok(!content.includes('visualBox'), 'Capabilities must not contain visualBox');
  assert.ok(!content.includes('Terminal'), 'Capabilities must not contain Terminal');
  assert.ok(!content.toUpperCase().includes('RUNTIME FOOTPRINT'), 'Capabilities must not contain RUNTIME FOOTPRINT');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});

test('Capabilities and Coverage components render architectural highlights', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const covPath = resolve(process.cwd(), 'apps/demo/src/components/Coverage.tsx');
  const capContent = readFileSync(capPath, 'utf8');
  const covContent = readFileSync(covPath, 'utf8');

  assert.ok(capContent.includes('Zero Runtime Dependencies'), 'Highlights zero dependencies');
  assert.ok(capContent.includes('Urdu Normalization Engine'), 'Highlights Urdu normalizer');
  assert.ok(covContent.includes('Full City Directory'), 'Coverage renders full city directory');
  assert.ok(!capContent.includes('\u2014') && !covContent.includes('\u2014'), 'No em-dashes');
  assert.ok(!capContent.includes('\u2013') && !covContent.includes('\u2013'), 'No en-dashes');
});

test('Capabilities component renders 4 architectural foundation cards with metrics', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const content = readFileSync(capPath, 'utf8');

  // Verify section ID and header
  assert.ok(content.includes('id="capabilities"'), 'Has id="capabilities" anchor');
  assert.ok(content.includes('Architectural Foundation'), 'Has badge: Architectural Foundation');
  assert.ok(content.includes('Built for Production Resilience'), 'Has headline: Built for Production Resilience');
  assert.ok(
    content.includes('Engineered from the ground up for zero-overhead performance, offline reliability, and native bilingual intelligence.'),
    'Has subhead'
  );

  // 4 Feature Cards
  assert.ok(content.includes('Zero Runtime Dependencies'), 'Card 1: Zero Runtime Dependencies');
  assert.ok(content.includes('Urdu Normalization Engine'), 'Card 2: Urdu Normalization Engine');
  assert.ok(content.includes('Sub-Millisecond Reverse Geocoding'), 'Card 3: Sub-Millisecond Reverse Geocoding');
  assert.ok(content.includes('Lightweight Hierarchy Subpath'), 'Card 4: Lightweight Hierarchy Subpath');

  // Technical details
  assert.ok(content.includes('pure standard library') || content.includes('Pure standard library'), 'Mentions pure standard library');
  assert.ok(content.includes('0.4 ms') || content.includes('&lt; 0.4 ms'), 'Mentions < 0.4 ms');
  assert.ok(content.includes('Haversine') || content.includes('haversine'), 'Mentions Haversine calculations');
  assert.ok(content.includes('pak-geodata/hierarchy'), 'Mentions subpath import pak-geodata/hierarchy');

  // Zero terminal metric boxes
  assert.ok(!content.includes('visualBox'), 'Capabilities contains no visualBox property');
  assert.ok(!content.includes('Terminal'), 'Capabilities contains no Terminal icon');
  assert.ok(!content.toUpperCase().includes('RUNTIME FOOTPRINT'), 'Capabilities contains no RUNTIME FOOTPRINT');

  // Zero em-dash and en-dash constraint
  assert.ok(!content.includes('\u2014'), 'Capabilities contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Capabilities contains zero en-dashes');

  // No personal names or company branding
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'No company names in capabilities');
});

test('Coverage component renders simplified mobile-responsive city directory list', () => {
  const covPath = resolve(process.cwd(), 'apps/demo/src/components/Coverage.tsx');
  const content = readFileSync(covPath, 'utf8');

  // Verify section ID and header
  assert.ok(content.includes('id="coverage"'), 'Has id="coverage" anchor');
  assert.ok(content.includes('Dataset Intelligence'), 'Has badge: Dataset Intelligence');
  assert.ok(content.includes('Comprehensive Metropolitan Coverage'), 'Has headline: Comprehensive Metropolitan Coverage');
  assert.ok(
    content.includes('Curated across 7 provinces, 40 verified cities, and 189 foundational metropolitan areas with district bounds and postal codes.'),
    'Has subhead'
  );

  // Directory list
  assert.ok(content.includes('Full City Directory'), 'Contains Full City Directory');

  // Mobile responsiveness
  assert.ok(content.includes('block md:hidden'), 'Contains mobile responsive card list');
  assert.ok(content.includes('hidden md:block') || content.includes('hidden md:table'), 'Contains desktop responsive view');

  // Removed obsolete sections and base catalogs
  assert.ok(!content.includes('PROVINCES_BASE_CATALOG'), 'PROVINCES_BASE_CATALOG is removed');
  assert.ok(!content.includes('FLAGSHIP_METROS_BASE'), 'FLAGSHIP_METROS_BASE is removed');
  assert.ok(!content.includes('The 7 Provinces'), 'Province cards grid is removed');
  assert.ok(!content.includes('Major Cities Summary'), 'Flagship metros summary cards grid is removed');
  assert.ok(!content.includes('Phase 1 Flagship Metros'), 'Flagship metros ticker is removed');

  // Zero em-dash and en-dash constraint
  assert.ok(!content.includes('\u2014'), 'Coverage contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Coverage contains zero en-dashes');

  // No personal names or company branding
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'No company names in coverage');
});

test('Recipes component includes arrow key keyboard navigation for tabs', () => {
  const recipesPath = resolve(process.cwd(), 'apps/demo/src/components/Recipes.tsx');
  const content = readFileSync(recipesPath, 'utf8');

  assert.ok(content.includes('ArrowRight') && content.includes('ArrowLeft'), 'Recipes tabs handle ArrowLeft and ArrowRight');
});
