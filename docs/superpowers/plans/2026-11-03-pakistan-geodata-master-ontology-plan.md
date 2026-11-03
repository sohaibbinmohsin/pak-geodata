# Pakistan GeoData Master Spatial Ontology & Nationwide Mapping Plan

> **Goal:** Transform `pak-geodata` from an urban neighborhood lookup library into Pakistan's definitive, open-source, offline, typed, zero-hallucination geospatial ontology covering all administrative, urban, rural, transit, emergency, healthcare, industrial, educational, and postal layers.
>
> **Architecture:** A user-centric, tiered package architecture (TypeScript/Node and Python) with subpath tree-shaking exports. The core bundle remains featherweight (<100 KB gzipped) for 90% of web/mobile users, while extended spatial bounds (`bounds`, `radiusKm`) and machine-auditable provenance (`sources`) are accessible on demand via `pak-geodata/extended`.
>
> **Tech Stack:** TypeScript (ESM + CommonJS, DTS), Python 3.9+ (dataclasses), Zod validation, Haversine spatial math, NGA / GeoNames parser, UN OCHA COD ingestors, Pakistan Post Directory gazetteer, Node.js test runner, Python unittest.
>
> **Master File Location:** `docs/superpowers/plans/2026-11-03-pakistan-geodata-master-ontology-plan.md`

---

## 1. The Zero-Hallucination Ingestion Constitution

To eliminate guesswork, synthetic interpolation, or LLM hallucination, every entity across all layers must strictly satisfy the **Three Golden Ingestion Laws**:

1. **Law of Provenance (`sourceId` & `sourceType`)**:
   - Every single record in the repository MUST carry an immutable audit trail pointing to an authoritative external database.
   - Recognized source types:
     - `nga:<feature_code>:<id>` (National Geospatial-Intelligence Agency / GeoNames ID, e.g. `nga:pplx:1372009`)
     - `pak_post:<office_id>` (Pakistan Post Official National Directory)
     - `un_ocha:<pcode>` (United Nations OCHA Common Operational Datasets COD-PS / COD-AB)
     - `pbs:<level>:<code/id>` (Pakistan Bureau of Statistics 2023 Digital Census)
     - `plra:<mauza_code>` (Punjab Land Records Authority Cadastre)
     - `pes_1122:<station_id>` (Punjab Emergency Service 1122 Registry)
     - `hec:<inst_id>` (Higher Education Commission Registry)
   - Entries lacking verifiable `sources` with valid external IDs are rejected automatically at build time.

2. **Law of Physical Coordinates (Zero Interpolation & No Quotas)**:
   - Centroids must be extracted directly from surveyed node coordinates, polygon geometric centroids, or verified government gazette coordinates.
   - Bounding-box spatial interpolation, random offset generation, or synthetic quota padding (e.g. "at least 12 per city") is strictly prohibited. If a city has 8 documented neighborhoods in official databases, it keeps 8. If a metro has 150, it gets 150.

3. **Law of Boundary Containment**:
   - Every entity's centroid must programmatically lie within:
     - Pakistan's national territorial bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`).
     - Its designated parent administrative boundary polygon or district bounding box.

---

## 2. The 3 Authoritative Data Pillars (Beyond OpenStreetMap)

Instead of relying on OpenStreetMap scraping, the repository anchors its data in three authoritative, structured datasets:

### Pillar A: NGA (National Geospatial-Intelligence Agency) / GeoNames (`PK.txt`)
* **Scope**: 150,402 georeferenced records across Pakistan with strict military/geospatial feature classifications.
* **Key Classifications**:
  * **`PPLX` (3,515 records)**: *"Section of Populated Place"* — urban neighborhoods, city sectors, and residential quarters. Used to audit and enrich the 79 cities.
  * **`PPL` (145,564 records)**: Populated towns, villages, and rural settlements across every district.
  * **`PPLA2` (120 records)**: District administrative headquarters.

### Pillar B: Pakistan Post Official National Delivery Directory
* **Scope**: 13,000+ registered delivery post offices (GPOs, Sub-Post Offices, and Branch Offices).
* **Role**: Binds authentic, verified 5-digit postal codes to every urban quarter and rural village, eliminating postal guesswork.

### Pillar C: UN OCHA / HDX & Pakistan Bureau of Statistics (2023 Digital Census)
* **Scope**: Official Common Operational Datasets (COD-AB & COD-PS).
* **Role**: Provides P-codes (unique UN identifiers) and legal administrative boundaries down to Tehsils, Cantonments, and Mauzas.

---

## 3. Product & Package Architecture (User-Centric Design to Prevent Bloat)

To ensure the library stays blazing fast for everyday web/mobile developers while offering deep GIS power for logistics, we establish a **two-tier consumption model**:

```
                                  pak-geodata Library
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         CORE DEFAULT IMPORT                            EXTENDED SUBPATH IMPORT
     import { searchAreas } from 'pak-geodata'      import { ... } from 'pak-geodata/extended'
                  │                                               │
      - 90% of Users (Checkouts, Forms, UI)          - 10% of Users (Logistics, Dispatch, GIS)
      - Minimal JSON fields: id, name, urdu,         - Spatial Bounding Boxes (`bounds`) & radius
        cityId, postalCode, aliases, coords          - Machine-auditable `sources` provenance
      - Total bundle remains ultra-light (<100KB)    - Raw polygons & deep administrative codes
```

### The Optimum Spatial Choice: Centroid + Bounds + Radius
Instead of storing multi-megabyte GeoJSON polygons, each area in the extended layer includes:
```typescript
{
  "id": "lahore-dha-phase-5",
  "coordinates": { "lat": 31.4581, "lng": 74.4121 }, // Primary centroid (for fast Haversine)
  "radiusKm": 2.2,                                    // Approximate spatial radius
  "bounds": {                                         // Tight bounding box of the neighborhood
    "minLat": 31.4420, "maxLat": 31.4740,
    "minLng": 74.3950, "maxLng": 74.4300
  }
}
```
* **Pure Arithmetic Performance**: Bounding box check runs in **0.0001 ms** (`lat >= minLat && lat <= maxLat`), executing 1,000x faster than polygon ray-casting.
* **Accurate Reverse Geocoding**: `getNearestArea` first tests whether a coordinate falls inside any neighborhood's `bounds` for an exact spatial match, eliminating boundary-edge errors.

---

## 4. The 2-Track Execution Roadmap

```
TRACK 1: Fortify & Enrich Existing Cities (The Solid Foundation)
   ├── Step 1.1: Upgrade Area Schema (Structured `sources` + optional `bounds`/`radiusKm`)
   ├── Step 1.2: Audit Existing 1,279 Areas against NGA (Fix coordinate drift & attach source IDs)
   └── Step 1.3: Enrich Existing 79 Cities with genuine missing quarters (`PPLX` from NGA)
                                 │
                                 ▼
TRACK 2: Multi-Layer Expansion via 6 Bite-Sized Sub-Plans
   ├── Sub-Plan 1: Sub-District Governance (Tehsils & 44 Cantonment Boards via UN OCHA / ML&C)
   ├── Sub-Plan 2: Transit & Mobility Grid (Railway Stations, Metro/BRT Platforms, Major Chowks)
   ├── Sub-Plan 3: Emergency & Health Services (Rescue 1122 Stations, DHQ/THQ Hospitals, Police Thanas)
   ├── Sub-Plan 4: Rural Settlements & Cadastre (Populated Villages & Mauzas via COD-PS)
   ├── Sub-Plan 5: Commercial & Academic Hubs (Industrial Estates/SEZs & HEC Universities)
   └── Sub-Plan 6: Complete Pakistan Post Network (Full 13,000+ Delivery Post Office directory)
```

---

## 5. Detailed Breakdown: Track 1 (Immediate Foundation)

Before adding new layers, we first make the existing 79 cities rock-solid:

### Step 1.1: Schema Upgrade (`PakistanArea` & `PakistanAreaExtended`)
* **Core Model (`PakistanArea`)**: Retains essential properties: `id`, `name`, `urduName`, `cityId`, `provinceId`, `coordinates`, `postalCode`, `aliases`, `type`, `verified`.
* **Extended Model (`PakistanAreaExtended`)**: Adds `bounds?: CityBounds`, `radiusKm?: number`, and structured `sources?: ProvenanceSource[]`:
  ```typescript
  export interface ProvenanceSource {
    provider: 'nga' | 'pak_post' | 'un_ocha' | 'pbs' | 'official_gazette';
    id: string;         // e.g. "1372009", "51310", "PK30101"
    type?: string;       // e.g. "PPLX", "delivery_post_office"
    verifiedAt: string; // ISO date "2026-11-03"
  }
  ```

### Step 1.2: Differential Centroid Audit of Existing 1,279 Areas
* Run automated differential audit script comparing each area's current coordinates against NGA `PK.txt` coordinates.
* Categorize distance deltas ($\Delta d$):
  * **$\Delta d \le 300\text{m}$ (Green)**: Verified high precision; attach NGA ID.
  * **$300\text{m} < \Delta d \le 1.5\text{km}$ (Yellow)**: Acceptable approximation (entrance/market pin); refine to surveyed centroid.
  * **$\Delta d > 1.5\text{km}$ (Red)**: Coordinate drift; correct coordinate to empirical ground truth.

### Step 1.3: Ground-Truth City Enrichment via NGA `PPLX`
* Extract missing `PPLX` (urban quarters) that fall inside the district bounding boxes of our 79 cities.
* Join each candidate with the Pakistan Post Delivery Directory for its 5-digit postal code.
* Ingest with full provenance IDs into the respective `data/areas/<province>/<city>.json` files.

---

## 6. Detailed Breakdown: Track 2 (The 6 Sub-Plans)

### Sub-Plan 1: Sub-District Governance (Tehsils & Cantonment Boards)
* **Goal**: Ingest all ~550 official Tehsils/Talukas and 44 Cantonment Boards across Pakistan.
* **Sources**: UN OCHA COD-AB Level 3 & Military Lands and Cantonments (ML&C) Department.
* **Output**: `data/administrative/tehsils.json`, `data/administrative/cantonments.json`, subpath `pak-geodata/administrative`.

### Sub-Plan 2: Transportation & Mobility Grid (Rail, Metro, Interchanges)
* **Goal**: Ingest all operational Pakistan Railways stations (~1,000+), Metro/BRT platforms (Lahore Orange Line, Metrobus, Peshawar Zu BRT, Karachi Green Line), and major Motorway/Highway interchanges.
* **Sources**: Pakistan Railways official timetable gazette, Mass Transit Authorities, NHA.
* **Output**: `data/transit/railway_stations.json`, `data/transit/metro_stations.json`, `data/transit/interchanges.json`, subpath `pak-geodata/transit`.

### Sub-Plan 3: Emergency & Healthcare Infrastructure (Rescue 1122, Thanas, Hospitals)
* **Goal**: Ingest all official Rescue 1122 stations, DHQ/THQ hospitals, and Police Stations across Pakistan.
* **Sources**: Punjab Emergency Service (Rescue 1122) GIS registry, WHO / Ministry of Health Facility List, Provincial Police directories.
* **Output**: `data/emergency/rescue1122.json`, `data/emergency/hospitals.json`, `data/emergency/police_stations.json`, subpath `pak-geodata/emergency`.

### Sub-Plan 4: Rural Settlements & Cadastre (Populated Villages & Mauzas)
* **Goal**: Ingest verified villages and populated places (`PPL`) across all districts with UN P-codes.
* **Sources**: UN OCHA COD-PS (~35,000 settlements) & PLRA Mauza directory.
* **Output**: Partitioned district datasets `data/settlements/<province>/<district>.json`, subpath `pak-geodata/settlements`.

### Sub-Plan 5: Commercial, Industrial & Academic Hubs
* **Goal**: Ingest HEC-recognized higher education institutions and BOI/PIEDMC industrial estates.
* **Sources**: Higher Education Commission (HEC Pakistan), Board of Investment (BOI), PIEDMC / FIEDMC.
* **Output**: `data/education/universities.json`, `data/commercial/industrial_estates.json`, subpath `pak-geodata/commercial`.

### Sub-Plan 6: Complete Pakistan Post Network
* **Goal**: Digitize the complete Pakistan Post national delivery gazette, binding every village and urban post office to its genuine 5-digit postal code.
* **Sources**: Pakistan Post official National Postal Directory & Delivery Office Gazette.
* **Output**: `data/postal/delivery_offices.json`, subpath `pak-geodata/postal`.

---

## 7. Licensing, Attribution & Data Credits

`pak-geodata` maintains a transparent, dual-licensing and attribution architecture ensuring complete compliance with upstream open-data providers while preserving an MIT license for the code:

### 1. Code & Package Distribution License
* The client libraries, TypeScript declarations, build pipelines, CLI tools, and demo web application are released under the permissive **MIT License**.

### 2. Upstream Data Licenses & Attributions
Every external database used to curate, cross-reference, and audit `pak-geodata` is formally attributed:
* **National Geospatial-Intelligence Agency (NGA) / GeoNames**:
  * Toponymic gazetteer data is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
  * *Attribution*: Sourced from NGA / GeoNames geographical database (`PK.txt`).
* **OpenStreetMap (OSM)**:
  * Spatial geometry and historical nodes are licensed under the **Open Database License (ODbL)**.
  * *Attribution*: © OpenStreetMap contributors (`https://www.openstreetmap.org/copyright`).
* **UN OCHA / Humanitarian Data Exchange (HDX)**:
  * Common Operational Datasets (COD-AB, COD-PS) are licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
  * *Attribution*: United Nations Office for the Coordination of Humanitarian Affairs (OCHA) Pakistan.
* **Pakistan Post**:
  * Postal code mappings and delivery office names courtesy of Pakistan Post, Ministry of Communications, Government of Pakistan.
* **Pakistan Bureau of Statistics (PBS)**:
  * Population census boundaries and administrative unit gazettes courtesy of the Pakistan Bureau of Statistics, Government of Pakistan.

### 3. Implementation of Attribution Across the Project
* **`LICENSE` / `ATTRIBUTION.md`**: Create a formal `ATTRIBUTION.md` at repository root detailing each provider, their license terms, and upstream URLs.
* **README Documentation**: Include a prominent **Data Sources & Credits** section across `README.md`, `packages/npm/README.md`, and `packages/pypi/README.md`.
* **Package Manifests**: Add attribution metadata and links in `packages/npm/package.json` and `packages/pypi/pyproject.toml`.
* **Web Demo Footer**: Display clickable attribution links in the interactive demo app footer.

---

## 8. Execution Process

For each step and sub-plan:
1. **Isolated Worktree**: Execute on dedicated topic branches in isolated git worktrees.
2. **Provenance Enforcement**: Zero records admitted without external database IDs.
3. **Dual Language Support**: Standard English names + native Urdu Nastaliq typography.
4. **Automated Verification**: Run `verify.ts` and test runner with 0 errors before PR creation.
5. **No Direct Push to Main**: Strict commit, push, and Pull Request (`cppr`) workflow.

