import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(import.meta.dirname, 'dist');

console.log('Building pak-geodata NPM package...');

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

// 1. Compile ESM and TypeScript declarations
console.log('1. Compiling TypeScript declarations and ESM...');
execSync('npx tsc', { cwd: import.meta.dirname, stdio: 'inherit' });

// 2. Compile CommonJS bundle for root entry point
console.log('2. Compiling CommonJS distribution bundle...');
execSync(
  'npx esbuild src/index.ts --bundle --platform=node --format=cjs --outfile=dist/index.cjs',
  { cwd: import.meta.dirname, stdio: 'inherit' }
);

// 3. Compile CommonJS bundles for subpath areas
console.log('3. Compiling CommonJS subpath areas...');
execSync(
  'npx esbuild src/areas/lahore.ts src/areas/karachi.ts src/areas/islamabad.ts src/areas/rawalpindi.ts src/areas/faisalabad.ts --bundle --platform=node --format=cjs --outdir=dist/areas --out-extension:.js=.cjs',
  { cwd: import.meta.dirname, stdio: 'inherit' }
);

console.log('✔ Build completed successfully.');
