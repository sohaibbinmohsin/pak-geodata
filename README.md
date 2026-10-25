# pak-geodata

[![NPM Version](https://img.shields.io/npm/v/pak-geodata?color=blue)](https://www.npmjs.com/package/pak-geodata)
[![PyPI Version](https://img.shields.io/pypi/v/pak-geodata?color=green)](https://pypi.org/project/pak-geodata/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade geospatial foundation for Pakistan, developed and maintained by [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) at [The Mohsin Project Global](https://themohsinproject.org).

It provides offline access to verified geographic datasets for Pakistan's provinces, territories, cities, and metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers), distributed simultaneously for **TypeScript/Node.js** and **Python** with **zero runtime dependencies**.

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

// Available subpaths:
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

## Data Schema Reference

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