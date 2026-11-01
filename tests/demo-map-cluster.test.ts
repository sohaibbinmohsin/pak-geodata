import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { clusterAreas, type AreaCluster } from '../apps/demo/src/components/clusterUtils';
import type { PakistanArea } from 'pak-geodata';

const mockAreaA: PakistanArea = {
  id: 'karachi-clifton',
  cityId: 'karachi',
  provinceId: 'sindh',
  name: 'Clifton',
  urduName: 'کلفٹن',
  aliases: [],
  coordinates: { lat: 24.8138, lng: 67.0299 },
  type: 'neighborhood',
  verified: true,
};

const mockAreaB: PakistanArea = {
  id: 'karachi-defence-5',
  cityId: 'karachi',
  provinceId: 'sindh',
  name: 'DHA Phase 5',
  urduName: 'ڈی ایچ اے فیز ۵',
  aliases: [],
  coordinates: { lat: 24.8155, lng: 67.0315 },
  type: 'neighborhood',
  verified: true,
};

const mockAreaFar: PakistanArea = {
  id: 'lahore-gulberg',
  cityId: 'lahore',
  provinceId: 'punjab',
  name: 'Gulberg',
  urduName: 'گلبرگ',
  aliases: [],
  coordinates: { lat: 31.5204, lng: 74.3587 },
  type: 'commercial',
  verified: true,
};

test('clusterAreas returns empty array when areas list is empty', () => {
  const result = clusterAreas([], () => ({ x: 0, y: 0 }), 45);
  assert.deepEqual(result, []);
});

test('clusterAreas returns single-item clusters when points are far apart', () => {
  // Mock projection where distance is > 45px
  const project = (lat: number, _lng: number) => {
    return lat < 30 ? { x: 100, y: 100 } : { x: 500, y: 500 };
  };

  const clusters = clusterAreas([mockAreaA, mockAreaFar], project, 45);
  assert.equal(clusters.length, 2);
  assert.equal(clusters[0].count, 1);
  assert.equal(clusters[0].areas[0].id, 'karachi-clifton');
  assert.equal(clusters[1].count, 1);
  assert.equal(clusters[1].areas[0].id, 'lahore-gulberg');
});

test('clusterAreas combines overlapping points into a single cluster with count > 1', () => {
  // Mock projection where mockAreaA and mockAreaB map to within 10px of each other
  const project = (lat: number, _lng: number) => {
    if (lat > 30) return { x: 800, y: 800 }; // far away
    return lat === mockAreaA.coordinates.lat ? { x: 200, y: 200 } : { x: 205, y: 205 };
  };

  const clusters = clusterAreas([mockAreaA, mockAreaB, mockAreaFar], project, 45, 'karachi-defence-5');
  assert.equal(clusters.length, 2, 'Should produce 1 cluster for Karachi and 1 for Lahore');

  const karachiCluster = clusters.find((c: AreaCluster) => c.count > 1);
  assert.ok(karachiCluster, 'Karachi areas should be clustered together');
  assert.equal(karachiCluster.count, 2);
  assert.equal(karachiCluster.hasSelected, true, 'Cluster contains selectedArea');
  assert.ok(karachiCluster.bounds.minLat <= 24.8138);
  assert.ok(karachiCluster.bounds.maxLat >= 24.8155);

  const lahoreCluster = clusters.find((c: AreaCluster) => c.count === 1);
  assert.ok(lahoreCluster, 'Lahore area should remain individual');
  assert.equal(lahoreCluster.count, 1);
});

test('MapCanvas integrates cluster circle rendering and styles', () => {
  const mapPath = resolve(process.cwd(), 'apps/demo/src/components/MapCanvas.tsx');
  const content = readFileSync(mapPath, 'utf8');

  assert.ok(content.includes('clusterAreas') || content.includes('createClusterIcon'), 'MapCanvas uses cluster rendering');
  assert.ok(content.includes('pak-cluster-container') || content.includes('pak-cluster-marker'), 'MapCanvas uses cluster classes');
  assert.ok(!content.includes('\u2014'), 'MapCanvas contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'MapCanvas contains zero en-dashes');

  const cssPath = resolve(process.cwd(), 'apps/demo/src/index.css');
  const cssContent = readFileSync(cssPath, 'utf8');
  assert.ok(cssContent.includes('.pak-cluster-container'), 'index.css defines .pak-cluster-container');
  assert.ok(cssContent.includes('.pak-cluster-marker'), 'index.css defines .pak-cluster-marker');
});
