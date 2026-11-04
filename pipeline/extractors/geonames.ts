import fs from 'node:fs';
import readline from 'node:readline';
import { haversineDistanceMeters } from '../validators/spatial.js';

export interface GeoNamesRecord {
  geonameId: number;
  name: string;
  asciiname: string;
  alternateNames: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  featureClass: string;
  featureCode: string;
  countryCode: string;
  admin1Code: string;
  admin2Code?: string;
  admin3Code?: string;
  admin4Code?: string;
  population?: number;
  elevation?: number;
  modificationDate: string;
}

export interface GeoNamesMatch {
  record: GeoNamesRecord;
  distanceMeters: number;
  matchedName: string;
}

/**
 * Parses a single tab-delimited line from the GeoNames gazetteer (PK.txt).
 */
export function parseGeoNamesLine(line: string): GeoNamesRecord | null {
  if (!line || typeof line !== 'string') return null;
  const parts = line.split('\t');
  if (parts.length < 19) return null;

  const geonameId = parseInt(parts[0], 10);
  if (isNaN(geonameId)) return null;

  const lat = parseFloat(parts[4]);
  const lng = parseFloat(parts[5]);
  if (isNaN(lat) || isNaN(lng)) return null;

  const altNames = parts[3] ? parts[3].split(',').map((s) => s.trim()).filter(Boolean) : [];

  return {
    geonameId,
    name: parts[1],
    asciiname: parts[2],
    alternateNames: altNames,
    coordinates: { lat, lng },
    featureClass: parts[6],
    featureCode: parts[7],
    countryCode: parts[8],
    admin1Code: parts[10],
    admin2Code: parts[11] || undefined,
    admin3Code: parts[12] || undefined,
    admin4Code: parts[13] || undefined,
    population: parts[14] ? parseInt(parts[14], 10) : undefined,
    elevation: parts[15] ? parseInt(parts[15], 10) : undefined,
    modificationDate: parts[18]
  };
}

/**
 * Normalizes text for comparison by lowercasing, stripping roman numerals/phase numbers, and trimming.
 */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SUBDIVISION_TERMS = new Set([
  'phase', 'sector', 'block', 'stage', 'zone', 'colony', 'town', 'scheme', 'extension'
]);

/**
 * Checks if two place names match with appropriate specificity.
 */
function isNameMatch(target: string, candidate: string): boolean {
  const normTarget = normalizeName(target);
  const normCand = normalizeName(candidate);
  if (!normTarget || !normCand) return false;

  if (normTarget === normCand) return true;

  const targetTokens = normTarget.split(' ').filter((t) => t.length > 2);
  const candTokens = normCand.split(' ').filter((t) => t.length > 2);

  if (targetTokens.length === 0 || candTokens.length === 0) return false;

  // Check if target has specific block/phase numbers or letters (e.g. "phase 2", "block g", "sector a")
  const targetSubdiv = target.toLowerCase().match(/\b(phase\s*\d+|block\s*[a-z0-9]+|sector\s*[a-z0-9]+)\b/);
  const candSubdiv = candidate.toLowerCase().match(/\b(phase\s*\d+|block\s*[a-z0-9]+|sector\s*[a-z0-9]+)\b/);

  // If one has a specific phase/block and the other has a different one, do NOT match
  if (targetSubdiv && candSubdiv && targetSubdiv[1].replace(/\s+/g, '') !== candSubdiv[1].replace(/\s+/g, '')) {
    return false;
  }

  // If target has parentheses like "Allama Iqbal Town (Chenab Block)" or "Garden Town (Civic Centre)"
  const parenMatch = target.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const specificPart = parenMatch[1];
    const normSpec = normalizeName(specificPart);
    if (!normCand.includes(normSpec)) {
      return false;
    }
  }

  const matchCount = targetTokens.filter((t) => candTokens.includes(t)).length;
  return matchCount > 0 && matchCount >= Math.min(targetTokens.length, candTokens.length);
}


export interface CandidateSearchOptions {
  name: string;
  aliases?: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  maxDistanceKm?: number;
  candidates: GeoNamesRecord[];
}

/**
 * Finds the closest matching GeoNames record for an area within a maximum distance.
 */
export function findGeoNamesCandidate(options: CandidateSearchOptions): GeoNamesMatch | null {
  const { name, aliases = [], coordinates, maxDistanceKm = 5.0, candidates } = options;
  const maxDistanceMeters = maxDistanceKm * 1000;

  const hasSubdiv = /\b(phase|sector|block|stage|zone)\b/i.test(name) || /\([^)]+\)/.test(name);
  let bestMatch: GeoNamesMatch | null = null;
  let minDistance = Infinity;

  for (const cand of candidates) {
    const dist = haversineDistanceMeters(
      coordinates.lat,
      coordinates.lng,
      cand.coordinates.lat,
      cand.coordinates.lng
    );

    if (dist > maxDistanceMeters) continue;

    const candidateNames = [cand.name, cand.asciiname, ...cand.alternateNames];

    // Priority 1: Match on primary name
    let matched = false;
    for (const cName of candidateNames) {
      if (isNameMatch(name, cName)) {
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = {
            record: cand,
            distanceMeters: dist,
            matchedName: cName
          };
        }
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Priority 2: Match on aliases only if target is not a specific subdivision or distance is close (<= 800m)
    if (!hasSubdiv || dist <= 800) {
      for (const alias of aliases) {
        for (const cName of candidateNames) {
          if (isNameMatch(alias, cName)) {
            if (dist < minDistance) {
              minDistance = dist;
              bestMatch = {
                record: cand,
                distanceMeters: dist,
                matchedName: cName
              };
            }
            break;
          }
        }
      }
    }
  }

  return bestMatch;
}


/**
 * Streams the GeoNames dataset (e.g. pipeline/raw/PK.txt) filtering records.
 */
export async function streamGeoNames(
  filePath: string,
  filter?: (record: GeoNamesRecord) => boolean
): Promise<GeoNamesRecord[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`GeoNames file not found at ${filePath}`);
  }

  const results: GeoNamesRecord[] = [];
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const record = parseGeoNamesLine(line);
    if (!record) continue;
    if (filter && !filter(record)) continue;
    results.push(record);
  }

  return results;
}
