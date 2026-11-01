import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Footer contains logo after company name without underline', () => {
  const footerPath = resolve(process.cwd(), 'apps/demo/src/components/Footer.tsx');
  const content = readFileSync(footerPath, 'utf8');

  assert.ok(content.includes('A free software by'), 'Includes standard software phrase');
  assert.ok(content.includes('The Mohsin Project'), 'Includes company name');
  assert.ok(content.includes('themohsinproject.org'), 'Links to official site');
  assert.ok(content.includes('no-underline'), 'Link has no-underline style');
  assert.ok(content.includes('mohsin-project-logo') || content.includes('MohsinProjectLogo') || content.includes('mohsinLogo'), 'Includes logo asset');
  assert.ok(content.includes('Released under the MIT License.'), 'Includes MIT license');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});

test('Footer includes MIT License and registry package links', () => {
  const footerPath = resolve(process.cwd(), 'apps/demo/src/components/Footer.tsx');
  const content = readFileSync(footerPath, 'utf8');

  assert.ok(content.includes('Released under the MIT License.'), 'Footer specifies MIT license');
  assert.ok(content.includes('https://github.com/sohaibbinmohsin/pak-geodata'), 'Footer links to GitHub');
  assert.ok(content.includes('https://www.npmjs.com/package/pak-geodata'), 'Footer links to NPM');
  assert.ok(content.includes('https://pypi.org/project/pak-geodata/'), 'Footer links to PyPI');
});

test('App.tsx integrates all sections in vertical scroll order', () => {
  const appPath = resolve(process.cwd(), 'apps/demo/src/App.tsx');
  const content = readFileSync(appPath, 'utf8');

  assert.ok(content.includes('<Header />') || content.includes('<Header'), 'App includes Header');
  assert.ok(content.includes('<Hero />') || content.includes('<Hero'), 'App includes Hero');
  assert.ok(content.includes('<Capabilities />') || content.includes('<Capabilities'), 'App includes Capabilities');
  assert.ok(content.includes('<Recipes />') || content.includes('<Recipes'), 'App includes Recipes');
  assert.ok(content.includes('<Coverage />') || content.includes('<Coverage'), 'App includes Coverage');
  assert.ok(content.includes('<Footer />') || content.includes('<Footer'), 'App includes Footer');

  // Verify order
  const idxHeader = content.indexOf('<Header');
  const idxHero = content.indexOf('<Hero');
  const idxCap = content.indexOf('<Capabilities');
  const idxRecipes = content.indexOf('<Recipes');
  const idxCov = content.indexOf('<Coverage');
  const idxFooter = content.indexOf('<Footer');

  assert.ok(idxHeader < idxHero, 'Header precedes Hero');
  assert.ok(idxHero < idxCap, 'Hero precedes Capabilities');
  assert.ok(idxCap < idxRecipes, 'Capabilities precedes Recipes');
  assert.ok(idxRecipes < idxCov, 'Recipes precedes Coverage');
  assert.ok(idxCov < idxFooter, 'Coverage precedes Footer');

  assert.ok(!content.includes('\u2014'), 'App.tsx contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'App.tsx contains zero en-dashes');
});
