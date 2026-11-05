/// Urdu text normalization and structured geographic search.
library;

import 'dart:math' as math;
import 'data/areas.dart';
import 'models.dart';

/// City-level colloquial abbreviations, nicknames, and Urdu aliases.
const cityColloquialAliases = <String, List<String>>{
  'karachi': ['khi', 'khi city', 'city of lights', 'عروس البلاد'],
  'lahore': ['lhe', 'lhr', 'lahore city', 'heart of pakistan', 'زندہ دلان لاہور'],
  'islamabad': ['isb', 'federal capital', 'ict', 'capital territory'],
  'rawalpindi': ['pindi', 'rwp', 'twin city'],
  'faisalabad': ['fsd', 'lyallpur', 'manchester of pakistan'],
  'multan': ['mux', 'mul', 'city of saints', 'madinat-ul-auliya'],
  'peshawar': ['pew', 'psh', 'city of flowers'],
  'quetta': ['qta', 'fruit garden of pakistan'],
  'gujranwala': ['gwa', 'city of wrestlers', 'pehlwanon ka shehar'],
  'sialkot': ['skt', 'city of iqbal'],
  'hyderabad': ['hdd', 'hyd'],
  'abbottabad': ['atd', 'city of pines'],
  'bahawalpur': ['bhv', 'bwp', 'princely state'],
  'sargodha': ['sgd', 'city of eagles', 'shaheenon ka shehar'],
  'sukkur': ['skz'],
  'gwadar': ['gwd'],
  'skardu': ['kdu'],
  'gilgit': ['gil'],
  'muzaffarabad': ['mzd'],
  'mirpur': ['mpr'],
};

/// Converts Eastern Arabic-Indic (۰-۹) and Standard Arabic-Indic (٠-٩)
/// numerals to standard Western ASCII digits (0-9).
String toWesternDigits(String text) {
  final buffer = StringBuffer();
  for (final rune in text.runes) {
    if (rune >= 0x06F0 && rune <= 0x06F9) {
      buffer.writeCharCode(0x30 + (rune - 0x06F0));
    } else if (rune >= 0x0660 && rune <= 0x0669) {
      buffer.writeCharCode(0x30 + (rune - 0x0660));
    } else {
      buffer.writeCharCode(rune);
    }
  }
  return buffer.toString();
}

/// Removes Arabic/Urdu diacritical marks (Tashkeel), Tatweel, and Superscript Alef.
String stripUrduDiacritics(String text) {
  final buffer = StringBuffer();
  for (final rune in text.runes) {
    // 0x0640 = Tatweel, 0x064B-0x065F = Tashkeel (aerab), 0x0670 = Superscript Alef
    if (rune == 0x0640 || (rune >= 0x064B && rune <= 0x065F) || rune == 0x0670) {
      continue;
    }
    buffer.writeCharCode(rune);
  }
  return buffer.toString();
}

/// Applies standard Urdu NLP normalization rules:
/// - Strips Tashkeel diacritics and Tatweel
/// - Normalizes Alef variations (آ, أ, إ, ٱ) -> ا
/// - Normalizes Yeh variations (ي, ى, ئ, ے) -> ی
/// - Normalizes Kaf variations (ك) -> ک
/// - Normalizes Heh variations (ة, ھ, ه) -> ہ
/// - Converts Eastern Arabic-Indic numerals to Western digits
/// - Trims and normalizes whitespace
String normalizeUrduText(String text) {
  if (text.isEmpty) return '';

  final stripped = stripUrduDiacritics(text);
  final buffer = StringBuffer();

  for (final rune in stripped.runes) {
    switch (rune) {
      // Alef variations: آ, أ, إ, ٱ -> ا
      case 0x0622:
      case 0x0623:
      case 0x0625:
      case 0x0671:
        buffer.writeCharCode(0x0627);
        break;
      // Yeh variations: ي, ى, ئ, ے -> ی
      case 0x064A:
      case 0x0649:
      case 0x0626:
      case 0x06D2:
        buffer.writeCharCode(0x06CC);
        break;
      // Kaf variations: ك -> ک
      case 0x0643:
        buffer.writeCharCode(0x06A9);
        break;
      // Heh variations: ة, ھ, ه -> ہ
      case 0x0629:
      case 0x06BE:
      case 0x0647:
        buffer.writeCharCode(0x06C1);
        break;
      default:
        buffer.writeCharCode(rune);
        break;
    }
  }

  final withWesternDigits = toWesternDigits(buffer.toString());
  return withWesternDigits.trim().replaceAll(RegExp(r'\s+'), ' ');
}

String _normalizeString(String s) {
  final cleaned = s.toLowerCase().trim().replaceAll(RegExp(r'[-_.,/]'), ' ');
  return cleaned.replaceAll(RegExp(r'\s+'), ' ').trim();
}

int _levenshteinDistance(String a, String b) {
  final ar = a.runes.toList(growable: false);
  final br = b.runes.toList(growable: false);
  final la = ar.length;
  final lb = br.length;

  if (la == 0) return lb;
  if (lb == 0) return la;

  var dp = List<int>.generate(lb + 1, (i) => i);

  for (var i = 1; i <= la; i++) {
    var prev = dp[0];
    dp[0] = i;
    for (var j = 1; j <= lb; j++) {
      final temp = dp[j];
      if (ar[i - 1] == br[j - 1]) {
        dp[j] = prev;
      } else {
        var minVal = dp[j - 1];
        if (dp[j] < minVal) minVal = dp[j];
        if (prev < minVal) minVal = prev;
        dp[j] = minVal + 1;
      }
      prev = temp;
    }
  }

  return dp[lb];
}

class _NormalizedCandidate {
  final PakistanArea area;
  final String normName;
  final String normId;
  final String normUrdu;
  final String rawUrdu;
  final List<String> normAliases;
  final String allText;

  _NormalizedCandidate({
    required this.area,
    required this.normName,
    required this.normId,
    required this.normUrdu,
    required this.rawUrdu,
    required this.normAliases,
    required this.allText,
  });
}

List<_NormalizedCandidate>? _cachedCandidates;
Map<String, List<_NormalizedCandidate>>? _cachedByCity;

void _ensureCandidatesIndexed() {
  if (_cachedCandidates != null) return;

  final candidates = <_NormalizedCandidate>[];
  final byCity = <String, List<_NormalizedCandidate>>{};

  for (final a in pakistanAreas) {
    final normName = _normalizeString(a.name);
    final normId = _normalizeString(a.id);
    final rawUrdu = (a.urduName ?? '').trim();
    final normUrdu = a.urduName != null ? normalizeUrduText(a.urduName!) : '';

    final normAliases = a.aliases.map(_normalizeString).toList();
    final cityAliases = cityColloquialAliases[a.cityId];
    if (cityAliases != null) {
      normAliases.addAll(cityAliases.map(_normalizeString));
    }

    final allTextParts = [
      normName,
      normId,
      normAliases.join(' '),
      normUrdu,
      rawUrdu,
    ];
    final allText = allTextParts.join(' ').trim();

    final candidate = _NormalizedCandidate(
      area: a,
      normName: normName,
      normId: normId,
      normUrdu: normUrdu,
      rawUrdu: rawUrdu,
      normAliases: normAliases,
      allText: allText,
    );

    candidates.add(candidate);
    final cityKey = a.cityId.toLowerCase().trim();
    (byCity[cityKey] ??= []).add(candidate);
  }

  _cachedCandidates = candidates;
  _cachedByCity = byCity;
}

/// Searches Pakistan areas using structured matching and ranking:
/// Exact match > Prefix match > Urdu match > Alias match > Substring / Token match > Fuzzy match.
List<SearchResult> searchAreas(
  String query, {
  String? cityId,
  String? provinceId,
  int limit = 20,
  SearchOptions? options,
  List<PakistanArea>? candidateAreas,
}) {
  final trimmed = query.trim();
  if (trimmed.isEmpty) return const [];

  final effectiveCityId = (options?.cityId ?? cityId)?.trim().toLowerCase();
  final effectiveProvinceId =
      (options?.provinceId ?? provinceId)?.trim().toLowerCase();
  final effectiveLimit = options?.limit ?? limit;

  _ensureCandidatesIndexed();

  List<_NormalizedCandidate> pool;
  if (candidateAreas != null) {
    pool = candidateAreas.map((a) {
      final normName = _normalizeString(a.name);
      final normId = _normalizeString(a.id);
      final rawUrdu = (a.urduName ?? '').trim();
      final normUrdu = a.urduName != null ? normalizeUrduText(a.urduName!) : '';
      final normAliases = a.aliases.map(_normalizeString).toList();
      final cityAliases = cityColloquialAliases[a.cityId];
      if (cityAliases != null) {
        normAliases.addAll(cityAliases.map(_normalizeString));
      }
      return _NormalizedCandidate(
        area: a,
        normName: normName,
        normId: normId,
        normUrdu: normUrdu,
        rawUrdu: rawUrdu,
        normAliases: normAliases,
        allText: [normName, normId, normAliases.join(' '), normUrdu, rawUrdu]
            .join(' ')
            .trim(),
      );
    }).toList();
  } else if (effectiveCityId != null && effectiveCityId.isNotEmpty) {
    pool = _cachedByCity?[effectiveCityId] ?? const [];
  } else {
    pool = _cachedCandidates!;
  }

  if (effectiveProvinceId != null && effectiveProvinceId.isNotEmpty) {
    pool = pool
        .where((c) => c.area.provinceId.toLowerCase() == effectiveProvinceId)
        .toList();
  }

  if (pool.isEmpty) return const [];

  final normQuery = _normalizeString(trimmed);
  final normUrduQuery = normalizeUrduText(trimmed);
  final queryTokens =
      normQuery.split(' ').where((s) => s.isNotEmpty).toList();
  final urduTokens =
      normUrduQuery.split(' ').where((s) => s.isNotEmpty).toList();
  final queryRuneLen = normQuery.runes.length;

  final scored = <SearchResult>[];

  for (final c in pool) {
    var score = 0.0;
    var matchType = 'exact';

    // 1. Exact matches
    if (c.normName == normQuery) {
      score = 1000.0;
      matchType = 'exact';
    } else if (c.normId == normQuery) {
      score = 950.0;
      matchType = 'exact';
    } else if ((c.normUrdu.isNotEmpty && c.normUrdu == normUrduQuery) ||
        (c.rawUrdu.isNotEmpty && c.rawUrdu == trimmed)) {
      score = 900.0;
      matchType = 'urdu';
    } else {
      for (final al in c.normAliases) {
        if (al == normQuery) {
          score = 850.0;
          matchType = 'alias';
          break;
        }
      }
    }

    // 2. Prefix matches
    if (score < 800.0) {
      if (c.normName.startsWith(normQuery)) {
        final ratio = normQuery.length / math.max(c.normName.length, 1);
        final pScore = 700.0 + ratio * 50.0;
        if (pScore > score) {
          score = pScore;
          matchType = 'prefix';
        }
      } else if ((c.normUrdu.isNotEmpty &&
              normUrduQuery.isNotEmpty &&
              c.normUrdu.startsWith(normUrduQuery)) ||
          (c.rawUrdu.isNotEmpty && c.rawUrdu.startsWith(trimmed))) {
        if (650.0 > score) {
          score = 650.0;
          matchType = 'prefix';
        }
      } else {
        for (final al in c.normAliases) {
          if (al.startsWith(normQuery)) {
            if (600.0 > score) {
              score = 600.0;
              matchType = 'prefix';
            }
            break;
          }
        }
      }
    }

    // 3. Substring / Token matches
    if (score < 600.0) {
      if (c.normName.contains(normQuery)) {
        if (500.0 > score) {
          score = 500.0;
          matchType = 'substring';
        }
      } else if ((c.normUrdu.isNotEmpty &&
              normUrduQuery.isNotEmpty &&
              c.normUrdu.contains(normUrduQuery)) ||
          (c.rawUrdu.isNotEmpty && c.rawUrdu.contains(trimmed))) {
        if (450.0 > score) {
          score = 450.0;
          matchType = 'substring';
        }
      } else {
        for (final al in c.normAliases) {
          if (al.contains(normQuery)) {
            if (400.0 > score) {
              score = 400.0;
              matchType = 'substring';
            }
            break;
          }
        }

        if (score < 400.0) {
          var tokenScore = 0.0;
          if (queryTokens.isNotEmpty) {
            final matched =
                queryTokens.where((t) => c.allText.contains(t)).length;
            if (matched == queryTokens.length) {
              tokenScore = math.max(tokenScore, 300.0 + queryTokens.length * 20.0);
            } else if (matched > 0) {
              tokenScore = math.max(
                tokenScore,
                100.0 + (matched / queryTokens.length) * 100.0,
              );
            }
          }

          if (urduTokens.isNotEmpty) {
            final matchedUrdu =
                urduTokens.where((t) => c.allText.contains(t)).length;
            if (matchedUrdu == urduTokens.length) {
              tokenScore =
                  math.max(tokenScore, 300.0 + urduTokens.length * 20.0);
            } else if (matchedUrdu > 0) {
              tokenScore = math.max(
                tokenScore,
                100.0 + (matchedUrdu / urduTokens.length) * 100.0,
              );
            }
          }

          if (tokenScore > score) {
            score = tokenScore;
            matchType = 'token';
          }
        }
      }
    }

    // 4. Fuzzy fallback (4 <= query length <= 40)
    if (score == 0.0 && queryRuneLen >= 4 && queryRuneLen <= 40) {
      final nameRuneLen = c.normName.runes.length;
      final maxLen = math.max(queryRuneLen, nameRuneLen);
      final dist = _levenshteinDistance(normQuery, c.normName);
      final sim = 1.0 - (dist / maxLen);

      if (sim >= 0.72) {
        final fScore = 150.0 * sim;
        if (fScore > score) {
          score = fScore;
          matchType = 'fuzzy';
        }
      } else {
        // Check words in area name
        for (final w in c.normName.split(' ')) {
          final wRuneLen = w.runes.length;
          if (wRuneLen >= 4) {
            final wMax = math.max(queryRuneLen, wRuneLen);
            final wDist = _levenshteinDistance(normQuery, w);
            final wSim = 1.0 - (wDist / wMax);
            if (wSim >= 0.75) {
              final wScore = 130.0 * wSim;
              if (wScore > score) {
                score = wScore;
                matchType = 'fuzzy';
              }
              break;
            }
          }
        }

        // Check aliases
        if (score == 0.0) {
          for (final al in c.normAliases) {
            final alRuneLen = al.runes.length;
            if (alRuneLen >= 3) {
              final alMax = math.max(queryRuneLen, alRuneLen);
              final alDist = _levenshteinDistance(normQuery, al);
              final alSim = 1.0 - (alDist / alMax);
              if (alSim >= 0.75) {
                final alScore = 120.0 * alSim;
                if (alScore > score) {
                  score = alScore;
                  matchType = 'fuzzy';
                }
                break;
              }
            }
          }
        }
      }
    }

    if (score > 0.0) {
      scored.add(SearchResult(
        area: c.area,
        score: score,
        matchType: matchType,
      ));
    }
  }

  scored.sort((a, b) {
    final cmp = b.score.compareTo(a.score);
    if (cmp != 0) return cmp;
    return a.area.name.compareTo(b.area.name);
  });

  if (effectiveLimit > 0 && scored.length > effectiveLimit) {
    return scored.sublist(0, effectiveLimit);
  }

  return scored;
}
