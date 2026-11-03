# Pakistan GeoData Master Spatial Ontology & Nationwide Mapping Plan

> **Goal:** Transform `pak-geodata` from an urban neighborhood lookup library into Pakistan's definitive, open-source, offline, typed, zero-hallucination geospatial ontology covering all administrative, rural, transit, emergency, healthcare, industrial, educational, and postal layers.
>
> **Architecture:** A typed, layered multi-package architecture (TypeScript/Node and Python) with subpath tree-shaking exports, strict provenance tracing (every entry keyed to an official government or OpenStreetMap entity ID), and automated 3-tier validation pipelines.
>
> **Tech Stack:** TypeScript (ESM + CommonJS, DTS), Python 3.9+ (dataclasses), Zod validation, Turf.js / Haversine spatial math, Overpass / OSM PBF extractors, Node.js test runner, Python unittest.
>
> **Master File Location:** `docs/superpowers/plans/2026-11-03-pakistan-geodata-master-ontology-plan.md`

---

## 1. The Zero-Hallucination Constitution

To prevent synthetic drift or LLM guesswork from ever entering `pak-geodata`, every entity across all layers must strictly satisfy the **Three Golden Ingestion Laws**:

1. **Law of Provenance (`sourceId` & `sourceType`)**:
   - Every single record in the repository MUST carry an immutable audit trail pointing to an authoritative external database.
   - Recognized source types:
     - `osm:<type>/<id>` (e.g. `osm:node/123456789`, `osm:way/987654321`)
     - `pbs:<level>:<code/id>` (Pakistan Bureau of Statistics 2023 Digital Census)
     - `un_ocha:<pcode>` (United Nations OCHA Common Operational Datasets COD-PS / COD-AB)
     - `pak_post:<office_id>` (Pakistan Post National Directory)
     - `plra:<mauza_code>` (Punjab Land Records Authority Cadastre)
     - `hec:<inst_id>` (Higher Education Commission Registry)
     - `pes_1122:<station_id>` (Punjab Emergency Service 1122 Registry)
   - Entries lacking verifiable `sources` with valid external IDs are rejected automatically at build time.

2. **Law of Physical Coordinates (Zero Interpolation)**:
   - Centroids must be extracted directly from surveyed node coordinates, polygon geometric centroids, or verified gazette coordinates.
   - Bounding-box spatial interpolation, random offset generation, or synthetic quota padding is strictly prohibited. If a city or tehsil has 3 verified entities in public records, it has 3 entities. No artificial quotas.

3. **Law of Boundary Containment**:
   - Every entity's centroid must programmatically lie within:
     - Pakistan's national territorial bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`).
     - Its designated parent administrative boundary polygon or district bounding box.

---

## 2. The 10-Layer Spatial Ontology Architecture

```
Layer 0: National Administrative Backbone (Provinces -> Divisions -> Districts)
   │
Layer 1: Sub-District Governance (Tehsils/Talukas, Cantonment Boards, Union Councils)
   │
Layer 2: Urban Fabric & Localities (CDA/KDA Sectors, Housing Schemes, Mohallahs, Goths)
   │
Layer 3: Rural Cadastre & Settlements (Mauzas, Dehs, Chaks, Villages, Hamlets)
   │
Layer 4: Transportation & Mobility Grid (Chowks, Mors, Railway Stations, Metro/BRT, Ports)
   │
Layer 5: Emergency & Public Safety (Rescue 1122 Stations, Police Thanas, Fire Stations)
   │
Layer 6: Healthcare Infrastructure (Tertiary/Teaching Hospitals, DHQs, THQs, BHUs)
   │
Layer 7: Commercial & Industrial Hubs (SEZs, Industrial Estates, Wholesale Mandis)
   │
Layer 8: Educational Campuses (HEC Universities, Medical & Engineering Colleges)
   │
Layer 9: Postal & Logistics Delivery (GPOs, Sub-Post Offices, Delivery Branch Offices)
```

---

## 3. Layer Specifications & Ground-Truth Data Sources

### Layer 0: Administrative Backbone (Baseline Complete)
- **Entities**: 7 Provinces/Territories, 37 Administrative Divisions, 160+ Districts, 79 Primary Urban Cities.
- **Ground-Truth Source**: Pakistan Bureau of Statistics (PBS), Survey of Pakistan, UN OCHA COD-AB Level 0–2.
- **Status in Library**: Already completed and verified in Phases 1 & 2.

### Layer 1: Sub-District Governance & Cantonments
- **Entities**:
  - **Tehsils / Talukas (~550)**: The official administrative sub-district units across all 7 territories.
  - **Cantonment Boards (44)**: Autonomous military municipal jurisdictions (Clifton Cantt, Rawalpindi Cantt, Walton Cantt, etc.) with municipal boundaries distinct from civil district corporations.
  - **Union Councils & Wards (~7,000 UCs)**: Key local governance units required for domicile and electoral verification.
- **Ground-Truth Source**: 
  - UN OCHA Pakistan Administrative Boundaries (Level 3 - Tehsils).
  - Military Lands and Cantonments (ML&C) Department official directory.
  - Election Commission of Pakistan (ECP) delimitation notifications.

### Layer 2: Urban Fabric & Localities (Active Expansion)
- **Entities**: CDA/LDA/KDA/RDA Sectors, Block subdivisions, Housing Schemes, Gated Townships, and Organic Historical Quarters (e.g., Qasba Colony, Machar Colony, Dhok Hassu, Marghzar Colony).
- **Ground-Truth Source**: OpenStreetMap (`place=suburb`, `place=neighbourhood`, `place=quarter`), development authority master plans (CDA, LDA, KDA).
- **Status in Library**: 1,279 verified areas across all 79 cities (PR #13).

### Layer 3: Rural Cadastre & Settlements (Villages / Mauzas)
- **Entities**: Official Villages, *Mauzas* (Punjab/KPK), *Dehs* (Sindh), *Killis* (Balochistan), *Chaks* (Canal Colonies), and *Bandas / Garhis*.
- **Ground-Truth Source**: 
  - UN OCHA COD-PS (Common Operational Dataset - Populated Places, ~35,000 georeferenced settlement points in Pakistan).
  - Punjab Land Records Authority (PLRA) Mauza directory.
  - GeoNames Pakistan Populated Places (`feature_class=P`).

### Layer 4: Transportation & Mobility Grid
- **Entities**:
  - **Chowks, Mors & Highway Interchanges**: Major navigational junctions (Kalma Chowk, Banaras Chowk, Liberty Chowk, Faizabad Interchange, Motorway M-2 Interchanges).
  - **Railway Stations (~1,000+)**: Operational stations on Pakistan Railways network with official station codes (`PR:LHR`, `PR:RWP`, `PR:KHI`).
  - **Metro & BRT Platforms**: Exact station platform centroids for Lahore Orange Line, Lahore Metrobus, Rawalpindi-Islamabad Metrobus, Peshawar Zu BRT, Karachi Green Line.
  - **Intercity Bus & Truck Terminals (*Addas*)**: Badami Bagh, Pirwadhai, Sohrab Goth Bus Terminal, Daewoo terminals.
  - **Airports & Ports**: CAA commercial aerodromes, Karachi Port Trust, Port Qasim, Gwadar Port, Dry Ports.
- **Ground-Truth Source**: OpenStreetMap (`railway=station`, `highway=motorway_junction`, `amenity=bus_station`), Pakistan Railways official timetable, Civil Aviation Authority (CAA).

### Layer 5: Emergency & Public Safety
- **Entities**:
  - **Rescue 1122 Stations**: Operational emergency ambulance and rescue centers across Punjab, KPK, GB, and AJK.
  - **Police Stations (*Thanas*)**: Territorial jurisdictional police stations with station coordinates.
  - **Fire Brigade Stations**: Municipal fire rescue headquarters.
- **Ground-Truth Source**: Punjab Emergency Service (PES 1122) GIS registry, Provincial Police departmental directories (e.g. Punjab Police GIS, Sindh Police).

### Layer 6: Healthcare Infrastructure
- **Entities**:
  - **Tertiary Teaching Hospitals**: (Mayo, Jinnah, PIMS, AKUH, Lady Reading, Nishtar, Civil).
  - **District Headquarter (DHQ) Hospitals**: (1 per district).
  - **Tehsil Headquarter (THQ) Hospitals**: (1 per tehsil).
  - **Basic Health Units (BHUs) & Rural Health Centers (RHCs)**: Rural primary care nodes.
- **Ground-Truth Source**: Ministry of National Health Services, WHO Pakistan Health Facility Master List, provincial Health Departments.

### Layer 7: Commercial & Industrial Hubs
- **Entities**:
  - **Special Economic Zones (SEZs) & Industrial Trading Estates**: (SITE Karachi, Korangi Industrial Area, Sundar Industrial Estate, Hattar, Faisalabad M-3 Industrial City).
  - **Wholesale Mandis**: Grain markets (Galla Mandi), Fruit & Vegetable markets (Sabzi Mandi), Timber and Steel markets.
  - **Major Bazaars & Shopping Malls**: (Anarkali, Raja Bazaar, Saddar, Tariq Road, Centaurus, Packages, Lucky One).
- **Ground-Truth Source**: Board of Investment (BOI) Pakistan, PIEDMC / FIEDMC / Sindh SITE Ltd, OSM commercial polygons.

### Layer 8: Educational & Academic Institutions
- **Entities**:
  - **Universities & Degree-Awarding Institutions (~250+)**: HEC-recognized main campuses and regional sub-campuses.
  - **Medical & Dental Colleges (~180+)**: PMDC-recognized medical universities and colleges.
  - **Engineering & Technology Campuses**: PEC-accredited campuses.
- **Ground-Truth Source**: Higher Education Commission (HEC Pakistan - `hec.gov.pk`), PMDC, PEC registries.

### Layer 9: Postal & Delivery Infrastructure
- **Entities**:
  - **General Post Offices (GPOs) & Head Post Offices (HPOs)**: Major postal processing centers.
  - **Sub-Post Offices (SPOs) & Delivery Branch Offices (EDBOs)**: Over 13,000 delivery points mapped to their official 5-digit Pakistan Post codes.
- **Ground-Truth Source**: Pakistan Post official National Postal Directory & Delivery Office Gazette.

---

## 4. Package Architecture & Subpath Modularization

To prevent package bloat and ensure zero performance penalties for basic lookups, the data is partitioned into modular subpaths:

```
pak-geodata (Core: Provinces, Cities, Top Metros, Hierarchy Engine)
  ├── pak-geodata/administrative   # Tehsils, Cantonment Boards, Wards
  ├── pak-geodata/settlements      # Towns, Villages, Mauzas, Dehs (searchable by district)
  ├── pak-geodata/transit          # Chowks, Mors, Railway Stations, Metro/BRT, Interchanges
  ├── pak-geodata/emergency        # Rescue 1122 Stations, Police Thanas, Hospitals
  ├── pak-geodata/commercial       # Industrial Estates, SEZs, Wholesale Mandis
  ├── pak-geodata/education        # Universities, Medical & Engineering Campuses
  ├── pak-geodata/postal           # 13,000+ Pakistan Post Delivery Offices
  ├── pak-geodata/hierarchy        # Lightweight PWA bilingual hierarchy (< 5 KB gzipped)
  └── pak-geodata/areas/<city>     # Deep city modular slices (tree-shakeable)
```

---

## 5. Master Roadmap & Sub-Plan Breakdown

We decompose the entire vision into 6 actionable sub-plans. Each sub-plan will be executed in its own isolated worktree following strict TDD, with dedicated verification tests and code review gates.

### Sub-Plan 1: Sub-District Administrative Hierarchy (Tehsils & Cantonments)
* **Goal**: Ingest all ~550 official Tehsils/Talukas and 44 Cantonment Boards across Pakistan from UN OCHA COD-AB and ML&C data.
* **Target Output**: `data/administrative/tehsils.json`, `data/administrative/cantonments.json`, subpath export `pak-geodata/administrative`.
* **Deliverable**: Complete district $\rightarrow$ tehsil/cantonment hierarchy integrated into `PakLocationItem`.

### Sub-Plan 2: Transportation & Mobility Grid (Transit Nodes, Rail & Metro)
* **Goal**: Ingest all Pakistan Railway stations, urban Metro/BRT platforms, and major highway interchanges/chowks via OpenStreetMap and Pakistan Railways gazette.
* **Target Output**: `data/transit/railway_stations.json`, `data/transit/metro_stations.json`, `data/transit/chowks_interchanges.json`, subpath export `pak-geodata/transit`.
* **Deliverable**: High-accuracy transit routing and nearest-station geocoding.

### Sub-Plan 3: Emergency & Healthcare Infrastructure (Rescue 1122, Thanas, Hospitals)
* **Goal**: Ingest all official Rescue 1122 stations, DHQ/THQ hospitals, and Police Stations across Pakistan.
* **Target Output**: `data/emergency/rescue1122.json`, `data/emergency/police_stations.json`, `data/emergency/hospitals.json`, subpath export `pak-geodata/emergency`.
* **Deliverable**: Dedicated emergency dispatch and medical facility locator with zero API cost.

### Sub-Plan 4: Populated Places & Rural Settlements (Villages, Mauzas, Dehs)
* **Goal**: Ingest UN OCHA COD-PS and PLRA datasets to cover rural Pakistan down to the village/mauza level with verified P-codes and parent district associations.
* **Target Output**: `data/settlements/<province>/<district>.json`, subpath export `pak-geodata/settlements`.
* **Deliverable**: Nationwide rural e-commerce and logistics delivery coverage.

### Sub-Plan 5: Academic & Economic Hubs (Universities, SEZs, Mandis)
* **Goal**: Ingest HEC-recognized higher education institutions and BOI/PIEDMC industrial estates.
* **Target Output**: `data/education/universities.json`, `data/commercial/industrial_estates.json`, subpath export `pak-geodata/commercial`.
* **Deliverable**: Verification and autocompletion for campus and commercial deliveries.

### Sub-Plan 6: Comprehensive Pakistan Post Delivery Gazette (13,000+ Branch Offices)
* **Goal**: Digitize the complete Pakistan Post national delivery gazette, binding each village and urban post office to its genuine 5-digit postal code.
* **Target Output**: `data/postal/delivery_offices.json`, subpath export `pak-geodata/postal`.
* **Deliverable**: 100% accurate postal code resolution and reverse postal lookups for every postal zone in Pakistan.

---

## 6. Execution Process & Next Step

Now that this Master Plan is codified, our operational cycle for each sub-plan will follow this continuous loop:
1. **Create Sub-Plan Spec & Plan Document**: Write `docs/superpowers/plans/YYYY-MM-DD-<subplan-name>.md` detailing exact schemas, data sources, and test suites.
2. **Setup Dedicated Git Worktree**: Branch cleanly from the latest verified state.
3. **Automated Ingestion Script with Verification Gate**:
   - Ingest raw government / OSM / UN OCHA datasets into clean JSON.
   - Run spatial validator (Zod schema + bounds check + anti-collision).
   - Reject any entry with missing provenance or imprecise coordinates.
4. **Compile TypeScript & Python Distributions**: Rebuild ESM/CJS bundles and sync Python models.
5. **Full Test & Lint Verification**: 100% passing test suites across both Node and Python.
6. **Commit, Push & Open Pull Request (`cppr`)**.
