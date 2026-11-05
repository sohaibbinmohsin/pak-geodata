package pakgeodata

import (
	"sort"
	"strings"
	"sync"
)

// CityColloquialAliases maps city IDs to commonly used abbreviations, nicknames, and Urdu phrases.
var CityColloquialAliases = map[string][]string{
	"karachi":      {"khi", "khi city", "city of lights", "عروس البلاد"},
	"lahore":       {"lhe", "lhr", "lahore city", "heart of pakistan", "زندہ دلان لاہور"},
	"islamabad":    {"isb", "federal capital", "ict", "capital territory"},
	"rawalpindi":   {"pindi", "rwp", "twin city"},
	"faisalabad":   {"fsd", "lyallpur", "manchester of pakistan"},
	"multan":       {"mux", "mul", "city of saints", "madinat-ul-auliya"},
	"peshawar":     {"pew", "psh", "city of flowers"},
	"quetta":       {"qta", "fruit garden of pakistan"},
	"gujranwala":   {"gwa", "city of wrestlers", "pehlwanon ka shehar"},
	"sialkot":      {"skt", "city of iqbal"},
	"hyderabad":    {"hdd", "hyd"},
	"abbottabad":   {"atd", "city of pines"},
	"bahawalpur":   {"bhv", "bwp", "princely state"},
	"sargodha":     {"sgd", "city of eagles", "shaheenon ka shehar"},
	"sukkur":       {"skz"},
	"gwadar":       {"gwd"},
	"skardu":       {"kdu"},
	"gilgit":       {"gil"},
	"muzaffarabad": {"mzd"},
	"mirpur":       {"mpr"},
}

// ToWesternDigits converts Eastern Arabic-Indic (۰-۹) and Standard Arabic-Indic (٠-٩)
// numerals to standard Western ASCII digits (0-9).
func ToWesternDigits(text string) string {
	var b strings.Builder
	b.Grow(len(text))
	for _, r := range text {
		switch {
		case r >= '\u06F0' && r <= '\u06F9': // Eastern Arabic-Indic (Urdu/Persian)
			b.WriteRune('0' + (r - '\u06F0'))
		case r >= '\u0660' && r <= '\u0669': // Standard Arabic-Indic
			b.WriteRune('0' + (r - '\u0660'))
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

// StripUrduDiacritics removes Arabic/Urdu diacritical marks (Tashkeel), Tatweel, and Superscript Alef.
func StripUrduDiacritics(text string) string {
	var b strings.Builder
	b.Grow(len(text))
	for _, r := range text {
		// \u0640 = Tatweel, \u064B-\u065F = Tashkeel (aerab), \u0670 = Superscript Alef
		if r == '\u0640' || (r >= '\u064B' && r <= '\u065F') || r == '\u0670' {
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

// NormalizeUrduText applies standard Urdu NLP normalization rules:
// - Strips Tashkeel diacritics and Tatweel
// - Normalizes Alef variations (آ, أ, إ, ٱ) -> ا
// - Normalizes Yeh variations (ي, ى, ئ, ے) -> ی
// - Normalizes Kaf variations (ك) -> ک
// - Normalizes Heh variations (ة, ھ, ه) -> ہ
// - Converts Eastern Arabic-Indic numerals to Western digits
// - Trims and normalizes whitespace
func NormalizeUrduText(text string) string {
	if text == "" {
		return ""
	}
	stripped := StripUrduDiacritics(text)

	var b strings.Builder
	b.Grow(len(stripped))
	for _, r := range stripped {
		switch r {
		// Alef variations
		case '\u0622', '\u0623', '\u0625', '\u0671':
			b.WriteRune('\u0627')
		// Yeh variations
		case '\u064A', '\u0649', '\u0626', '\u06D2':
			b.WriteRune('\u06CC')
		// Kaf variations
		case '\u0643':
			b.WriteRune('\u06A9')
		// Heh variations
		case '\u0629', '\u06BE', '\u0647':
			b.WriteRune('\u06C1')
		default:
			b.WriteRune(r)
		}
	}

	result := ToWesternDigits(b.String())
	return strings.Join(strings.Fields(result), " ")
}

func normalizeString(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range strings.ToLower(s) {
		if r == '-' || r == '_' || r == '.' || r == ',' || r == '/' {
			b.WriteRune(' ')
		} else {
			b.WriteRune(r)
		}
	}
	return strings.Join(strings.Fields(b.String()), " ")
}

func levenshteinDistance(a, b string) int {
	ar := []rune(a)
	br := []rune(b)
	la := len(ar)
	lb := len(br)

	if la == 0 {
		return lb
	}
	if lb == 0 {
		return la
	}

	dp := make([]int, lb+1)
	for j := 0; j <= lb; j++ {
		dp[j] = j
	}

	for i := 1; i <= la; i++ {
		prev := dp[0]
		dp[0] = i
		for j := 1; j <= lb; j++ {
			temp := dp[j]
			if ar[i-1] == br[j-1] {
				dp[j] = prev
			} else {
				minVal := dp[j-1]
				if dp[j] < minVal {
					minVal = dp[j]
				}
				if prev < minVal {
					minVal = prev
				}
				dp[j] = minVal + 1
			}
			prev = temp
		}
	}
	return dp[lb]
}

type normalizedCandidate struct {
	area        Area
	normName    string
	normID      string
	normUrdu    string
	rawUrdu     string
	normAliases []string
	allText     string
}

var (
	searchInitOnce         sync.Once
	normalizedCandidates   []normalizedCandidate
	normalizedByCityMap    map[string][]normalizedCandidate
)

func initSearchData() {
	searchInitOnce.Do(func() {
		initData()
		normalizedByCityMap = make(map[string][]normalizedCandidate)

		for _, a := range areas {
			normName := normalizeString(a.Name)
			normID := normalizeString(a.ID)
			rawUrdu := strings.TrimSpace(a.UrduName)
			normUrdu := NormalizeUrduText(a.UrduName)

			var normAliases []string
			for _, al := range a.Aliases {
				normAliases = append(normAliases, normalizeString(al))
			}

			if cityAliases, ok := CityColloquialAliases[a.CityID]; ok {
				for _, cal := range cityAliases {
					normAliases = append(normAliases, normalizeString(cal))
				}
			}

			allParts := []string{normName, normID, strings.Join(normAliases, " "), normUrdu, rawUrdu}
			allText := strings.TrimSpace(strings.Join(allParts, " "))

			c := normalizedCandidate{
				area:        a,
				normName:    normName,
				normID:      normID,
				normUrdu:    normUrdu,
				rawUrdu:     rawUrdu,
				normAliases: normAliases,
				allText:     allText,
			}

			normalizedCandidates = append(normalizedCandidates, c)
			cityKey := strings.ToLower(strings.TrimSpace(a.CityID))
			normalizedByCityMap[cityKey] = append(normalizedByCityMap[cityKey], c)
		}
	})
}

// SearchAreas searches Pakistan areas using structured matching and ranking:
// Exact match > Prefix match > Urdu match > Alias match > Substring / Token match > Fuzzy match.
func SearchAreas(query string, opts SearchOptions) []SearchResult {
	trimmed := strings.TrimSpace(query)
	if trimmed == "" {
		return []SearchResult{}
	}

	initSearchData()

	normQuery := normalizeString(trimmed)
	normUrduQuery := NormalizeUrduText(trimmed)
	queryTokens := strings.Fields(normQuery)
	urduTokens := strings.Fields(normUrduQuery)

	var pool []normalizedCandidate
	if opts.CityID != "" {
		cityKey := strings.ToLower(strings.TrimSpace(opts.CityID))
		pool = normalizedByCityMap[cityKey]
	} else {
		pool = normalizedCandidates
	}

	if opts.ProvinceID != "" {
		provKey := strings.ToLower(strings.TrimSpace(opts.ProvinceID))
		var filtered []normalizedCandidate
		for _, c := range pool {
			if strings.ToLower(strings.TrimSpace(c.area.ProvinceID)) == provKey {
				filtered = append(filtered, c)
			}
		}
		pool = filtered
	}

	if len(pool) == 0 {
		return []SearchResult{}
	}

	type scoredItem struct {
		candidate normalizedCandidate
		score     float64
	}
	var scored []scoredItem

	queryRuneLen := len([]rune(normQuery))

	for _, c := range pool {
		var score float64

		// 1. Exact matches
		if c.normName == normQuery {
			score = 1000.0
		} else if c.normID == normQuery {
			score = 950.0
		} else if (c.normUrdu != "" && c.normUrdu == normUrduQuery) || (c.rawUrdu != "" && c.rawUrdu == trimmed) {
			score = 900.0
		} else {
			for _, al := range c.normAliases {
				if al == normQuery {
					score = 850.0
					break
				}
			}
		}

		// 2. Prefix matches
		if score < 800.0 {
			if strings.HasPrefix(c.normName, normQuery) {
				ratio := float64(len(normQuery)) / float64(len(c.normName))
				pScore := 700.0 + ratio*50.0
				if pScore > score {
					score = pScore
				}
			} else if (c.normUrdu != "" && normUrduQuery != "" && strings.HasPrefix(c.normUrdu, normUrduQuery)) ||
				(c.rawUrdu != "" && strings.HasPrefix(c.rawUrdu, trimmed)) {
				if 650.0 > score {
					score = 650.0
				}
			} else {
				for _, al := range c.normAliases {
					if strings.HasPrefix(al, normQuery) {
						if 600.0 > score {
							score = 600.0
						}
						break
					}
				}
			}
		}

		// 3. Substring / Token matches
		if score < 600.0 {
			if strings.Contains(c.normName, normQuery) {
				if 500.0 > score {
					score = 500.0
				}
			} else if (c.normUrdu != "" && normUrduQuery != "" && strings.Contains(c.normUrdu, normUrduQuery)) ||
				(c.rawUrdu != "" && strings.Contains(c.rawUrdu, trimmed)) {
				if 450.0 > score {
					score = 450.0
				}
			} else {
				for _, al := range c.normAliases {
					if strings.Contains(al, normQuery) {
						if 400.0 > score {
							score = 400.0
						}
						break
					}
				}

				if score < 400.0 {
					var tokenScore float64
					if len(queryTokens) > 0 {
						matched := 0
						for _, t := range queryTokens {
							if strings.Contains(c.allText, t) {
								matched++
							}
						}
						if matched == len(queryTokens) {
							ts := 300.0 + float64(len(queryTokens))*20.0
							if ts > tokenScore {
								tokenScore = ts
							}
						} else if matched > 0 {
							ts := 100.0 + (float64(matched)/float64(len(queryTokens)))*100.0
							if ts > tokenScore {
								tokenScore = ts
							}
						}
					}

					if len(urduTokens) > 0 {
						matchedUrdu := 0
						for _, t := range urduTokens {
							if strings.Contains(c.allText, t) {
								matchedUrdu++
							}
						}
						if matchedUrdu == len(urduTokens) {
							ts := 300.0 + float64(len(urduTokens))*20.0
							if ts > tokenScore {
								tokenScore = ts
							}
						} else if matchedUrdu > 0 {
							ts := 100.0 + (float64(matchedUrdu)/float64(len(urduTokens)))*100.0
							if ts > tokenScore {
								tokenScore = ts
							}
						}
					}

					if tokenScore > score {
						score = tokenScore
					}
				}
			}
		}

		// 4. Fuzzy fallback (4 <= query length <= 40)
		if score == 0.0 && queryRuneLen >= 4 && queryRuneLen <= 40 {
			nameRuneLen := len([]rune(c.normName))
			maxLen := queryRuneLen
			if nameRuneLen > maxLen {
				maxLen = nameRuneLen
			}
			dist := levenshteinDistance(normQuery, c.normName)
			sim := 1.0 - float64(dist)/float64(maxLen)
			if sim >= 0.72 {
				fScore := 150.0 * sim
				if fScore > score {
					score = fScore
				}
			} else {
				// Check words in name
				for _, w := range strings.Fields(c.normName) {
					wRuneLen := len([]rune(w))
					if wRuneLen >= 4 {
						wMax := queryRuneLen
						if wRuneLen > wMax {
							wMax = wRuneLen
						}
						wDist := levenshteinDistance(normQuery, w)
						wSim := 1.0 - float64(wDist)/float64(wMax)
						if wSim >= 0.75 {
							wScore := 100.0 * wSim
							if wScore > score {
								score = wScore
							}
							break
						}
					}
				}

				// Check aliases
				if score == 0.0 {
					for _, al := range c.normAliases {
						alRuneLen := len([]rune(al))
						if alRuneLen >= 3 {
							alMax := queryRuneLen
							if alRuneLen > alMax {
								alMax = alRuneLen
							}
							alDist := levenshteinDistance(normQuery, al)
							alSim := 1.0 - float64(alDist)/float64(alMax)
							if alSim >= 0.75 {
								alScore := 120.0 * alSim
								if alScore > score {
									score = alScore
								}
								break
							}
						}
					}
				}
			}
		}

		if score > 0.0 {
			scored = append(scored, scoredItem{candidate: c, score: score})
		}
	}

	sort.Slice(scored, func(i, j int) bool {
		if scored[i].score != scored[j].score {
			return scored[i].score > scored[j].score
		}
		return scored[i].candidate.area.Name < scored[j].candidate.area.Name
	})

	results := make([]SearchResult, len(scored))
	for i, s := range scored {
		results[i] = SearchResult{
			Area:  s.candidate.area,
			Score: s.score,
		}
	}

	if opts.Limit > 0 && len(results) > opts.Limit {
		results = results[:opts.Limit]
	}

	return results
}
