# pak-geodata

[![NPM Version](https://img.shields.io/npm/v/pak-geodata?color=blue)](https://www.npmjs.com/package/pak-geodata)
[![PyPI Version](https://img.shields.io/pypi/v/pak-geodata?color=green)](https://pypi.org/project/pak-geodata/)
[![Go Reference](https://pkg.go.dev/badge/github.com/sohaibbinmohsin/pak-geodata/packages/go.svg)](https://pkg.go.dev/github.com/sohaibbinmohsin/pak-geodata/packages/go)
[![Pub Version](https://img.shields.io/pub/v/pak_geodata.svg?color=blue)](https://pub.dev/packages/pak_geodata)
<a href="https://geodata.themohsinproject.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Live%20Demo-Interactive%20Map-blue?logo=leaflet&color=10B981" alt="Live Interactive Demo" /></a>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade geospatial foundation for Pakistan.

It provides offline access to verified geographic datasets for Pakistan's provinces, territories, cities, and metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers), distributed simultaneously for **TypeScript/Node.js**, **Python**, **Go**, and **Dart/Flutter** with **zero runtime dependencies**.

Explore the [Live Interactive Demo](https://geodata.themohsinproject.org/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

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

- ⚡ **Zero Runtime Dependencies**: All four client libraries (TypeScript, Python, Go, and Dart) require 0 external runtime dependencies (pure standard-library implementations across all ecosystems).
- 📦 **Quad-Distribution**: Native first-class support across four major programming ecosystems: Node.js/TypeScript (`npm install pak-geodata`), Python (`pip install pak-geodata`), Go (`go get github.com/sohaibbinmohsin/pak-geodata/packages/go`), and Dart/Flutter (`dart pub add pak_geodata`).
- 🌐 **Offline and Self-Contained**: 100% bundled data: perform lookups, spatial radius checks, and searches in sub-millisecond time with no network requests.
- 🎯 **Strict Geofencing**: All coordinates strictly validated within Pakistan's bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`) and city district boundaries.
- 🏷️ **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` format (e.g. `lahore-dha-phase-5`, `karachi-clifton-block-2`).
- 🔍 **Multi-Script and Alias Search**: Ranks results across exact match, prefix match, Urdu script (`"گلبرگ"`), colloquial aliases (`"dha 5"`), token match, and fuzzy Levenshtein distance.
- 📍 **Spatial Reverse Geocoding**: Nearest neighbor resolution via spherical Haversine formula (`getNearestArea` / `get_nearest_area` / `GetNearestArea`).
- 📮 **Pakistan Post Codes**: 5-digit postal code resolution and reverse lookups.
- 🌲 **Tree-Shakeable Subpaths**: Modular imports like `pak-geodata/areas/lahore` load only the desired city data (~15 to 26 KB).
- 🏛️ **Bilingual Hierarchy & PWA Subpath**: Complete province $\rightarrow$ district $\rightarrow$ area hierarchy (`PakLocationItem`) and ultra-lightweight `< 5 KB` gzipped subpath export (`pak-geodata/hierarchy`) designed for offline-first PWAs and reporting workflows.
- 🗺️ **Live Interactive Web Demo**: Explore the [Live Interactive Demo](https://geodata.themohsinproject.org/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

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

### Go (1.21+)
```bash
go get github.com/sohaibbinmohsin/pak-geodata/packages/go
```

### Dart / Flutter
```bash
dart pub add pak_geodata
# or in Flutter projects:
flutter pub add pak_geodata
```

---

## Dataset Statistics

| Administrative Level | Count | Coverage | Key Details |
| :--- | :--- | :--- | :--- |
| **Provinces & Territories** | **7** | 100% of Pakistan | Punjab, Sindh, KPK, Balochistan, Islamabad (ICT), Azad Jammu & Kashmir (AJK), Gilgit-Baltistan |
| **Verified Cities** | **79** | 100% Coverage (All 79 Cities with Areas) | District centroids, bounding boxes, administrative divisions, 5-digit postal code ranges |
| **Foundational & Metro Urban Areas** | **3,953** | 100% of Cities (All 79 Cities Across All 7 Territories) | Foundational & verified areas spanning all metropolitan centers, regional economic hubs, and secondary cities |

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

## Verified Areas & Urban Hubs (3,953 Areas Across All 79 Cities)

Coverage encompasses **3,953 triangulated golden areas across 100% of Pakistan's 79 cities**, spanning all sectors, housing societies, commercial markets, industrial estates, working-class settlements, and historic quarters across all 7 provinces and administrative territories:

### Top 10 Metropolitan Hubs (2,883 Areas):
- **Karachi** (`606 areas`): Clifton (Blocks 1-9), DHA (Phases 1-8), Gulshan-e-Iqbal, North Nazimabad, PECHS, Federal B Area, Gulistan-e-Johar, North Karachi, Nazimabad, Saddar, SITE, Lyari, Ranchore Line, Sohrab Goth, Numaish, Kharadar, Golimar, Malir City, Landhi, Orangi Town, Mehmoodabad, Drigh Road, Qasba Colony, Banaras Chowk, Baldia Town, Keamari, Chakiwara, Metroville, Sharafi Goth, etc.
- **Lahore** (`575 areas`): Gulberg (I-V), DHA (Phases 1-9, Prism & Rahbar), Model Town, Johar Town, Allama Iqbal Town, Bahria Town, Township, Sabzazar, Faisal Town, Garden Town, Cantt, Harbanspura, Baghbanpura, Islampura, Gajjumata, Chauburji, Shahdara, Nishtar Town, Gawalmandi, Sanda, Mozang, Data Darbar, Bhatti Gate, Marghzar Colony, Mansoora, Hanjarwal, Kalma Chowk, Kahna, Jallo Mor, Punjab University, UVAS, Kot Lakhpat, Youhanabad, etc.
- **Islamabad** (`438 areas`): CDA Sectors (F-5 to F-17, G-5 to G-17, H-8 to H-16, I-8 to I-16, D-12, D-17, D-18, E-7 to E-11, C-12, C-15, C-16, B-17), Diplomatic Enclave, Blue Area, DHA Islamabad, Bahria Town, Gulberg Greens, Soan Gardens, PWD, Tarnol, Golra Sharif Station, I-10 Industrial, Barakahu Bazaar, Sohan, etc.
- **Hyderabad** (`292 areas`): Latifabad (Units 1-12), Qasimabad, Saddar, Cantt, Auto Bhan Road, Citizen Colony, Hussainabad, GOR Colony, Wadhu Wah Road, Phuleli, Paretabad, Tower Market, Shahi Bazaar, Tilak Incline, Halanaka, Hirabad, etc.
- **Peshawar** (`288 areas`): Hayatabad (Phases 1-7), University Town, Peshawar Campus, Cantt, Saddar, Warsak Road, Hazarkhwani, Yakatoot, Qissa Khwani, Kohati Gate, Namak Mandi, Gor Gathri, Haji Camp General Bus Stand, Karkhano Market, etc.
- **Quetta** (`241 areas`): Quetta Cantt, Jinnah Town, Shahbaz Town, Liaquat Bazaar, Suraj Ganj Bazaar, Kandahari Bazaar, Chaman Phatak, Marriabad, Patel Bagh, Arbab Town, Sariab Road, Sabzal Road, Brewery Road, Nawan Killi, Killi Deba, Killi Ismail, Hazara Town, etc.
- **Gujranwala** (`156 areas`): Gujranwala Cantt, Model Town, DC Colony, People's Colony, Satellite Town, Climax Abadi, Baghbanpura, Garjakh, Dhullay, Gondlanwala, Khiali Shahpur, Ferozwala, Climax Industrial Zone, Kangniwala, Nowshera Road, etc.
- **Faisalabad** (`114 areas`): Peoples Colony, Madina Town, D Ground, Ghulam Muhammad Abad, Kohinoor City, Civil Lines, Millat Town, Samanabad, Batala Colony, Gulberg, D-Type Colony, Tata Bazaar, Faizabad, Warispura, Clock Tower 8 Bazaars, etc.
- **Multan** (`97 areas`): Gulgasht Colony, Bosan Road, Cantt, Shah Rukn-e-Alam Colony, New Multan, MDA Officers Colony, Model Town, Wapda Town, DHA Multan, Hussain Agahi, Dera Adda, Delhi Gate, Bohar Gate, Haram Gate, Pak Gate, Lohari Gate, Daulat Gate, etc.
- **Rawalpindi** (`76 areas`): Bahria Town (Phases 1-8 & Ext), Satellite Town, Saddar, Westridge (1-3), Chaklala Scheme (1-3), Askari, Commercial Market, Raja Bazaar, Bhabra Bazaar, Mohanpura, Kartarpura, Pirwadhai Adda, Faizabad Interchange, Dhok Ratta, Dhok Khabba, Dhok Hassu, Dhok Mangtal, Dhok Dalal, Khanna Pul, Chungi No 22, etc.

### 69 Regional Hubs & Secondary Cities (1,070 Areas Across 100% of Pakistan's Cities):
- **Punjab (27 cities, 255 areas)**: Sialkot (22), Bahawalpur (18), Sargodha (18), Kasur (14), Jhelum (13), Gujrat (13), Sheikhupura (10), Sahiwal (10), Rahim Yar Khan (10), Dera Ghazi Khan (10), Wah Cantt (8), Okara (8), Attock (8), Bahawalnagar (8), Chakwal (8), Chiniot (8), Chishtian (8), Daska (8), Gojra (8), Hafizabad (8), Jaranwala (8), Jhang (8), Kamalia (8), Khanewal (8), Kot Addu (8), Mandi Bahauddin (8), Muridke (8), Muzaffargarh (8), Samundri (8), Taxila (8), Vehari (8), Wazirabad (8).
- **Sindh (6 cities, 60 areas)**: Sukkur (18), Larkana (10), Nawabshah (10), Mirpur Khas (8), Jacobabad (8), Shikarpur (8).
- **KPK (7 cities, 68 areas)**: Abbottabad (15), Mardan (13), Mingora / Swat (10), Kohat (8), Dera Ismail Khan (8), Mansehra (8), Nowshera (8), Swabi (8).
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

### Go

```go
package main

import (
	"fmt"

	pakgeodata "github.com/sohaibbinmohsin/pak-geodata/packages/go"
)

func main() {
	// 1. Lookups
	punjab, found := pakgeodata.GetProvinceByID("punjab")
	if found {
		fmt.Printf("%s (%s)\n", punjab.Name, punjab.UrduName) // "Punjab", "پنجاب"
	}

	lahore, found := pakgeodata.GetCityByID("lahore")
	if found {
		fmt.Printf("%s has %d verified areas\n", lahore.Name, lahore.TotalAreasCount)
	}

	lahoreAreas := pakgeodata.GetAreasByCity("lahore")
	fmt.Printf("Loaded %d areas in Lahore (first: %s)\n", len(lahoreAreas), lahoreAreas[0].Name)

	// 2. Intelligent Multi-Script & Alias Search
	// Ranked by: Exact > Prefix > Urdu > Alias > Token > Fuzzy
	results := pakgeodata.SearchAreas("dha 5", pakgeodata.SearchOptions{CityID: "lahore"})
	if len(results) > 0 {
		fmt.Println(results[0].Area.Name) // "DHA Phase 5"
		fmt.Println(results[0].Area.ID)   // "lahore-dha-phase-5"
	}

	// Search via Urdu script
	urduMatches := pakgeodata.SearchAreas("کلفٹن", pakgeodata.SearchOptions{})
	if len(urduMatches) > 0 {
		fmt.Println(urduMatches[0].Area.Name) // "Clifton Block 1"
	}

	// 3. Reverse Geocoding / Nearest Area
	userCoords := pakgeodata.Coordinates{Lat: 31.4581, Lng: 74.4121}
	nearest, distKm, found := pakgeodata.GetNearestArea(userCoords, pakgeodata.NearestAreaOptions{
		CityID:        "lahore",
		MaxDistanceKm: 5,
	})
	if found {
		fmt.Printf("Nearest: %s (%.2f km)\n", nearest.Name, distKm)
	}

	// 4. Postal Code Resolution
	postalArea, found := pakgeodata.FindAreaByPostalCode("54000")
	if found {
		fmt.Printf("Postal Code 54000: %s\n", postalArea.Name)
	}

	// 5. Great-Circle Distance
	dist := pakgeodata.HaversineDistanceKm(
		pakgeodata.Coordinates{Lat: 31.5204, Lng: 74.3587}, // Lahore Center
		pakgeodata.Coordinates{Lat: 24.8607, Lng: 67.0011}, // Karachi Center
	)
	fmt.Printf("Distance between Lahore and Karachi: %.0f km\n", dist) // ~1025 km
}
```

---

### Dart / Flutter

```dart
import 'package:pak_geodata/pak_geodata.dart';

void main() {
  // 1. Lookups
  final punjab = getProvinceById('punjab');
  print('${punjab?.name}, ${punjab?.urduName}'); // "Punjab", "پنجاب"

  final lahore = getCityById('lahore');
  print('${lahore?.name} has ${lahore?.totalAreasCount} verified areas');

  final lahoreAreas = getAreasByCity('lahore');
  print('Loaded ${lahoreAreas.length} areas in Lahore (first: ${lahoreAreas.first.name})');

  // 2. Intelligent Multi-Script & Alias Search
  // Ranked by: Exact > Prefix > Urdu > Alias > Token > Fuzzy
  final results = searchAreas('dha 5', cityId: 'lahore');
  if (results.isNotEmpty) {
    print(results.first.area.name); // "DHA Phase 5"
    print(results.first.area.id);   // "lahore-dha-phase-5"
  }

  // Search via Urdu script
  final urduMatches = searchAreas('کلفٹن');
  if (urduMatches.isNotEmpty) {
    print(urduMatches.first.area.name); // "Clifton Block 1"
  }

  // 3. Reverse Geocoding / Nearest Area
  const userCoords = Coordinates(lat: 31.4581, lng: 74.4121);
  final nearest = getNearestArea(
    userCoords,
    cityId: 'lahore',
    maxRadiusKm: 5,
  );
  if (nearest != null) {
    print('Nearest: ${nearest.area.name} (${nearest.distanceKm.toStringAsFixed(2)} km)');
  }

  // 4. Postal Code Resolution
  final postalArea = findAreaByPostalCode('54000');
  print('Postal Code 54000: ${postalArea?.name}');

  // 5. Great-Circle Distance
  final distKm = haversineDistanceKm(
    const Coordinates(lat: 31.5204, lng: 74.3587), // Lahore Center
    const Coordinates(lat: 24.8607, lng: 67.0011), // Karachi Center
  );
  print('Distance between Lahore and Karachi: ${distKm.round()} km'); // ~1025 km
}
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

The project is structured as an automated monorepo with integrated code generation, quad-runtime test suites, and cross-language dataset synchronization:

```
├── data/                         # Root of truth: Master JSON datasets
│   ├── provinces.json
│   ├── cities/                   # 79 cities by province
│   └── areas/                    # 3,953 verified areas by province & city
├── packages/
│   ├── npm/                      # TypeScript / JavaScript client library
│   │   ├── src/                  # Source TS modules & subpath exports
│   │   │   └── data/             # Generated typed const datasets
│   │   ├── dist/                 # Compiled ESM, CJS, and DTS bundles
│   │   └── tests/                # Node.js test runner suite
│   ├── pypi/                     # Python client library (pak-geodata)
│   │   ├── pak_geodata/          # Pure Python standard-library package
│   │   │   ├── data/             # Synchronized master JSON datasets
│   │   │   ├── lookups.py        # O(1) lookups, search, & spatial math
│   │   │   └── models.py         # Frozen dataclasses
│   │   └── tests/                # Python unittest suite
│   ├── go/                       # Go client package (pakgeodata)
│   │   ├── data/                 # Synchronized master JSON datasets
│   │   ├── pakgeodata.go         # //go:embed and thread-safe sync.Once lookups
│   │   ├── geo.go                # Pure Go Haversine math & reverse geocoding
│   │   ├── search.go             # Urdu normalization & multi-script search
│   │   └── pakgeodata_test.go    # Native Go test suite
│   └── dart/                     # Dart & Flutter client package (pak_geodata)
│       ├── lib/                  # Pure Dart package entry point
│       │   ├── pak_geodata.dart  # Top-level lookups and exports
│       │   └── src/data/         # Generated typed const datasets
│       └── test/                 # Native Dart test suite
├── pipeline/                     # Ingestion, Overpass scrapers, & validators
├── scripts/
│   ├── build.ts                  # Code generator, sync engine, & compiler
│   ├── codegen/                  # TypeScript & Dart code generators
│   └── verify.ts                 # Full dataset integrity & parity runner
└── tests/
    └── parity/                   # Multi-language golden vectors parity suite
```

### Multi-Language Architecture

`pak-geodata` guarantees strict parity across all four target ecosystems using an automated pipeline:

```
                          ┌───────────────────────────┐
                          │   data/ (Master Datasets) │
                          │  (Sole Source of Truth)   │
                          │   7 Prov / 79 City / 3953 │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           │ Synchronize                │ Synchronize               │ Codegen & Compile
           ▼                            ▼                           ▼
┌──────────────────────┐     ┌──────────────────────┐    ┌──────────────────────┐
│     packages/pypi    │     │     packages/go      │    │     packages/npm     │
│ (pak_geodata/data/)  │     │    (packages/go/     │    │ (src/data/*.ts const)│
│  Synchronized JSON   │     │        data/)        │    │  ESM / CJS Bundles   │
│ (importlib.resources)│     │  //go:embed JSON     │    │ + Subpath Exports    │
└──────────────────────┘     └──────────────────────┘    └──────────────────────┘
                                                                    │
                                                                    │ Codegen
                                                                    ▼
                                                         ┌──────────────────────┐
                                                         │    packages/dart     │
                                                         │ (lib/src/data/*.dart)│
                                                         │   Typed const Data   │
                                                         │ (Pure Dart / Zero-Dep│
                                                         └──────────────────────┘
```

1. **Single Source of Truth (`data/`)**: All master geographic records reside exclusively in `data/provinces.json`, `data/cities/*.json`, and `data/areas/**/*.json`. Language packages never store or permit manually edited data.
2. **Synchronized JSON Embedding (Go & Python)**:
   - **Go**: Uses standard-library `//go:embed data` to compile master JSON datasets directly into binary executables with zero filesystem runtime dependencies. Thread-safe lookups and indexes are initialized on first access using `sync.Once`.
   - **Python**: Master JSON datasets are synchronized into `packages/pypi/pak_geodata/data/` during build and loaded using Python's standard-library `pkgutil` / `importlib.resources`.
3. **Typed Constant Code Generation (TypeScript & Dart)**:
   - **TypeScript**: `scripts/codegen/typescript.ts` compiles master JSON into strongly-typed ESM/CommonJS modules and TypeScript declaration files (`.d.ts`), enabling full IDE autocomplete and granular per-city subpath imports.
   - **Dart**: `scripts/codegen/dart.ts` compiles master JSON into pure Dart `const` model instances with `const Coordinates(...)` centroids and bounds, providing zero-parse-overhead compile-time constant data for Flutter and Dart VM.
4. **Zero Runtime External Dependencies**: None of the client libraries depend on third-party runtime dependencies. All spatial calculations (spherical Haversine formula with radius $R = 6371.0088\text{ km}$), Urdu normalization, and search indexing are implemented purely using each runtime's standard library.
5. **Multi-Package Parity Gate**: Automatically validated on every build via `scripts/verify.ts` and `tests/parity/golden_vectors.test.ts`, asserting identical counts (7 provinces, 79 cities, 3,953 areas) and matching search/geocoding behaviors across all language targets.

### Build & Test Commands

```bash
# Install dependencies
npm install

# Run full production build (validates data, generates TS/Dart, syncs PyPI/Go, builds bundles)
npm run build

# Run end-to-end multi-runtime test suite (TypeScript + Python + Go + Dart)
npm test

# Run individual language test suites
npm run test:ts       # TypeScript test suite (Node.js test runner)
npm run test:python   # Python unittest suite
npm run test:go       # Go test suite (native or Docker)
npm run test:dart     # Dart test suite (native or Docker)
npm run test:parity   # Cross-language golden vectors parity test

# Type check all packages
npm run lint

# Validate master data integrity and dataset count parity across all 5 targets
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

## Data Sources & Upstream Attribution

`pak-geodata` synthesizes and cross-validates geographic intelligence from authoritative international and national GIS repositories:

1. **National Geospatial-Intelligence Agency (NGA) & GeoNames**:
   - Primary source for georeferenced populated places (`PPL`), urban quarters/neighborhoods (`PPLX`), and administrative centroids across Pakistan.
   - Licensed under [Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
2. **OpenStreetMap Contributors**:
   - Source for verified metropolitan neighborhood and road-network boundary references.
   - © OpenStreetMap contributors. Licensed under the [Open Database License (ODbL 1.0)](https://opendatacommons.org/licenses/odbl/1.0/).
3. **United Nations OCHA / Humanitarian Data Exchange (HDX COD)**:
   - Administrative Common Operational Datasets (COD-AB) for Pakistan provincial and district administrative boundaries.
   - Licensed under [CC-BY-IGO](https://creativecommons.org/licenses/by/3.0/igo/).
4. **Pakistan Post & Pakistan Bureau of Statistics (PBS)**:
   - Postal codes, delivery zones, and district administrative hierarchies.

For complete attribution notices and upstream provenance details, please refer to [ATTRIBUTION.md](ATTRIBUTION.md).

---

## Licensing & Commercial Use FAQ

`pak-geodata` employs a standard **Split-License Architecture**:
- **Codebase & Libraries** (`packages/npm`, `packages/pypi`, algorithms, and build scripts): Licensed under the permissive [MIT License](LICENSE).
- **Geographic Datasets** (`data/` directory and compiled JSON geographic records): Dual-licensed under the [Open Database License (ODbL 1.0)](LICENSE-DATA) and [CC-BY 4.0](LICENSE-DATA).

### Frequently Asked Questions for Commercial Developers

#### Can I use `pak-geodata` in a proprietary commercial SaaS, mobile app, or e-commerce platform?
**Yes.** Under **Section 4.3 of the Open Database License (ODbL)**, displaying Pakistani cities, autocomplete menus, checkout address pickers, or geocoding outputs within your application constitutes a **"Produced Work"**. Using `pak-geodata` in your website or mobile app does **NOT** require you to open-source your proprietary code, backend services, or customer database.

#### Do I need to attribute `pak-geodata` in my application?
Yes. If your application or public service utilizes `pak-geodata` datasets, simply include a standard attribution line in your app's "About", "Credits", or "Legal" page:
> *"Geographic data provided by pak-geodata (The Mohsin Project), derived from OpenStreetMap contributors (ODbL) and NGA/GeoNames (CC-BY 4.0)."*

#### What if I modify or extend the underlying geographic dataset itself?
If you publicly redistribute an adapted version of the `data/` database (e.g. publishing an enriched standalone Pakistan GIS dataset derived from this repository), ODbL Section 4.4 requires you to share those specific geographic database modifications under ODbL 1.0.

For full legal terms, see [LICENSE](LICENSE) (Code) and [LICENSE-DATA](LICENSE-DATA) (Geographic Data).

---

## About The Mohsin Project

> **Free software for those who do good.**

`pak-geodata` is an open-source public good engineered and maintained by **[The Mohsin Project](https://themohsinproject.org)**.

The Mohsin Project exists because purpose-driven organizations and emergency teams lose momentum to outdated systems, expensive proprietary APIs, and scarce technical resources. We design, engineer, and deploy centralized digital solutions entirely free of cost so that nonprofits, humanitarian initiatives, and civic developers can focus on their mission.

- 💬 **Get in Touch**: [hello@themohsinproject.org](mailto:hello@themohsinproject.org)

---

## License

- **Code**: [MIT License](LICENSE) © 2026 [The Mohsin Project Global](https://themohsinproject.org)
- **Data**: [ODbL 1.0](LICENSE-DATA) & [CC-BY 4.0](LICENSE-DATA) © OpenStreetMap contributors & NGA/GeoNames