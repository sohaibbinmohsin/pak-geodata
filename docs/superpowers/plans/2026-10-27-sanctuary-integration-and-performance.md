# Sanctuary Integration & Production Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `pak-geodata` with Sanctuary's emergency rescue reporting and tracking app by implementing bilingual administrative hierarchy (`PakLocationItem`), O(1) resilient lookup helpers (`getCityName`, `getAreaName`), Urdu script & numeral normalization, search pre-normalization, spatial reverse-geocoding bounding box pruning, and a lightweight PWA `./hierarchy` subpath export.

**Architecture:** Layered approach keeping low-level GIS datasets intact while introducing an application & localization layer with pre-indexed O(1) Map lookups, Urdu script normalizers, function-overloaded search, and code-split ESM/CJS distributions.

**Tech Stack:** TypeScript 5.5, Node.js (tsx test runner), esbuild, Zod.

**Spec:** [`docs/superpowers/specs/2026-10-27-sanctuary-integration-and-performance-design.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/docs/superpowers/specs/2026-10-27-sanctuary-integration-and-performance-design.md)

## Global Constraints

- 100% backward compatibility: all 74 existing tests must continue to pass without modifications to existing behavior.
- Zero runtime dependencies for the npm package distribution.
- Subpath `./hierarchy` bundle must remain < 15 KB unminified (< 5 KB gzipped).
- Full production build (`npm run build`) must succeed with 0 errors before completion.

---

### Task 1: Type Definitions (`PakLocationItem` & Autocomplete Unions)

**Files:**
- Modify: `packages/npm/src/types.ts`
- Test: `packages/npm/tests/types.test.ts`

**Interfaces:**
- Produces: `PakLocationType`, `PakLocationItem`, `ProvinceId`, `CityId`

- [ ] **Step 1: Write the failing test for types**

```ts
// packages/npm/tests/types.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PakLocationItem, PakLocationType, ProvinceId, CityId } from '../src/types.js';

test('PakLocationItem interface accepts valid location structures', () => {
  const item: PakLocationItem = {
    id: 'lahore-gulberg-iii',
    nameEn: 'Gulberg III',
    nameUr: 'گلبرگ ۳',
    type: 'area',
    parentId: 'lahore',
    coordinates: {
      lat: 31.5123,
      lng: 74.3456
    }
  };
  assert.equal(item.nameEn, 'Gulberg III');
  assert.equal(item.nameUr, 'گلبرگ ۳');
  assert.equal(item.type, 'area');
  assert.equal(item.parentId, 'lahore');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test packages/npm/tests/types.test.ts`  
Expected: FAIL with compilation error (types not exported).

- [ ] **Step 3: Update `packages/npm/src/types.ts`**

Add `PakLocationType`, `PakLocationItem`, `ProvinceId`, and `CityId`:

```ts
export type PakLocationType = 'province' | 'division' | 'district' | 'tehsil' | 'area';

export interface PakLocationItem {
  id: string;
  nameEn: string;
  nameUr: string;
  type: PakLocationType;
  parentId?: string;
  coordinates?: Coordinates;
}

export type ProvinceId =
  | 'punjab'
  | 'sindh'
  | 'khyber-pakhtunkhwa'
  | 'balochistan'
  | 'islamabad-ict'
  | 'azad-jammu-kashmir'
  | 'gilgit-baltistan';

export type CityId =
  | 'lahore'
  | 'karachi'
  | 'islamabad'
  | 'rawalpindi'
  | 'faisalabad'
  | (string & {});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test packages/npm/tests/types.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/npm/src/types.ts packages/npm/tests/types.test.ts
git commit -m "feat(types): add PakLocationItem and strict hierarchy types"
```

---

### Task 2: Urdu Script & Numeral Normalizer

**Files:**
- Create: `packages/npm/src/urdu.ts`
- Test: `packages/npm/tests/urdu.test.ts`

**Interfaces:**
- Produces:
  - `normalizeUrduText(text: string): string`
  - `toWesternDigits(text: string): string`
  - `toEasternDigits(text: string): string`
  - `stripUrduDiacritics(text: string): string`

- [ ] **Step 1: Write the failing test for Urdu normalization**

```ts
// packages/npm/tests/urdu.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrduText,
  toWesternDigits,
  toEasternDigits,
  stripUrduDiacritics
} from '../src/urdu.js';

test('toWesternDigits converts Eastern numerals to Western ASCII digits', () => {
  assert.equal(toWesternDigits('گلبرگ ۳'), 'گلبرگ 3');
  assert.equal(toWesternDigits('۱۲۳۴۵۶۷۸۹۰'), '1234567890');
});

test('toEasternDigits converts Western digits to Eastern Arabic numerals', () => {
  assert.equal(toEasternDigits('Gulberg 3'), 'Gulberg ۳');
});

test('stripUrduDiacritics removes Aerab / Tashkeel', () => {
  assert.equal(stripUrduDiacritics('لَاہَوْر'), 'لاہور');
});

test('normalizeUrduText normalizes Arabic letter variants, numerals, and whitespace', () => {
  // Arabic Yeh (ي) -> Urdu Yeh (ی)
  assert.equal(normalizeUrduText('کراچی '), 'کراچی');
  // Arabic Kaf (ك) -> Urdu Keheh (ک)
  assert.equal(normalizeUrduText('كراچى'), 'کراچی');
  // Eastern numeral normalized to Western for unified token matching
  assert.equal(normalizeUrduText('گلبرگ ۳'), 'گلبرگ 3');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test packages/npm/tests/urdu.test.ts`  
Expected: FAIL (`../src/urdu.js` does not exist).

- [ ] **Step 3: Implement `packages/npm/src/urdu.ts`**

```ts
const EASTERN_TO_WESTERN_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

const WESTERN_TO_EASTERN_DIGITS: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

export function toWesternDigits(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[۰-۹]/g, (char) => EASTERN_TO_WESTERN_DIGITS[char] || char);
}

export function toEasternDigits(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[0-9]/g, (char) => WESTERN_TO_EASTERN_DIGITS[char] || char);
}

export function stripUrduDiacritics(text: string): string {
  if (typeof text !== 'string') return '';
  // Unicode range for Arabic/Urdu diacritics / tashkeel
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

export function normalizeUrduText(text: string): string {
  if (typeof text !== 'string') return '';
  let str = stripUrduDiacritics(text);
  // Normalize Arabic Yeh (ي) & Alef Maksura (ى) to Urdu Yeh (ی)
  str = str.replace(/[\u064A\u0649]/g, '\u06CC');
  // Normalize Arabic Kaf (ك) to Urdu Keheh (ک)
  str = str.replace(/\u0643/g, '\u06A9');
  // Normalize Arabic Heh (ه) to Urdu Goal Heh (ہ)
  str = str.replace(/\u0647/g, '\u06C1');
  // Unify numerals to Western digits for robust matching
  str = toWesternDigits(str);
  // Normalize whitespace
  return str.trim().replace(/\s+/g, ' ');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test packages/npm/tests/urdu.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/npm/src/urdu.ts packages/npm/tests/urdu.test.ts
git commit -m "feat(urdu): add Urdu script, numeral, and diacritic normalization engine"
```

---

### Task 3: Hierarchy Engine & O(1) Resilient Lookups

**Files:**
- Create: `packages/npm/src/hierarchy.ts`
- Test: `packages/npm/tests/hierarchy.test.ts`

**Interfaces:**
- Consumes: `PakLocationItem`, `PakistanProvince`, `PakistanCity`, `PakistanArea` from `types.ts`, `normalizeUrduText` from `urdu.ts`
- Produces:
  - `getCityName(key: string, lang?: 'en' | 'ur'): string`
  - `getAreaName(cityKey: string, areaKey: string, lang?: 'en' | 'ur'): string`
  - `toLocationItem(entity: PakistanProvince | PakistanCity | PakistanArea): PakLocationItem`
  - `getProvincesAsLocationItems(): PakLocationItem[]`
  - `getCitiesAsLocationItems(provinceId?: string): PakLocationItem[]`
  - `getAreasAsLocationItems(cityKey: string): PakLocationItem[]`
  - `searchLocationItems(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[]`

- [ ] **Step 1: Write the failing test for hierarchy & lookups**

```ts
// packages/npm/tests/hierarchy.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCityName,
  getAreaName,
  toLocationItem,
  getProvincesAsLocationItems,
  getCitiesAsLocationItems,
  getAreasAsLocationItems,
  searchLocationItems
} from '../src/hierarchy.js';

test('getCityName resolves title-cased English key and slug in en and ur', () => {
  assert.equal(getCityName('Lahore', 'en'), 'Lahore');
  assert.equal(getCityName('Lahore', 'ur'), 'لاہور');
  assert.equal(getCityName('lahore', 'ur'), 'لاہور');
  assert.equal(getCityName('karachi', 'en'), 'Karachi');
  assert.equal(getCityName('karachi', 'ur'), 'کراچی');
  // Fallback for unverified city
  assert.equal(getCityName('UnknownCity', 'ur'), 'UnknownCity');
});

test('getAreaName resolves area slug, title name, and alias with city key', () => {
  assert.equal(getAreaName('Lahore', 'Gulberg III', 'en'), 'Gulberg III');
  assert.equal(getAreaName('Lahore', 'Gulberg III', 'ur'), 'گلبرگ ۳');
  assert.equal(getAreaName('lahore', 'lahore-gulberg-iii', 'ur'), 'گلبرگ ۳');
  assert.equal(getAreaName('lahore', 'Gulberg', 'ur'), 'گلبرگ ۳');
  // Fallback for unverified area
  assert.equal(getAreaName('Lahore', 'Custom Colony', 'ur'), 'Custom Colony');
});

test('toLocationItem maps provinces, cities, and areas correctly', () => {
  const provItem = getProvincesAsLocationItems().find((p) => p.id === 'punjab');
  assert.ok(provItem);
  assert.equal(provItem.type, 'province');
  assert.equal(provItem.nameEn, 'Punjab');
  assert.equal(provItem.nameUr, 'پنجاب');
  assert.equal(provItem.parentId, undefined);

  const cityItem = getCitiesAsLocationItems('punjab').find((c) => c.id === 'lahore');
  assert.ok(cityItem);
  assert.equal(cityItem.type, 'district');
  assert.equal(cityItem.parentId, 'punjab');
  assert.ok(cityItem.coordinates);

  const areas = getAreasAsLocationItems('Lahore');
  assert.ok(areas.length > 0);
  const gulberg = areas.find((a) => a.id === 'lahore-gulberg-iii');
  assert.ok(gulberg);
  assert.equal(gulberg.type, 'area');
  assert.equal(gulberg.parentId, 'lahore');
});

test('searchLocationItems returns PakLocationItem array scoped to city', () => {
  const results = searchLocationItems('Lahore', 'Gulberg', 'ur');
  assert.ok(results.length > 0);
  assert.equal(results[0].type, 'area');
  assert.equal(results[0].parentId, 'lahore');
  assert.ok(results[0].nameUr.includes('گلبرگ'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test packages/npm/tests/hierarchy.test.ts`  
Expected: FAIL (`../src/hierarchy.js` does not exist).

- [ ] **Step 3: Implement `packages/npm/src/hierarchy.ts`**

Implement pre-indexed O(1) maps (`cityLookupMap`, `areaCompoundLookupMap`) and exported helpers:
- Support case-insensitive key lookups.
- Index canonical slug, English title, and aliases.
- Implement `toLocationItem` converter mapping entity types to `PakLocationItem`.
- Implement `searchLocationItems` by querying city-scoped candidates and mapping results to `PakLocationItem[]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test packages/npm/tests/hierarchy.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/npm/src/hierarchy.ts packages/npm/tests/hierarchy.test.ts
git commit -m "feat(hierarchy): implement O(1) bilingual lookups and PakLocationItem hierarchy"
```

---

### Task 4: Search Pre-Normalization, Overload & Spatial Pruning

**Files:**
- Modify: `packages/npm/src/search.ts`
- Modify: `packages/npm/src/geo.ts`
- Test: `packages/npm/tests/search_overload.test.ts`
- Test: `packages/npm/tests/geo_optimization.test.ts`

**Interfaces:**
- Consumes: `PakLocationItem` from `types.ts`, `normalizeUrduText` from `urdu.ts`, `cities` from `data/cities.js`
- Produces:
  - Overloaded `searchAreas`:
    - `searchAreas(cityKey: string, query: string, lang?: 'en' | 'ur'): PakLocationItem[]`
    - `searchAreas(query: string, options?: SearchOptions, candidateAreas?: readonly PakistanArea[]): PakistanArea[]`
  - Bounding box pruned `getNearestArea`

- [ ] **Step 1: Write tests for search overload and spatial pruning**

```ts
// packages/npm/tests/search_overload.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchAreas } from '../src/index.js';

test('searchAreas overload 1: Sanctuary signature (cityKey, query, lang)', () => {
  const items = searchAreas('Lahore', 'DHA', 'ur');
  assert.ok(Array.isArray(items));
  assert.ok(items.length > 0);
  assert.equal(items[0].type, 'area');
  assert.equal(items[0].parentId, 'lahore');
  assert.ok(items[0].nameEn.length > 0);
  assert.ok(items[0].nameUr.length > 0);
});

test('searchAreas overload 2: Classic signature (query, options)', () => {
  const areas = searchAreas('DHA Phase 5', { cityId: 'lahore' });
  assert.ok(Array.isArray(areas));
  assert.ok(areas.length > 0);
  assert.equal(areas[0].id, 'lahore-dha-phase-5');
});
```

- [ ] **Step 2: Run test to verify it fails or needs implementation**

Run: `npx tsx --test packages/npm/tests/search_overload.test.ts`

- [ ] **Step 3: Update `packages/npm/src/search.ts` and `packages/npm/src/geo.ts`**

1. In `packages/npm/src/search.ts`:
   - Pre-tokenize candidate areas at module load so `normalizeString()` and `normalizeUrduText()` are not re-computed on every candidate during keystroke iterations.
   - Add Urdu normalization to query handling so Eastern numerals (`۳`) match Western numerals (`3`) and Arabic Yeh/Kaf variants match smoothly.
   - Implement the overload dispatcher detecting whether argument 1 is a cityKey string vs options object.
2. In `packages/npm/src/geo.ts`:
   - Prune candidate areas using city bounding box checks before computing Haversine trigonometric distances when no `cityId` is supplied.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx tsx --test packages/npm/tests/search_overload.test.ts packages/npm/tests/geo_optimization.test.ts`  
Expected: PASS.

- [ ] **Step 5: Run existing package tests to guarantee zero regressions**

Run: `npm test`  
Expected: All existing 74 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/npm/src/search.ts packages/npm/src/geo.ts packages/npm/tests/
git commit -m "perf(search,geo): add search pre-normalization, Sanctuary overload, and spatial pruning"
```

---

### Task 5: Packaging, Subpath Exports & Build Pipeline

**Files:**
- Modify: `packages/npm/src/index.ts`
- Modify: `packages/npm/package.json`
- Modify: `packages/npm/build.js`
- Modify: `scripts/build.ts`
- Test: `tests/bundle.test.ts`

**Interfaces:**
- Produces:
  - Root exports: re-exports `PakLocationItem`, `PakLocationType`, `getCityName`, `getAreaName`, `searchAreas`, `searchLocationItems`, `normalizeUrduText`
  - Subpath: `pak-geodata/hierarchy` (dist/hierarchy.js, dist/hierarchy.cjs, dist/hierarchy.d.ts)

- [ ] **Step 1: Write bundle verification test**

```ts
// tests/bundle.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('hierarchy subpath build artifacts exist and are lightweight (< 25 KB)', () => {
  const distDir = resolve(process.cwd(), 'packages/npm/dist');
  const esmHierarchy = resolve(distDir, 'hierarchy.js');
  const cjsHierarchy = resolve(distDir, 'hierarchy.cjs');
  const dtsHierarchy = resolve(distDir, 'hierarchy.d.ts');

  assert.ok(existsSync(esmHierarchy), 'hierarchy.js must exist');
  assert.ok(existsSync(cjsHierarchy), 'hierarchy.cjs must exist');
  assert.ok(existsSync(dtsHierarchy), 'hierarchy.d.ts must exist');

  const esmSize = statSync(esmHierarchy).size;
  assert.ok(esmSize < 25000, `hierarchy.js size (${esmSize} bytes) should be < 25 KB`);
});
```

- [ ] **Step 2: Update `packages/npm/src/index.ts`**

Export all hierarchy and Urdu helpers and types from the root entry point.

- [ ] **Step 3: Update `packages/npm/package.json` and build scripts**

1. In `packages/npm/package.json`, add `"./hierarchy"` to `exports`.
2. In `packages/npm/build.js`, add esbuild step compiling `src/hierarchy.ts` to `dist/hierarchy.cjs`.
3. In `scripts/build.ts`, ensure `hierarchy.ts` is processed during the monorepo build.

- [ ] **Step 4: Execute production build and run all tests**

Run: `npm run build && npm test`  
Expected: 0 errors across entire monorepo.

- [ ] **Step 5: Commit**

```bash
git add packages/npm/src/index.ts packages/npm/package.json packages/npm/build.js scripts/build.ts tests/bundle.test.ts
git commit -m "feat(packaging): add ./hierarchy subpath export and update build pipeline"
```

---

### Task 6: Documentation & Sanctuary Integration Guide

**Files:**
- Modify: `packages/npm/README.md`
- Modify: `README.md`

- [ ] **Step 1: Document Sanctuary integration spec and API examples**

Add explicit documentation and TypeScript snippets for:
- `PakLocationItem`
- `getCityName(key, lang)`
- `getAreaName(cityKey, areaKey, lang)`
- `searchAreas(cityKey, query, lang)`
- `import { ... } from 'pak-geodata/hierarchy'` for PWA offline loading.

- [ ] **Step 2: Verify linting & type checks**

Run: `npm run lint && npm run verify`  
Expected: Clean pass with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/npm/README.md README.md
git commit -m "docs: add Sanctuary integration guide and hierarchy API reference"
```
