import type { PakistanArea } from 'pak-geodata';

export interface MatchBadgeInfo {
  type: 'urdu' | 'alias' | 'postal' | 'exact' | 'prefix' | 'match';
  label: string;
  colorClass: string;
}

/**
 * Detects match origin: Urdu script, colloquial alias, postal code, or exact/prefix name.
 */
export function getMatchBadge(area: PakistanArea, rawQuery: string): MatchBadgeInfo {
  const query = rawQuery.trim();
  const normQuery = query.toLowerCase().replace(/[-_.,/]/g, ' ').replace(/\s+/g, ' ');
  const isDigits = /^\d+$/.test(query);
  const isUrdu = /[\u0600-\u06FF]/.test(query);

  // 1. Postal Code match
  if (isDigits && area.postalCode && (area.postalCode === query || area.postalCode.startsWith(query))) {
    return {
      type: 'postal',
      label: `Postal: ${area.postalCode}`,
      colorClass: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
    };
  }

  // 2. Urdu Script match
  if (isUrdu && area.urduName && (area.urduName.includes(query) || query.includes(area.urduName))) {
    return {
      type: 'urdu',
      label: `Urdu: "${area.urduName}"`,
      colorClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    };
  }

  // 3. Exact match
  const normName = area.name.toLowerCase().replace(/[-_.,/]/g, ' ').replace(/\s+/g, ' ');
  const normId = area.id.toLowerCase().replace(/[-_.,/]/g, ' ').replace(/\s+/g, ' ');
  if (normName === normQuery || normId === normQuery) {
    return {
      type: 'exact',
      label: 'Exact Match',
      colorClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    };
  }

  // 4. Alias match (e.g. "dha 5", "old city", "gulberg 3")
  const matchedAlias = (area.aliases || []).find((a) => {
    const na = a.toLowerCase().replace(/[-_.,/]/g, ' ').replace(/\s+/g, ' ');
    return na === normQuery || na.startsWith(normQuery) || (normQuery.length >= 3 && na.includes(normQuery));
  });
  if (matchedAlias) {
    return {
      type: 'alias',
      label: `Alias: "${matchedAlias}"`,
      colorClass: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    };
  }

  // 5. Prefix match
  if (normName.startsWith(normQuery) || normId.startsWith(normQuery)) {
    return {
      type: 'prefix',
      label: 'Prefix Match',
      colorClass: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    };
  }

  // 6. Substring / Fallback match
  return {
    type: 'match',
    label: 'Match',
    colorClass: 'text-neutral-300 bg-white/10 border-white/15',
  };
}
