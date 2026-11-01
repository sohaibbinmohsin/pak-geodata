import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('App.tsx integrates screen routing for full-screen Studio', () => {
  const appPath = resolve(process.cwd(), 'apps/demo/src/App.tsx');
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const appContent = readFileSync(appPath, 'utf8');
  const heroContent = readFileSync(heroPath, 'utf8');

  assert.ok(appContent.includes('StudioScreen'), 'App imports StudioScreen');
  assert.ok(appContent.includes('currentView') || appContent.includes('view') || appContent.includes('isStudioOpen'), 'App manages view state');
  assert.ok(heroContent.includes('Launch Studio') || heroContent.includes('onOpenStudio'), 'Hero triggers Studio opening');
  assert.ok(!appContent.includes('\u2014'), 'No em-dashes');
  assert.ok(!appContent.includes('\u2013'), 'No en-dashes');
});
