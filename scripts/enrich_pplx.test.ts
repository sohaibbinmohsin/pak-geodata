import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { enrichCityWithPplx, PplxCandidate } from './enrich_pplx.js';
import type { Area } from '../pipeline/validators/schema.js';

test('enrich_pplx: filters and enriches city dataset with clean PPLX candidates', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pak-geodata-enrich-test-'));

  const dataDir = path.join(tmpDir, 'data');
  const cityPath = path.join(dataDir, 'cities', 'punjab.json');
  fs.mkdirSync(path.dirname(cityPath), { recursive: true });

  const mockCity = {
    id: 'sialkot',
    name: 'Sialkot',
    urduName: 'سیالکوٹ',
    provinceId: 'punjab',
    district: 'Sialkot',
    coordinates: { lat: 32.4945, lng: 74.5229 },
    postalCodeRange: ['51300', '51399'] as [string, string],
    bounds: { minLat: 32.40, maxLat: 32.60, minLng: 74.45, maxLng: 74.65 }
  };
  fs.writeFileSync(cityPath, JSON.stringify([mockCity], null, 2), 'utf8');

  const areasPath = path.join(dataDir, 'areas', 'punjab', 'sialkot.json');
  fs.mkdirSync(path.dirname(areasPath), { recursive: true });

  const existingAreas: Area[] = [
    {
      id: 'sialkot-cantt',
      cityId: 'sialkot',
      provinceId: 'punjab',
      name: 'Sialkot Cantt',
      aliases: [],
      coordinates: { lat: 32.5050, lng: 74.5300 },
      verified: true,
      sources: ['survey']
    }
  ];
  fs.writeFileSync(areasPath, JSON.stringify(existingAreas, null, 2), 'utf8');

  const mockCandidates: PplxCandidate[] = [
    {
      geonameId: 1164909,
      name: 'Muzaffarpur',
      asciiname: 'Muzaffarpur',
      altNames: ['Muzaffar Pur'],
      coordinates: { lat: 32.5200, lng: 74.5400 },
      cityId: 'sialkot',
      provinceId: 'punjab'
    },
    {
      // Proximity collision with Sialkot Cantt (< 100m)
      geonameId: 9999999,
      name: 'Cantt Bazaar',
      asciiname: 'Cantt Bazaar',
      altNames: [],
      coordinates: { lat: 32.5051, lng: 74.5301 },
      cityId: 'sialkot',
      provinceId: 'punjab'
    },
    {
      // Outside Sialkot bounds
      geonameId: 8888888,
      name: 'Far Away Village',
      asciiname: 'Far Away Village',
      altNames: [],
      coordinates: { lat: 35.0000, lng: 74.5000 },
      cityId: 'sialkot',
      provinceId: 'punjab'
    }
  ];

  const result = enrichCityWithPplx({
    city: mockCity,
    existingAreas,
    candidates: mockCandidates
  });

  assert.equal(result.added.length, 1);
  assert.equal(result.added[0].id, 'sialkot-muzaffarpur');
  assert.equal(result.added[0].name, 'Muzaffarpur');
  assert.equal(result.added[0].verified, true);
  assert.ok(result.added[0].sources);
  assert.equal(result.added[0].sources.length, 1);
  const source = result.added[0].sources[0] as any;
  assert.equal(source.provider, 'nga_geonames');
  assert.equal(source.id, 1164909);
  assert.equal(source.featureCode, 'PPLX');
});
