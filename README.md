# pak-geodata

[![NPM Version](https://img.shields.io/npm/v/pak-geodata?color=blue)](https://www.npmjs.com/package/pak-geodata)
[![PyPI Version](https://img.shields.io/pypi/v/pak-geodata?color=green)](https://pypi.org/project/pak-geodata/)
<a href="https://sohaibbinmohsin.github.io/pak-geodata/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Live%20Demo-Interactive%20Map-blue?logo=leaflet&color=10B981" alt="Live Interactive Demo" /></a>
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
- 🏛️ **Bilingual Hierarchy & PWA Subpath**: Complete province $\rightarrow$ district $\rightarrow$ area hierarchy (`PakLocationItem`) and ultra-lightweight `< 5 KB` gzipped subpath export (`pak-geodata/hierarchy`) designed for offline-first PWAs and reporting workflows.
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
| **Verified Cities** | **79** | 100% Coverage (All 79 Cities with Areas) | District centroids, bounding boxes, administrative divisions, 5-digit postal code ranges |
| **Foundational & Metro Urban Areas** | **1,108** | 100% of Cities (All 79 Cities Across All 7 Territories) | Foundational & verified areas spanning all metropolitan centers, regional economic hubs, and secondary cities |

---

## The 79 Verified Cities

### What does a "verified city" mean?
Every one of the 79 cities in `pak-geodata` has undergone municipal boundary verification. Each entry provides:
1. **Centroid Coordinates**: Accurate GPS coordinates for the city center.
2. **District Bounding Box (`bounds`)**: Strict geofencing limits (`minLat`, `maxLat`, `minLng`, `maxLng`) representing the greater urban municipal district.
3. **Administrative Division**: Official provincial division mapping (e.g. Lahore Division, Karachi Division, Hazara Division).
4. **Pakistan Post Range (`postalCodeRange`)**: Official 5-digit postal code boundaries (e.g. `["54000", "54999"]` for Lahore).

This enables developers to immediately geofence incoming coordinates, filter areas with `cityId`, and validate shipping addresses offline.

### Complete List of the 79 Verified Cities

- **Punjab (37 cities)**:
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
  - Attock (`attock`)
  - Bahawalnagar (`bahawalnagar`)
  - Chakwal (`chakwal`)
  - Chiniot (`chiniot`)
  - Chishtian (`chishtian`)
  - Daska (`daska`)
  - Dera Ghazi Khan (`dera-ghazi-khan`)
  - Gojra (`gojra`)
  - Hafizabad (`hafizabad`)
  - Jhang (`jhang`)
  - Jaranwala (`jaranwala`)
  - Kamalia (`kamalia`)
  - Khanewal (`khanewal`)
  - Kot Addu (`kot-addu`)
  - Mandi Bahauddin (`mandi-bahauddin`)
  - Muridke (`muridke`)
  - Muzaffargarh (`muzaffargarh`)
  - Okara (`okara`)
  - Samundri (`samundri`)
  - Taxila (`taxila`)
  - Vehari (`vehari`)
  - Wah Cantt (`wah-cantt`)
  - Wazirabad (`wazirabad`)
- **Sindh (8 cities)**:
  - Karachi (`karachi`)
  - Hyderabad (`hyderabad`)
  - Sukkur (`sukkur`)
  - Larkana (`larkana`)
  - Nawabshah (`nawabshah`)
  - Mirpur Khas (`mirpur-khas`)
  - Jacobabad (`jacobabad`)
  - Shikarpur (`shikarpur`)
- **Khyber Pakhtunkhwa (9 cities)**:
  - Peshawar (`peshawar`)
  - Abbottabad (`abbottabad`)
  - Mardan (`mardan`)
  - Mingora / Swat (`mingora`)
  - Kohat (`kohat`)
  - Dera Ismail Khan (`dera-ismail-khan`)
  - Nowshera (`nowshera`)
  - Swabi (`swabi`)
  - Mansehra (`mansehra`)
- **Balochistan (10 cities)**:
  - Quetta (`quetta`)
  - Gwadar (`gwadar`)
  - Turbat (`turbat`)
  - Khuzdar (`khuzdar`)
  - Hub (`hub`)
  - Chaman (`chaman`)
  - Sibi (`sibi`)
  - Zhob (`zhob`)
  - Loralai (`loralai`)
  - Dera Murad Jamali (`dera-murad-jamali`)
- **Islamabad Capital Territory (1 city)**:
  - Islamabad (`islamabad`)
- **Azad Jammu & Kashmir (7 cities)**:
  - Muzaffarabad (`muzaffarabad`)
  - Mirpur (`mirpur`)
  - Rawalakot (`rawalakot`)
  - Kotli (`kotli`)
  - Bhimber (`bhimber`)
  - Bagh (`bagh`)
  - Pallandri (`pallandri`)
- **Gilgit-Baltistan (7 cities)**:
  - Gilgit (`gilgit`)
  - Skardu (`skardu`)
  - Karimabad / Hunza (`karimabad-hunza`)
  - Chilas (`chilas`)
  - Aliabad / Hunza (`aliabad-hunza`)
  - Gahkuch (`gahkuch`)
  - Khaplu (`khaplu`)

---

## Verified Areas & Urban Hubs (1,108 Areas Across All 79 Cities)

Coverage encompasses **1,108 triangulated golden areas across 100% of Pakistan's 79 cities**, spanning all sectors, housing societies, commercial markets, industrial estates, and historic quarters across all 7 provinces and administrative territories:

### Top 10 Metropolitan Hubs (504 Areas):
- **Karachi** (`105 areas`): Clifton (Blocks 1-9), DHA (Phases 1-8), Gulshan-e-Iqbal (Blocks 1-13), North Nazimabad (Blocks A-T), PECHS (Blocks 2, 3, 6), Federal B Area (Blocks 1-12), Gulistan-e-Johar (Blocks 1-15), North Karachi (Sectors 5, 7, 8, 11), Nazimabad (Blocks 1-2), Saddar, SITE, Korangi Crossing, Landhi Industrial, Port Qasim, I.I. Chundrigar Road, Empress Market, Scheme 33, Gulshan-e-Maymar, Gulshan-e-Hadeed, Bahadurabad, Tariq Road, Burns Road, etc.
- **Lahore** (`105 areas`): Gulberg (I-V), DHA (Phases 1-9, Prism & Rahbar), Model Town, Johar Town (Phases 1-2 & Blocks B-R), Allama Iqbal Town (Blocks Chenab, Ravi, Huma, Khyber, Mehran, Neelam, Nizam, Jahanzeb), Bahria Town (Sectors A-F), Township (Sectors A1-C2), Sabzazar (Blocks A-G), Faisal Town (Blocks A-C), Garden Town, Cantt, Paragon City, State Life (Phases 1-2), Sui Gas (Phases 1-2), PCSIR (Phases 1-2), Izmir Town, Jubilee Town, Liberty Market, M.M. Alam Road, Hafeez Centre, Shalimar, Badami Bagh, Shadbagh, Thokar Niaz Baig, Barki Road, Bedian Road, etc.
- **Islamabad** (`80 areas`): CDA Sectors (F-5 to F-17, G-5 to G-17, H-8 to H-16, I-8 to I-16, D-12, D-17, D-18, E-7, E-8, E-9, E-11, C-12, C-15, C-16, B-17), Diplomatic Enclave, Blue Area, DHA Islamabad (Phases 1, 2, 3, 5), Bahria Town (Phases 2, 3, 7 & Enclave), Gulberg Greens, Soan Gardens, CBR Town, Police Foundation, PWD, Pakistan Town, Naval Anchorage, Bhara Kahu, Bani Gala, Park View City, Chak Shahzad, Rawat Industrial, Sihala, Humak, Nilore, etc.
- **Rawalpindi** (`50 areas`): Bahria Town (Phases 1-8 & Ext), Satellite Town, Saddar, Westridge (1-3), Chaklala Scheme (1-3), Askari (1, 2, 7, 10, 11, 14), Commercial Market, Raja Bazaar, Sarafa Bazaar, Murree Road, Peshawar Road, Gulraiz (Phases 1-2), Media Town, CBR Town Phase 2, Airport Housing Society, Tench Bhatta, Shamsabad, Faizabad, Gulshan-e-Abad, Afshan Colony, Range Road, Adyala Road, Top City-1, Mumtaz City, Pirwadhai, Gulzar-e-Quaid, etc.
- **Faisalabad** (`40 areas`): Peoples Colony (1-2), Madina Town, D Ground & Commercial Belt, Ghulam Muhammad Abad, Kohinoor City, Civil Lines, Millat Town, Samanabad, Batala Colony, Gulberg, Jinnah Colony, Susan Road, Saeedabad, Mansoorabad, Canal Road, FDA City, Satiana Road, Raza Garden, Tech Town, Al-Najaf Colony, Mujahid Colony, Officer Colony (1-2), Citi Housing, Faisal Town, FIEDMC / M-3 City, Small Industrial Estate, Eden Valley, Abdullahpur, Tariqabad, etc.
- **Multan** (`28 areas`): Gulgasht Colony, Bosan Road, Cantt, Shah Rukn-e-Alam Colony, New Multan, MDA Officers Colony, Model Town, Wapda Town, DHA Multan, Garden Town, Mumtazabad, Zakariya Town, Shalimar Colony, Peer Khurshid Colony, Gulshan Market, Hassan Parwana Colony, Royal Orchard, Citi Housing Multan, MPS Road, Chungi No 6, 9, 14, Dera Adda, Shah Shams Tabrez Colony, Industrial Estate, etc.
- **Peshawar** (`28 areas`): Hayatabad (Phases 1-7), University Town, University of Peshawar Campus, Cantt, Saddar, Warsak Road, Gulbahar, Regi Model Town, DHA Peshawar, Shami Road, Dalazak Road, Deans Trade Center, Kohat Road, Ring Road, Board Bazaar, Charsadda Road, Tehkal, Nauthia, KMU Area, Hayatabad Industrial Estate, Gulberg Peshawar, Defence Officers Colony, Qissa Khwani, etc.
- **Hyderabad** (`26 areas`): Latifabad (Units 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), Qasimabad (Phases 1-2, Nasim Nagar), Saddar, Cantt, Auto Bhan Road, Citizen Colony, Kohsar, Gul Centre, Defence (Phases 1-2), Hussainabad, GOR Colony, Wadhu Wah Road, Thandi Sarak, SITE Area, etc.
- **Gujranwala** (`22 areas`): Gujranwala Cantt, Model Town, DC Colony, People's Colony, Satellite Town, Wapda Town, Master City, Garden Town, Rahwali Cantt, Shalimar Town, Citi Housing (Phases 1-2), Palm City, Fazaia Housing, Sialkot Bypass, Kangniwala, Gondlanwala Road, Nowshera Road, Trust Plaza, Small Industrial Estate, Climax Industrial Zone, Civil Lines, etc.
- **Quetta** (`20 areas`): Quetta Cantt, Jinnah Town, Shahbaz Town, Samungli Road, Model Town, Zarghoon Housing Scheme, Satellite Town, Chaman Phatak, Patel Bagh, Arbab Town, Brewery Road, Nawan Killi, Alamo Chowk, Spinny Road, Joint Road, Airport Road, Gulshan-e-Zahoor, Liaquat Bazaar, Suraj Ganj Bazaar, Kandahari Bazaar, etc.

### 69 Regional Hubs & Secondary Cities (604 Areas Across 100% of Pakistan's Cities):
- **Punjab (27 cities, 230 areas)**: Sialkot (14), Bahawalpur (12), Sargodha (12), Sheikhupura (10), Sahiwal (10), Jhelum (10), Gujrat (10), Rahim Yar Khan (10), Dera Ghazi Khan (10), Kasur (8), Wah Cantt (8), Okara (8), Attock (8), Bahawalnagar (8), Chakwal (8), Chiniot (8), Chishtian (8), Daska (8), Gojra (8), Hafizabad (8), Jaranwala (8), Jhang (8), Kamalia (8), Khanewal (8), Kot Addu (8), Mandi Bahauddin (8), Muridke (8), Muzaffargarh (8), Samundri (8), Taxila (8), Vehari (8), Wazirabad (8).
- **Sindh (6 cities, 54 areas)**: Sukkur (12), Larkana (10), Nawabshah (10), Mirpur Khas (8), Jacobabad (8), Shikarpur (8).
- **KPK (7 cities, 62 areas)**: Abbottabad (12), Mardan (10), Mingora / Swat (10), Kohat (8), Dera Ismail Khan (8), Mansehra (8), Nowshera (8), Swabi (8).
- **Balochistan (9 cities, 74 areas)**: Gwadar (10), Turbat (8), Khuzdar (8), Hub (8), Chaman (8), Dera Murad Jamali (8), Loralai (8), Sibi (8), Zhob (8).
- **Azad Jammu & Kashmir (AJK) (7 cities, 58 areas)**: Muzaffarabad (10), Mirpur (10), Rawalakot (8), Bagh (8), Bhimber (8), Kotli (8), Pallandri (8).
- **Gilgit-Baltistan (7 cities, 58 areas)**: Gilgit (10), Skardu (10), Aliabad / Hunza (8), Chilas (8), Gahkuch (8), Karimabad (8), Khaplu (8).

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

## Bilingual Hierarchy & Lightweight PWA Subpath

For applications requiring hierarchical administrative selection (Province → City/District → Area), `pak-geodata` provides a unified bilingual interface `PakLocationItem` and an ultra-lightweight `< 5 KB` gzipped subpath export:

```typescript
import {
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  getCityName,
  getAreaName,
  searchAreas
} from 'pak-geodata/hierarchy'; // Ultra-lightweight subpath (< 5 KB gzipped)

// 1. Traverse administrative hierarchy
const provinces = getProvincesAsLocationItems();
const sindhCities = getCitiesAsLocationItems('sindh');
const karachiAreas = getAreasAsLocationItems('karachi');

// 2. Resilient O(1) lookups (English & native Urdu Nastaliq)
console.log(getCityName('lahore', 'ur')); // "لاہور"
console.log(getAreaName('lahore', 'Gulberg', 'ur')); // "گلبرگ ۳"

// 3. City-scoped autocomplete search
const results = searchAreas('Lahore', 'گلبرگ ۳', 'ur');
```

> 📖 **Full Implementation Recipe**: For complete React form components, real-time localized display patterns, and offline database persistence, see the [Bilingual Reporting & Tracking PWA Recipe](docs/recipes/bilingual-reporting-pwa.md).

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
│   ├── cities/                   # 79 cities by province
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
- **Phase 1 (Completed)**: 100% National Urban Coverage across all 79 cities in Pakistan (1,108 verified golden areas spanning all 7 provinces and administrative territories).
- **Phase 2 (Planned)**: Deep-tier density expansion for high-density metropolitan quarters, metro corridors, and campus townships.
- **Phase 3 (Planned)**: Tertiary cities, tehsils, and union councils across all provinces.
- **Phase 4 (Planned)**: GeoJSON polygon boundary support for precise geofencing.

---

## About The Mohsin Project

> **Free software for those who do good.**

`pak-geodata` is an open-source public good engineered and maintained by **[The Mohsin Project](https://themohsinproject.org)**.

The Mohsin Project exists because purpose-driven organizations and emergency teams lose momentum to outdated systems, expensive proprietary APIs, and scarce technical resources. We design, engineer, and deploy centralized digital solutions entirely free of cost so that nonprofits, humanitarian initiatives, and civic developers can focus on their mission.

- 💬 **Get in Touch**: [hello@themohsinproject.org](mailto:hello@themohsinproject.org)

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).

Copyright (c) 2026 [The Mohsin Project Global](https://themohsinproject.org)