<?php

declare(strict_types=1);

namespace PakGeoData;

use PakGeoData\Models\Area;
use PakGeoData\Models\SearchResult;

final class Search
{
    /**
     * Colloquial abbreviations, nicknames, and Urdu phrases mapped to city IDs.
     *
     * @var array<string, array<string>>
     */
    public const CITY_COLLOQUIAL_ALIASES = [
        'karachi' => ['khi', 'khi city', 'city of lights', 'عروس البلاد'],
        'lahore' => ['lhe', 'lhr', 'lahore city', 'heart of pakistan', 'زندہ دلان لاہور'],
        'islamabad' => ['isb', 'federal capital', 'ict', 'capital territory'],
        'rawalpindi' => ['pindi', 'rwp', 'twin city'],
        'faisalabad' => ['fsd', 'lyallpur', 'manchester of pakistan'],
        'multan' => ['mux', 'mul', 'city of saints', 'madinat-ul-auliya'],
        'peshawar' => ['pew', 'psh', 'city of flowers'],
        'quetta' => ['qta', 'fruit garden of pakistan'],
        'gujranwala' => ['gwa', 'city of wrestlers', 'pehlwanon ka shehar'],
        'sialkot' => ['skt', 'city of iqbal'],
        'hyderabad' => ['hdd', 'hyd'],
        'abbottabad' => ['atd', 'city of pines'],
        'bahawalpur' => ['bhv', 'bwp', 'princely state'],
        'sargodha' => ['sgd', 'city of eagles', 'shaheenon ka shehar'],
        'sukkur' => ['skz'],
        'gwadar' => ['gwd'],
        'skardu' => ['kdu'],
        'gilgit' => ['gil'],
        'muzaffarabad' => ['mzd'],
        'mirpur' => ['mpr'],
    ];

    /**
     * Map for converting Eastern Arabic-Indic and Standard Arabic-Indic digits to Western ASCII.
     */
    private const EASTERN_TO_WESTERN = [
        '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
        '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
        '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
        '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
    ];

    /**
     * Pre-indexed candidates pool.
     *
     * @var array<array{area: Area, normName: string, normId: string, normUrdu: string, rawUrdu: string, normAliases: array<string>, allText: string, postalCode: ?string}>|null
     */
    private static ?array $candidates = null;

    /**
     * Pre-indexed candidates partitioned by cityId.
     *
     * @var array<string, array<array{area: Area, normName: string, normId: string, normUrdu: string, rawUrdu: string, normAliases: array<string>, allText: string, postalCode: ?string}>>|null
     */
    private static ?array $candidatesByCity = null;

    private function __construct() {}

    /**
     * Converts Eastern Arabic-Indic (۰-۹) and Standard Arabic-Indic (٠-٩) numerals
     * to standard Western ASCII digits (0-9).
     */
    public static function toWesternDigits(string $text): string
    {
        return strtr($text, self::EASTERN_TO_WESTERN);
    }

    /**
     * Removes Arabic/Urdu diacritical marks (Tashkeel / aerab), Tatweel, and Superscript Alef.
     */
    public static function stripDiacritics(string $text): string
    {
        return preg_replace('/[\x{0640}\x{064B}-\x{065F}\x{0670}]/u', '', $text) ?? $text;
    }

    /**
     * Alias for stripDiacritics for cross-language compatibility.
     */
    public static function stripUrduDiacritics(string $text): string
    {
        return self::stripDiacritics($text);
    }

    /**
     * Applies standard Urdu NLP normalization rules:
     * - Strips Tashkeel diacritics and Tatweel
     * - Normalizes Alef variations (آ, أ, إ, ٱ) -> ا
     * - Normalizes Yeh variations (ي, ى, ئ, ے) -> ی
     * - Normalizes Kaf variations (ك) -> ک
     * - Normalizes Heh variations (ة, ھ, ه) -> ہ
     * - Converts Eastern Arabic-Indic numerals to Western ASCII digits
     * - Trims and normalizes whitespace
     */
    public static function normalizeUrduText(string $text): string
    {
        if ($text === '') {
            return '';
        }

        $str = self::stripDiacritics($text);
        // Alef variations: [آأإٱ] -> ا
        $str = preg_replace('/[آأإٱ]/u', 'ا', $str) ?? $str;
        // Yeh variations: [يىئے] -> ی
        $str = preg_replace('/[يىئے]/u', 'ی', $str) ?? $str;
        // Kaf variations: ك -> ک
        $str = preg_replace('/ك/u', 'ک', $str) ?? $str;
        // Heh variations: [ةھه] -> ہ
        $str = preg_replace('/[ةھه]/u', 'ہ', $str) ?? $str;
        // Eastern digits -> Western ASCII
        $str = self::toWesternDigits($str);
        // Normalize whitespace
        $trimmed = trim($str);
        return preg_replace('/\s+/u', ' ', $trimmed) ?? $trimmed;
    }

    /**
     * Normalizes an ASCII/Latin string: lowercase, punctuation to spaces, normalized spaces.
     */
    public static function normalizeString(string $s): string
    {
        $lowered = mb_strtolower($s, 'UTF-8');
        $spaced = preg_replace('/[-_.,\/]/u', ' ', $lowered) ?? $lowered;
        $trimmed = trim($spaced);
        return preg_replace('/\s+/u', ' ', $trimmed) ?? $trimmed;
    }

    /**
     * Multi-byte UTF-8 Levenshtein edit distance calculation.
     */
    public static function levenshteinDistance(string $a, string $b): int
    {
        if ($a === $b) {
            return 0;
        }

        $ar = mb_str_split($a, 1, 'UTF-8');
        $br = mb_str_split($b, 1, 'UTF-8');
        $la = count($ar);
        $lb = count($br);

        if ($la === 0) {
            return $lb;
        }
        if ($lb === 0) {
            return $la;
        }

        $dp = range(0, $lb);
        for ($i = 1; $i <= $la; $i++) {
            $prev = $dp[0];
            $dp[0] = $i;
            for ($j = 1; $j <= $lb; $j++) {
                $temp = $dp[$j];
                if ($ar[$i - 1] === $br[$j - 1]) {
                    $dp[$j] = $prev;
                } else {
                    $dp[$j] = min($dp[$j - 1], $dp[$j], $prev) + 1;
                }
                $prev = $temp;
            }
        }

        return $dp[$lb];
    }

    /**
     * Searches Pakistan areas using multi-tier ranking:
     * Exact match > Prefix match > Urdu match > Alias match > Token match > Levenshtein fuzzy match.
     *
     * @return array<SearchResult>
     */
    public static function searchAreas(
        string $query,
        ?string $cityId = null,
        int $limit = 20,
        ?string $provinceId = null
    ): array {
        $trimmed = trim($query);
        if ($trimmed === '' || $limit <= 0) {
            return [];
        }

        self::ensureCandidatesIndexed();

        $pool = self::$candidates;
        if ($cityId !== null) {
            $cityKey = strtolower(trim($cityId));
            $pool = self::$candidatesByCity[$cityKey] ?? [];
        }

        if ($provinceId !== null) {
            $provKey = strtolower(trim($provinceId));
            $filtered = [];
            foreach ($pool as $c) {
                if (strtolower(trim($c['area']->provinceId)) === $provKey) {
                    $filtered[] = $c;
                }
            }
            $pool = $filtered;
        }

        if (empty($pool)) {
            return [];
        }

        $normQuery = self::normalizeString($trimmed);
        $normUrduQuery = self::normalizeUrduText($trimmed);
        $queryTokens = array_values(array_filter(explode(' ', $normQuery), static fn(string $t): bool => $t !== ''));
        $urduTokens = array_values(array_filter(explode(' ', $normUrduQuery), static fn(string $t): bool => $t !== ''));
        $queryRuneLen = mb_strlen($normQuery, 'UTF-8');

        $scored = [];

        foreach ($pool as $c) {
            $score = 0.0;
            $matchType = 'exact';

            // 1. Exact matches
            if ($c['normName'] === $normQuery) {
                $score = 1000.0;
                $matchType = 'exact';
            } elseif ($c['normId'] === $normQuery) {
                $score = 950.0;
                $matchType = 'exact';
            } elseif (($c['normUrdu'] !== '' && $c['normUrdu'] === $normUrduQuery) ||
                ($c['rawUrdu'] !== '' && $c['rawUrdu'] === $trimmed)) {
                $score = 900.0;
                $matchType = 'urdu';
            } elseif ($c['postalCode'] !== null && $c['postalCode'] === $normQuery) {
                $score = 880.0;
                $matchType = 'exact';
            } else {
                foreach ($c['normAliases'] as $al) {
                    if ($al === $normQuery) {
                        $score = 850.0;
                        $matchType = 'alias';
                        break;
                    }
                }
            }

            // 2. Prefix matches
            if ($score < 800.0) {
                if ($normQuery !== '' && str_starts_with($c['normName'], $normQuery)) {
                    $lenRatio = mb_strlen($normQuery, 'UTF-8') / max(1, mb_strlen($c['normName'], 'UTF-8'));
                    $pScore = 700.0 + $lenRatio * 50.0;
                    if ($pScore > $score) {
                        $score = $pScore;
                        $matchType = 'prefix';
                    }
                } elseif (($c['normUrdu'] !== '' && $normUrduQuery !== '' && str_starts_with($c['normUrdu'], $normUrduQuery)) ||
                    ($c['rawUrdu'] !== '' && str_starts_with($c['rawUrdu'], $trimmed))) {
                    if (650.0 > $score) {
                        $score = 650.0;
                        $matchType = 'urdu';
                    }
                } elseif ($normQuery !== '') {
                    foreach ($c['normAliases'] as $al) {
                        if (str_starts_with($al, $normQuery)) {
                            if (600.0 > $score) {
                                $score = 600.0;
                                $matchType = 'alias';
                            }
                            break;
                        }
                    }
                }
            }

            // 3. Substring / Token matches
            if ($score < 600.0 && $normQuery !== '') {
                if (str_contains($c['normName'], $normQuery)) {
                    if (500.0 > $score) {
                        $score = 500.0;
                        $matchType = 'substring';
                    }
                } elseif (($c['normUrdu'] !== '' && $normUrduQuery !== '' && str_contains($c['normUrdu'], $normUrduQuery)) ||
                    ($c['rawUrdu'] !== '' && str_contains($c['rawUrdu'], $trimmed))) {
                    if (450.0 > $score) {
                        $score = 450.0;
                        $matchType = 'urdu';
                    }
                } else {
                    foreach ($c['normAliases'] as $al) {
                        if (str_contains($al, $normQuery)) {
                            if (400.0 > $score) {
                                $score = 400.0;
                                $matchType = 'alias';
                            }
                            break;
                        }
                    }

                    if ($score < 400.0) {
                        $tokenScore = 0.0;

                        if (!empty($queryTokens)) {
                            $matched = 0;
                            foreach ($queryTokens as $t) {
                                if (str_contains($c['allText'], $t)) {
                                    $matched++;
                                }
                            }
                            if ($matched === count($queryTokens)) {
                                $ts = 300.0 + count($queryTokens) * 20.0;
                                if ($ts > $tokenScore) {
                                    $tokenScore = $ts;
                                }
                            } elseif ($matched > 0) {
                                $ts = 100.0 + ($matched / count($queryTokens)) * 100.0;
                                if ($ts > $tokenScore) {
                                    $tokenScore = $ts;
                                }
                            }
                        }

                        if (!empty($urduTokens)) {
                            $matchedUrdu = 0;
                            foreach ($urduTokens as $t) {
                                if (str_contains($c['allText'], $t)) {
                                    $matchedUrdu++;
                                }
                            }
                            if ($matchedUrdu === count($urduTokens)) {
                                $ts = 300.0 + count($urduTokens) * 20.0;
                                if ($ts > $tokenScore) {
                                    $tokenScore = $ts;
                                }
                            } elseif ($matchedUrdu > 0) {
                                $ts = 100.0 + ($matchedUrdu / count($urduTokens)) * 100.0;
                                if ($ts > $tokenScore) {
                                    $tokenScore = $ts;
                                }
                            }
                        }

                        if ($tokenScore > $score) {
                            $score = $tokenScore;
                            $matchType = 'token';
                        }
                    }
                }
            }

            // 4. Fuzzy fallback (4 <= query length <= 40)
            if ($score === 0.0 && $queryRuneLen >= 4 && $queryRuneLen <= 40) {
                $nameRuneLen = mb_strlen($c['normName'], 'UTF-8');
                $maxLen = max($queryRuneLen, $nameRuneLen);
                $dist = self::levenshteinDistance($normQuery, $c['normName']);
                $sim = 1.0 - ($dist / max(1, $maxLen));

                if ($sim >= 0.72) {
                    $fScore = 150.0 * $sim;
                    if ($fScore > $score) {
                        $score = $fScore;
                        $matchType = 'fuzzy';
                    }
                } else {
                    // Check individual words in area name
                    $words = explode(' ', $c['normName']);
                    foreach ($words as $w) {
                        $wRuneLen = mb_strlen($w, 'UTF-8');
                        if ($wRuneLen >= 4) {
                            $wMax = max($queryRuneLen, $wRuneLen);
                            $wDist = self::levenshteinDistance($normQuery, $w);
                            $wSim = 1.0 - ($wDist / max(1, $wMax));
                            if ($wSim >= 0.75) {
                                $wScore = 100.0 * $wSim;
                                if ($wScore > $score) {
                                    $score = $wScore;
                                    $matchType = 'fuzzy';
                                }
                                break;
                            }
                        }
                    }

                    // Check aliases
                    if ($score === 0.0) {
                        foreach ($c['normAliases'] as $al) {
                            $alRuneLen = mb_strlen($al, 'UTF-8');
                            if ($alRuneLen >= 3) {
                                $alMax = max($queryRuneLen, $alRuneLen);
                                $alDist = self::levenshteinDistance($normQuery, $al);
                                $alSim = 1.0 - ($alDist / max(1, $alMax));
                                if ($alSim >= 0.75) {
                                    $alScore = 120.0 * $alSim;
                                    if ($alScore > $score) {
                                        $score = $alScore;
                                        $matchType = 'fuzzy';
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if ($score > 0.0) {
                $scored[] = [
                    'area' => $c['area'],
                    'score' => $score,
                    'matchType' => $matchType,
                ];
            }
        }

        // Sort descending by score, tie-break ascending by Area name
        usort($scored, static function (array $a, array $b): int {
            if ($b['score'] !== $a['score']) {
                return $b['score'] <=> $a['score'];
            }
            return strcmp($a['area']->name, $b['area']->name);
        });

        if ($limit > 0 && count($scored) > $limit) {
            $scored = array_slice($scored, 0, $limit);
        }

        $results = [];
        foreach ($scored as $item) {
            $results[] = new SearchResult(
                area: $item['area'],
                score: (float) $item['score'],
                matchType: (string) $item['matchType']
            );
        }

        return $results;
    }

    /**
     * Lazily builds the normalized in-memory index for fast keystroke searching.
     */
    private static function ensureCandidatesIndexed(): void
    {
        if (self::$candidates !== null) {
            return;
        }

        $areas = PakGeoData::getAllAreas();
        $candidates = [];
        $byCity = [];

        foreach ($areas as $area) {
            $normName = self::normalizeString($area->name);
            $normId = self::normalizeString($area->id);
            $rawUrdu = trim($area->urduName ?? '');
            $normUrdu = self::normalizeUrduText($area->urduName ?? '');

            $normAliases = [];
            foreach ($area->aliases as $alias) {
                $normAliases[] = self::normalizeString($alias);
            }

            $cityKey = strtolower(trim($area->cityId));
            if (isset(self::CITY_COLLOQUIAL_ALIASES[$cityKey])) {
                foreach (self::CITY_COLLOQUIAL_ALIASES[$cityKey] as $cAlias) {
                    $normAliases[] = self::normalizeString($cAlias);
                }
            }

            $postalCode = null;
            if ($area->postalCode !== null && $area->postalCode !== '') {
                $postalCode = trim($area->postalCode);
                $normAliases[] = $postalCode;
            }

            $allParts = array_filter(
                [$normName, $normId, implode(' ', $normAliases), $normUrdu, $rawUrdu],
                static fn(string $p): bool => $p !== ''
            );
            $allText = implode(' ', $allParts);

            $cand = [
                'area' => $area,
                'normName' => $normName,
                'normId' => $normId,
                'normUrdu' => $normUrdu,
                'rawUrdu' => $rawUrdu,
                'normAliases' => $normAliases,
                'allText' => $allText,
                'postalCode' => $postalCode,
            ];

            $candidates[] = $cand;
            $byCity[$cityKey][] = $cand;
        }

        self::$candidates = $candidates;
        self::$candidatesByCity = $byCity;
    }
}
