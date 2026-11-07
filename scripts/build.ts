import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync
} from 'node:fs';
import { resolve } from 'node:path';
import { generateDartData } from './codegen/dart.js';
import { generatePhpData } from './codegen/php.js';
import { generateTypeScriptData } from './codegen/typescript.js';
import { verifyAllData, verifyMultiPackageParity } from './verify.js';

async function main() {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const npmSrcDir = resolve(rootDir, 'packages/npm/src');
  const pypiDataDir = resolve(rootDir, 'packages/pypi/pak_geodata/data');
  const goDataDir = resolve(rootDir, 'packages/go/data');
  const dartLibDir = resolve(rootDir, 'packages/dart/lib');

  console.log('=== Step 1: Validating all repository geodata ===');
  const verifyResult = await verifyAllData();
  if (!verifyResult.success) {
    console.error('Data verification failed. Aborting build.');
    process.exit(1);
  }

  console.log('\n=== Step 2: Synchronizing data to backend packages (pypi, go) ===');
  if (existsSync(pypiDataDir)) {
    rmSync(pypiDataDir, { recursive: true, force: true });
  }
  mkdirSync(pypiDataDir, { recursive: true });
  cpSync(dataDir, pypiDataDir, { recursive: true });
  console.log('✔ Master data synchronized to packages/pypi/pak_geodata/data/');

  if (existsSync(goDataDir)) {
    rmSync(goDataDir, { recursive: true, force: true });
  }
  mkdirSync(goDataDir, { recursive: true });
  cpSync(dataDir, goDataDir, { recursive: true });
  console.log('✔ Master data synchronized to packages/go/data/');

  const dartDir = resolve(rootDir, 'packages/dart');
  mkdirSync(dartDir, { recursive: true });

  const phpDir = resolve(rootDir, 'packages/php');
  mkdirSync(phpDir, { recursive: true });

  const rootLicense = resolve(rootDir, 'LICENSE');
  if (existsSync(rootLicense)) {
    cpSync(rootLicense, resolve(rootDir, 'packages/npm/LICENSE'));
    cpSync(rootLicense, resolve(rootDir, 'packages/pypi/LICENSE'));
    cpSync(rootLicense, resolve(rootDir, 'packages/go/LICENSE'));
    cpSync(rootLicense, resolve(dartDir, 'LICENSE'));
    cpSync(rootLicense, resolve(phpDir, 'LICENSE'));
  }

  const rootLicenseData = resolve(rootDir, 'LICENSE-DATA');
  if (existsSync(rootLicenseData)) {
    cpSync(rootLicenseData, resolve(rootDir, 'packages/npm/LICENSE-DATA'));
    cpSync(rootLicenseData, resolve(rootDir, 'packages/pypi/LICENSE-DATA'));
    cpSync(rootLicenseData, resolve(rootDir, 'packages/go/LICENSE-DATA'));
    cpSync(rootLicenseData, resolve(dartDir, 'LICENSE-DATA'));
    cpSync(rootLicenseData, resolve(phpDir, 'LICENSE-DATA'));
  }

  const rootAttribution = resolve(rootDir, 'ATTRIBUTION.md');
  if (existsSync(rootAttribution)) {
    cpSync(rootAttribution, resolve(rootDir, 'packages/npm/ATTRIBUTION.md'));
    cpSync(rootAttribution, resolve(rootDir, 'packages/pypi/ATTRIBUTION.md'));
    cpSync(rootAttribution, resolve(rootDir, 'packages/go/ATTRIBUTION.md'));
    cpSync(rootAttribution, resolve(dartDir, 'ATTRIBUTION.md'));
    cpSync(rootAttribution, resolve(phpDir, 'ATTRIBUTION.md'));
  }
  console.log('✔ LICENSE, LICENSE-DATA, and ATTRIBUTION.md synchronized to packages');

  console.log('\n=== Step 3: Generating modular TypeScript, Dart & PHP datasets ===');
  const cityAreaCounts: Record<string, number> = {};
  await generateTypeScriptData(dataDir, npmSrcDir, cityAreaCounts);
  console.log('✔ TypeScript data modules generated for packages/npm/src/data/');

  await generateDartData(dataDir, dartLibDir, cityAreaCounts);
  console.log('✔ Dart typed const datasets generated for packages/dart/lib/src/data/');

  const phpSrcDir = resolve(rootDir, 'packages/php/src');
  await generatePhpData(dataDir, phpSrcDir, cityAreaCounts);
  console.log('✔ PHP OPcache array datasets generated for packages/php/src/Data/');

  console.log('\n=== Step 4: Compiling packages/npm distribution ===');
  const npmDir = resolve(rootDir, 'packages/npm');
  execSync('node build.js', { cwd: npmDir, stdio: 'inherit' });

  // Verify hierarchy subpath build artifacts
  const hierarchyEsm = resolve(npmDir, 'dist/hierarchy.js');
  const hierarchyCjs = resolve(npmDir, 'dist/hierarchy.cjs');
  const hierarchyDts = resolve(npmDir, 'dist/hierarchy.d.ts');
  if (!existsSync(hierarchyEsm) || !existsSync(hierarchyCjs) || !existsSync(hierarchyDts)) {
    throw new Error('Hierarchy build artifacts are missing from packages/npm/dist');
  }

  console.log('\n=== Step 5: Asserting Multi-Package Dataset Count Parity Gate ===');
  const parityResult = verifyMultiPackageParity(rootDir);
  if (!parityResult.success) {
    console.error('✖ Multi-package parity verification failed:');
    for (const err of parityResult.errors) {
      console.error(`  - ${err}`);
    }
    throw new Error('Dataset count parity gate failed across multi-language targets');
  }
  console.log('✔ Exact dataset count parity verified across 6 targets (7 provinces, 79 cities, 3953 areas)');

  const citySlugs = Object.keys(cityAreaCounts).sort();

  console.log('\n=== Build Summary ===');
  console.log(`Provinces:            ${verifyResult.stats.provinces}`);
  console.log(`Cities:               ${verifyResult.stats.cities}`);
  console.log(`Total Verified Areas: ${verifyResult.stats.areas}`);
  console.log('Areas breakdown by city:');
  for (const slug of citySlugs) {
    const cityName = slug.charAt(0).toUpperCase() + slug.slice(1);
    console.log(`  - ${cityName.padEnd(16)}: ${cityAreaCounts[slug]} areas`);
  }
  console.log('\nDistribution artifacts generated:');
  console.log('  ✔ packages/npm/dist/ (ESM + CommonJS bundles + DTS declarations)');
  console.log('  ✔ packages/npm/dist/hierarchy (Subpath hierarchy exports: ESM, CJS, DTS)');
  console.log('  ✔ packages/npm/dist/areas/ (Modular subpath areas)');
  console.log('  ✔ packages/pypi/pak_geodata/data/ (Synchronized JSON datasets)');
  console.log('  ✔ packages/go/data/ (Synchronized JSON datasets)');
  console.log('  ✔ packages/dart/lib/src/data/ (Generated typed const Dart datasets)');
  console.log('  ✔ packages/php/src/Data/ (Generated PHP OPcache array datasets)');
  console.log('\n✔ Full production build succeeded with 0 errors.');
}

main().catch((err) => {
  console.error('Fatal build failure:', err);
  process.exit(1);
});
