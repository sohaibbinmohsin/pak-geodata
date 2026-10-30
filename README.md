# pak-geodata

[![NPM Version](https://img.shields.io/npm/v/pak-geodata?color=blue)](https://www.npmjs.com/package/pak-geodata)
[![PyPI Version](https://img.shields.io/pypi/v/pak-geodata?color=green)](https://pypi.org/project/pak-geodata/)
[![Live Interactive Demo](https://img.shields.io/badge/Live%20Demo-Interactive%20Map-blue?logo=leaflet&color=10B981)](https://sohaibbinmohsin.github.io/pak-geodata/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade geospatial foundation for Pakistan.

It provides offline access to verified geographic datasets for Pakistan's provinces, territories, cities, and metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers), distributed simultaneously for **TypeScript/Node.js** and **Python** with **zero runtime dependencies**.

Explore the [Live Interactive Demo](https://sohaibbinmohsin.github.io/pak-geodata/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

---

## Why pak-geodata Exists

Developers building address autocompletion, checkout forms, delivery routing, real estate platforms, or logistics applications in Pakistan face chronic data problems:
- **No standardized administrative hierarchy**: Inconsistent city and area naming across platforms.
- **Missing or inaccurate coordinates**: Approximate pins that land kilometers away from actual neighborhoods.
- **High latency and expensive APIs**: Reliance on Google Maps or Mapbox geocoding APIs for static neighborhood queries.
- **Duplicate and inconsistent data**: Variations like "DHA 5", "DHA Phase V", "Defence Phase 5", and "ڈی ایچ اے فیز 5" treated as disparate entities.
- **Absence of official postal code mappings**: Disconnected Pakistan Post data and lacking reverse lookup.

`pak-geodata` solves this with an offline, typed, curated dataset that enforces canonical slugs, multi-script aliases, and 3-tier spatial triangulation.

---

## Core Highlights

- ⚡ **Zero Runtime Dependencies**: Both NPM and PyPI client libraries require 0 external dependencies (pure JS/TS and Python standard library).
- 📦 **Dual Distribution**: Native first-class support for both Node.js/TypeScript (`npm install pak-geodata`) and Python (`pip install pak-geodata`).
- 🌐 **Offline and Self-Contained**: 100% bundled data: perform lookups, spatial radius checks, and searches in sub-millisecond time with no network requests.
- 🎯 **Strict Geofencing**: All coordinates strictly validated within Pakistan's bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`) and city district boundaries.
- 🏷️ **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` format (e.g. `lahore-dha-phase-5`, `karachi-clifton-block-2`).
- 🔍 **Multi-Script and Alias Search**: Ranks results across exact match, prefix match, Urdu script (`"گلبرگ"`), colloquial aliases (`"dha 5"`), token match, and fuzzy Levenshtein distance.
- 📍 **Spatial Reverse Geocoding**: Nearest neighbor resolution via spherical Haversine formula (`getNearestArea` / `get_nearest_area`).
- 📮 **Pakistan Post Codes**: 5-digit postal code resolution and reverse lookups.
- 🌲 **Tree-Shakeable Subpaths**: Modular imports like `pak-geodata/areas/lahore` load only the desired city data (~15 to 26 KB).
- 🏛️ **Bilingual Hierarchy & PWA Subpath**: Complete province $\rightarrow$ district $\rightarrow$ area hierarchy (`PakLocationItem`) and ultra-lightweight `< 5 KB` gzipped subpath export (`pak-geodata/hierarchy`) designed for emergency rescue PWAs.
- 🗺️ **Live Interactive Web Demo**: Explore the [Live Interactive Demo](https://sohaibbinmohsin.github.io/pak-geodata/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

---

## Installation

### TypeScript / JavaScript (Node.js, Deno, Bun, Browser)
```bash
npm install pak-geodata
# or
yarn add pak-geodata
# or
pnpm add pak-geodata
```

### Python (3.9+)
```bash
pip install pak-geodata
# or
poetry add pak-geodata
```

---

## Dataset Statistics

| Administrative Level | Count | Coverage | Key Details |
| :--- | :--- | :--- | :--- |
| **Provinces & Territories** | **7** | 100% of Pakistan | Punjab, Sindh, KPK, Balochistan, Islamabad (ICT), Azad Jammu & Kashmir (AJK), Gilgit-Baltistan |
| **Verified Cities** | **40** | Major Urban Centers | District centroids, bounding boxes, administrative divisions, 5-digit postal code ranges |
| **Flagship Metros Areas** | **189** | Phase 1 (In Progress) | Foundational areas across Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad |

---

## The 40 Verified Cities

### What does a "verified city" mean?
Every one of the 40 cities in `pak-geodata` has undergone municipal boundary verification. Each entry provides:
1. **Centroid Coordinates**: Accurate GPS coordinates for the city center.
2. **District Bounding Box (`bounds`)**: Strict geofencing limits (`minLat`, `maxLat`, `minLng`, `maxLng`) representing the greater urban municipal district.
3. **Administrative Division**: Official provincial division mapping (e.g. Lahore Division, Karachi Division, Hazara Division).
4. **Pakistan Post Range (`postalCodeRange`)**: Official 5-digit postal code boundaries (e.g. `["54000", "54999"]` for Lahore).

This enables developers to immediately geofence incoming coordinates, filter areas with `cityId`, and validate shipping addresses offline.

### Complete List of the 40 Verified Cities

- **Punjab (14 cities)**:
  - Lahore (`lahore`)
  - Rawalpindi (`rawalpindi`)
  - Faisalabad (`faisalabad`)
  - Multan (`multan`)
  - Gujranwala (`gujranwala`)
  - Sialkot (`sialkot`)
  - Bahawalpur (`bahawalpur`)
  - Sargodha (`sargodha`)
  - Gujrat (`gujrat`)
  - Sheikhupura (`sheikhupura`)
  - Sahiwal (`sahiwal`)
  - Jhelum (`jhelum`)
  - Kasur (`kasur`)
  - Rahim Yar Khan (`rahim-yar-khan`)
- **Sindh (6 cities)**:
  - Karachi (`karachi`)
  - Hyderabad (`hyderabad`)
  - Sukkur (`sukkur`)
  - Larkana (`larkana`)
  - Nawabshah (`nawabshah`)
  - Mirpur Khas (`mirpur-khas`)
- **Khyber Pakhtunkhwa (6 cities)**:
  - Peshawar (`peshawar`)
  - Abbottabad (`abbottabad`)
  - Mardan (`mardan`)
  - Mingora / Swat (`mingora`)
  - Kohat (`kohat`)
  - Dera Ismail Khan (`dera-ismail-khan`)
- **Balochistan (5 cities)**:
  - Quetta (`quetta`)
  - Gwadar (`gwadar`)
  - Turbat (`turbat`)
  - Khuzdar (`khuzdar`)
  - Hub (`hub`)
- **Islamabad Capital Territory (1 city)**:
  - Islamabad (`islamabad`)
- **Azad Jammu & Kashmir (4 cities)**:
  - Muzaffarabad (`muzaffarabad`)
  - Mirpur (`mirpur`)
  - Rawalakot (`rawalakot`)
  - Kotli (`kotli`)
- **Gilgit-Baltistan (4 cities)**:
  - Gilgit (`gilgit`)
  - Skardu (`skardu`)
  - Karimabad / Hunza (`karimabad-hunza`)
  - Chilas (`chilas`)

---

## Flagship Metropolitan Areas (Phase 1: In Progress)

Phase 1 is currently **in progress**. While we have established an initial core of 189 triangulated foundational areas across Pakistan's 5 largest metropolitan economies, active work is underway to expand coverage across all sectors, housing societies, commercial markets, industrial estates, and historic quarters.

### Current Phase 1 Foundation (189 Areas):
- **Karachi** (`51 areas`): Clifton (Blocks 1-9), DHA (Phases 1-8), Gulshan-e-Iqbal, North Nazimabad, PECHS, Saddar, KDA Scheme 1, Malir Cantt, Gulistan-e-Johar, Bahadurabad, etc.
- **Lahore** (`50 areas`): Gulberg (I-V), DHA (Phases 1-9), Model Town (Blocks A-M), Johar Town (Phases 1-2), Bahria Town (Sectors A-F), Cantt, Faisal Town, Garden Town, Shadman, Wapda Town, etc.
- **Islamabad** (`36 areas`): CDA Sectors F-6, F-7, F-8, F-10, F-11, G-6 to G-13, H-8, H-9, H-11, I-8, I-9, I-10, Diplomatic Enclave, Blue Area, DHA Islamabad, Bahria Town Islamabad, etc.
- **Rawalpindi** (`28 areas`): Bahria Town (Phases 1-8), Satellite Town (Blocks A-F), Saddar, Westridge (I-III), Chaklala Scheme (I-III), Askari (I-XIV), Peshawar Road, Gulraiz, etc.
- **Faisalabad** (`24 areas`): Madina Town, Peoples Colony (No. 1-2), D Ground, Ghulam Muhammad Abad, Kohinoor City, Civil Lines, Millat Town, Samanabad, Gulberg, Eden Valley, etc.

---

## Quickstart

### TypeScript / JavaScript

```typescript
import {
  getAllProvinces,
  getProvinceById,
  getAllCities,
  getCitiesByProvince,
  getCityById,
  getAreasByCity,
  searchAreas,
  getNearestArea,
  findAreaByPostalCode,
  haversineDistanceKm
} from 'pak-geodata';

// 1. Lookups
const punjab = getProvinceById('punjab');
console.log(punjab?.name, punjab?.urduName); // "Punjab", "پنجاب"

const lahore = getCityById('lahore');
console.log(`${lahore?.name} has ${lahore?.totalAreasCount} verified areas`);

const lahoreAreas = getAreasByCity('lahore');
console.log(`First area: ${lahoreAreas[0].name}`);

// 2. Intelligent Multi-Script & Alias Search
// Ranked by: Exact > Prefix > Alias > Token > Fuzzy
const results = searchAreas('dha 5', { cityId: 'lahore' });
console.log(results[0].name); // "DHA Phase 5"
console.log(results[0].id);   // "lahore-dha-phase-5"

// Search via Urdu script
const urduMatches = searchAreas('کلفٹن');
console.log(urduMatches[0].name); // "Clifton Block 1"

// 3. Reverse Geocoding / Nearest Area
const userCoords = { lat: 31.4581, lng: 74.4121 };
const nearest = getNearestArea(userCoords, { cityId: 'lahore', maxDistanceKm: 5 });
console.log(`Nearest: ${nearest?.name} (${nearest?.postalCode})`);

// 4. Postal Code Resolution
const postalArea = findAreaByPostalCode('54000');
console.log(`Postal Code 54000: ${postalArea?.name}`);

// 5. Great-Circle Distance
const distKm = haversineDistanceKm(
  { lat: 31.5204, lng: 74.3587 }, // Lahore Center
  { lat: 24.8607, lng: 67.0011 }  // Karachi Center
);
console.log(`Distance: ${Math.round(distKm)} km`); // ~1025 km
```

#### Subpath Tree-Shaking (Browser Optimization)

Load only the areas for a single city without bundling the rest of the dataset:

```typescript
// Bundle size: ~24 KB (Lahore only)
import { lahoreAreas } from 'pak-geodata/areas/lahore';

// Bundle size: ~26 KB (Karachi only)
import { karachiAreas } from 'pak-geodata/areas/karachi';

// Lightweight PWA Administrative Hierarchy (< 5 KB gzipped)
import { getCityName, getAreaName, getProvincesAsLocationItems, getCitiesAsLocationItems } from 'pak-geodata/hierarchy';

// Available subpaths:
// pak-geodata/hierarchy (Administrative boundaries, O(1) bilingual lookups, zero area bloat)
// pak-geodata/areas/lahore
// pak-geodata/areas/karachi
// pak-geodata/areas/islamabad
// pak-geodata/areas/rawalpindi
// pak-geodata/areas/faisalabad
```

---

### Python

```python
from pak_geodata import (
    get_all_provinces,
    get_province_by_id,
    get_all_cities,
    get_cities_by_province,
    get_city_by_id,
    get_areas_by_city,
    search_areas,
    get_nearest_area,
    find_area_by_postal_code,
    haversine_distance_km,
    Coordinates,
)

# 1. Lookups
sindh = get_province_by_id("sindh")
print(sindh.name, sindh.urdu_name)  # "Sindh", "سندھ"

karachi = get_city_by_id("karachi")
print(f"{karachi.name} total areas: {karachi.total_areas_count}")

khi_areas = get_areas_by_city("karachi")
print(f"Loaded {len(khi_areas)} areas in Karachi")

# 2. Intelligent Multi-Script & Alias Search
results = search_areas("dha 5", city_id="lahore")
print(results[0].name)  # "DHA Phase 5"
print(results[0].id)    # "lahore-dha-phase-5"

# Search in Urdu
results = search_areas("ماڈل ٹاؤن")
for r in results:
    print(f"{r.name} ({r.urdu_name}) in {r.city_id}")

# 3. Reverse Geocoding / Nearest Area
user_coords = Coordinates(lat=31.4581, lng=74.4121)
nearest = get_nearest_area(user_coords, city_id="lahore")
print(f"Nearest area: {nearest.name} [ID: {nearest.id}]")

# Or using float coordinates directly:
nearest = get_nearest_area(31.4581, 74.4121)

# 4. Postal Code Resolution (accepts string or integer)
area = find_area_by_postal_code(54000)
print(f"54000 resolves to: {area.name}")

# 5. Spatial Distance (supports 2 Coordinates or 4 float numbers)
dist = haversine_distance_km(31.5204, 74.3587, 24.8607, 67.0011)
print(f"Distance between Lahore and Karachi: {round(dist)} km")
```

---

## Sanctuary Integration Guide

This guide details the specifications, design patterns, and copy-pasteable TypeScript components designed for **Sanctuary**—an offline-capable emergency rescue reporting and tracking Progressive Web App (PWA) operating across Pakistan.

### 1. Bilingual Administrative Hierarchy (`PakLocationItem`)

Emergency medical rescue, disaster relief, and municipal response require traversing hierarchical administrative boundaries from provinces to cities/districts down to neighborhood sectors. `pak-geodata` unifies these tiers into a single bilingual data model: `PakLocationItem`.

```typescript
export type PakLocationType = 'province' | 'division' | 'district' | 'tehsil' | 'area';

export interface PakLocationItem {
  id: string;                    // Canonical identifier (e.g. "punjab", "lahore", "lahore-gulberg-iii")
  nameEn: string;                // Standardized English name (e.g. "Punjab", "Lahore", "Gulberg III")
  nameUr: string;                // Native Urdu script (e.g. "پنجاب", "لاہور", "گلبرگ ۳")
  type: PakLocationType;         // Administrative level classification
  parentId?: string;             // Hierarchy parent reference (e.g. area -> cityId -> provinceId)
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

#### Hierarchy Traversal Helpers

- **`getProvincesAsLocationItems(): PakLocationItem[]`**: Returns all 7 provinces and federal territories (`type: 'province'`).
- **`getCitiesAsLocationItems(provinceId?: string): PakLocationItem[]`**: Returns verified municipal cities/districts (`type: 'district'`), optionally filtered by parent province.
- **`getAreasAsLocationItems(cityKey: string): PakLocationItem[]`**: Returns all verified areas in a given city (`type: 'area'`), linked via `parentId`.
- **`toLocationItem(entity)`**: Universal mapper converting any raw `PakistanProvince`, `PakistanCity`, or `PakistanArea` into a unified `PakLocationItem`.

```typescript
import {
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems
} from 'pak-geodata';

// Load provinces for administrative navigation
const provinces = getProvincesAsLocationItems();

// Load cities in Punjab
const punjabCities = getCitiesAsLocationItems('punjab');

// Load neighborhood areas in Lahore
const lahoreAreas = getAreasAsLocationItems('lahore');
```

---

### 2. Standardized English Storage & Localized Display

#### Architectural Rationale
In mission-critical platforms with distributed mobile nodes (SQLite, PowerSync, CouchDB, PostgreSQL), saving free-form Urdu or mixed transliterations directly into primary database columns causes index fragmentation, sorting anomalies, and inter-system synchronization failures.

**The Solution:**
1. **Database / Persistence Layer**: Always persist canonical, standardized English strings:
   ```json
   {
     "reportNumber": "SANCTUARY-92810",
     "city": "Lahore",
     "location_area": "Gulberg",
     "status": "DISPATCHED"
   }
   ```
2. **Client-Side Presentation Layer**: Resolve these keys dynamically at render time into English or native Urdu Nastaliq using resilient O(1) lookup helpers.

#### Resilient O(1) Lookup Helpers

- **`getCityName(key: string, lang?: 'en' | 'ur'): string`**  
  Resolves a city slug (`"lahore"`), title-cased name (`"Lahore"`), or Urdu representation (`"لاہور"`) to the requested language.
  - `getCityName("Lahore", "ur")` $\rightarrow$ `"لاہور"`
  - `getCityName("lahore", "en")` $\rightarrow$ `"Lahore"`
  - Safe fallback: returns the raw input `key` unchanged if the city is custom or unverified.

- **`getAreaName(cityKey: string, areaKey: string, lang?: 'en' | 'ur'): string`**  
  Resolves an area within a city using compound O(1) indexing (`${cityKey}:${areaKey}`). Supports:
  - Canonical slugs: `"lahore-gulberg-iii"`
  - Short slugs without city prefix: `"gulberg-iii"`
  - Title-cased names: `"Gulberg III"`
  - Colloquial aliases: `"Gulberg"`, `"dha 5"`
  - Urdu script names: `"گلبرگ ۳"`
  - Returns: `"Gulberg III"` (for `'en'`) or `"گلبرگ ۳"` (for `'ur'`).
  - Safe fallback: returns `areaKey` unchanged if custom-entered or unverified.

```typescript
import { getCityName, getAreaName } from 'pak-geodata';

// Standardized DB record:
const incident = { city: 'Lahore', location_area: 'Gulberg' };

// English UI presentation:
const enLabel = `${getAreaName(incident.city, incident.location_area, 'en')}, ${getCityName(incident.city, 'en')}`;
// => "Gulberg III, Lahore"

// Urdu UI presentation:
const urLabel = `${getCityName(incident.city, 'ur')}، ${getAreaName(incident.city, incident.location_area, 'ur')}`;
// => "لاہور، گلبرگ ۳"
```

---

### 3. Autocomplete Search with Overloaded `searchAreas` & Urdu Normalization

Sanctuary provides emergency autocomplete search scoped to a chosen city, returning typed `PakLocationItem[]` candidates.

#### Function Overload Signatures

```typescript
// 1. Sanctuary Overload (city-scoped, returns PakLocationItem[])
function searchAreas(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 2. Direct Named Function (same as Sanctuary overload)
function searchLocationItems(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 3. Classic GIS Overload (global or options-based, returns raw PakistanArea[])
function searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[];
```

#### Urdu Script & Numeral Normalization

Mobile keyboards across Pakistan produce character and numeral variations. `pak-geodata` pre-normalizes search indexes and queries with zero runtime performance cost:
- **Numeral Unification**: Bidirectionally matches Eastern Arabic-Indic numerals (`۰-۹`), standard Arabic-Indic digits (`٠-٩`), and Western ASCII digits (`0-9`). Searching `"گلبرگ ۳"` or `"گلبرگ ٣"` matches `"Gulberg 3"`.
- **Letter Variant Normalization**:
  - Arabic Yeh (`ي`, U+064A) and Alef Maksura (`ى`, U+0649) map to Urdu Yeh (`ی`, U+06CC).
  - Arabic Kaf (`ك`, U+0643) maps to Urdu Keheh (`ک`, U+06A9).
  - Arabic Heh (`ه`, U+0647) maps to Urdu Goal Heh (`ہ`, U+06C1).
- **Diacritic / Tashkeel & Tatweel Stripping**: Removes Zabar, Zer, Pesh, Tanween, Tashdeed, Sukun, and Tatweel/Kashida (`[\u0640\u064B-\u065F\u0670]`).

```typescript
import { searchAreas } from 'pak-geodata';

// Scoped bilingual search with Eastern Arabic numerals
const results = searchAreas('Lahore', 'گلبرگ ۳', 'ur');
console.log(results[0].nameEn); // "Gulberg III"
console.log(results[0].nameUr); // "گلبرگ ۳"
```

---

### 4. Lightweight PWA Subpath (`pak-geodata/hierarchy`)

PWAs operating in low-connectivity 2G/3G environments need instant initial load times. The `./hierarchy` subpath contains administrative boundaries and O(1) lookup engines with **zero neighborhood geospatial overhead**:

```typescript
// ESM or CommonJS import
import {
  getCityName,
  getAreaName,
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  searchLocationItems,
  toLocationItem
} from 'pak-geodata/hierarchy';
```

- **Bundle footprint**: `< 15 KB` unminified, **`< 5 KB` gzipped**.
- Enables lightweight service worker caching, instant app shell boots, and background sync.
- Full neighborhood datasets can be code-split and loaded on demand per city via `pak-geodata/areas/<city>`.

---

### 5. Production Implementation Examples

#### Example 1: Incident Reporting Intake Form (`/report`)

This React / TypeScript component allows citizens and dispatchers to select a city, search areas with real-time bilingual feedback, and submit standardized English keys:

```typescript
import React, { useState, useMemo } from 'react';
import {
  getCitiesAsLocationItems,
  searchAreas,
  type PakLocationItem
} from 'pak-geodata';

interface IncidentReportPayload {
  reportNumber: string;
  city: string;            // Standardized English: e.g. "Lahore"
  location_area: string;   // Standardized English: e.g. "Gulberg III"
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes: string;
}

interface IncidentReportFormProps {
  lang: 'en' | 'ur';
  onSubmitReport: (payload: IncidentReportPayload) => Promise<void>;
}

export function IncidentReportForm({ lang, onSubmitReport }: IncidentReportFormProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>('lahore');
  const [areaQuery, setAreaQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<PakLocationItem | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Load city options formatted for current language
  const cities = useMemo(() => getCitiesAsLocationItems(), []);

  // 2. City-scoped bilingual search: handles Urdu script, Eastern numerals ('۳'), and aliases
  const areaSuggestions = useMemo(() => {
    if (!areaQuery.trim() || !selectedCityId) return [];
    // Invokes overloaded Sanctuary signature: searchAreas(cityKey, query, lang)
    return searchAreas(selectedCityId, areaQuery, lang);
  }, [selectedCityId, areaQuery, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) return;

    setIsSubmitting(true);
    try {
      const selectedCityObj = cities.find((c) => c.id === selectedCityId);

      // 3. Persist standardized English keys to database / backend
      const payload: IncidentReportPayload = {
        reportNumber: `SANCTUARY-${Date.now().toString().slice(-6)}`,
        city: selectedCityObj?.nameEn || selectedCityId, // Persist English: "Lahore"
        location_area: selectedArea.nameEn,             // Persist English: "Gulberg III"
        coordinates: selectedArea.coordinates,
        notes
      };

      await onSubmitReport(payload);
      setAreaQuery('');
      setSelectedArea(null);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="incident-form" onSubmit={handleSubmit} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <h2>{lang === 'ur' ? 'ایمرجنسی رپورٹ درج کریں' : 'Submit Emergency Report'}</h2>

      {/* City Dropdown */}
      <div className="form-group">
        <label htmlFor="city-select">
          {lang === 'ur' ? 'شہر منتخب کریں' : 'Select City'}
        </label>
        <select
          id="city-select"
          value={selectedCityId}
          onChange={(e) => {
            setSelectedCityId(e.target.value);
            setSelectedArea(null);
            setAreaQuery('');
          }}
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {lang === 'ur' ? city.nameUr : city.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Area Search / Combobox */}
      <div className="form-group autocomplete-container">
        <label htmlFor="area-search">
          {lang === 'ur' ? 'علاقہ / سیکٹر / محلہ' : 'Area / Neighborhood'}
        </label>
        <input
          id="area-search"
          type="text"
          value={areaQuery}
          onChange={(e) => {
            setAreaQuery(e.target.value);
            setSelectedArea(null);
          }}
          placeholder={lang === 'ur' ? 'تلاش کریں (مثلاً: گلبرگ، ڈی ایچ اے، ۳)' : 'Search (e.g. Gulberg, DHA, Phase 5)'}
          autoComplete="off"
        />

        {/* Suggestion Dropdown */}
        {areaSuggestions.length > 0 && !selectedArea && (
          <ul className="suggestions-list">
            {areaSuggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setSelectedArea(item);
                  setAreaQuery(lang === 'ur' ? item.nameUr : item.nameEn);
                }}
              >
                <span className="suggestion-primary">
                  {lang === 'ur' ? item.nameUr : item.nameEn}
                </span>
                <span className="suggestion-secondary">
                  {lang === 'ur' ? item.nameEn : item.nameUr}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Additional Notes */}
      <div className="form-group">
        <label htmlFor="notes">
          {lang === 'ur' ? 'واقعے کی تفصیلات' : 'Incident Details'}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <button type="submit" disabled={!selectedArea || isSubmitting}>
        {isSubmitting
          ? (lang === 'ur' ? 'رپورٹ بھیجی جا رہی ہے...' : 'Submitting...')
          : (lang === 'ur' ? 'ایمرجنسی ٹیم طلب کریں' : 'Request Emergency Rescue')}
      </button>
    </form>
  );
}
```

---

#### Example 2: Emergency Incident Tracking View (`/report/track/:reportNumber`)

This React / TypeScript component loads a database record with standardized English fields and dynamically resolves the city and area names using the lightweight `< 5 KB` `pak-geodata/hierarchy` subpath:

```typescript
import React from 'react';
import {
  getCityName,
  getAreaName
} from 'pak-geodata/hierarchy'; // Ultra-lightweight subpath (< 5 KB gzipped)

export interface RescueIncidentRecord {
  reportNumber: string;
  city: string;            // Stored English key: e.g. "Lahore"
  location_area: string;   // Stored English key or alias: e.g. "Gulberg"
  status: 'RECEIVED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  reportedAt: string;
}

interface IncidentTrackingViewProps {
  incident: RescueIncidentRecord;
  lang: 'en' | 'ur';
}

export function IncidentTrackingView({ incident, lang }: IncidentTrackingViewProps) {
  // O(1) Resilient Lookups: resolves slugs, English names, and aliases in O(1) time
  // e.g. "Lahore" -> "لاہور", "Gulberg" -> "گلبرگ ۳"
  const localizedCity = getCityName(incident.city, lang);
  const localizedArea = getAreaName(incident.city, incident.location_area, lang);

  const statusMap = {
    RECEIVED: { en: 'Report Received', ur: 'رپورٹ موصول ہو چکی ہے', color: '#f59e0b' },
    DISPATCHED: { en: 'Rescue Team Dispatched', ur: 'ریسکیو ٹیم روانہ ہو چکی ہے', color: '#3b82f6' },
    EN_ROUTE: { en: 'En Route to Location', ur: 'ٹیم جائے وقوعہ کی طرف گامزن ہے', color: '#6366f1' },
    ON_SCENE: { en: 'Team on Scene', ur: 'ٹیم جائے وقوعہ پر پہنچ چکی ہے', color: '#10b981' },
    RESOLVED: { en: 'Incident Resolved', ur: 'ریسکیو مشن مکمل', color: '#059669' }
  };

  const currentStatus = statusMap[incident.status] || statusMap.RECEIVED;

  return (
    <div className="tracking-card" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <header className="tracking-header">
        <span className="badge">
          {lang === 'ur' ? 'رپورٹ نمبر:' : 'Report #:'} {incident.reportNumber}
        </span>
        <span className="timestamp">
          {new Date(incident.reportedAt).toLocaleTimeString()}
        </span>
      </header>

      {/* Localized Location Display */}
      <div className="tracking-location-section">
        <div className="location-pin">📍</div>
        <div className="location-details">
          <h3>
            {lang === 'ur'
              ? `${localizedCity}، ${localizedArea}`
              : `${localizedArea}, ${localizedCity}`}
          </h3>
          <p className="canonical-subtext">
            {incident.location_area}, {incident.city}
          </p>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="tracking-status" style={{ borderColor: currentStatus.color }}>
        <div className="status-indicator" style={{ backgroundColor: currentStatus.color }} />
        <span className="status-label">
          {currentStatus[lang]}
        </span>
      </div>
    </div>
  );
}
```

---

## Data Schema Reference

### `PakLocationItem`
Represents an administrative unit in the hierarchical bilingual tree (province, district, or area).

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Canonical slug identifier (e.g. `"punjab"`, `"lahore"`, `"lahore-gulberg-iii"`) |
| `nameEn` | `string` | Standardized English display name (e.g. `"Punjab"`, `"Lahore"`, `"Gulberg III"`) |
| `nameUr` | `string` | Native Urdu script name (e.g. `"پنجاب"`, `"لاہور"`, `"گلبرگ ۳"`) |
| `type` | `PakLocationType` | Classification: `'province'`, `'division'`, `'district'`, `'tehsil'`, or `'area'` |
| `parentId` | `string?` | Parent identifier in hierarchy tree (area $\rightarrow$ cityId $\rightarrow$ provinceId) |
| `coordinates` | `{ lat: number, lng: number }?` | Centroid GPS coordinates (WGS 84) |

### `PakistanArea`
Represents a neighborhood, sector, housing scheme, or commercial zone.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Canonical slug identifier formatted as `<city-slug>-<area-slug>` (e.g. `lahore-gulberg-3`) |
| `name` | `string` | Official English display name (e.g. `"Gulberg III"`) |
| `urduName` | `string?` | Native Urdu Nastaliq name (e.g. `"گلبرگ 3"`) |
| `cityId` | `string` | Foreign key referencing the parent city (e.g. `"lahore"`) |
| `provinceId` | `string` | Foreign key referencing the parent province (e.g. `"punjab"`) |
| `coordinates` | `{ lat: number, lng: number }` | Centroid coordinates (WGS 84, within Pakistan territorial boundaries) |
| `postalCode` | `string?` | 5-digit Pakistan Post postal code (e.g. `"54660"`) |
| `aliases` | `string[]` | Common colloquial variations, romanized spellings, abbreviations |
| `type` | `string?` | Categorization: `neighborhood`, `sector`, `housing_scheme`, `commercial`, etc. |
| `verified` | `boolean` | `true` once validated by the 3-tier triangulation pipeline |
| `sources` | `string[]` | Audit trail of data sources (e.g. `["survey", "curated", "osm"]`) |

### `PakistanCity`
Represents an urban municipal city or district.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Canonical city slug identifier (e.g. `"lahore"`) |
| `name` | `string` | City English name (e.g. `"Lahore"`) |
| `urduName` | `string` | City Urdu name (e.g. `"لاہور"`) |
| `provinceId` | `string` | Province slug (e.g. `"punjab"`) |
| `division` | `string?` | Administrative division (e.g. `"Lahore Division"`) |
| `district` | `string?` | Administrative district |
| `coordinates` | `{ lat: number, lng: number }` | City centroid coordinates |
| `postalCodeRange` | `[string, string]?` | 5-digit postal code boundaries (e.g. `["54000", "54999"]`) |
| `bounds` | `CityBounds?` | District bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`) |
| `totalAreasCount` | `number` | Number of verified areas available in the dataset |

### `PakistanProvince`
Represents an administrative province, federal territory, or autonomous state.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (`punjab`, `sindh`, `kpk`, `balochistan`, `islamabad-ict`, `ajk`, `gilgit-baltistan`) |
| `name` | `string` | Official English name |
| `urduName` | `string` | Official Urdu name |
| `capitalCityId` | `string` | Identifier of the capital city |
| `type` | `string` | `'province'`, `'federal_capital'`, or `'autonomous_territory'` |

---

## 3-Tier Triangulation & Verification Methodology

Every area included in `pak-geodata` must pass a rigorous 3-tier quality gate before inclusion into golden datasets:

```
[Raw Overpass / OSM / Geo Sources]
               │
               ▼
┌──────────────────────────────────────────────┐
│ Tier 1: Candidate Extraction & Schema Check  │
│  - Strict Zod & Type Validation             │
│  - Non-empty name, cityId, provinceId        │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Tier 2: Spatial & Boundary Validation        │
│  - National Boundary Geofence:               │
│    23.5 <= lat <= 37.1, 60.8 <= lng <= 77.8  │
│  - City District Bounding Box Enclosure      │
│  - Postal Code Range Validation              │
│  - Spatial Proximity Collision Check (<150m) │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Tier 3: AI-Arbiter & Human Verification      │
│  - Colloquial Alias Enrichment (e.g. dha 5)  │
│  - Native Urdu Script Normalization          │
│  - Canonical Slug Prefix Enforcement         │
│  - Referential Integrity Check Across Tree   │
└──────────────────────────────────────────────┘
               │
               ▼
       [Golden Curated Dataset]
```

1. **Tier 1 (Schema & Format)**: Structural validation verifying non-empty identifiers, valid coordinate objects, and ISO naming.
2. **Tier 2 (Spatial Geofencing & Deduplication)**:
   - Validates that every coordinate lies within Pakistan's geographic bounds.
   - Verifies that centroid points fall strictly within their designated city district bounding boxes.
   - Runs pairwise Haversine proximity scanning (< 150m) with token matching to detect and prevent duplicate or overlapping area polygons.
   - Enforces postal codes within the city's registered Pakistan Post range.
3. **Tier 3 (AI-Arbiter & Local Context)**:
   - Enriches each area with colloquial aliases commonly used by local residents, couriers, and taxi apps.
   - Adds verified Urdu typography in Nastaliq / Naskh script.
   - Assigns canonical slug prefixes following `<cityId>-<area-slug>`.

---

## Development & Build Pipeline

The project is structured as an automated monorepo with integrated code generation, test suites, and cross-language dataset synchronization:

```
├── data/                         # Root of truth: Master JSON datasets
│   ├── provinces.json
│   ├── cities/                   # 40 cities by province
│   └── areas/                    # Flagship areas by province & city
├── packages/
│   ├── npm/                      # TypeScript / JavaScript client library
│   │   ├── src/                  # Source TS modules & subpath exports
│   │   ├── dist/                 # Compiled ESM, CJS, and DTS bundles
│   │   └── tests/                # Node.js test runner suite
│   └── pypi/                     # Python client library (pak-geodata)
│       ├── pak_geodata/          # Pure Python standard-library package
│       │   ├── data/             # Synchronized master JSON datasets
│       │   ├── lookups.py        # O(1) lookups, search, & spatial math
│       │   └── models.py         # Frozen dataclasses
│       └── tests/                # Python unittest suite
├── pipeline/                     # Ingestion, Overpass scrapers, & validators
├── scripts/
│   ├── build.ts                  # Code generator, PyPI sync, & compiler
│   └── verify.ts                 # Full dataset integrity test runner
```

### Build Commands

```bash
# Install dependencies
npm install

# Run full production build (validates data, generates TS, syncs PyPI, builds bundles)
npm run build

# Run end-to-end test suite (TypeScript tests + Python unittest suite)
npm test

# Type check all packages
npm run lint

# Validate master data integrity
npm run verify
```

---

## Contribution & Roadmap

We actively welcome community contributions to expand coverage across Pakistan!

### Adding a New City or Area
1. Areas belong in `data/areas/<province>/<city-slug>.json`.
2. Every area must:
   - Use a canonical ID: `<city-slug>-<area-slug>`.
   - Have coordinates verified within the city's bounding box and Pakistan bounds.
   - Include valid `sources` (e.g. `["survey", "curated"]`).
   - Include authentic colloquial aliases and Urdu translation.
3. Run `npm run verify` to confirm your additions pass all validation rules.
4. Run `npm run build && npm test` to update generated code and verify the test suite.
5. Open a Pull Request! Please read our [Contributing Guide](CONTRIBUTING.md) for complete details.

### Expansion Roadmap
- **Phase 1 (In Progress)**: Flagship Metros (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad): expanding beyond the initial 189 foundational areas across residential, commercial, industrial, and historic classifications.
- **Phase 2 (Planned)**: Secondary Metropolitan Hubs (Peshawar, Quetta, Multan, Gujranwala, Sialkot, Hyderabad, Abbottabad).
- **Phase 3 (Planned)**: Tertiary cities, tehsils, and union councils across all provinces.
- **Phase 4 (Planned)**: GeoJSON polygon boundary support for precise geofencing.

---

## License & Authors

This project is open-source software licensed under the [MIT License](LICENSE).

Developed and maintained by:
- **[Sohaib Bin Mohsin](https://sohaibbinmohsin.com)** (Founder & Maintainer)
- **[The Mohsin Project Global](https://themohsinproject.org)**