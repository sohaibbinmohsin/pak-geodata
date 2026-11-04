import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { haversineDistanceMeters } from '../pipeline/validators/spatial.js';
import { Area, City, CitySchema } from '../pipeline/validators/schema.js';

export interface PplxCandidate {
  geonameId: number;
  name: string;
  asciiname: string;
  altNames: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  cityId: string;
  provinceId: string;
}

export interface PostOffice {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a name for deduplication.
 */
function normalizeNameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface EnrichCityOptions {
  city: City;
  existingAreas: Area[];
  candidates: PplxCandidate[];
  postOffices?: PostOffice[];
  globalCoords?: Set<string>;
  globalIds?: Set<string>;
}

/**
 * Filters candidates and generates authentic non-colliding Area records for a single city.
 */
export function enrichCityWithPplx(options: EnrichCityOptions): { added: Area[]; rejectedCount: number } {
  const { city, existingAreas, candidates, postOffices = [], globalCoords = new Set(), globalIds = new Set() } = options;

  const existingNames = new Set(existingAreas.map((a) => normalizeNameKey(a.name)));
  for (const a of existingAreas) {
    for (const alias of (a.aliases || [])) {
      existingNames.add(normalizeNameKey(alias));
    }
    globalCoords.add(`${a.coordinates.lat.toFixed(6)},${a.coordinates.lng.toFixed(6)}`);
    globalIds.add(a.id);
  }


  const added: Area[] = [];
  let rejectedCount = 0;

  for (const cand of candidates) {
    // 1. Verify bounds
    if (city.bounds) {
      const { minLat, maxLat, minLng, maxLng } = city.bounds;
      if (
        cand.coordinates.lat < minLat ||
        cand.coordinates.lat > maxLat ||
        cand.coordinates.lng < minLng ||
        cand.coordinates.lng > maxLng
      ) {
        rejectedCount++;
        continue;
      }
    }

    // 2. Deduplicate by name
    const normName = normalizeNameKey(cand.name);
    if (existingNames.has(normName)) {
      rejectedCount++;
      continue;
    }

    // 2b. Deduplicate parent township and distinctive token overlap
    const COMMON_GENERIC_TOKENS = new Set([
      'colony', 'town', 'bazaar', 'bazar', 'market', 'scheme', 'block', 'phase', 'sector', 'main', 'road', 'goth', 'kili', 'chauk', 'chowk', 'pur', 'pura', 'wali', 'wala', 'new', 'old', 'upper', 'lower', 'north', 'south', 'east', 'west'
    ]);

    const candTokens = cand.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 3 && !COMMON_GENERIC_TOKENS.has(t));

    let alreadyRepresented = false;
    for (const a of existingAreas) {
      const normA = normalizeNameKey(a.name);
      // Direct string prefix/containment
      const isSub = normA.startsWith(normName) || normName.startsWith(normA) || normA.includes(normName) || normName.includes(normA);
      
      // Distinctive token match
      const aTokens = a.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 3 && !COMMON_GENERIC_TOKENS.has(t));

      const sharesDistinctiveToken = candTokens.some((ct) =>
        aTokens.some((at) => {
          if (at === ct || at.startsWith(ct) || ct.startsWith(at)) return true;
          if (Math.abs(at.length - ct.length) <= 1 && Math.min(at.length, ct.length) >= 4) {
            // Levenshtein edit distance <= 1
            let diffs = 0;
            for (let i = 0, j = 0; i < at.length && j < ct.length;) {
              if (at[i] !== ct[j]) {
                diffs++;
                if (diffs > 1) break;
                if (at.length > ct.length) i++;
                else if (ct.length > at.length) j++;
                else { i++; j++; }
              } else {
                i++; j++;
              }
            }
            return diffs <= 1;
          }
          return false;
        })
      );


      if (isSub || sharesDistinctiveToken) {
        const d = haversineDistanceMeters(
          cand.coordinates.lat,
          cand.coordinates.lng,
          a.coordinates.lat,
          a.coordinates.lng
        );
        if (d < 1200) {
          alreadyRepresented = true;
          break;
        }
      }
    }

    if (alreadyRepresented) {
      rejectedCount++;
      continue;
    }


    // 3. Coordinate uniqueness
    const coordKey = `${cand.coordinates.lat.toFixed(6)},${cand.coordinates.lng.toFixed(6)}`;
    if (globalCoords.has(coordKey)) {
      rejectedCount++;
      continue;
    }

    // 4. Proximity collision check against existing areas and newly added areas in this city (< 150m)
    let tooClose = false;
    for (const a of [...existingAreas, ...added]) {
      const dist = haversineDistanceMeters(
        cand.coordinates.lat,
        cand.coordinates.lng,
        a.coordinates.lat,
        a.coordinates.lng
      );
      if (dist < 150) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) {
      rejectedCount++;
      continue;
    }


    // 5. Canonical slug format: <cityId>-<slug>
    let slug = sanitizeSlug(cand.name);
    if (!slug || slug.length < 2) {
      slug = sanitizeSlug(cand.asciiname);
    }
    if (!slug || slug.length < 2) {
      rejectedCount++;
      continue;
    }

    let areaId = `${city.id}-${slug}`;
    if (globalIds.has(areaId)) {
      // Append geonameId suffix if colliding
      areaId = `${city.id}-${slug}-${cand.geonameId}`;
      if (globalIds.has(areaId)) {
        rejectedCount++;
        continue;
      }
    }

    // 6. Optional postal code association within city.postalCodeRange
    let postalCode: string | undefined;
    if (city.postalCodeRange && postOffices.length > 0) {
      const minRange = parseInt(city.postalCodeRange[0], 10);
      const maxRange = parseInt(city.postalCodeRange[1], 10);

      let closestDist = 5000; // 5km max
      let closestCode: string | undefined;

      for (const po of postOffices) {
        const poNum = parseInt(po.code, 10);
        if (poNum >= minRange && poNum <= maxRange) {
          const d = haversineDistanceMeters(
            cand.coordinates.lat,
            cand.coordinates.lng,
            po.lat,
            po.lng
          );
          if (d < closestDist) {
            closestDist = d;
            closestCode = po.code;
          }
        }
      }
      postalCode = closestCode;
    }

    // 7. Aliases from altNames
    const urduRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    const urduAlt = (cand.altNames || []).find((s) => urduRegex.test(s))?.trim();

    const aliases = (cand.altNames || [])
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== cand.name.toLowerCase() && s.length >= 2 && !urduRegex.test(s))
      .slice(0, 5);

    const newArea: Area = {
      id: areaId,
      cityId: city.id,
      provinceId: city.provinceId,
      name: cand.name,
      aliases,
      coordinates: cand.coordinates,
      type: 'neighborhood',
      verified: true,
      sources: [
        {
          provider: 'nga_geonames',
          id: cand.geonameId,
          featureCode: 'PPLX',
          datasetVersion: '2026-11'
        }
      ]
    };

    if (urduAlt) {
      newArea.urduName = urduAlt;
    }


    if (postalCode) {
      newArea.postalCode = postalCode;
    }

    added.push(newArea);
    existingNames.add(normName);
    globalCoords.add(coordKey);
    globalIds.add(areaId);
  }

  return { added, rejectedCount };
}

/**
 * Loads all cities from data/cities/*.json.
 */
export function loadAllCities(citiesDir: string): City[] {
  const cities: City[] = [];
  const files = fs.readdirSync(citiesDir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(path.join(citiesDir, f), 'utf8'));
    for (const item of list) {
      const parsed = CitySchema.safeParse(item);
      if (parsed.success) {
        cities.push(parsed.data);
      }
    }
  }
  return cities;
}

/**
 * Loads postal code records from pipeline/raw/postal_PK/PK.txt.
 */
export function loadPostOffices(filePath: string): PostOffice[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const postOffices: PostOffice[] = [];

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 11) continue;
    const code = parts[1]?.trim();
    const name = parts[2]?.trim();
    const lat = parseFloat(parts[9]);
    const lng = parseFloat(parts[10]);
    if (code && !isNaN(lat) && !isNaN(lng)) {
      postOffices.push({ code, name, lat, lng });
    }
  }

  return postOffices;
}

/**
 * Runs the full PPLX enrichment pipeline.
 */
export async function runPplxEnrichment(options: {
  rawGeoNamesPath?: string;
  postalPath?: string;
  dataDir?: string;
  execute?: boolean;
  cityFilter?: string;
}) {
  const rawPath = options.rawGeoNamesPath ?? path.join(process.cwd(), 'pipeline/raw/PK.txt');
  const postalPath = options.postalPath ?? path.join(process.cwd(), 'pipeline/raw/postal_PK/PK.txt');
  const dataDir = options.dataDir ?? path.join(process.cwd(), 'data');
  const execute = options.execute ?? false;

  console.log('=== Step 1.3: Ground-Truth City Enrichment via NGA PPLX ===');
  console.log(`Execution Mode: ${execute ? 'WRITE TO DISK' : 'DRY-RUN SIMULATION'}`);

  const cities = loadAllCities(path.join(dataDir, 'cities'));
  const postOffices = loadPostOffices(postalPath);
  console.log(`Loaded ${cities.length} cities and ${postOffices.length} postal reference points.`);

  // Load existing areas
  const areasDir = path.join(dataDir, 'areas');
  const globalCoords = new Set<string>();
  const globalIds = new Set<string>();
  const areasByCity = new Map<string, { areas: Area[]; filePath: string }>();

  for (const prov of fs.readdirSync(areasDir)) {
    const pPath = path.join(areasDir, prov);
    if (!fs.statSync(pPath).isDirectory()) continue;
    for (const cFile of fs.readdirSync(pPath)) {
      if (!cFile.endsWith('.json')) continue;
      const citySlug = cFile.replace('.json', '');
      const filePath = path.join(pPath, cFile);
      const areas: Area[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      for (const a of areas) {
        globalCoords.add(`${a.coordinates.lat.toFixed(6)},${a.coordinates.lng.toFixed(6)}`);
        globalIds.add(a.id);
      }
      areasByCity.set(citySlug, { areas, filePath });
    }
  }

  // Stream PK.txt for PPLX
  const candidatesByCity = new Map<string, PplxCandidate[]>();
  const fileStream = fs.createReadStream(rawPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const parts = line.split('\t');
    if (parts.length < 19 || parts[7] !== 'PPLX') continue;

    const geonameId = parseInt(parts[0], 10);
    const name = parts[1].trim();
    const asciiname = parts[2].trim();
    const altNames = parts[3] ? parts[3].split(',') : [];
    const lat = parseFloat(parts[4]);
    const lng = parseFloat(parts[5]);
    if (isNaN(lat) || isNaN(lng)) continue;

    // Match city
    for (const c of cities) {
      if (options.cityFilter && c.id !== options.cityFilter) continue;
      if (c.bounds) {
        if (lat >= c.bounds.minLat && lat <= c.bounds.maxLat && lng >= c.bounds.minLng && lng <= c.bounds.maxLng) {
          const list = candidatesByCity.get(c.id) || [];
          list.push({
            geonameId,
            name,
            asciiname,
            altNames,
            coordinates: { lat, lng },
            cityId: c.id,
            provinceId: c.provinceId
          });
          candidatesByCity.set(c.id, list);
          break;
        }
      }
    }
  }

  let totalAdded = 0;
  let totalRejected = 0;
  const enrichedSummary: Record<string, number> = {};

  for (const c of cities) {
    if (options.cityFilter && c.id !== options.cityFilter) continue;

    const cityCandidates = candidatesByCity.get(c.id) || [];
    if (cityCandidates.length === 0) continue;

    const cityEntry = areasByCity.get(c.id);
    if (!cityEntry) continue;

    const { added, rejectedCount } = enrichCityWithPplx({
      city: c,
      existingAreas: cityEntry.areas,
      candidates: cityCandidates,
      postOffices,
      globalCoords,
      globalIds
    });

    totalAdded += added.length;
    totalRejected += rejectedCount;

    if (added.length > 0) {
      enrichedSummary[c.id] = added.length;
      if (execute) {
        const mergedAreas = [...cityEntry.areas, ...added];
        fs.writeFileSync(cityEntry.filePath, JSON.stringify(mergedAreas, null, 2) + '\n', 'utf8');
      }
    }
  }

  console.log('\n=== Step 1.3 Results ===');
  console.log(`Total New Authentic Quarters Ingested: ${totalAdded}`);
  console.log(`Candidates Rejected (Duplicates/Collisions): ${totalRejected}`);
  console.log(`Cities Enriched: ${Object.keys(enrichedSummary).length}`);

  return { totalAdded, totalRejected, enrichedSummary };
}

// CLI direct run
if (process.argv[1] && process.argv[1].endsWith('enrich_pplx.ts')) {
  const execute = process.argv.includes('--execute');
  const cityFilterArg = process.argv.find((a) => a.startsWith('--city='));
  const cityFilter = cityFilterArg ? cityFilterArg.split('=')[1] : undefined;

  runPplxEnrichment({ execute, cityFilter }).catch((err) => {
    console.error('Enrichment failed:', err);
    process.exit(1);
  });
}
