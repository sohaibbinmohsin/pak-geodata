# pak-geodata

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade TypeScript and JavaScript client library providing offline access to verified geographic data for Pakistan, created and maintained by [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) at [The Mohsin Project Global](https://themohsinproject.org).

It covers all administrative provinces, 40 major cities, and 189 foundational flagship metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers).

Designed with **zero runtime dependencies**, strict geofencing, sub-millisecond lookups, and modular tree-shakeable subpath exports.

---

## Features

- **Zero Runtime Dependencies**: Completely self-contained with 0 runtime dependencies.
- **Dual Module Support**: Full ESM (`import`) and CommonJS (`require`) support.
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

---

## Data Schema

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
