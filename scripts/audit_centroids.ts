import fs from 'node:fs';
import path from 'node:path';
import { streamGeoNames, findGeoNamesCandidate, GeoNamesRecord } from '../pipeline/extractors/geonames.js';
import { AreaSchema, Area } from '../pipeline/validators/schema.js';

interface AuditStats {
  totalAreas: number;
  matchedCount: number;
  greenCount: number;  // <= 300m
  yellowCount: number; // 300m - 1500m
  redCount: number;    // > 1500m
  unmatchedCount: number;
}

export async function runCentroidAudit(options: {
  rawGeoNamesPath?: string;
  dataDir?: string;
  attachSources?: boolean;
  cityFilter?: string;
}) {
  const rawPath = options.rawGeoNamesPath ?? path.join(process.cwd(), 'pipeline/raw/PK.txt');
  const dataDir = options.dataDir ?? path.join(process.cwd(), 'data');
  const attachSources = options.attachSources ?? false;

  if (!fs.existsSync(rawPath)) {
    console.error(`GeoNames PK.txt file not found at ${rawPath}.`);
    console.error('Download PK.zip from https://download.geonames.org/export/dump/PK.zip');
    return { success: false, error: 'File not found' };
  }

  console.log('=== Step 1: Loading NGA / GeoNames gazetteer (PPL, PPLX, AREA) ===');
  const startTime = Date.now();
  const allowedFeatureCodes = new Set(['PPLX', 'PPL', 'PPLA', 'PPLA2', 'PPLA3', 'AREA', 'LCTY']);

  const ngaRecords = await streamGeoNames(rawPath, (rec) =>
    allowedFeatureCodes.has(rec.featureCode)
  );

  console.log(`Loaded ${ngaRecords.length} populated place records in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);

  // Load all master areas
  console.log('\n=== Step 2: Auditing 1,279 Areas across 79 Cities ===');
  const areasDir = path.join(dataDir, 'areas');
  const provinceDirs = fs.readdirSync(areasDir).filter((d) =>
    fs.statSync(path.join(areasDir, d)).isDirectory()
  );

  const stats: AuditStats = {
    totalAreas: 0,
    matchedCount: 0,
    greenCount: 0,
    yellowCount: 0,
    redCount: 0,
    unmatchedCount: 0
  };

  const matchesByCity: Record<string, { green: number; yellow: number; red: number; unmatched: number }> = {};

  for (const prov of provinceDirs) {
    const provPath = path.join(areasDir, prov);
    const cityFiles = fs.readdirSync(provPath).filter((f) => f.endsWith('.json'));

    for (const cityFile of cityFiles) {
      const citySlug = path.basename(cityFile, '.json');
      if (options.cityFilter && citySlug !== options.cityFilter) continue;

      const filePath = path.join(provPath, cityFile);
      const rawJson = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Area[];

      matchesByCity[citySlug] = { green: 0, yellow: 0, red: 0, unmatched: 0 };
      let fileModified = false;

      const updatedAreas = rawJson.map((area) => {
        stats.totalAreas++;

        // Find candidate in NGA
        const match = findGeoNamesCandidate({
          name: area.name,
          aliases: area.aliases,
          coordinates: area.coordinates,
          maxDistanceKm: 3.0,
          candidates: ngaRecords
        });

        if (!match) {
          stats.unmatchedCount++;
          matchesByCity[citySlug].unmatched++;
          return area;
        }

        stats.matchedCount++;
        const dist = match.distanceMeters;

        if (dist <= 300) {
          stats.greenCount++;
          matchesByCity[citySlug].green++;

          if (attachSources) {
            const existingSources = area.sources || [];
            const alreadyHasNga = existingSources.some(
              (s) => typeof s === 'object' && s.provider === 'nga_geonames' && s.id === match.record.geonameId
            );

            if (!alreadyHasNga) {
              const ngaSource = {
                provider: 'nga_geonames' as const,
                id: match.record.geonameId,
                featureCode: match.record.featureCode,
                datasetVersion: '2026-11'
              };
              area.sources = [...existingSources, ngaSource];
              fileModified = true;
            }
          }
        } else if (dist <= 1500) {
          stats.yellowCount++;
          matchesByCity[citySlug].yellow++;
        } else {
          stats.redCount++;
          matchesByCity[citySlug].red++;
        }

        return area;
      });

      if (attachSources && fileModified) {
        fs.writeFileSync(filePath, JSON.stringify(updatedAreas, null, 2) + '\n', 'utf8');
      }
    }
  }

  console.log('\n=== Step 3: Centroid Audit Results ===');
  console.log(`Total Master Areas Audited: ${stats.totalAreas}`);
  console.log(`Verified Against NGA Gazetteer: ${stats.matchedCount} (${((stats.matchedCount / stats.totalAreas) * 100).toFixed(1)}%)`);
  console.log(`  ✔ Green  (<= 300m delta)    : ${stats.greenCount} (${((stats.greenCount / stats.totalAreas) * 100).toFixed(1)}%)`);
  console.log(`  ⚠ Yellow (300m - 1500m delta): ${stats.yellowCount} (${((stats.yellowCount / stats.totalAreas) * 100).toFixed(1)}%)`);
  console.log(`  ✖ Red    (> 1500m drift)     : ${stats.redCount} (${((stats.redCount / stats.totalAreas) * 100).toFixed(1)}%)`);
  console.log(`  ℹ Unmatched (OSM / Post only): ${stats.unmatchedCount} (${((stats.unmatchedCount / stats.totalAreas) * 100).toFixed(1)}%)`);

  return { success: true, stats };
}

// Direct execution
if (process.argv[1] && process.argv[1].endsWith('audit_centroids.ts')) {
  const attachSources = process.argv.includes('--attach-sources');
  const cityFilterArg = process.argv.find((a) => a.startsWith('--city='));
  const cityFilter = cityFilterArg ? cityFilterArg.split('=')[1] : undefined;

  runCentroidAudit({ attachSources, cityFilter }).catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
