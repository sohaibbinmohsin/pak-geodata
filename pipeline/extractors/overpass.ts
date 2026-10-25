import { BoundingBox } from '../validators/spatial.js';

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string | undefined>;
}

export interface OverpassResponse {
  version?: number;
  generator?: string;
  osm3s?: {
    timestamp_osm_base?: string;
    copyright?: string;
  };
  elements: OverpassElement[];
}

export interface OverpassCandidate {
  id: string;
  osmId: number;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  urduName?: string;
  type?: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: Record<string, string | undefined>;
}

export interface OverpassQueryOptions {
  timeoutSeconds?: number;
  placeTypes?: string[];
}

export interface OverpassFetchOptions {
  endpoint?: string;
  fetchFn?: typeof fetch;
  retryDelayMs?: number;
  maxRetries?: number;
  userAgent?: string;
}

const DEFAULT_PLACE_TYPES = [
  'suburb',
  'neighbourhood',
  'quarter',
  'residential',
  'subdivision'
];

/**
 * Builds an Overpass QL query targeting places inside the given bounding box.
 */
export function buildOverpassQuery(
  box: BoundingBox,
  options: OverpassQueryOptions = {}
): string {
  const timeout = options.timeoutSeconds ?? 25;
  const types = options.placeTypes ?? DEFAULT_PLACE_TYPES;
  const typesRegex = types.join('|');
  const bbox = `${box.minLat},${box.minLng},${box.maxLat},${box.maxLng}`;

  return `[out:json][timeout:${timeout}];
(
  node["place"~"^(${typesRegex})$"](${bbox});
  way["place"~"^(${typesRegex})$"](${bbox});
  relation["place"~"^(${typesRegex})$"](${bbox});
);
out center tags;`;
}

/**
 * Parses raw Overpass API JSON response into normalized OverpassCandidate records.
 */
export function parseOverpassResponse(
  response: OverpassResponse
): OverpassCandidate[] {
  const candidates: OverpassCandidate[] = [];

  for (const element of response.elements) {
    if (!element.tags) continue;

    const name = element.tags['name:en'] || element.tags.name;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      continue;
    }

    let lat: number | undefined;
    let lng: number | undefined;

    if (element.type === 'node') {
      lat = element.lat;
      lng = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lng = element.center.lon;
    } else if (element.lat !== undefined && element.lon !== undefined) {
      lat = element.lat;
      lng = element.lon;
    }

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      continue;
    }

    candidates.push({
      id: `${element.type}/${element.id}`,
      osmId: element.id,
      osmType: element.type,
      name: name.trim(),
      urduName: element.tags['name:ur']?.trim() || undefined,
      type: element.tags.place || element.tags.residential || element.tags.landuse || undefined,
      postalCode: element.tags['addr:postcode']?.trim() || element.tags.postal_code?.trim() || undefined,
      coordinates: { lat, lng },
      tags: element.tags
    });
  }

  return candidates;
}

/**
 * Fetches candidate records from an OSM Overpass API endpoint with retry & backoff.
 */
export async function fetchOverpassCandidates(
  query: string,
  options: OverpassFetchOptions = {}
): Promise<OverpassCandidate[]> {
  const endpoint = options.endpoint ?? 'https://overpass-api.de/api/interpreter';
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const retryDelayMs = options.retryDelayMs ?? 1000;
  const maxRetries = options.maxRetries ?? 3;
  const userAgent = options.userAgent ?? 'pak-geodata/0.1.0';

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': userAgent
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (response.status === 429 || response.status === 504 || response.status === 503) {
        if (attempt < maxRetries) {
          const delay = retryDelayMs * attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(
          `Overpass API rate limited or timed out: ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as OverpassResponse;
      return parseOverpassResponse(json);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries && lastError.message.includes('rate limited')) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
        continue;
      }
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch from Overpass API');
}
