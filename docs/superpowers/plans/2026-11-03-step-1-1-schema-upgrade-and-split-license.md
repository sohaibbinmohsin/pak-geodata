# Step 1.1: Schema Upgrade, Split-License & Attribution Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `PakistanArea` types and Zod validation schemas across TypeScript and Python to support structured provenance (`sources: ProvenanceSource[]`) and spatial extent metadata (`bounds`, `radiusKm`), implement the formal split-license architecture (`LICENSE-DATA`, `ATTRIBUTION.md`), and update build pipelines with 100% backward compatibility.

**Architecture:** A dual-layer schema design: core `PakistanArea` remains lightweight and backwards-compatible with legacy string arrays, while supporting structured `ProvenanceSource` objects and optional spatial bounding boxes. Legal separation establishes MIT for code and ODbL 1.0 / CC-BY 4.0 for data with explicit "Produced Work" commercial clarity.

**Tech Stack:** TypeScript 5.5, Zod 3.23, Python 3.9+ dataclasses, Node.js test runner (`node:test`), Python unittest, esbuild.

**Spec:** `docs/superpowers/plans/2026-11-03-pakistan-geodata-master-ontology-plan.md`

## Global Constraints
- **100% Backward Compatibility**: All 146 Node tests and 29 Python tests must continue to pass without modifications to existing data JSON files.
- **Zero Runtime Dependencies**: The npm and PyPI distribution packages must remain zero-dependency.
- **Strict Verification**: Full build (`npm run build`), type-checking (`npm run lint`), and demo compilation (`npm run build:demo`) must pass with 0 errors.
- **Never Push to Main**: All work must be committed to the topic branch and verified before opening/updating the Pull Request.

---

## File Structure

```
├── LICENSE                                    # Software code license (MIT)
├── LICENSE-DATA                               # Geographic datasets license (ODbL 1.0 & CC-BY 4.0) [NEW]
├── ATTRIBUTION.md                             # Upstream data sources registry [NEW]
├── packages/
│   ├── npm/
│   │   ├── src/
│   │   │   ├── types.ts                       # ProvenanceSource, PakistanArea extended types
│   │   │   └── index.ts                       # Re-exports of new interfaces
│   │   ├── tests/
│   │   │   └── types.test.ts                  # Type and backward compatibility tests
│   │   └── README.md                          # Licensing FAQ & Data Credits
│   └── pypi/
│       ├── pak_geodata/
│       │   ├── models.py                      # ProvenanceSource dataclass, bounds & radius_km
│       │   └── __init__.py                    # Re-export of ProvenanceSource
│       ├── tests/
│       │   └── test_lookups.py                # Python model tests
│       └── README.md                          # Licensing FAQ & Data Credits
├── pipeline/
│   └── validators/
│       └── schema.ts                          # ProvenanceSourceSchema, AreaSchema update
├── scripts/
│   ├── build.ts                               # Synchronize LICENSE-DATA & ATTRIBUTION.md
│   └── verify.test.ts                         # Validation unit tests for new schema fields
└── README.md                                  # Root Licensing & Commercial Use FAQ
```

---

## Tasks

### Task 1: Create Legal Split-License Files & Build Synchronization

**Files:**
- Create: `LICENSE-DATA`
- Create: `ATTRIBUTION.md`
- Modify: `scripts/build.ts:90-100`
- Modify: `tests/bundle.test.ts:1-40`

**Interfaces:**
- Produces: `LICENSE-DATA` (ODbL 1.0 & CC-BY 4.0 open data terms)
- Produces: `ATTRIBUTION.md` (attributions for NGA/GeoNames, OSM, UN OCHA, Pakistan Post, PBS)
- Synchronizes: `packages/npm/LICENSE-DATA`, `packages/npm/ATTRIBUTION.md`, `packages/pypi/LICENSE-DATA`, `packages/pypi/ATTRIBUTION.md`

- [ ] **Step 1: Write the failing test for license synchronization**

Edit `tests/bundle.test.ts` to assert that `LICENSE-DATA` and `ATTRIBUTION.md` exist in both `packages/npm/` and `packages/pypi/`:

```typescript
test('build pipeline synchronizes LICENSE-DATA and ATTRIBUTION.md to packages', () => {
  const root = process.cwd();
  const files = [
    resolve(root, 'LICENSE-DATA'),
    resolve(root, 'ATTRIBUTION.md'),
    resolve(root, 'packages/npm/LICENSE-DATA'),
    resolve(root, 'packages/npm/ATTRIBUTION.md'),
    resolve(root, 'packages/pypi/LICENSE-DATA'),
    resolve(root, 'packages/pypi/ATTRIBUTION.md'),
  ];
  for (const f of files) {
    assert.ok(existsSync(f), `Expected file to exist: ${f}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/bundle.test.ts`  
Expected: FAIL (`Expected file to exist: .../LICENSE-DATA`)

- [ ] **Step 3: Create `LICENSE-DATA` and `ATTRIBUTION.md`**

Create `LICENSE-DATA`:
```text
Open Data License for pak-geodata Datasets

The geographic datasets included in this repository (all files under data/,
packages/npm/src/data/, and packages/pypi/pak_geodata/data/) are open data
compiled from multiple public and open sources.

They are made available under the following dual-licensing terms:

1. Open Database License 1.0 (ODbL)
   For data derived from OpenStreetMap:
   https://opendatacommons.org/licenses/odbl/1-0/
   © OpenStreetMap contributors

2. Creative Commons Attribution 4.0 International (CC BY 4.0)
   For toponymic gazetteer and settlement records derived from NGA / GeoNames
   and UN OCHA Common Operational Datasets:
   https://creativecommons.org/licenses/by/4.0/

PRODUCED WORK EXEMPTION (ODbL Section 4.3):
Using these datasets to power address autocompletion, checkout forms, search
indexes, map displays, or logistics dispatch in a proprietary, commercial,
or open-source application constitutes a "Produced Work".

Creating a Produced Work DOES NOT require you to open-source your application,
backend source code, or business logic. You only need to provide standard
attribution acknowledging pak-geodata and its upstream contributors.
```

Create `ATTRIBUTION.md`:
```markdown
# Upstream Data Sources & Attribution Registry

`pak-geodata` aggregates, normalizes, and verifies spatial data from multiple authoritative open sources. We gratefully acknowledge:

### 1. National Geospatial-Intelligence Agency (NGA) & GeoNames
- **Source**: NGA / GeoNames Pakistan gazetteer database (`PK.txt`).
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **URL**: https://www.geonames.org/

### 2. OpenStreetMap (OSM)
- **Source**: OpenStreetMap spatial polygons, highway junctions, and transit nodes.
- **License**: Open Database License 1.0 (ODbL) © OpenStreetMap contributors.
- **URL**: https://www.openstreetmap.org/copyright

### 3. UN OCHA / Humanitarian Data Exchange (HDX)
- **Source**: Pakistan Common Operational Datasets (COD-AB and COD-PS).
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **URL**: https://data.humdata.org/dataset/cod-ps-pak

### 4. Pakistan Post, Government of Pakistan
- **Source**: National Postal Code Directory and Delivery Office Gazette.
- **URL**: https://www.pakpost.gov.pk/

### 5. Pakistan Bureau of Statistics (PBS), Government of Pakistan
- **Source**: 7th Population & Housing Census (2023 Digital Census) gazettes.
- **URL**: https://www.pbs.gov.pk/
```

- [ ] **Step 4: Update `scripts/build.ts` to synchronize `LICENSE-DATA` and `ATTRIBUTION.md`**

In `scripts/build.ts`, update Step 2 after copying `LICENSE`:
```typescript
  const rootLicenseData = resolve(rootDir, 'LICENSE-DATA');
  if (existsSync(rootLicenseData)) {
    cpSync(rootLicenseData, resolve(rootDir, 'packages/npm/LICENSE-DATA'));
    cpSync(rootLicenseData, resolve(rootDir, 'packages/pypi/LICENSE-DATA'));
  }

  const rootAttribution = resolve(rootDir, 'ATTRIBUTION.md');
  if (existsSync(rootAttribution)) {
    cpSync(rootAttribution, resolve(rootDir, 'packages/npm/ATTRIBUTION.md'));
    cpSync(rootAttribution, resolve(rootDir, 'packages/pypi/ATTRIBUTION.md'));
  }
  console.log('✔ LICENSE, LICENSE-DATA, and ATTRIBUTION.md synchronized to packages');
```

- [ ] **Step 5: Run build and tests to verify pass**

Run: `npm run build && npx tsx --test tests/bundle.test.ts`  
Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add LICENSE-DATA ATTRIBUTION.md scripts/build.ts tests/bundle.test.ts packages/npm/LICENSE-DATA packages/npm/ATTRIBUTION.md packages/pypi/LICENSE-DATA packages/pypi/ATTRIBUTION.md
git commit -m "feat(legal): establish split-license architecture with LICENSE-DATA and ATTRIBUTION.md"
```

---

### Task 2: TypeScript Schema & Type Definitions

**Files:**
- Modify: `packages/npm/src/types.ts:1-45`
- Modify: `packages/npm/src/index.ts:1-30`
- Modify: `packages/npm/tests/types.test.ts:1-50`

**Interfaces:**
- Produces: `export interface ProvenanceSource { provider: ...; id?: string; type?: string; url?: string; verifiedAt?: string; }`
- Produces: `export interface CityBounds { minLat: number; maxLat: number; minLng: number; maxLng: number; }`
- Updates: `export interface PakistanArea { ... bounds?: CityBounds; radiusKm?: number; sources?: (string | ProvenanceSource)[]; }`
- Produces: `export interface PakistanAreaExtended extends PakistanArea { bounds: CityBounds; radiusKm: number; sources: ProvenanceSource[]; }`

- [ ] **Step 1: Write the failing test for TypeScript extended types**

Edit `packages/npm/tests/types.test.ts` to assert that `ProvenanceSource`, `CityBounds`, and `PakistanAreaExtended` work seamlessly with backward-compatible string sources:

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import type { PakistanArea, ProvenanceSource, PakistanAreaExtended, CityBounds } from '../src/types.js';

test('types: PakistanArea accepts legacy string sources and structured ProvenanceSource', () => {
  const legacyArea: PakistanArea = {
    id: 'lahore-gulberg-3',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'Gulberg III',
    aliases: ['Gulberg 3'],
    coordinates: { lat: 31.512, lng: 74.345 },
    verified: true,
    sources: ['survey', 'curated'],
  };
  assert.equal(legacyArea.sources?.length, 2);

  const structuredSource: ProvenanceSource = {
    provider: 'nga',
    id: '1372009',
    type: 'PPLX',
    verifiedAt: '2026-11-03',
  };

  const modernArea: PakistanArea = {
    ...legacyArea,
    bounds: { minLat: 31.5, maxLat: 31.52, minLng: 74.33, maxLng: 74.36 },
    radiusKm: 1.8,
    sources: [structuredSource],
  };

  assert.equal(modernArea.radiusKm, 1.8);
  assert.equal((modernArea.sources?.[0] as ProvenanceSource).provider, 'nga');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test packages/npm/tests/types.test.ts`  
Expected: FAIL (`ProvenanceSource is not exported`)

- [ ] **Step 3: Update `packages/npm/src/types.ts` and `packages/npm/src/index.ts`**

In `packages/npm/src/types.ts`:
```typescript
export interface CityBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export type ProvenanceProvider =
  | 'nga'
  | 'pak_post'
  | 'un_ocha'
  | 'pbs'
  | 'osm'
  | 'official_gazette'
  | 'survey'
  | 'curated';

export interface ProvenanceSource {
  provider: ProvenanceProvider;
  id?: string;
  type?: string;
  url?: string;
  verifiedAt?: string;
}

export interface PakistanArea {
  id: string;
  cityId: string;
  provinceId: string;
  name: string;
  urduName?: string;
  aliases: string[];
  postalCode?: string;
  coordinates: Coordinates;
  type?: AreaType;
  verified: boolean;
  bounds?: CityBounds;
  radiusKm?: number;
  sources?: (string | ProvenanceSource)[];
}

export interface PakistanAreaExtended extends PakistanArea {
  bounds: CityBounds;
  radiusKm: number;
  sources: ProvenanceSource[];
}
```

In `packages/npm/src/index.ts`, re-export `CityBounds`, `ProvenanceProvider`, `ProvenanceSource`, `PakistanAreaExtended`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test packages/npm/tests/types.test.ts`  
Expected: PASS

- [ ] **Step 5: Run full TypeScript check**

Run: `npm run lint`  
Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add packages/npm/src/types.ts packages/npm/src/index.ts packages/npm/tests/types.test.ts
git commit -m "feat(types): add ProvenanceSource, CityBounds, and PakistanAreaExtended types"
```

---

### Task 3: Python Model Upgrade (`packages/pypi/pak_geodata/models.py`)

**Files:**
- Modify: `packages/pypi/pak_geodata/models.py:1-126`
- Modify: `packages/pypi/pak_geodata/__init__.py:1-45`
- Modify: `packages/pypi/tests/test_lookups.py:350-400`

**Interfaces:**
- Produces: `@dataclass(frozen=True) class ProvenanceSource: provider: str; id: Optional[str]; type: Optional[str]; url: Optional[str]; verified_at: Optional[str]`
- Updates: `class PakistanArea: ... bounds: Optional[CityBounds] = None; radius_km: Optional[float] = None; sources: List[Union[str, ProvenanceSource]] = field(default_factory=list)`

- [ ] **Step 1: Write the failing Python test for model provenance and bounds**

In `packages/pypi/tests/test_lookups.py`, add `test_area_provenance_and_bounds`:

```python
    def test_area_provenance_and_bounds(self):
        source = ProvenanceSource(
            provider="nga",
            id="1372009",
            type="PPLX",
            verified_at="2026-11-03",
        )
        bounds = CityBounds(min_lat=31.5, max_lat=31.52, min_lng=74.33, max_lng=74.36)
        area = PakistanArea(
            id="lahore-gulberg-3",
            city_id="lahore",
            province_id="punjab",
            name="Gulberg III",
            coordinates=Coordinates(lat=31.512, lng=74.345),
            bounds=bounds,
            radius_km=1.8,
            sources=[source, "curated"],
        )
        self.assertEqual(area.radius_km, 1.8)
        self.assertEqual(area.bounds.min_lat, 31.5)
        self.assertEqual(len(area.sources), 2)
        self.assertIsInstance(area.sources[0], ProvenanceSource)
        self.assertEqual(area.sources[0].provider, "nga")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest packages/pypi/tests/test_lookups.py`  
Expected: FAIL (`NameError: name 'ProvenanceSource' is not defined`)

- [ ] **Step 3: Implement `ProvenanceSource` in `models.py` and `__init__.py`**

In `packages/pypi/pak_geodata/models.py`:
```python
from typing import List, Optional, Union

@dataclass(frozen=True)
class ProvenanceSource:
    """Audit provenance record linking an entity to its upstream database."""

    provider: str
    id: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None
    verified_at: Optional[str] = None

    @property
    def verifiedAt(self) -> Optional[str]:
        return self.verified_at
```

Update `PakistanArea`:
```python
@dataclass(frozen=True)
class PakistanArea:
    """Specific neighborhood, suburb, society, or sector within a Pakistani city."""

    id: str
    city_id: str
    province_id: str
    name: str
    aliases: List[str] = field(default_factory=list)
    coordinates: Optional[Coordinates] = None
    urdu_name: Optional[str] = None
    postal_code: Optional[str] = None
    type: Optional[str] = None
    verified: bool = False
    bounds: Optional[CityBounds] = None
    radius_km: Optional[float] = None
    sources: List[Union[str, ProvenanceSource]] = field(default_factory=list)

    @property
    def radiusKm(self) -> Optional[float]:
        return self.radius_km
```

In `packages/pypi/pak_geodata/__init__.py`, import and re-export `ProvenanceSource`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest packages/pypi/tests/test_lookups.py`  
Expected: PASS (all 30 tests pass cleanly).

- [ ] **Step 5: Commit**

```bash
git add packages/pypi/pak_geodata/models.py packages/pypi/pak_geodata/__init__.py packages/pypi/tests/test_lookups.py
git commit -m "feat(pypi): add ProvenanceSource dataclass and optional bounds/radius_km to PakistanArea"
```

---

### Task 4: Ingestion Zod Validator Upgrade (`pipeline/validators/schema.ts`)

**Files:**
- Modify: `pipeline/validators/schema.ts:1-55`
- Modify: `scripts/verify.test.ts:40-70`

**Interfaces:**
- Produces: `export const ProvenanceSourceSchema = z.object({ ... })`
- Updates: `AreaSchema` with optional `bounds`, `radiusKm`, and union `sources: z.array(z.union([z.string(), ProvenanceSourceSchema]))`

- [ ] **Step 1: Write the failing test for Zod validator**

In `scripts/verify.test.ts`, add test:

```typescript
test('verifier: AreaSchema validates structured sources, bounds, and radiusKm', () => {
  const areaWithMetadata = {
    id: 'lahore-gulberg-3',
    cityId: 'lahore',
    provinceId: 'punjab',
    name: 'Gulberg III',
    coordinates: { lat: 31.512, lng: 74.345 },
    verified: true,
    bounds: { minLat: 31.5, maxLat: 31.52, minLng: 74.33, maxLng: 74.36 },
    radiusKm: 1.8,
    sources: [
      {
        provider: 'nga',
        id: '1372009',
        type: 'PPLX',
        verifiedAt: '2026-11-03'
      },
      'curated'
    ]
  };
  const parsed = AreaSchema.safeParse(areaWithMetadata);
  assert.ok(parsed.success, `Schema validation failed: ${JSON.stringify(parsed.error?.format())}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/verify.test.ts`  
Expected: FAIL (`Unrecognized keys: bounds, radiusKm` or `invalid sources type`)

- [ ] **Step 3: Update `pipeline/validators/schema.ts`**

Update `pipeline/validators/schema.ts`:
```typescript
export const CityBoundsSchema = z.object({
  minLat: z.number().min(23.5).max(37.1),
  maxLat: z.number().min(23.5).max(37.1),
  minLng: z.number().min(60.8).max(77.8),
  maxLng: z.number().min(60.8).max(77.8)
});

export const ProvenanceSourceSchema = z.object({
  provider: z.enum([
    'nga',
    'pak_post',
    'un_ocha',
    'pbs',
    'osm',
    'official_gazette',
    'survey',
    'curated'
  ]),
  id: z.string().optional(),
  type: z.string().optional(),
  url: z.string().url().optional(),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const AreaSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+-[a-z0-9-]+$/),
  cityId: z.string().min(2),
  provinceId: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
  coordinates: CoordinatesSchema,
  type: z.enum([
    'neighborhood',
    'suburb',
    'commercial',
    'housing_society',
    'sector',
    'industrial',
    'administrative'
  ]).optional(),
  verified: z.boolean(),
  bounds: CityBoundsSchema.optional(),
  radiusKm: z.number().positive().optional(),
  sources: z.array(z.union([z.string(), ProvenanceSourceSchema])).optional()
});
```

- [ ] **Step 4: Run verification tests to verify pass**

Run: `npx tsx --test scripts/verify.test.ts && npx tsx scripts/verify.ts`  
Expected: PASS (all master data and unit tests pass with 0 errors).

- [ ] **Step 5: Commit**

```bash
git add pipeline/validators/schema.ts scripts/verify.test.ts
git commit -m "feat(validator): support CityBoundsSchema, ProvenanceSourceSchema, and radiusKm in AreaSchema"
```

---

### Task 5: Documentation & Commercial Use FAQ Update

**Files:**
- Modify: `README.md`
- Modify: `packages/npm/README.md`
- Modify: `packages/pypi/README.md`

**Content Requirements:**
- Add **Licensing & Commercial Use FAQ**:
  - Clarify that software is MIT.
  - Clarify that geographic datasets are ODbL 1.0 & CC-BY 4.0.
  - Explain ODbL Section 4.3 ("Produced Work") in plain English: using `pak-geodata` in a proprietary checkout form or delivery app **never forces you to open-source your code**.
- Add **Data Sources & Attribution Registry**:
  - Explicit links to NGA/GeoNames, OpenStreetMap, UN OCHA, and Pakistan Post.

- [ ] **Step 1: Update README.md, packages/npm/README.md, and packages/pypi/README.md**

Add the dedicated section to each README:
```markdown
## Licensing & Commercial Use FAQ

### Can I use `pak-geodata` in commercial, proprietary, or closed-source applications?
**Yes.** 
* **The Software Code** (NPM and PyPI packages, algorithms, TypeScript declarations) is licensed under the permissive **MIT License**.
* **The Geographic Datasets** are open data licensed under the **Open Database License (ODbL 1.0)** and **Creative Commons Attribution 4.0 (CC BY 4.0)**.

Under **ODbL Section 4.3**, querying `pak-geodata` to power an address autocompletion dropdown, route delivery drivers, validate a postal code, or display map markers creates a **"Produced Work"**:
* It **does NOT** require you to open-source your application, proprietary algorithms, or user data.
* You only need to include standard attribution in your app's credits/legal screen (e.g. *"Geographic data courtesy of pak-geodata"*).
* Share-Alike only applies if you publicly redistribute the raw underlying database itself.
```

- [ ] **Step 2: Run full build and test suites**

Run:
```bash
npm run build
npm test
npm run lint
npm run build:demo
```
Expected: All 146+ Node tests and 30 Python tests pass; 0 lint errors; Vite demo builds cleanly.

- [ ] **Step 3: Commit**

```bash
git add README.md packages/npm/README.md packages/pypi/README.md
git commit -m "docs: add licensing FAQ, Produced Work clarity, and upstream attribution to READMEs"
```

---

## Plan Review & Checkpoint

Upon completion of this plan:
1. `LICENSE-DATA` and `ATTRIBUTION.md` are established in root and synchronized to both npm and pypi packages.
2. `PakistanArea` supports structured `ProvenanceSource`, `bounds`, and `radiusKm` across TypeScript, Python, and Zod validators with 100% backward compatibility.
3. Commercial users have unambiguous legal clarity on MIT vs. ODbL "Produced Work" usage.
4. The codebase is immediately ready for **Step 1.2 (Auditing existing 1,279 areas against the NGA master database)**.
