import type { PakistanArea, SearchOptions, PakLocationItem } from './types.js';
import { allAreas } from './data/areas/index.js';
import { normalizeUrduText } from './urdu.js';
import { toLocationItem, cityLookupMap } from './hierarchy.js';

interface NormalizedCandidate {
  readonly area: PakistanArea;
  readonly normName: string;
  readonly normId: string;
  readonly normUrdu: string;
  readonly rawUrdu: string;
  readonly normAliases: readonly string[];
  readonly allText: string;
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

function createNormalizedCandidate(area: PakistanArea): NormalizedCandidate {
  const normName = normalizeString(area.name);
  const normId = normalizeString(area.id);
  const rawUrdu = area.urduName ? area.urduName.trim() : '';
  const normUrdu = area.urduName ? normalizeUrduText(area.urduName) : '';
  const normAliases = area.aliases.map((a) => normalizeString(a));
  const allText = `${normName} ${normId} ${normAliases.join(' ')} ${normUrdu} ${rawUrdu}`.trim();
  return {
    area,
    normName,
    normId,
    normUrdu,
    rawUrdu,
    normAliases,
    allText
  };
}

// Pre-tokenize and normalize all candidates at module load time to eliminate
// repeated string allocations and lowercasing inside keystroke search loops.
const normalizedCandidates: readonly NormalizedCandidate[] = allAreas.map(createNormalizedCandidate);

const candidateByAreaMap = new Map<PakistanArea, NormalizedCandidate>();
for (const c of normalizedCandidates) {
  candidateByAreaMap.set(c.area, c);
}

const normalizedByCityMap = new Map<string, NormalizedCandidate[]>();
for (const c of normalizedCandidates) {
  const cityKey = c.area.cityId.toLowerCase();
  const list = normalizedByCityMap.get(cityKey) || [];
  list.push(c);
  normalizedByCityMap.set(cityKey, list);
}

interface ScoredCandidate {
  candidate: NormalizedCandidate;
  score: number;
}

/**
 * Resolves candidates pool with O(1) city selection and pre-normalized metadata.
 */
function getCandidatePool(
  options?: SearchOptions,
  candidateAreas: readonly PakistanArea[] = allAreas
): readonly NormalizedCandidate[] {
  let list: readonly NormalizedCandidate[];

  if (candidateAreas === allAreas) {
    if (options?.cityId && typeof options.cityId === 'string') {
      const cityId = options.cityId.toLowerCase().trim();
      list = normalizedByCityMap.get(cityId) || [];
    } else {
      list = normalizedCandidates;
    }
  } else {
    let filtered = candidateAreas;
    if (options?.cityId && typeof options.cityId === 'string') {
      const cityId = options.cityId.toLowerCase().trim();
      filtered = filtered.filter((a) => a.cityId.toLowerCase() === cityId);
    }
    list = filtered.map((a) => candidateByAreaMap.get(a) || createNormalizedCandidate(a));
  }

  if (options?.provinceId && typeof options.provinceId === 'string') {
    const provinceId = options.provinceId.toLowerCase().trim();
    list = list.filter((c) => c.area.provinceId.toLowerCase() === provinceId);
  }

  return list;
}

/**
 * Classic search implementation returning PakistanArea[].
 */
function classicSearchAreas(
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
  const normUrduQuery = normalizeUrduText(trimmed);
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const urduTokens = normUrduQuery ? normUrduQuery.split(' ').filter(Boolean) : [];

  const pool = getCandidatePool(options, candidateAreas);
  const scored: ScoredCandidate[] = [];

  for (const c of pool) {
    let score = 0;

    // 1. Exact matches
    if (c.normName === normQuery) {
      score = Math.max(score, 1000);
    } else if (c.normId === normQuery) {
      score = Math.max(score, 950);
    } else if (
      (c.normUrdu && c.normUrdu === normUrduQuery) ||
      (c.rawUrdu && c.rawUrdu === trimmed)
    ) {
      score = Math.max(score, 900);
    } else if (c.normAliases.some((al) => al === normQuery)) {
      score = Math.max(score, 850);
    }

    // 2. Prefix matches
    if (score < 800) {
      if (c.normName.startsWith(normQuery)) {
        score = Math.max(score, 700 + (normQuery.length / c.normName.length) * 50);
      } else if (
        (c.normUrdu && normUrduQuery && c.normUrdu.startsWith(normUrduQuery)) ||
        (c.rawUrdu && c.rawUrdu.startsWith(trimmed))
      ) {
        score = Math.max(score, 650);
      } else if (c.normAliases.some((al) => al.startsWith(normQuery))) {
        score = Math.max(score, 600);
      }
    }

    // 3. Substring / Token matches
    if (score < 600) {
      if (c.normName.includes(normQuery)) {
        score = Math.max(score, 500);
      } else if (
        (c.normUrdu && normUrduQuery && c.normUrdu.includes(normUrduQuery)) ||
        (c.rawUrdu && c.rawUrdu.includes(trimmed))
      ) {
        score = Math.max(score, 450);
      } else if (c.normAliases.some((al) => al.includes(normQuery))) {
        score = Math.max(score, 400);
      } else {
        let tokenScore = 0;
        if (queryTokens.length > 0) {
          const matched = queryTokens.filter((token) => c.allText.includes(token));
          if (matched.length === queryTokens.length) {
            tokenScore = Math.max(tokenScore, 300 + queryTokens.length * 20);
          } else if (matched.length > 0) {
            tokenScore = Math.max(tokenScore, 100 + (matched.length / queryTokens.length) * 100);
          }
        }
        if (urduTokens.length > 0) {
          const matchedUrdu = urduTokens.filter((token) => c.allText.includes(token));
          if (matchedUrdu.length === urduTokens.length) {
            tokenScore = Math.max(tokenScore, 300 + urduTokens.length * 20);
          } else if (matchedUrdu.length > 0) {
            tokenScore = Math.max(tokenScore, 100 + (matchedUrdu.length / urduTokens.length) * 100);
          }
        }
        if (tokenScore > 0) {
          score = Math.max(score, tokenScore);
        }
      }
    }

    // 4. Fuzzy fallback for short queries or slight typos (4 <= length <= 40)
    if (score === 0 && normQuery.length >= 4 && normQuery.length <= 40) {
      const dist = levenshteinDistance(normQuery, c.normName);
      const maxLen = Math.max(normQuery.length, c.normName.length);
      const similarity = 1 - dist / maxLen;
      if (similarity >= 0.72) {
        score = Math.max(score, 150 * similarity);
      } else {
        for (const al of c.normAliases) {
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
      scored.push({ candidate: c, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.candidate.area.name.localeCompare(b.candidate.area.name);
  });

  const results = scored.map((s) => s.candidate.area);

  if (options?.limit !== undefined) {
    if (options.limit <= 0) {
      return [];
    }
    return results.slice(0, options.limit);
  }

  return results;
}

/**
 * Searches areas within a specific city and returns ranked results as PakLocationItem[].
 *
 * Each returned PakLocationItem always contains both English (`nameEn`) and Urdu (`nameUr`) names.
 * The `_lang` parameter is accepted for Sanctuary compatibility.
 *
 * @param cityKey - City identifier, English name, or Urdu name
 * @param query - Search term (English or Urdu)
 * @param _lang - Optional language code accepted for Sanctuary compatibility
 * @returns Ranked array of PakLocationItem elements
 */
export function searchLocationItems(
  cityKey: string,
  query: string,
  _lang?: 'en' | 'ur'
): PakLocationItem[] {
  if (typeof cityKey !== 'string' || typeof query !== 'string') return [];
  const trimmedCity = cityKey.trim();
  const trimmedQuery = query.trim();
  if (!trimmedCity || !trimmedQuery) return [];

  const city =
    cityLookupMap.get(trimmedCity.toLowerCase()) ||
    cityLookupMap.get(normalizeUrduText(trimmedCity));
  if (!city) return [];

  const results = classicSearchAreas(trimmedQuery, { cityId: city.id });
  return results.map(toLocationItem);
}

/**
 * Searches Pakistan areas using structured matching and ranking:
 * Exact match > Prefix match > Alias match > Substring / Token match > Fuzzy match.
 *
 * Overload 1 (Sanctuary signature):
 * searchAreas(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[]
 *
 * Overload 2 (Classic signature):
 * searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[]
 */
export function searchAreas(
  cityKey: string,
  query: string,
  lang?: 'en' | 'ur'
): PakLocationItem[];
export function searchAreas(
  query: string,
  options?: SearchOptions,
  candidateAreas?: readonly PakistanArea[]
): PakistanArea[];
export function searchAreas(
  firstArg: string,
  secondArg?: string | SearchOptions,
  thirdArg?: 'en' | 'ur' | readonly PakistanArea[]
): PakLocationItem[] | PakistanArea[] {
  // Runtime dispatch: when argument 2 is a string, route to Sanctuary mode
  if (typeof secondArg === 'string') {
    const cityKey = firstArg;
    const query = secondArg;
    const lang = thirdArg === 'ur' ? 'ur' : 'en';
    return searchLocationItems(cityKey, query, lang);
  }

  // Otherwise, route to classic search mode
  const query = firstArg;
  const options = typeof secondArg === 'object' && secondArg !== null ? secondArg : undefined;
  const candidateAreas = Array.isArray(thirdArg) ? thirdArg : allAreas;
  return classicSearchAreas(query, options, candidateAreas);
}
