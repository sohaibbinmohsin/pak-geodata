# pak-geodata

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade TypeScript and JavaScript client library providing offline access to verified geographic data for Pakistan, created and maintained by [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) at [The Mohsin Project Global](https://themohsinproject.org).

It covers all administrative provinces, 40 major cities, and 189 foundational flagship metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers).

Designed with **zero runtime dependencies**, strict geofencing, sub-millisecond lookups, and modular tree-shakeable subpath exports.

---

## Features

- **Zero Runtime Dependencies**: Completely self-contained with 0 runtime dependencies.
- **Dual Module Support**: Full ESM (`import`) and CommonJS (`require`) support.
- **Bilingual Administrative Hierarchy (`PakLocationItem`)**: Unified administrative data structure connecting provinces, cities/districts, and areas with synchronized English and Urdu names.
- **Resilient O(1) Key Lookups**: Pre-indexed instant resolution via `getCityName(key, lang)` and `getAreaName(cityKey, areaKey, lang)` supporting case-insensitive slugs, title names, and colloquial aliases.
- **Lightweight PWA Subpath (`pak-geodata/hierarchy`)**: Code-split micro-bundle (< 5 KB gzipped) designed specifically for offline-first emergency response Progressive Web Apps.
- **Urdu Script & Numeral Normalization**: Robust bidirectional matching across Eastern Arabic numerals (`۳` vs `3`), Urdu letter variants (`ي` vs `ی`, `ك` vs `ک`), and diacritic stripping.
- **Subpath Tree-Shaking**: Import only the areas you need (e.g. `pak-geodata/areas/lahore`) to keep your bundle footprint under a few kilobytes.
- **Offline & Self-Contained**: All verified golden datasets are bundled with the library: no remote API calls or latency.
- **Strict Geofencing & Validation**: Every coordinate is rigorously validated within Pakistan territorial boundaries (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`) and city district bounding boxes.
- **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` identifiers across all datasets (e.g. `lahore-dha-phase-5`).
- **Multi-Script & Alias Search**: Full support for English queries, colloquial aliases (e.g. `"dha 5"`), Urdu script queries (e.g. `"گلبرگ"`), and fuzzy typo tolerance.
- **Spatial Nearest Neighbor**: Instant reverse geocoding via spherical Haversine distance calculations.
- **Postal Code Resolution**: 5-digit Pakistan Post postal code lookup and reverse mapping.
- **Fully Typed**: Written in TypeScript with complete type definitions (`.d.ts`).

---

## Installation

```bash
npm install pak-geodata
```

```bash
yarn add pak-geodata
```

```bash
pnpm add pak-geodata
```

---

## Quick Start

### 1. Provinces & Cities

```typescript
import {
  getAllProvinces,
  getProvinceById,
  getAllCities,
  getCitiesByProvince,
  getCityById
} from 'pak-geodata';

// List all 7 provinces and federal territories
const provinces = getAllProvinces();
for (const p of provinces) {
  console.log(`${p.name} (${p.urduName}) - Capital: ${p.capitalCityId}`);
}

// Find a province by ID
const punjab = getProvinceById('punjab');
console.log(punjab?.name); // "Punjab"

// Retrieve all cities in a province
const punjabCities = getCitiesByProvince('punjab');
console.log(`Found ${punjabCities.length} cities in Punjab`);

// Get specific city details
const lahore = getCityById('lahore');
console.log(`${lahore?.name} coordinates:`, lahore?.coordinates);
console.log(`Verified areas count: ${lahore?.totalAreasCount}`);
```

### 2. Areas by City

```typescript
import { getAreasByCity, getAllAreas } from 'pak-geodata';

// Retrieve all verified areas for a city
const lahoreAreas = getAreasByCity('lahore');
for (const area of lahoreAreas.slice(0, 5)) {
  console.log(`${area.name} [${area.id}] - Postal Code: ${area.postalCode}`);
}

// Total verified areas in Pakistan
const allAreas = getAllAreas();
console.log(`Total verified areas: ${allAreas.length}`); // 189
```

### 3. Modular Subpath Imports (Tree-Shaking)

To minimize browser bundle size, import areas for specific cities directly without bundling the rest of the country:

```typescript
// Only imports Lahore areas (~24 KB)
import { lahoreAreas } from 'pak-geodata/areas/lahore';

// Only imports Karachi areas (~26 KB)
import { karachiAreas } from 'pak-geodata/areas/karachi';

// Available subpaths:
// pak-geodata/areas/lahore
// pak-geodata/areas/karachi
// pak-geodata/areas/islamabad
// pak-geodata/areas/rawalpindi
// pak-geodata/areas/faisalabad
```

### 4. Intelligent Search

The search engine ranks results across multiple matching tiers:
1. Exact match on name, ID, Urdu name, or alias
2. Prefix match
3. Substring / multi-word token match
4. Fuzzy edit-distance fallback for typos

```typescript
import { searchAreas } from 'pak-geodata';

// Search by colloquial alias scoped to a city
const results = searchAreas('dha 5', { cityId: 'lahore' });
console.log(results[0].id);   // "lahore-dha-phase-5"
console.log(results[0].name); // "DHA Phase 5"

// Search using Urdu script
const urduResults = searchAreas('کلفٹن');
for (const r of urduResults) {
  console.log(`${r.name} (${r.urduName}) in ${r.cityId}`);
}

// Scoped search with limit
const limited = searchAreas('phase', { cityId: 'islamabad', limit: 3 });
```

### 5. Reverse Geocoding & Spatial Nearest Neighbor

```typescript
import { getNearestArea, haversineDistanceKm } from 'pak-geodata';

// Coordinates near Liberty Market, Gulberg, Lahore
const userLocation = { lat: 31.512, lng: 74.343 };

// Find closest verified area
const nearest = getNearestArea(userLocation);
console.log(`Nearest area: ${nearest?.name} (${nearest?.id})`);

// Find nearest area within a specific city and max radius (km)
const nearestInLahore = getNearestArea(userLocation, {
  cityId: 'lahore',
  maxDistanceKm: 5.0
});

// Calculate distance between two coordinate pairs
const lahoreCenter = { lat: 31.5204, lng: 74.3587 };
const karachiCenter = { lat: 24.8607, lng: 67.0011 };
const distance = haversineDistanceKm(lahoreCenter, karachiCenter);
console.log(`Distance: ${Math.round(distance)} km`); // ~1025 km
```

### 6. Postal Code Resolution

```typescript
import { findAreaByPostalCode, findAreasByPostalCode } from 'pak-geodata';

// Resolve area by 5-digit Pakistan Post postal code (string or number)
const area = findAreaByPostalCode('54000');
console.log(`Postal code 54000: ${area?.name} (${area?.cityId})`);

// Find all areas sharing a postal code
const areas = findAreasByPostalCode(54000);
```

### 7. Bilingual Administrative Hierarchy & O(1) Lookups

```typescript
import {
  getCityName,
  getAreaName,
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  searchAreas
} from 'pak-geodata';

// 1. Instant O(1) bilingual name resolution
console.log(getCityName('Lahore', 'ur'));               // "لاہور"
console.log(getCityName('lahore', 'en'));               // "Lahore"
console.log(getAreaName('Lahore', 'Gulberg', 'ur'));    // "گلبرگ ۳"
console.log(getAreaName('lahore', 'lahore-gulberg-iii', 'en')); // "Gulberg III"

// 2. Bilingual hierarchy traversal
const provinces = getProvincesAsLocationItems();
console.log(provinces[0]); // { id: 'punjab', nameEn: 'Punjab', nameUr: 'پنجاب', type: 'province' }

const punjabCities = getCitiesAsLocationItems('punjab');
console.log(`Punjab has ${punjabCities.length} verified cities/districts`);

// 3. City-scoped bilingual search (Sanctuary overload)
const results = searchAreas('Lahore', 'DHA', 'ur');
console.log(results[0]);
// { id: 'lahore-dha-phase-5', nameEn: 'DHA Phase 5', nameUr: 'ڈی ایچ اے فیز ۵', type: 'area', parentId: 'lahore', ... }
```

---

## Sanctuary Integration Guide

This guide documents the design patterns, data contracts, and implementation specifications built into `pak-geodata` for **Sanctuary**—an offline-first emergency rescue reporting and tracking Progressive Web App (PWA) operating across Pakistan.

### 1. Bilingual Administrative Hierarchy (`PakLocationItem`)

Emergency dispatching, disaster triage, and community reporting span multiple administrative tiers. Rather than handling disconnected data shapes for provinces, cities, and neighborhoods, `pak-geodata` provides a unified data contract: `PakLocationItem`.

```typescript
export type PakLocationType = 'province' | 'division' | 'district' | 'tehsil' | 'area';

export interface PakLocationItem {
  id: string;                    // Canonical identifier (e.g. "punjab", "lahore", "lahore-gulberg-iii")
  nameEn: string;                // Standardized English name (e.g. "Punjab", "Lahore", "Gulberg III")
  nameUr: string;                // Native Urdu script (e.g. "پنجاب", "لاہور", "گلبرگ ۳")
  type: PakLocationType;         // Administrative level
  parentId?: string;             // Hierarchy linkage: area -> cityId -> provinceId
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

#### Hierarchy Traversal Functions

- **`getProvincesAsLocationItems(): PakLocationItem[]`**  
  Returns all 7 provinces and federal territories (`type: 'province'`, `parentId: undefined`).
- **`getCitiesAsLocationItems(provinceId?: string): PakLocationItem[]`**  
  Returns all 40 verified municipal cities/districts (`type: 'district'`, `parentId: provinceId`). If `provinceId` is provided, filters cities belonging to that province.
- **`getAreasAsLocationItems(cityKey: string): PakLocationItem[]`**  
  Returns all verified areas in a given city (`type: 'area'`, `parentId: cityId`).
- **`toLocationItem(entity)`**  
  Universal converter accepting any `PakistanProvince`, `PakistanCity`, or `PakistanArea` object and mapping it to a standard `PakLocationItem`.

```typescript
import {
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems
} from 'pak-geodata';

// Load provinces
const provinces = getProvincesAsLocationItems();

// Load cities in Sindh
const sindhCities = getCitiesAsLocationItems('sindh');

// Load areas in Karachi
const karachiAreas = getAreasAsLocationItems('karachi');
```

---

### 2. Standardized English Storage & Real-Time Localized Display

#### Architectural Rationale
In distributed emergency rescue architectures (PostgreSQL, SQLite, PowerSync, CouchDB), storing free-form Urdu or mixed-script strings in core database records causes severe indexing fragmentation, duplicate collation issues, and inter-agency sync friction.

**The Golden Pattern:**
1. **Database / Persistence Layer**: Always persist canonical, standardized English keys (`city: "Lahore"`, `location_area: "Gulberg"` or `"Gulberg III"`).
2. **Presentation / UI Layer**: Resolve these keys dynamically at render time into English or native Urdu Nastaliq using resilient O(1) lookup helpers.

#### Resilient O(1) Lookup Helpers

- **`getCityName(key: string, lang?: 'en' | 'ur'): string`**  
  Resolves a city slug (`"lahore"`), title-cased name (`"Lahore"`), or Urdu representation (`"لاہور"`) to the requested language.
  - `getCityName("lahore", "ur")` $\rightarrow$ `"لاہور"`
  - `getCityName("Lahore", "en")` $\rightarrow$ `"Lahore"`
  - Resilient fallback: returns the raw `key` if the city is custom or unverified.

- **`getAreaName(cityKey: string, areaKey: string, lang?: 'en' | 'ur'): string`**  
  Resolves an area within a city using compound O(1) indexing (`${cityKey}:${areaKey}`). Supports:
  - Canonical slugs: `"lahore-gulberg-iii"`
  - Local slugs without city prefix: `"gulberg-iii"`
  - Title names: `"Gulberg III"`
  - Colloquial aliases: `"Gulberg"`, `"dha 5"`
  - Urdu script queries: `"گلبرگ ۳"`
  - Returns: `"Gulberg III"` (for `'en'`) or `"گلبرگ ۳"` (for `'ur'`).
  - Resilient fallback: returns `areaKey` unchanged if unverified or custom-entered.

```typescript
import { getCityName, getAreaName } from 'pak-geodata';

// Standardized DB Record:
const record = { city: 'Lahore', location_area: 'Gulberg' };

// English display:
console.log(`${getAreaName(record.city, record.location_area, 'en')}, ${getCityName(record.city, 'en')}`);
// "Gulberg III, Lahore"

// Urdu display:
console.log(`${getCityName(record.city, 'ur')}، ${getAreaName(record.city, record.location_area, 'ur')}`);
// "لاہور، گلبرگ ۳"
```

---

### 3. Autocomplete Search with Overloaded `searchAreas` & Urdu Normalization

Sanctuary requires responsive autocomplete search scoped to a chosen city, returning typed `PakLocationItem[]` results.

#### Function Overload Signatures

`pak-geodata` supports two search calling styles:

```typescript
// 1. Sanctuary Overload (city-scoped, returns PakLocationItem[])
function searchAreas(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 2. Direct Named Function (same as Sanctuary overload)
function searchLocationItems(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 3. Classic GIS Overload (global or options-based, returns raw PakistanArea[])
function searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[];
```

#### Urdu Script & Numeral Normalization Engine

Mobile users and rescue field operators in Pakistan frequently switch between English, Urdu Nastaliq keyboards, and Arabic numeral settings. `pak-geodata` transparently pre-normalizes search terms with zero runtime performance cost:
- **Numeral Unification**: Eastern Arabic numerals (`۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹`) and Western digits (`0-9`) match bidirectionally (`"گلبرگ ۳"` matches `"Gulberg 3"`).
- **Letter Variant Normalization**:
  - Arabic Yeh (`ي`, U+064A) and Alef Maksura (`ى`, U+0649) map to Urdu Yeh (`ی`, U+06CC).
  - Arabic Kaf (`ك`, U+0643) maps to Urdu Keheh (`ک`, U+06A9).
  - Arabic Heh (`ه`, U+0647) maps to Urdu Goal Heh (`ہ`, U+06C1).
- **Diacritic / Tashkeel Stripping**: Removes Zabar, Zer, Pesh, Tanween, Tashdeed, and Sukun (`[\u064B-\u065F\u0670]`).

```typescript
import { searchAreas } from 'pak-geodata';

// Eastern numeral search returns matched PakLocationItem
const results = searchAreas('Lahore', 'گلبرگ ۳', 'ur');
console.log(results[0].nameEn); // "Gulberg III"
console.log(results[0].nameUr); // "گلبرگ ۳"
```

---

### 4. Lightweight PWA Subpath (`pak-geodata/hierarchy`)

PWAs operating in low-connectivity 2G/3G environments must minimize JavaScript bundle sizes. The `./hierarchy` subpath contains administrative boundaries and O(1) lookup engines with **zero neighborhood geospatial overhead**:

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
- Perfect for initial service worker caching, instant app shell startup, and background tracking views.
- City-specific areas can be dynamically loaded on demand when the user selects a city via `pak-geodata/areas/<city>`.

---

### 5. Production Implementation Examples

#### Example 1: Emergency Incident Reporting Form (`/report`)

This component demonstrates how a reporting intake form allows a user to select a city, search areas with real-time bilingual feedback, and submit standardized English keys into the database:

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

This component demonstrates how an incident tracking view loads a database record with standardized English fields and dynamically resolves the city and area names using the lightweight `< 5 KB` `pak-geodata/hierarchy` subpath:

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

## Data Schema

### `PakLocationItem`
```typescript
type PakLocationType = 'province' | 'division' | 'district' | 'tehsil' | 'area';

interface PakLocationItem {
  id: string;                    // Canonical identifier (e.g. "lahore-gulberg-iii", "lahore", "punjab")
  nameEn: string;                // Standardized English name (e.g. "Gulberg III", "Lahore", "Punjab")
  nameUr: string;                // Native Urdu script (e.g. "گلبرگ ۳", "لاہور", "پنجاب")
  type: PakLocationType;         // Administrative level classification
  parentId?: string;             // Hierarchy linkage: area -> cityId -> provinceId
  coordinates?: {
    lat: number;                 // Latitude (WGS 84)
    lng: number;                 // Longitude (WGS 84)
  };
}
```

### `PakistanArea`
```typescript
interface PakistanArea {
  id: string;                    // Canonical: <city-slug>-<area-slug>
  cityId: string;                // e.g. "lahore", "karachi"
  provinceId: string;            // e.g. "punjab", "sindh"
  name: string;                  // Primary English name
  urduName?: string;             // Urdu Nastaliq / Naskh name
  aliases: string[];             // Common alternative names and abbreviations
  coordinates: {
    lat: number;                 // Latitude (WGS 84)
    lng: number;                 // Longitude (WGS 84)
  };
  postalCode?: string;           // 5-digit Pakistan Post postal code
  type?: 'neighborhood' | 'sector' | 'commercial' | 'housing_scheme' | 'suburb' | 'industrial' | 'administrative';
  verified: boolean;             // True if verified via triangulation pipeline
  sources: string[];             // Verification sources (e.g. "survey", "curated", "osm")
}
```

### `PakistanCity`
```typescript
interface PakistanCity {
  id: string;                    // Canonical city slug (e.g. "lahore")
  name: string;                  // English name
  urduName: string;              // Urdu name
  provinceId: string;            // Province ID
  division?: string;             // Administrative division
  district?: string;             // District name
  coordinates: {
    lat: number;                 // City centroid latitude
    lng: number;                 // City centroid longitude
  };
  postalCodeRange?: [string, string]; // [minPostalCode, maxPostalCode]
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  totalAreasCount: number;       // Number of verified areas in dataset
}
```

### `PakistanProvince`
```typescript
interface PakistanProvince {
  id: string;                    // e.g. "punjab", "sindh", "islamabad-ict"
  name: string;                  // English name
  urduName: string;              // Urdu name
  capitalCityId: string;         // Capital city slug
  type: 'province' | 'federal_capital' | 'autonomous_territory';
}
```

---

## License

MIT © 2026 [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) • [The Mohsin Project Global](https://themohsinproject.org)
