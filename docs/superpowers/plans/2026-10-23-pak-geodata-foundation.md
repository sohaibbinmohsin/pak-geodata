# pak-geodata Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete monorepo foundation for `pak-geodata` containing modular JSON master data, automated spatial verification pipeline, Phase 1 flagship metros dataset (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad), and zero-dependency production packages for TypeScript/NPM and Python/PyPI.

**Architecture:** Monorepo with a single source of truth in `data/` (provinces, cities, areas), a verification/ingestion pipeline in `pipeline/` enforcing coordinate geofencing and postal validation, and code-generation build scripts in `scripts/` compiling data into tree-shakeable `packages/npm` and typed `packages/pypi`.

**Tech Stack:** TypeScript (Node.js v22), Python 3.14, vitest / Node test runner, pytest, Turf.js / geometric calculation, Zod schema validation.

**Spec:** [`docs/superpowers/specs/2026-10-23-pak-geodata-design.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/docs/superpowers/specs/2026-10-23-pak-geodata-design.md)

## Global Constraints

- Never push directly to `main` or `master`; work on feature branches.
- Production build (`npm run build` and python test) must succeed with 0 errors before completion.
- Zero runtime dependencies in the distributed NPM and PyPI client libraries.
- Strict coordinates geofencing: all points must fall within Pakistan bounds (`lat: 23.5 - 37.1`, `lng: 60.8 - 77.8`) and within city district limits.
- Canonical slugs must follow `<city-slug>-<area-slug>` format.

---

### Task 1: Monorepo Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/npm/package.json`
- Create: `packages/npm/tsconfig.json`
- Create: `packages/pypi/pyproject.toml`

**Interfaces:**
- Produces: Root monorepo workspace configuration with npm scripts (`build`, `test`, `verify`, `lint`).

- [ ] **Step 1: Write root .gitignore**

```text
node_modules/
dist/
*.pyc
__pycache__/
.pytest_cache/
*.egg-info/
build/
pipeline/raw/
.DS_Store
```

- [ ] **Step 2: Create root package.json and tsconfig.base.json**

Create `package.json`:
```json
{
  "name": "pak-geodata-monorepo",
  "private": true,
  "workspaces": [
    "packages/npm"
  ],
  "scripts": {
    "build": "tsx scripts/build.ts",
    "test": "tsx --test scripts/verify.test.ts && cd packages/npm && npm test",
    "verify": "tsx scripts/verify.ts"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "zod": "^3.23.8"
  }
}
```

Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Setup packages/npm and packages/pypi configs**

Create `packages/npm/package.json`:
```json
{
  "name": "pak-geodata",
  "version": "0.1.0",
  "description": "Comprehensive, typed, offline geographic data for all areas and cities in Pakistan",
  "author": "The Mohsin Project",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./areas/*": {
      "import": "./dist/areas/*.js",
      "types": "./dist/areas/*.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "test": "node --test dist/**/*.test.js"
  }
}
```

Create `packages/pypi/pyproject.toml`:
```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "pak-geodata"
version = "0.1.0"
description = "Comprehensive, typed, offline geographic data for all areas and cities in Pakistan"
readme = "README.md"
requires-python = ">=3.9"
license = { text = "MIT" }
authors = [{ name = "The Mohsin Project" }]
classifiers = [
    "Programming Language :: Python :: 3",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Topic :: Scientific/Engineering :: GIS",
]

[project.optional-dependencies]
dev = ["pytest>=7.0.0"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

- [ ] **Step 4: Install npm dependencies and test build script trigger**

Run: `npm install`
Expected: Node modules installed cleanly.

- [ ] **Step 5: Commit scaffolding**

```bash
git add .gitignore package.json tsconfig.base.json packages/
git commit -m "chore: setup monorepo scaffolding for npm and pypi packages"
```

---

### Task 2: Master Schema & Core Province/City Dataset

**Files:**
- Create: `pipeline/validators/schema.ts`
- Create: `data/provinces.json`
- Create: `data/cities/punjab.json`
- Create: `data/cities/sindh.json`
- Create: `data/cities/islamabad-ict.json`
- Create: `data/cities/kpk.json`
- Create: `data/cities/balochistan.json`
- Create: `data/cities/ajk.json`
- Create: `data/cities/gilgit-baltistan.json`
- Test: `tests/schema.test.ts`

**Interfaces:**
- Produces: Zod schemas (`AreaSchema`, `CitySchema`, `ProvinceSchema`) and validated master city/province JSON files.

- [ ] **Step 1: Write Zod validation schemas in pipeline/validators/schema.ts**

```typescript
import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(23.5).max(37.1),
  lng: z.number().min(60.8).max(77.8)
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
  sources: z.array(z.string()).optional()
});

export const CitySchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().min(2),
  provinceId: z.string().min(2),
  division: z.string().optional(),
  district: z.string().min(2),
  coordinates: CoordinatesSchema,
  postalCodeRange: z.tuple([z.string().regex(/^\d{5}$/), z.string().regex(/^\d{5}$/)]).optional(),
  bounds: z.object({
    minLat: z.number(),
    maxLat: z.number(),
    minLng: z.number(),
    maxLng: z.number()
  }).optional()
});

export const ProvinceSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().min(2),
  capitalCityId: z.string().min(2),
  type: z.enum(['province', 'federal_capital', 'autonomous_territory'])
});
```

- [ ] **Step 2: Create data/provinces.json and data/cities/*.json**

Populate all 7 provinces/territories in `data/provinces.json`:
- `punjab` (Capital: `lahore`)
- `sindh` (Capital: `karachi`)
- `kpk` (Capital: `peshawar`)
- `balochistan` (Capital: `quetta`)
- `islamabad-ict` (Capital: `islamabad`)
- `ajk` (Capital: `muzaffarabad`)
- `gilgit-baltistan` (Capital: `gilgit`)

Populate cities files with exact centroids, districts, and bounding boxes for major cities.

- [ ] **Step 3: Write tests/schema.test.ts to validate all initial data against Zod schemas**

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ProvinceSchema, CitySchema } from '../pipeline/validators/schema.js';

test('validates provinces.json', () => {
  const content = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));
  for (const prov of content) {
    assert.doesNotThrow(() => ProvinceSchema.parse(prov));
  }
});

test('validates all cities/*.json files', () => {
  const citiesDir = 'data/cities';
  const files = fs.readdirSync(citiesDir);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const cities = JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf8'));
    for (const city of cities) {
      assert.doesNotThrow(() => CitySchema.parse(city), `Failed validating city ${city.id}`);
    }
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit master schema and core province/city dataset**

```bash
git add pipeline/validators/schema.ts data/ tests/schema.test.ts
git commit -m "feat: add Zod validation schemas and core provinces/cities datasets"
```

---

### Task 3: Ingestion Pipeline, Spatial Verification & CI Suite

**Files:**
- Create: `pipeline/validators/spatial.ts`
- Create: `pipeline/extractors/overpass.ts`
- Create: `scripts/verify.ts`
- Create: `scripts/verify.test.ts`

**Interfaces:**
- Consumes: `pipeline/validators/schema.ts`, `data/cities/*.json`
- Produces: `verifyAllData()` script enforcing:
  1. No duplicate slugs across cities or areas.
  2. Every area coordinate lies within its city's bounding box.
  3. No two distinct areas share identical coordinates (< 150m collision detector).
  4. Postal codes strictly match 5-digit regex and city range.

- [ ] **Step 1: Implement spatial bounding box and distance validator in pipeline/validators/spatial.ts**

```typescript
export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function isPointInBoundingBox(lat: number, lng: number, box: BoundingBox): boolean {
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

- [ ] **Step 2: Implement scripts/verify.ts**

Enforce the full verification suite over `data/provinces.json`, `data/cities/`, and `data/areas/`.

- [ ] **Step 3: Implement scripts/verify.test.ts**

Test that invalid coordinates (e.g. lat/lng outside Pakistan, or area inside wrong city box, or duplicate slug) correctly throw verification errors.

- [ ] **Step 4: Run verify script and test**

Run: `npx tsx scripts/verify.ts`
Expected: PASS (0 errors found)

- [ ] **Step 5: Commit verification engine**

```bash
git add pipeline/ scripts/
git commit -m "feat: add spatial validation, deduplication, and verification test suite"
```

---

### Task 4: Phase 1 Flagship Metros Golden Dataset

**Files:**
- Create: `data/areas/punjab/lahore.json`
- Create: `data/areas/punjab/rawalpindi.json`
- Create: `data/areas/punjab/faisalabad.json`
- Create: `data/areas/sindh/karachi.json`
- Create: `data/areas/islamabad-ict/islamabad.json`

**Interfaces:**
- Produces: Standardized, verified area datasets for the top 5 metro zones (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad) covering key residential societies, sectors, commercial centers, Urdu names, and aliases.

- [ ] **Step 1: Curate Lahore Golden Area Dataset (`data/areas/punjab/lahore.json`)**
  Curate ~50 major recognized zones:
  - Gulberg (I, II, III, IV, V)
  - DHA Lahore (Phases 1 through 9, Phase 11 Rahbar)
  - Model Town (Blocks A through M)
  - Johar Town (Phases 1 & 2)
  - Faisal Town, Garden Town, Muslim Town, Shadman
  - Bahria Town (Sectors A through F)
  - Walled City / Old City, Anarkali, Mozang
  - Cantt, Cavalry Ground, Askari (1 through 11)
  - Allama Iqbal Town, Wapda Town, Valencia, Lake City

- [ ] **Step 2: Curate Karachi Golden Area Dataset (`data/areas/sindh/karachi.json`)**
  Curate ~50 major recognized zones:
  - Clifton (Blocks 1 through 9)
  - DHA Karachi (Phases 1 through 8, Phase 8 Extension)
  - PECHS (Blocks 1 through 6), Bahadurabad, Tariq Road
  - Gulshan-e-Iqbal (Blocks 1 through 19)
  - North Nazimabad (Blocks A through T)
  - Saddar, Kharadar, Mithadar, Burns Road
  - Korangi, Landhi, Malir Cantt, Gulistan-e-Johar (Blocks 1 through 20)
  - Federal B Area (Blocks 1 through 22), Nazimabad, Liaquatabad

- [ ] **Step 3: Curate Islamabad & Rawalpindi Golden Datasets**
  `data/areas/islamabad-ict/islamabad.json`:
  - Blue Area, F-6, F-7, F-8, F-10, F-11
  - G-6, G-7, G-8, G-9, G-10, G-11
  - E-7, E-11, H-8, H-9, H-12 (NUST)
  - I-8, I-9, I-10
  - Bahria Town Islamabad, DHA Phase 2 Islamabad, Chak Shahzad, Bani Gala
  `data/areas/punjab/rawalpindi.json`:
  - Saddar Rawalpindi, Cantt, Westridge, Chaklala Scheme 3
  - Satellite Town, Bahria Town Rawalpindi (Phases 1 through 8), Askari (1 through 14)

- [ ] **Step 4: Curate Faisalabad Golden Dataset (`data/areas/punjab/faisalabad.json`)**
  - Civil Lines, Peoples Colony (1 & 2), D Ground, Madina Town
  - Ghulam Muhammad Abad, Kohinoor City, Gulberg Faisalabad, Jinnah Colony

- [ ] **Step 5: Run verification suite on all Phase 1 datasets**

Run: `npx tsx scripts/verify.ts`
Expected: 100% verified with 0 errors.

- [ ] **Step 6: Commit Phase 1 golden datasets**

```bash
git add data/areas/
git commit -m "feat: add curated Phase 1 flagship metros golden datasets (LHR, KHI, ISB, RWP, FSD)"
```

---

### Task 5: TypeScript / NPM Package Development

**Files:**
- Create: `packages/npm/src/types.ts`
- Create: `packages/npm/src/index.ts`
- Create: `packages/npm/src/search.ts`
- Create: `packages/npm/src/geo.ts`
- Create: `packages/npm/tests/index.test.ts`
- Modify: `packages/npm/package.json`

**Interfaces:**
- Produces: Zero-runtime-dependency TypeScript library with typed exports:
  `getAreasByCity(cityId)`, `searchAreas(query, options)`, `findAreaByPostalCode(code)`, `getNearestArea(coords)`.
  Subpath export capability for granular imports (e.g. `pak-geodata/areas/lahore`).

- [ ] **Step 1: Write types in packages/npm/src/types.ts**

Expose `PakistanArea`, `PakistanCity`, `PakistanProvince`, `Coordinates`, `AreaType`.

- [ ] **Step 2: Implement search and geo algorithms in packages/npm/src/**
  - `searchAreas(query: string, options)`: Fuzzy alias/name/Urdu search with ranking (exact match > prefix match > alias match).
  - `getNearestArea(coords, options)`: Haversine distance nearest-neighbor finder.
  - `findAreaByPostalCode(code)`: Fast postal code index.

- [ ] **Step 3: Implement unit tests in packages/npm/tests/index.test.ts**

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import { getAreasByCity, searchAreas, findAreaByPostalCode } from '../src/index.js';

test('getAreasByCity returns areas for lahore', () => {
  const areas = getAreasByCity('lahore');
  assert.ok(areas.length > 0);
  assert.equal(areas[0].cityId, 'lahore');
});

test('searchAreas finds DHA Phase 5 via alias "dha 5"', () => {
  const results = searchAreas('dha 5', { cityId: 'lahore' });
  assert.ok(results.length > 0);
  assert.equal(results[0].id, 'lhr-dha-phase-5');
});

test('findAreaByPostalCode resolves DHA Phase 5 postal code', () => {
  const area = findAreaByPostalCode('54792');
  assert.ok(area);
  assert.equal(area?.id, 'lhr-dha-phase-5');
});
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `cd packages/npm && npx tsx --test tests/index.test.ts`
Expected: PASS

- [ ] **Step 5: Commit TypeScript library**

```bash
git add packages/npm/
git commit -m "feat(npm): implement typed search, lookup, and spatial query utilities"
```

---

### Task 6: Python / PyPI Package Development

**Files:**
- Create: `packages/pypi/pak_geodata/__init__.py`
- Create: `packages/pypi/pak_geodata/models.py`
- Create: `packages/pypi/pak_geodata/lookups.py`
- Create: `packages/pypi/tests/test_lookups.py`
- Create: `packages/pypi/README.md`

**Interfaces:**
- Produces: Pythonic library mirroring TypeScript functionality:
  `get_areas_by_city(city_id)`, `search_areas(query, city_id=None)`, `get_nearest_area(lat, lng)`.

- [ ] **Step 1: Write typed dataclass models in packages/pypi/pak_geodata/models.py**

```python
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(frozen=True)
class Coordinates:
    lat: float
    lng: float

@dataclass(frozen=True)
class PakistanArea:
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
```

- [ ] **Step 2: Implement lookups and spatial search in packages/pypi/pak_geodata/lookups.py**
  Implement `get_areas_by_city`, `search_areas`, `find_area_by_postal_code`, `get_nearest_area` using pure Python standard library (`math`, `json`, `difflib`).

- [ ] **Step 3: Write tests in packages/pypi/tests/test_lookups.py**

```python
import pytest
from pak_geodata import get_areas_by_city, search_areas, find_area_by_postal_code

def test_get_areas_by_city():
    areas = get_areas_by_city("lahore")
    assert len(areas) > 0
    assert areas[0].city_id == "lahore"

def test_search_alias():
    results = search_areas("dha 5", city_id="lahore")
    assert len(results) > 0
    assert results[0].id == "lhr-dha-phase-5"

def test_postal_code():
    area = find_area_by_postal_code("54792")
    assert area is not None
    assert area.id == "lhr-dha-phase-5"
```

- [ ] **Step 4: Run pytest to verify tests pass**

Run: `pytest packages/pypi/tests/`
Expected: PASS

- [ ] **Step 5: Commit Python package**

```bash
git add packages/pypi/
git commit -m "feat(pypi): implement Python typed package with lookups and search"
```

---

### Task 7: Build Script, Code-Gen & Full Production Verification

**Files:**
- Create: `scripts/build.ts`
- Modify: `README.md`
- Test: Full end-to-end build and verification pipeline

**Interfaces:**
- Produces: `npm run build` which:
  1. Validates all data in `data/`.
  2. Compiles modular tree-shakeable JS/TS files to `packages/npm/dist/`.
  3. Bundles synchronized JSON datasets to `packages/pypi/pak_geodata/data/`.
  4. Runs TypeScript type checking with 0 errors.

- [ ] **Step 1: Write scripts/build.ts**

Build script reading `data/` and generating:
- `packages/npm/src/generated/areas/*.ts`
- `packages/pypi/pak_geodata/data/*.json`
- Updating dynamic `totalAreasCount` across all cities.

- [ ] **Step 2: Write root and package README.md documentation**
  Include full quickstart for both NPM (`npm install pak-geodata`) and PyPI (`pip install pak-geodata`), API documentation, and contribution guidelines for submitting new cities/areas.

- [ ] **Step 3: Execute full build and verification**

Run: `npm run build && npm test`
Expected: 0 errors.

- [ ] **Step 4: Commit build scripts and docs**

```bash
git add scripts/ README.md
git commit -m "feat: add build code-generator, docs, and end-to-end verification"
```
