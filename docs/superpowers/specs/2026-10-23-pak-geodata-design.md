# Design Specification: pak-geodata

**Date:** 2026-10-23  
**Status:** Approved  
**Topic:** Open-Source Pakistani Geodata Package & Ingestion Pipeline (`pak-geodata`)

---

## 1. Executive Summary & Vision

`pak-geodata` is an open-source, offline, zero-runtime-dependency, typed geodata ecosystem for Pakistan. It provides standardized data for provinces, districts, cities, and neighborhoods/sub-areas with GPS centroid coordinates, Urdu names, colloquial aliases, and official Pakistan Post postal codes.

The project is structured as a single monorepo maintaining a modular, verified JSON database as the single source of truth, compiled automatically into two production-grade distributions:
1. **NPM Package (`pak-geodata`)**: Ultra-lightweight, ESM/CJS, zero runtime dependencies, tree-shakeable per city.
2. **PyPI Package (`pak-geodata`)**: Pythonic, typed dataclasses/Pydantic models, ready for Django, FastAPI, and data science workflows.

---

## 2. Data Hierarchy & Schemas

### 2.1 Entity Hierarchy
`pak-geodata` uses a **Developer-First Hierarchy**:
```
Province / Administrative Territory
  └── District / Division
        └── City
              └── Area / Neighborhood / Housing Society / Sector
```
Administrative Union Councils (UCs) and Pakistan Post codes are linked as metadata attributes rather than rigid container levels.

### 2.2 Canonical Schemas

#### Area Entity (`PakistanArea`)
```typescript
export interface Coordinates {
  lat: number;  // Latitude (WGS 84, e.g. 31.4697)
  lng: number;  // Longitude (WGS 84, e.g. 74.3984)
}

export type AreaType = 
  | 'neighborhood' 
  | 'suburb' 
  | 'commercial' 
  | 'housing_society' 
  | 'sector' 
  | 'industrial'
  | 'administrative';

export interface PakistanArea {
  id: string;               // Unique canonical slug: `<city-slug>-<area-slug>` (e.g. "lhr-dha-phase-5")
  cityId: string;           // Parent city identifier: "lahore"
  provinceId: string;       // "punjab" | "sindh" | "kpk" | "balochistan" | "islamabad-ict" | "ajk" | "gilgit-baltistan"
  name: string;             // Canonical English display name: "DHA Phase 5"
  urduName?: string;        // Nastaliq / Urdu script name: "ڈی ایچ اے فیز 5"
  aliases: string[];        // Common colloquial variations: ["DHA 5", "Defence Phase 5", "DHA Phase V"]
  postalCode?: string;      // 5-digit Pakistan Post postal code: "54792"
  coordinates: Coordinates; // Verified centroid point
  type?: AreaType;
  verified: boolean;        // true = audited against spatial boundaries and postal tables
  sources?: string[];       // e.g. ["osm", "pakistan-post", "lda-master-plan"]
}
```

#### City Entity (`PakistanCity`)
```typescript
export interface PakistanCity {
  id: string;               // Canonical city slug: e.g. "lahore"
  name: string;             // "Lahore"
  urduName: string;         // "لاہور"
  provinceId: string;       // "punjab"
  division?: string;        // "Lahore Division"
  district: string;         // "Lahore"
  coordinates: Coordinates; // City center centroid (e.g. { lat: 31.5204, lng: 74.3587 })
  postalCodeRange?: [string, string]; // e.g. ["54000", "54999"]
  totalAreasCount: number;  // Dynamically generated
}
```

#### Province / Territory Entity (`PakistanProvince`)
```typescript
export interface PakistanProvince {
  id: string;               // "punjab" | "sindh" | "kpk" | "balochistan" | "islamabad-ict" | "ajk" | "gilgit-baltistan"
  name: string;             // "Punjab"
  urduName: string;         // "پنجاب"
  capitalCityId: string;    // "lahore"
  type: 'province' | 'federal_capital' | 'autonomous_territory';
}
```

---

## 3. Repository Architecture & Layout

The project adopts a Monorepo design with strict separation of data, ingestion pipelines, and package distributions:

```text
pak-geodata/
├── data/                                 # Golden Source of Truth (Pure JSON)
│   ├── provinces.json                    # 7 provinces and administrative units
│   ├── cities/                           # Cities by province
│   │   ├── punjab.json
│   │   ├── sindh.json
│   │   ├── kpk.json
│   │   ├── balochistan.json
│   │   ├── islamabad-ict.json
│   │   ├── ajk.json
│   │   └── gilgit-baltistan.json
│   └── areas/                            # Modular city area files
│       ├── punjab/
│       │   ├── lahore.json
│       │   ├── rawalpindi.json
│       │   └── ...
│       ├── sindh/
│       │   ├── karachi.json
│       │   └── ...
│       ├── islamabad-ict/
│       │   └── islamabad.json
│       └── ...
├── pipeline/                             # Ingestion, Triangulation, & Verification Engine
│   ├── extractors/                       # Raw candidate harvesters (Overpass, Pakistan Post, Overture)
│   ├── validators/                       # Spatial polygon, geofence, and schema tests
│   ├── arbiter/                          # AI arbiter prompts & conflict resolution tooling
│   └── raw/                              # Cached raw candidate dumps (git-ignored)
├── packages/
│   ├── npm/                              # TypeScript / ESM package
│   │   ├── src/
│   │   │   ├── index.ts                  # Core lookups, search, postal code query
│   │   │   ├── types.ts                  # TypeScript types
│   │   │   └── generated/                # Auto-compiled city exports for tree-shaking
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── pypi/                             # Python package
│       ├── pak_geodata/
│       │   ├── __init__.py
│       │   ├── models.py                 # Dataclasses & type hints
│       │   ├── search.py                 # Fast search & spatial nearest-neighbor
│       │   └── data/                     # Synced data bundle
│       ├── pyproject.toml
│       └── README.md
└── scripts/
    ├── build.ts                          # Compiles data/ into npm and pypi packages
    └── verify.ts                         # CI regression tests for all datasets
```

---

## 4. Verification & Curation Architecture (Triangulation + AI Arbiter)

Data accuracy is enforced through a 3-tier hybrid pipeline:

```
[Raw Sources: OSM + Pakistan Post + Overture Maps / GADM]
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│  Tier 1: Deterministic Triangulation (90% of areas)    │
│  - Mathematically cross-references 2+ open sources.    │
│  - If OSM centroid & Overture/Postal tables agree       │
│    within 300 meters -> Auto-verified instantly (100%   │
│    free, 0 tokens, 0 risk of CAPTCHAs).                │
└─────────────────────┬──────────────────────────────────┘
                      │
        Flagged (10% conflicts or missing data)
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│  Tier 2: AI Arbiter & Cultural Enricher (Targeted)     │
│  - AI resolves discrepancies between sources.          │
│  - AI generates colloquial aliases ("DHA 5", "Ext")    │
│    and perfect Urdu Nastaliq translations.             │
│  - AI performs targeted web searches for official      │
│    housing society master plans (LDA, KDA, CDA).       │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│  Tier 3: Mathematical Safety Invariants (CI/CD Gates)  │
│  - Geofence Test: Must be mathematically inside city.  │
│  - Proximity Deduplication: No two distinct areas      │
│    can have identical coordinates within 100 meters.   │
│  - Postal Code Check: Must match city's 5-digit range. │
└────────────────────────────────────────────────────────┘
```

### Safety Invariants Enforced in CI/CD:
1. **Coordinate Boundaries**: Every coordinate must fall strictly inside Pakistan (`lat: 23.5 - 37.1`, `lng: 60.8 - 77.8`) and within the city's district polygon.
2. **Nearest-Neighbor Deduplication**: Areas within 150m of each other with matching tokens are flagged for collision resolution.
3. **Postal Code Validation**: Postal code must be a 5-digit string matching the city's GPO postal code range.
4. **Unique Canonical IDs**: No duplicate `id` across the entire database.

---

## 5. Phased Recursive Rollout Plan

Because Pakistan contains ~150 cities and thousands of areas, compilation is staged recursively:

* **Phase 1: Flagship Metros (Covers ~85% of tech/delivery use cases)**:
  1. Lahore (LDA schemes, DHA 1-11, Johar Town, Model Town, Gulberg, Bahria, Walled City, etc.)
  2. Karachi (Clifton, DHA 1-8, Gulshan, North Nazimabad, PECHS, Korangi, Malir, etc.)
  3. Islamabad & Rawalpindi (CDA Sectors E/F/G/H/I, Bahria Phase 1-8, Saddar, Chaklala, Westridge)
  4. Faisalabad (Civil Lines, Madina Town, Peoples Colony, D Ground, Ghulam Muhammad Abad)
  5. Peshawar & Quetta (Hayatabad, University Town, Cantt, Zarghoon, Samungli)
* **Phase 2: Secondary Economic Hubs**:
  Multan, Gujranwala, Sialkot, Hyderabad, Abbottabad, Sukkur, Bahawalpur, Sargodha, Gujrat, Sheikhupura.
* **Phase 3: Comprehensive Nationwide District Coverage**:
  All remaining district headquarters, tehsils, and postal zones across all provinces, AJK, and Gilgit-Baltistan.

---

## 6. Distribution APIs

### 6.1 TypeScript / NPM API (`pak-geodata`)
Zero runtime dependencies. Tree-shakeable sub-path exports:
```typescript
// Sub-path import for minimal frontend bundle
import { lahoreAreas } from 'pak-geodata/areas/lahore';

// Full library utilities
import { 
  getAreasByCity, 
  getCitiesByProvince, 
  searchAreas, 
  findAreaByPostalCode,
  getNearestArea
} from 'pak-geodata';

// Functions:
getAreasByCity(cityId: string): PakistanArea[];
searchAreas(query: string, options?: { cityId?: string; limit?: number }): PakistanArea[];
findAreaByPostalCode(postalCode: string): PakistanArea[];
getNearestArea(coords: Coordinates, options?: { cityId?: string; maxDistanceKm?: number }): PakistanArea | null;
```

### 6.2 Python / PyPI API (`pak-geodata`)
Type-annotated, high-performance in-memory lookup:
```python
from pak_geodata import (
    get_areas_by_city,
    get_cities_by_province,
    search_areas,
    find_area_by_postal_code,
    get_nearest_area
)

# Functions:
areas = get_areas_by_city("lahore")
results = search_areas("dha 5", city_id="lahore")
nearest = get_nearest_area(lat=31.4697, lng=74.3984)
```
