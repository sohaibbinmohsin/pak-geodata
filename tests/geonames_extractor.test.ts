import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGeoNamesLine,
  findGeoNamesCandidate,
  GeoNamesRecord
} from '../pipeline/extractors/geonames.js';

test('geonames: parseGeoNamesLine parses tab-delimited NGA record', () => {
  // Mock line from PK.txt
  // geonameid, name, asciiname, alternatenames, lat, lng, fclass, fcode, country, cc2, adm1, adm2, adm3, adm4, pop, elev, dem, tz, moddate
  const mockLine = '1168581\tModel Town\tModel Town\tModel Town,ماڈل ٹاؤن\t31.4850\t74.3200\tP\tPPLX\tPK\t\t04\t\t\t\t0\t215\t215\tAsia/Karachi\t2026-11-01';

  const record = parseGeoNamesLine(mockLine);
  assert.ok(record);
  assert.equal(record.geonameId, 1168581);
  assert.equal(record.name, 'Model Town');
  assert.equal(record.asciiname, 'Model Town');
  assert.deepEqual(record.alternateNames, ['Model Town', 'ماڈل ٹاؤن']);
  assert.equal(record.coordinates.lat, 31.485);
  assert.equal(record.coordinates.lng, 74.32);
  assert.equal(record.featureClass, 'P');
  assert.equal(record.featureCode, 'PPLX');
  assert.equal(record.admin1Code, '04');
});

test('geonames: parseGeoNamesLine returns null for empty or invalid line', () => {
  assert.equal(parseGeoNamesLine(''), null);
  assert.equal(parseGeoNamesLine('not-enough-tabs\t123'), null);
});

test('geonames: findGeoNamesCandidate matches candidate by name and coordinate proximity', () => {
  const records: GeoNamesRecord[] = [
    {
      geonameId: 101,
      name: 'Gulberg',
      asciiname: 'Gulberg',
      alternateNames: ['Gulberg', 'گلبرگ'],
      coordinates: { lat: 31.5100, lng: 74.3440 },
      featureClass: 'P',
      featureCode: 'PPLX',
      countryCode: 'PK',
      admin1Code: '04',
      modificationDate: '2026-11-01'
    },
    {
      geonameId: 202,
      name: 'Gulberg',
      asciiname: 'Gulberg',
      alternateNames: ['Gulberg'],
      // Far away in Peshawar
      coordinates: { lat: 34.0000, lng: 71.5000 },
      featureClass: 'P',
      featureCode: 'PPLX',
      countryCode: 'PK',
      admin1Code: '03',
      modificationDate: '2026-11-01'
    }
  ];

  // Look for Lahore Gulberg (~31.5102, 74.3441)
  const match = findGeoNamesCandidate({
    name: 'Gulberg III',
    aliases: ['Gulberg'],
    coordinates: { lat: 31.5102, lng: 74.3441 },
    maxDistanceKm: 5.0,
    candidates: records
  });

  assert.ok(match);
  assert.equal(match.record.geonameId, 101);
  assert.ok(match.distanceMeters < 100);
});
