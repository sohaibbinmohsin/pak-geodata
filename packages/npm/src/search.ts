import type { PakistanArea, SearchOptions } from './types.js';
import { allAreas } from './data/areas/index.js';

// Pre-indexed lookup map for O(1) candidate pool selection by city
const areasByCityMap = new Map<string, PakistanArea[]>();
for (const a of allAreas) {
  const cityKey = a.cityId.toLowerCase();
  const list = areasByCityMap.get(cityKey) || [];
  list.push(a);
  areasByCityMap.set(cityKey, list);
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/[-_.,/]/g, ' ').replace(/\s+/g, ' ');
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = i;
  }

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? matrix[j - 1]
          : Math.min(matrix[j - 1], matrix[j], prev) + 1;
      matrix[j - 1] = prev;
      prev = val;
    }
    matrix[b.length] = prev;
  }

  return matrix[b.length];
}

interface ScoredArea {
  area: PakistanArea;
  score: number;
}

/**
 * Searches Pakistan areas using structured matching and ranking:
 * Exact match > Prefix match > Alias match > Substring / Token match > Fuzzy match.
 *
 * @param query - Search term (English, Urdu, ID, or colloquial alias)
 * @param options - Optional filters (cityId, provinceId, limit)
 * @param candidateAreas - Custom pool of areas (defaults to all verified areas)
 * @returns Ranked array of matching PakistanArea objects
 */
export function searchAreas(
  query: string,
  options?: SearchOptions,
  candidateAreas: readonly PakistanArea[] = allAreas
): PakistanArea[] {
  if (typeof query !== 'string') {
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const normQuery = normalizeString(trimmed);
  const queryTokens = normQuery.split(' ').filter(Boolean);

  let filtered = candidateAreas;

  if (options?.cityId && typeof options.cityId === 'string') {
    const cityId = options.cityId.toLowerCase().trim();
    if (candidateAreas === allAreas) {
      filtered = areasByCityMap.get(cityId) || [];
    } else {
      filtered = filtered.filter((a) => a.cityId.toLowerCase() === cityId);
    }
  }

  if (options?.provinceId && typeof options.provinceId === 'string') {
    const provinceId = options.provinceId.toLowerCase().trim();
    filtered = filtered.filter((a) => a.provinceId.toLowerCase() === provinceId);
  }

  const scored: ScoredArea[] = [];

  for (const area of filtered) {
    let score = 0;

    const normName = normalizeString(area.name);
    const normId = normalizeString(area.id);
    const normUrdu = area.urduName ? area.urduName.trim() : '';
    const normAliases = area.aliases.map((a) => normalizeString(a));

    // 1. Exact matches
    if (normName === normQuery) {
      score = Math.max(score, 1000);
    } else if (normId === normQuery) {
      score = Math.max(score, 950);
    } else if (normUrdu && normUrdu === trimmed) {
      score = Math.max(score, 900);
    } else if (normAliases.some((al) => al === normQuery)) {
      score = Math.max(score, 850);
    }

    // 2. Prefix matches
    if (score < 800) {
      if (normName.startsWith(normQuery)) {
        score = Math.max(score, 700 + (normQuery.length / normName.length) * 50);
      } else if (normUrdu && normUrdu.startsWith(trimmed)) {
        score = Math.max(score, 650);
      } else if (normAliases.some((al) => al.startsWith(normQuery))) {
        score = Math.max(score, 600);
      }
    }

    // 3. Substring / Token matches
    if (score < 600) {
      if (normName.includes(normQuery)) {
        score = Math.max(score, 500);
      } else if (normUrdu && normUrdu.includes(trimmed)) {
        score = Math.max(score, 450);
      } else if (normAliases.some((al) => al.includes(normQuery))) {
        score = Math.max(score, 400);
      } else if (queryTokens.length > 0) {
        const areaAllText = `${normName} ${normId} ${normAliases.join(' ')}`;
        const matchedTokens = queryTokens.filter((token) => areaAllText.includes(token));
        if (matchedTokens.length === queryTokens.length) {
          score = Math.max(score, 300 + (queryTokens.length * 20));
        } else if (matchedTokens.length > 0) {
          score = Math.max(score, 100 + (matchedTokens.length / queryTokens.length) * 100);
        }
      }
    }

    // 4. Fuzzy fallback for short queries or slight typos (4 <= length <= 40)
    if (score === 0 && normQuery.length >= 4 && normQuery.length <= 40) {
      const dist = levenshteinDistance(normQuery, normName);
      const maxLen = Math.max(normQuery.length, normName.length);
      const similarity = 1 - dist / maxLen;
      if (similarity >= 0.72) {
        score = Math.max(score, 150 * similarity);
      } else {
        // Test aliases fuzzy
        for (const al of normAliases) {
          if (al.length >= 3) {
            const aliasDist = levenshteinDistance(normQuery, al);
            const aliasMaxLen = Math.max(normQuery.length, al.length);
            const aliasSim = 1 - aliasDist / aliasMaxLen;
            if (aliasSim >= 0.75) {
              score = Math.max(score, 120 * aliasSim);
              break;
            }
          }
        }
      }
    }

    if (score > 0) {
      scored.push({ area, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.area.name.localeCompare(b.area.name);
  });

  const results = scored.map((s) => s.area);

  if (options?.limit !== undefined) {
    if (options.limit <= 0) {
      return [];
    }
    return results.slice(0, options.limit);
  }

  return results;
}
