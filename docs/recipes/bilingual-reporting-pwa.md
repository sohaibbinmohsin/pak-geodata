# Recipe: Bilingual Reporting & Tracking Progressive Web App (PWA)

This guide documents the design patterns, data contracts, and production-ready TypeScript components for building offline-first progressive web apps, reporting intake forms, and localized dashboards operating across Pakistan with `pak-geodata`.

---

## 1. Bilingual Administrative Hierarchy (`PakLocationItem`)

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

### Hierarchy Traversal Functions

- **`getProvincesAsLocationItems(): PakLocationItem[]`**  
  Returns all 7 provinces and federal territories (`type: 'province'`, `parentId: undefined`).
- **`getCitiesAsLocationItems(provinceId?: string): PakLocationItem[]`**  
  Returns all 79 verified municipal cities/districts (`type: 'district'`, `parentId: provinceId`). If `provinceId` is provided, filters cities belonging to that province.
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

## 2. Standardized English Storage & Real-Time Localized Display

### Architectural Rationale
In distributed emergency rescue architectures (PostgreSQL, SQLite, PowerSync, CouchDB), storing free-form Urdu or mixed-script strings in core database records causes severe indexing fragmentation, duplicate collation issues, and inter-agency sync friction.

**The Golden Pattern:**
1. **Database / Persistence Layer**: Always persist canonical, standardized English keys (`city: "Lahore"`, `location_area: "Gulberg"` or `"Gulberg III"`).
2. **Presentation / UI Layer**: Resolve these keys dynamically at render time into English or native Urdu Nastaliq using resilient O(1) lookup helpers.

### Resilient O(1) Lookup Helpers

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

## 3. Autocomplete Search with Overloaded `searchAreas` & Urdu Normalization

Applications frequently require responsive autocomplete search scoped to a chosen city, returning typed `PakLocationItem[]` results.

### Function Overload Signatures

`pak-geodata` supports two search calling styles:

```typescript
// 1. City-scoped Overload (returns PakLocationItem[])
function searchAreas(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 2. Direct Named Function (same as city-scoped overload)
function searchLocationItems(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[];

// 3. Classic GIS Overload (global or options-based, returns raw PakistanArea[])
function searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[];
```

### Urdu Script & Numeral Normalization Engine

Mobile users and rescue field operators in Pakistan frequently switch between English, Urdu Nastaliq keyboards, and Arabic numeral settings. `pak-geodata` transparently pre-normalizes search terms with zero runtime performance cost:
- **Numeral Unification**: Eastern Arabic-Indic numerals (`۰-۹`), standard Arabic-Indic digits (`٠-٩`), and Western digits (`0-9`) match bidirectionally (`"گلبرگ ۳"` or `"گلبرگ ٣"` matches `"Gulberg 3"`).
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

## 4. Lightweight PWA Subpath (`pak-geodata/hierarchy`)

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

## 5. Production Implementation Examples

### Example 1: Incident Reporting Intake Form (`/report`)

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
  city: string;            // Standardized English: "Lahore"
  location_area: string;   // Standardized English: "Gulberg III"
  coordinates?: { lat: number; lng: number };
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
    // Invokes overloaded city-scoped signature: searchAreas(cityKey, query, lang)
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
        reportNumber: `INCIDENT-${Date.now().toString().slice(-6)}`,
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
    <form onSubmit={handleSubmit} dir={lang === 'ur' ? 'rtl' : 'ltr'} className="report-form">
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

      {/* Area Search Autocomplete Input */}
      <div className="form-group">
        <label htmlFor="area-search">
          {lang === 'ur' ? 'علاقہ / سیکٹر / سوسائٹی تلاش کریں' : 'Search Area / Sector / Society'}
        </label>
        <input
          id="area-search"
          type="text"
          value={areaQuery}
          onChange={(e) => {
            setAreaQuery(e.target.value);
            setSelectedArea(null);
          }}
          placeholder={
            lang === 'ur'
              ? 'مثال: گلبرگ، ڈی ایچ اے، ماڈل ٹاؤن...'
              : 'e.g. Gulberg, DHA, Model Town...'
          }
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

### Example 2: Incident Tracking View (`/report/track/:reportNumber`)

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
