import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Capabilities and Coverage components render architectural highlights', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const covPath = resolve(process.cwd(), 'apps/demo/src/components/Coverage.tsx');
  const capContent = readFileSync(capPath, 'utf8');
  const covContent = readFileSync(covPath, 'utf8');

  assert.ok(capContent.includes('Zero Runtime Dependencies'), 'Highlights zero dependencies');
  assert.ok(capContent.includes('Urdu Normalization Engine'), 'Highlights Urdu normalizer');
  assert.ok(covContent.includes('Punjab'), 'Coverage lists provinces');
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

  // Zero em-dash and en-dash constraint
  assert.ok(!content.includes('\u2014'), 'Capabilities contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Capabilities contains zero en-dashes');

  // No personal names or company branding
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'No company names in capabilities');
});

test('Coverage component renders 7 provinces, 40 cities summary, bounding boxes, and postal codes', () => {
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

  // 7 Provinces and territories
  assert.ok(content.includes('Punjab'), 'Contains Punjab');
  assert.ok(content.includes('Sindh'), 'Contains Sindh');
  assert.ok(content.includes('Khyber Pakhtunkhwa'), 'Contains KPK');
  assert.ok(content.includes('Balochistan'), 'Contains Balochistan');
  assert.ok(content.includes('Islamabad') || content.includes('Islamabad ICT'), 'Contains Islamabad');
  assert.ok(content.includes('Azad Jammu') || content.includes('AJK'), 'Contains Azad Jammu and Kashmir');
  assert.ok(content.includes('Gilgit-Baltistan'), 'Contains Gilgit-Baltistan');

  // Major cities summary
  assert.ok(content.includes('Lahore'), 'Contains Lahore');
  assert.ok(content.includes('Karachi'), 'Contains Karachi');
  assert.ok(content.includes('Faisalabad'), 'Contains Faisalabad');
  assert.ok(content.includes('Rawalpindi'), 'Contains Rawalpindi');

  // Phase 1 flagship metros ticker
  assert.ok(content.includes('189'), 'Mentions 189 foundational areas');
  assert.ok(content.includes('Phase 1'), 'Mentions Phase 1');

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
