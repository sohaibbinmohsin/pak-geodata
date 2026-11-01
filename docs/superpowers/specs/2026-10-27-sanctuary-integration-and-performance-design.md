# Sanctuary Integration & Production Performance Design

**Date:** 2026-10-27  
**Status:** In Review  
**Target Package:** `pak-geodata` (v0.2.0)  
**Consumer App:** Sanctuary Emergency Rescue Platform (`/report`, `/report/track/:reportNumber`)

---

## 1. Executive Summary & Goals

Sanctuary is an offline-capable emergency rescue reporting and tracking Progressive Web App (PWA) operating across Pakistan. Sanctuary requires:
1. **Bilingual Administrative Hierarchy (`PakLocationItem`)**: Unified data contract with English/Urdu strings and parent-child linkage across provinces, cities/districts, and areas.
2. **Standardized English Storage with Localized Display**: Ability to persist canonical English keys in SQLite / PowerSync / Postgres (`city: "Lahore"`, `location_area: "Gulberg"`) while presenting native Urdu or English names to users in real time.
3. **Resilient O(1) Key Lookups**: Instant resolution via `getCityName(key, lang)` and `getAreaName(cityKey, areaKey, lang)` supporting case-insensitive slugs, title-cased names, and aliases with zero linear scanning overhead.
4. **Urdu Script & Numeral Normalization**: Seamless search matching across Eastern/Western Arabic numerals (`۳` vs `3`), Urdu letter variants (`ي` vs `ی`, `ك` vs `ک`), and diacritics/tashkeel.
5. **Offline-First PWA Code Splitting**: A dedicated `pak-geodata/hierarchy` subpath export (< 5 KB gzipped) containing administrative boundaries and city lookups with zero neighborhood area bloat, preserving `pak-geodata/areas/<city>` for on-demand loading.

---

## 2. Layered Architecture

To preserve `pak-geodata`'s speed as a low-level GIS engine while giving application developers ergonomic tools, the package is structured into two non-colliding layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 2: Application, Localization & PWA Hierarchy Layer              │
│  - PakLocationItem & toLocationItem() converters                       │
│  - getCityName(key, lang) & getAreaName(cityKey, areaKey, lang)        │
│  - searchAreas(cityKey, query, lang) [Overloaded]                      │
│  - searchLocationItems(cityKey, query, lang)                           │
│  - getProvincesAsLocationItems(), getCitiesAsLocationItems()           │
│  - Urdu script & numeral normalization (urdu.ts)                       │
│  - Subpath: pak-geodata/hierarchy (< 5 KB PWA load)                    │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 1: Low-Level GIS Core Engine (Zero Overhead)                    │
│  - Raw datasets: provinces (7), cities (40), areas (189)               │
│  - Pre-tokenized O(1) candidate lookup & spatial bounding box pruning   │
│  - Spatial math: haversineDistanceKm, nearest area calculation         │
│  - Postal code index: findAreaByPostalCode()                           │
│  - Subpath: pak-geodata/areas/<city>                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Types & Hierarchy Interface (`packages/npm/src/types.ts`)

```ts
export type PakLocationType = 'province' | 'division' | 'district' | 'tehsil' | 'area';

export interface PakLocationItem {
  id: string;
  nameEn: string;      // e.g. "Lahore", "Gulberg III", "Saddar"
  nameUr: string;      // e.g. "لاہور", "گلبرگ ۳", "صدر"
  type: PakLocationType;
  parentId?: string;   // Hierarchy linking: area -> cityId -> provinceId
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Strict union types for enhanced IDE autocomplete
export type ProvinceId =
  | 'punjab'
  | 'sindh'
  | 'khyber-pakhtunkhwa'
  | 'balochistan'
  | 'islamabad-ict'
  | 'azad-jammu-kashmir'
  | 'gilgit-baltistan';

export type CityId =
  | 'lahore'
  | 'karachi'
  | 'islamabad'
  | 'rawalpindi'
  | 'faisalabad'
  | (string & {}); // Non-breaking extensible string
```

### 3.2 Urdu Normalization Engine (`packages/npm/src/urdu.ts`)

Field data and mobile keyboards introduce character inconsistencies. The normalizer runs in O(N) single-pass regex and character mapping:
1. **Numeral Unification**: Maps Eastern Arabic numerals `۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹` to Western ASCII digits `0 1 2 3 4 5 6 7 8 9` (and supports bidirectional matching).
2. **Letter Normalization**:
   - Arabic Yeh (`ي`, U+064A) and Alef Maksura (`ى`, U+0649) $\rightarrow$ Urdu Yeh (`ی`, U+06CC)
   - Arabic Kaf (`ك`, U+0643) $\rightarrow$ Urdu Keheh (`ک`, U+06A9)
   - Arabic Heh (`ه`, U+0647) $\rightarrow$ Urdu Goal Heh (`ہ`, U+06C1)
   - Do Chashmi Heh (`ھ`, U+06BE) is preserved for aspirated letters.
3. **Aerab / Diacritic Stripping**:
   - Removes Zabar, Zer, Pesh, Tanween, Tashdeed, and Sukun (`[\u064B-\u065F\u0670]`).

### 3.3 High-Performance O(1) Lookups (`packages/npm/src/hierarchy.ts`)

To prevent linear iterations when rendering tabular incident lists in Sanctuary:
1. **City Lookup Map (`cityLookupMap`)**:
   - Indexed by lowercase canonical ID (e.g. `'lahore'`).
   - Indexed by lowercase English name (e.g. `'lahore'`).
   - Allows `getCityName("Lahore", "ur")`, `getCityName("lahore", "ur")`, and `getCityName("Lahore", "en")` to resolve in O(1) time.
2. **Compound Area Lookup Map (`areaCompoundLookupMap`)**:
   - Keyed by `${cityKey}:${areaKey}` in normalized form.
   - Indexes:
     - `${cityId}:${area.id}`
     - `${cityId}:${area.name.toLowerCase()}`
     - `${cityId}:${alias.toLowerCase()}` for every alias.
     - Also indexed by English city name `${cityName.toLowerCase()}:${...}`.
   - Allows `getAreaName("Lahore", "Gulberg", "ur")` and `getAreaName("lahore", "lahore-gulberg-iii", "en")` to return instantly.
   - Falls back gracefully to `areaKey` if an area is unverified or custom-entered.

### 3.4 Overloaded `searchAreas` & `searchLocationItems`

Sanctuary specifies:
```ts
searchAreas(cityKey: string, query: string, lang: 'en' | 'ur'): PakLocationItem[]
```
Existing consumers use:
```ts
searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[]
```
**Solution**: Function overloading with runtime type-check on argument 1:
- If `typeof arg1 === 'string'`, it routes to the Sanctuary bilingual helper, filters candidates by `cityKey` using the O(1) pre-indexed city pool, and converts matches to `PakLocationItem[]`.
- If `typeof arg1 !== 'string'` (e.g. object or omitted), it routes to standard `PakistanArea[]` search.
- We also export `searchLocationItems(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[]` as an explicit named function.

### 3.5 Search Pre-Normalization (`packages/npm/src/search.ts`)

Instead of repeatedly executing `normalizeString(area.name)` inside loop iterations for each keystroke, candidate areas are pre-processed at module load:
- Pre-computed `normalizedName`, `normalizedId`, `normalizedUrdu`, `normalizedAliases`, and pre-split token sets.
- During search, only the incoming `query` is normalized, followed by direct array/set comparisons.

### 3.6 Spatial Reverse-Geocoding Pruning (`packages/npm/src/geo.ts`)

When `getNearestArea(coords)` is called without a `cityId`:
- First checks `isPointInBoundingBox(coords, city.bounds)` against the 40 cities.
- If a city contains the point, candidate areas are restricted to that city before calculating Haversine distance.
- Falls back to the global pool only if the point is outside all city bounding boxes.

### 3.7 Lightweight PWA Subpath (`pak-geodata/hierarchy`)

Updated `packages/npm/package.json`:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./hierarchy": {
      "types": "./dist/hierarchy.d.ts",
      "import": "./dist/hierarchy.js",
      "require": "./dist/hierarchy.cjs"
    },
    "./areas/*": {
      "types": "./dist/areas/*.d.ts",
      "import": "./dist/areas/*.js",
      "require": "./dist/areas/*.cjs"
    }
  }
}
```
Build script compiles:
- `dist/index.{js,cjs,d.ts}`
- `dist/hierarchy.{js,cjs,d.ts}`
- `dist/areas/*.{js,cjs,d.ts}`

---

## 4. Verification & Testing Strategy

1. **Hierarchy & Adapter Tests (`packages/npm/tests/hierarchy.test.ts`)**:
   - `getCityName` resolves `"lahore"` and `"Lahore"` in `'en'` $\rightarrow$ `"Lahore"`, `'ur'` $\rightarrow$ `"لاہور"`.
   - `getCityName` returns input fallback for unverified key.
   - `getAreaName` resolves `"Lahore"` + `"Gulberg"` in `'ur'` $\rightarrow$ `"گلبرگ ۳"`.
   - `getAreaName` returns fallback for unknown area.
   - `toLocationItem` accurately produces `PakLocationItem` with correct `type` and `parentId`.
   - `getProvincesAsLocationItems()` and `getCitiesAsLocationItems()` return properly typed hierarchies.
2. **Urdu Normalization Tests (`packages/npm/tests/urdu.test.ts`)**:
   - Normalization of Eastern numerals `گلبرگ ۳` $\rightarrow$ matches `3`.
   - Normalization of Arabic Yeh (`ي`) and Kaf (`ك`).
   - Diacritic stripping (`لَاہَوْر` $\rightarrow$ `لاہور`).
3. **Overloaded `searchAreas` Tests (`packages/npm/tests/search_overload.test.ts`)**:
   - Invocation with `(cityKey, query, lang)` returns `PakLocationItem[]`.
   - Invocation with `(query, options)` returns `PakistanArea[]`.
4. **Bundle Verification**:
   - `dist/hierarchy.js` and `dist/hierarchy.cjs` size verification (< 15 KB unminified, < 5 KB gzipped).
   - Full monorepo build (`npm run build`) and test suite (`npm test`) exits with code 0.
