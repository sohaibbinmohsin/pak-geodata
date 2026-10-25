import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { verifyAllData } from './verify.js';

async function main() {
  console.log('=== Step 1: Validating all repository geodata ===');
  const verifyResult = await verifyAllData();
  if (!verifyResult.success) {
    console.error('Data verification failed. Aborting build.');
    process.exit(1);
  }

  console.log('\n=== Step 2: Building packages/npm ===');
  const npmDir = resolve(process.cwd(), 'packages/npm');
  execSync('node build.js', { cwd: npmDir, stdio: 'inherit' });

  console.log('\n✔ Full production build succeeded with 0 errors.');
}

main().catch((err) => {
  console.error('Fatal build failure:', err);
  process.exit(1);
});
