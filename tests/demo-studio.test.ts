import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Studio integrates bilingual language toggle and hierarchy breadcrumb', () => {
  const studioPath = resolve(process.cwd(), 'apps/demo/src/components/Studio.tsx');
  const content = readFileSync(studioPath, 'utf8');

  assert.ok(content.includes('English'), 'Studio includes English option');
  assert.ok(content.includes('اردو'), 'Studio includes Urdu option');
  assert.ok(content.includes('breadcrumb') || content.includes('Hierarchy'), 'Studio includes hierarchy breadcrumb');
  assert.ok(!content.includes('\u2014'), 'Studio contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Studio contains zero en-dashes');
});

test('Studio contains required section heading, anchor ID, and no branding', () => {
  const studioPath = resolve(process.cwd(), 'apps/demo/src/components/Studio.tsx');
  const content = readFileSync(studioPath, 'utf8');

  assert.ok(content.includes('id="studio"'), 'Studio container has id="studio"');
  assert.ok(content.includes('Interactive Geospatial Studio'), 'Studio has section heading');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Studio contains no personal names');
  assert.ok(!content.includes('The Mohsin Project'), 'Studio contains no company branding');
});

test('Omnibar contains quick search suggestion chips', () => {
  const omnibarPath = resolve(process.cwd(), 'apps/demo/src/components/Omnibar.tsx');
  const content = readFileSync(omnibarPath, 'utf8');

  assert.ok(content.includes('dha 5'), 'Omnibar includes "dha 5" suggestion chip');
  assert.ok(content.includes('54000'), 'Omnibar includes "54000" suggestion chip');
  assert.ok(content.includes('گلبرگ'), 'Omnibar includes "گلبرگ" suggestion chip');
  assert.ok(content.includes('فیز ۳'), 'Omnibar includes "فیز ۳" suggestion chip');
  assert.ok(!content.includes('\u2014'), 'Omnibar contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Omnibar contains zero en-dashes');
});

test('AreaInspector integrates language prop and hierarchy breadcrumb', () => {
  const inspectorPath = resolve(process.cwd(), 'apps/demo/src/components/AreaInspector.tsx');
  const content = readFileSync(inspectorPath, 'utf8');

  assert.ok(content.includes('lang'), 'AreaInspector accepts lang prop');
  assert.ok(content.includes('breadcrumb') || content.includes('Breadcrumb') || content.includes('Hierarchy'), 'AreaInspector includes hierarchy breadcrumb');
  assert.ok(!content.includes('\u2014'), 'AreaInspector contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'AreaInspector contains zero en-dashes');
});

test('CodeGenerator supports bilingual snippet generation', () => {
  const codeGenPath = resolve(process.cwd(), 'apps/demo/src/components/CodeGenerator.tsx');
  const content = readFileSync(codeGenPath, 'utf8');

  assert.ok(content.includes('lang'), 'CodeGenerator accepts lang prop');
  assert.ok(!content.includes('\u2014'), 'CodeGenerator contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'CodeGenerator contains zero en-dashes');
});
