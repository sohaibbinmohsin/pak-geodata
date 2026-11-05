# Multi-Language Architecture & Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified multi-language synchronization pipeline and native package implementations for **Go** (`packages/go`) and **Dart** (`packages/dart`) alongside TypeScript and Python, with zero runtime dependencies and 100% data parity.

**Architecture:** A single source of truth in `data/*.json` flows through `scripts/verify.ts` and `scripts/build.ts`. Master JSON is synchronized to backend targets (Python, Go via `//go:embed`) and compiled into typed `const` models for client/mobile targets (TypeScript, Dart). A shared golden parity test suite validates behavioral consistency across all language ports.

**Tech Stack:** TypeScript/Node (tsx, zod), Go 1.20+ (standard library only: `embed`, `encoding/json`, `math`), Dart 3.x (pure Dart SDK: `dart:core`, `dart:math`), Python 3.9+ (unittest).

**Spec:** [`docs/superpowers/specs/2026-11-04-multi-language-pipeline-design.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/.worktrees/multi-language-pipeline/docs/superpowers/specs/2026-11-04-multi-language-pipeline-design.md)

## Global Constraints

- Master data in `data/` is the sole source of truth; language packages never store manually edited data.
- Zero runtime external dependencies for all packages (`packages/npm`, `packages/pypi`, `packages/go`, `packages/dart`).
- Exact dataset parity: 7 Provinces/Territories, 79 Verified Cities, 3,953 Verified Areas across all packages.
- Spherical Earth radius for Haversine distance must equal $6371.0088\text{ km}$ across all language implementations.
- Full production build (`npm run build`) must succeed with 0 errors.

---

### Task 1: Modular Codegen Infrastructure & TypeScript Generator Extraction

**Files:**
- Create: `scripts/codegen/typescript.ts`
- Create: `scripts/codegen/typescript.test.ts`
- Modify: `scripts/build.ts:99-185`

**Interfaces:**
- Produces: `generateTypeScriptData(dataDir: string, npmSrcDir: string, cityAreaCounts: Record<string, number>): Promise<{ provincesCount: number; citiesCount: number; areasCount: number }>`

- [ ] **Step 1: Write unit test for TypeScript code generator**

```typescript
// scripts/codegen/typescript.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateTypeScriptData } from './typescript.js';

test('generateTypeScriptData emits provinces, cities, and city area files', async () => {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const tempOutDir = resolve(rootDir, 'node_modules/.cache/test-ts-codegen');

  const result = await generateTypeScriptData(dataDir, tempOutDir, {});
  assert.equal(result.provincesCount, 7);
  assert.equal(result.citiesCount, 79);
  assert.equal(result.areasCount, 3953);

  assert.ok(existsSync(resolve(tempOutDir, 'data/provinces.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/cities.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/areas/index.ts')));
  assert.ok(existsSync(resolve(tempOutDir, 'data/areas/lahore.ts')));
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx --test scripts/codegen/typescript.test.ts`
Expected: FAIL with module not found (`typescript.js`).

- [ ] **Step 3: Extract and implement `scripts/codegen/typescript.ts`**

Implement `generateTypeScriptData` extracting the existing TS generation from `scripts/build.ts` into a clean, testable function.

- [ ] **Step 4: Update `scripts/build.ts` and run test to verify pass**

Run: `npx tsx --test scripts/codegen/typescript.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/codegen/typescript.ts scripts/codegen/typescript.test.ts scripts/build.ts
git commit -m "refactor(build): extract TypeScript dataset generator into modular codegen"
```

---

### Task 2: Backend Target Synchronization (Go Master Data Sync)

**Files:**
- Modify: `scripts/build.ts:84-98`
- Create: `tests/data-sync.test.ts`

**Interfaces:**
- Consumes: `dataDir = resolve(rootDir, 'data')`
- Produces: `packages/go/data/` synchronized with exact copies of `provinces.json`, `cities/*.json`, and `areas/*.json`.

- [ ] **Step 1: Write test for Go master data synchronization**

```typescript
// tests/data-sync.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('build pipeline synchronizes data to packages/go/data', () => {
  const rootDir = process.cwd();
  const goDataDir = resolve(rootDir, 'packages/go/data');

  assert.ok(existsSync(resolve(goDataDir, 'provinces.json')));
  assert.ok(existsSync(resolve(goDataDir, 'cities')));
  assert.ok(existsSync(resolve(goDataDir, 'areas')));

  const cityFiles = readdirSync(resolve(goDataDir, 'cities'));
  assert.ok(cityFiles.length > 0);

  const areaFiles = readdirSync(resolve(goDataDir, 'areas'));
  assert.equal(areaFiles.length, 79);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx --test tests/data-sync.test.ts`
Expected: FAIL (`packages/go/data` does not exist).

- [ ] **Step 3: Update `scripts/build.ts` to sync data and licenses to `packages/go`**

```typescript
// scripts/build.ts
const goDataDir = resolve(rootDir, 'packages/go/data');
if (existsSync(goDataDir)) {
  rmSync(goDataDir, { recursive: true, force: true });
}
mkdirSync(goDataDir, { recursive: true });
cpSync(dataDir, goDataDir, { recursive: true });

// Copy LICENSE & ATTRIBUTION
cpSync(rootLicense, resolve(rootDir, 'packages/go/LICENSE'));
```

- [ ] **Step 4: Run build and verify test passes**

Run: `npx tsx scripts/build.ts && npx tsx --test tests/data-sync.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/build.ts tests/data-sync.test.ts
git commit -m "feat(build): add automated master data synchronization for packages/go"
```

---

### Task 3: Dart Const Code Generator

**Files:**
- Create: `scripts/codegen/dart.ts`
- Create: `scripts/codegen/dart.test.ts`
- Modify: `scripts/build.ts`

**Interfaces:**
- Produces: `generateDartData(dataDir: string, dartLibDir: string, cityAreaCounts: Record<string, number>): Promise<{ provincesCount: number; citiesCount: number; areasCount: number }>`
- Generates:
  - `packages/dart/lib/src/data/provinces.dart` (`const pakistanProvinces = [...]`)
  - `packages/dart/lib/src/data/cities.dart` (`const pakistanCities = [...]`)
  - `packages/dart/lib/src/data/areas.dart` (`const pakistanAreas = [...]`)

- [ ] **Step 1: Write unit test for Dart code generator**

```typescript
// scripts/codegen/dart.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateDartData } from './dart.js';

test('generateDartData emits valid const Dart collections with 100% parity', async () => {
  const rootDir = process.cwd();
  const dataDir = resolve(rootDir, 'data');
  const tempOutDir = resolve(rootDir, 'node_modules/.cache/test-dart-codegen');

  const result = await generateDartData(dataDir, tempOutDir, {});
  assert.equal(result.provincesCount, 7);
  assert.equal(result.citiesCount, 79);
  assert.equal(result.areasCount, 3953);

  const provincesDart = readFileSync(resolve(tempOutDir, 'src/data/provinces.dart'), 'utf-8');
  assert.ok(provincesDart.includes('pakistanProvinces'));
  assert.ok(provincesDart.includes('PakistanProvince'));

  const areasDart = readFileSync(resolve(tempOutDir, 'src/data/areas.dart'), 'utf-8');
  assert.ok(areasDart.includes('pakistanAreas'));
  assert.ok(areasDart.includes('lahore-dha-phase-5'));
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx --test scripts/codegen/dart.test.ts`
Expected: FAIL (`dart.js` not found).

- [ ] **Step 3: Implement `scripts/codegen/dart.ts`**

Generate pure Dart code files containing strongly-typed `const` lists of `PakistanProvince`, `PakistanCity`, and `PakistanArea`. Ensure proper string escaping for quotes and Urdu characters.

- [ ] **Step 4: Integrate into `scripts/build.ts` and test**

Run: `npx tsx --test scripts/codegen/dart.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/codegen/dart.ts scripts/codegen/dart.test.ts scripts/build.ts
git commit -m "feat(build): add Dart const dataset code generator"
```

---

### Task 4: Go Package Implementation (`packages/go`)

**Files:**
- Create: `packages/go/go.mod`
- Create: `packages/go/models.go`
- Create: `packages/go/pakgeodata.go`
- Create: `packages/go/geo.go`
- Create: `packages/go/search.go`
- Create: `packages/go/pakgeodata_test.go`

**Interfaces:**
- Module: `github.com/sohaibbinmohsin/pak-geodata/packages/go`
- Produces:
  - `GetAllProvinces() []Province`, `GetProvinceByID(id string) (Province, bool)`
  - `GetAllCities() []City`, `GetCityByID(id string) (City, bool)`, `GetCitiesByProvince(id string) []City`
  - `GetAllAreas() []Area`, `GetAreasByCity(cityId string) []Area`
  - `FindAreaByPostalCode(code string) (Area, bool)`, `FindAreasByPostalCode(code string) []Area`
  - `HaversineDistanceKm(c1, c2 Coordinates) float64`
  - `GetNearestArea(coords Coordinates, opts NearestAreaOptions) (*Area, float64, bool)`
  - `SearchAreas(query string, opts SearchOptions) []SearchResult`

- [ ] **Step 1: Create `packages/go/go.mod` and write `pakgeodata_test.go`**

Write test covering data loading, counts (7 provinces, 79 cities, 3953 areas), postal code lookup (`54000` $\rightarrow$ `lahore-gpo`), nearest area calculation (`[31.4697, 74.4133]` $\rightarrow$ `lahore-dha-phase-5`), and Urdu search (`"گلبرگ"`).

- [ ] **Step 2: Run test via Docker / local go to verify failure**

Run: `docker run --rm -v $(pwd)/packages/go:/app -w /app golang:1.22 go test -v ./...`
Expected: FAIL (types and package files not yet implemented).

- [ ] **Step 3: Implement `models.go`, `pakgeodata.go`, `geo.go`, and `search.go`**

Implement zero-dependency pure Go logic:
- `//go:embed data/*.json` to embed master dataset
- `sync.Once` for thread-safe pre-indexed map creation
- Spherical Earth Haversine formula ($R = 6371.0088\text{ km}$)
- Unicode Urdu character normalization and digit conversion

- [ ] **Step 4: Run Go test suite to verify all tests pass**

Run: `docker run --rm -v $(pwd)/packages/go:/app -w /app golang:1.22 go test -v ./...`
Expected: PASS (all tests pass with 0 errors).

- [ ] **Step 5: Commit**

```bash
git add packages/go
git commit -m "feat(go): implement pure Go client package with zero runtime dependencies"
```

---

### Task 5: Dart Package Implementation (`packages/dart`)

**Files:**
- Create: `packages/dart/pubspec.yaml`
- Create: `packages/dart/lib/src/models.dart`
- Create: `packages/dart/lib/src/geo.dart`
- Create: `packages/dart/lib/src/search.dart`
- Create: `packages/dart/lib/pak_geodata.dart`
- Create: `packages/dart/test/pak_geodata_test.dart`

**Interfaces:**
- Package: `pak_geodata` (pure Dart, zero dependencies)
- Produces:
  - `getAllProvinces()`, `getProvinceById(id)`
  - `getAllCities()`, `getCityById(id)`, `getCitiesByProvince(id)`
  - `getAllAreas()`, `getAreasByCity(cityId)`
  - `findAreaByPostalCode(code)`, `findAreasByPostalCode(code)`
  - `haversineDistanceKm(c1, c2)`
  - `getNearestArea(target, {cityId, maxRadiusKm})`
  - `searchAreas(query, {cityId, limit})`

- [ ] **Step 1: Create `pubspec.yaml` and `test/pak_geodata_test.dart`**

Write test verifying 7 provinces, 79 cities, 3953 areas, postal code `54000` resolution, Haversine nearest area resolution, and Urdu normalization search.

- [ ] **Step 2: Run test via Docker / local dart to verify failure**

Run: `docker run --rm -v $(pwd)/packages/dart:/app -w /app dart:stable dart test`
Expected: FAIL (models and public entrypoint not yet defined).

- [ ] **Step 3: Implement Dart library files**

Implement immutable models, lookup indexes, Haversine math ($6371.0088\text{ km}$), and Urdu string search in pure Dart.

- [ ] **Step 4: Run Dart test suite to verify pass**

Run: `docker run --rm -v $(pwd)/packages/dart:/app -w /app dart:stable dart test`
Expected: PASS (all tests pass with 0 errors).

- [ ] **Step 5: Commit**

```bash
git add packages/dart
git commit -m "feat(dart): implement pure Dart client package with zero runtime dependencies"
```

---

### Task 6: Parity Verification Gate & Monorepo Test Scripts

**Files:**
- Create: `tests/parity/golden_vectors.json`
- Create: `tests/parity/golden_vectors.test.ts`
- Modify: `scripts/verify.ts`
- Modify: `package.json`

**Interfaces:**
- Shared test vectors asserting identical outputs across all languages.
- New scripts in `package.json`: `test:ts`, `test:python`, `test:go`, `test:dart`, `test:parity`.

- [ ] **Step 1: Create `tests/parity/golden_vectors.json` and parity test**

Include golden test cases for:
- Postal codes (`54000` $\rightarrow$ `lahore-gpo`, `44000` $\rightarrow$ `islamabad-gpo`)
- Coordinates (`[31.4697, 74.4133]` $\rightarrow$ `lahore-dha-phase-5`)
- Urdu searches (`"گلبرگ"`, `"صدر"`)
- Colloquial aliases (`"isb"`, `"lhe"`, `"khi"`, `"pindi"`)

- [ ] **Step 2: Run test to verify pass in TypeScript**

Run: `npx tsx --test tests/parity/golden_vectors.test.ts`
Expected: PASS

- [ ] **Step 3: Add multi-package count parity assert in `scripts/verify.ts`**

Assert that `data/`, `packages/npm/src/data/`, `packages/pypi/pak_geodata/data/`, `packages/go/data/`, and `packages/dart/lib/src/data/` all hold identical numbers of entities.

- [ ] **Step 4: Update root `package.json` test scripts**

Add scripts:
```json
"test:ts": "tsx --test \"tests/**/*.test.ts\" \"scripts/**/*.test.ts\" \"packages/npm/tests/**/*.test.ts\"",
"test:python": "python3 -m unittest discover -s packages/pypi/tests",
"test:go": "which go >/dev/null 2>&1 && (cd packages/go && go test -v ./...) || docker run --rm -v $(pwd)/packages/go:/app -w /app golang:1.22 go test -v ./...",
"test:dart": "which dart >/dev/null 2>&1 && (cd packages/dart && dart test) || docker run --rm -v $(pwd)/packages/dart:/app -w /app dart:stable dart test",
"test:parity": "tsx --test tests/parity/golden_vectors.test.ts",
"test": "npm run test:ts && npm run test:python && npm run test:go && npm run test:dart"
```

- [ ] **Step 5: Run full `npm test` and commit**

Run: `npm test`
Expected: All suites pass across TypeScript, Python, Go, and Dart.

```bash
git add package.json scripts/verify.ts tests/parity
git commit -m "feat(test): add cross-language parity test vectors and multi-runtime test runner"
```

---

### Task 7: Documentation, CI Matrix & Full Production Verification

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/ci.yml`
- Bump: `package.json`, `packages/npm/package.json`, `packages/pypi/pyproject.toml`, `packages/dart/pubspec.yaml`

- [ ] **Step 1: Update `.github/workflows/ci.yml`**

Add Go and Dart test jobs in GitHub Actions so every PR tests all 4 runtimes.

- [ ] **Step 2: Update `README.md`**

Add installation and usage tabs/snippets for:
- Go: `go get github.com/sohaibbinmohsin/pak-geodata/packages/go`
- Dart: `dart pub add pak_geodata`
Add Go and Dart badges and update the architecture diagram.

- [ ] **Step 3: Bump package versions according to SemVer**

Proactively bump version for new feature release across all package manifests.

- [ ] **Step 4: Run full production build (`npm run build`)**

Verify that `npm run build` succeeds with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add README.md .github/workflows/ci.yml package.json packages/
git commit -m "docs: add Go and Dart documentation, update CI matrix, and bump versions"
```
