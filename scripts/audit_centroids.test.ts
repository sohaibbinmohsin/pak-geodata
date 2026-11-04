import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCentroidAudit } from './audit_centroids.js';

test('audit_centroids: audits test dataset against mock GeoNames PK.txt', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pak-geodata-audit-test-'));

  // Create mock PK.txt
  const mockGeoNamesContent = [
    '1168581\tModel Town\tModel Town\tModel Town,ماڈل ٹاؤن\t31.4850\t74.3200\tP\tPPLX\tPK\t\t04\t\t\t\t0\t215\t215\tAsia/Karachi\t2026-11-01',
    '1168582\tGulberg\tGulberg\tGulberg\t31.5100\t74.3440\tP\tPPLX\tPK\t\t04\t\t\t\t0\t215\t215\tAsia/Karachi\t2026-11-01'
  ].join('\n') + '\n';
  const mockPkPath = path.join(tmpDir, 'PK.txt');
  fs.writeFileSync(mockPkPath, mockGeoNamesContent, 'utf8');

  // Create mock data directory
  const dataDir = path.join(tmpDir, 'data');
  const areasDir = path.join(dataDir, 'areas', 'punjab');
  fs.mkdirSync(areasDir, { recursive: true });

  const mockAreas = [
    {
      id: 'lahore-model-town',
      cityId: 'lahore',
      provinceId: 'punjab',
      name: 'Model Town',
      coordinates: { lat: 31.4850, lng: 74.3200 },
      verified: true
    },
    {
      id: 'lahore-dha-phase-5',
      cityId: 'lahore',
      provinceId: 'punjab',
      name: 'DHA Phase 5',
      coordinates: { lat: 31.4705, lng: 74.4101 },
      verified: true
    }
  ];
  fs.writeFileSync(path.join(areasDir, 'lahore.json'), JSON.stringify(mockAreas, null, 2), 'utf8');

  const result = await runCentroidAudit({
    rawGeoNamesPath: mockPkPath,
    dataDir,
    attachSources: true
  });

  assert.equal(result.success, true);
  assert.equal(result.stats?.totalAreas, 2);
  assert.equal(result.stats?.matchedCount, 1);
  assert.equal(result.stats?.greenCount, 1);
  assert.equal(result.stats?.unmatchedCount, 1);

  // Check that source was attached to lahore-model-town
  const updatedAreas = JSON.parse(fs.readFileSync(path.join(areasDir, 'lahore.json'), 'utf8'));
  const modelTown = updatedAreas.find((a: any) => a.id === 'lahore-model-town');
  assert.ok(modelTown.sources);
  assert.equal(modelTown.sources[0].provider, 'nga_geonames');
  assert.equal(modelTown.sources[0].id, 1168581);
});
