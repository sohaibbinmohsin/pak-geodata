# PHP Package & Release Pipeline Streamlining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement native PHP (8.1+) package (`packages/php`) with zero runtime dependencies and OPcache array codegen, expand monorepo parity gate to 6 targets (7 provinces, 79 cities, 3,953 areas), and streamline the GitHub Actions release workflow to prevent duplicate parallel release runs.

**Architecture:** Master JSON in `data/` remains the single source of truth. A new TypeScript code generator `scripts/codegen/php.ts` compiles master data into native PHP array files (`src/Data/Areas.php`, `Cities.php`, `Provinces.php`). The PHP package `sohaibbinmohsin/pak-geodata` provides strongly typed PHP 8.1+ `readonly` models, in-memory memoized lookups, clamped spherical Haversine spatial calculations, and Urdu NLP search. CI/CD runs via PHPUnit (native or Docker), and `.github/workflows/release.yml` is streamlined to eliminate race conditions.

**Tech Stack:** PHP 8.1+, Composer, PHPUnit 10, TypeScript (Node.js 22), Docker (`php:8.2-cli`), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-05-php-package-pipeline-design.md`

## Global Constraints
- Master data in `data/` is the sole source of truth; language packages never store manually edited data.
- Zero external runtime dependencies for all packages, including PHP.
- Exact dataset parity: 7 Provinces/Territories, 79 Verified Cities, 3,953 Verified Areas across all 6 targets.
- Full production build (`npm run build`) and test suite (`npm test`) must succeed with 0 errors.
- Version bump: proactively bump package versions according to SemVer from `0.10.1` to `0.11.0` (minor bump for new language ecosystem) across all manifests (`package.json`, `packages/npm/package.json`, `packages/pypi/pyproject.toml`, `packages/pypi/pak_geodata/__init__.py`, `packages/dart/pubspec.yaml`, `packages/dart/CHANGELOG.md`, `packages/php/composer.json`, `apps/demo/package.json`).

---

### Task 1: PHP Code Generator (`scripts/codegen/php.ts`)

**Files:**
- Create: `scripts/codegen/php.ts`
- Create: `scripts/codegen/php.test.ts`
- Modify: `scripts/build.ts:75-105`

**Interfaces:**
- Consumes: Raw province, city, and area records from `data/`
- Produces: `generatePhpProvinces(provinces)`, `generatePhpCities(cities)`, `generatePhpAreas(areas)` returning valid PHP array code strings saving to `packages/php/src/Data/Provinces.php`, `Cities.php`, `Areas.php`.

- [ ] **Step 1: Write failing generator unit test**

Create `scripts/codegen/php.test.ts`:
```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePhpProvinces, generatePhpCities, generatePhpAreas } from './php.js';

describe('PHP Codegen', () => {
  it('generates valid PHP return array code for provinces with Urdu script preserved', () => {
    const provinces = [
      { id: 'punjab', name: 'Punjab', urduName: 'پنجاب', capitalCityId: 'lahore', type: 'province' },
    ];
    const code = generatePhpProvinces(provinces as any);
    assert.match(code, /^<\?php/);
    assert.match(code, /declare\(strict_types=1\);/);
    assert.match(code, /namespace PakGeoData\\Data;/);
    assert.match(code, /return \[/);
    assert.match(code, /'id' => 'punjab'/);
    assert.match(code, /'urduName' => 'پنجاب'/);
  });

  it('generates valid PHP return array code for cities with bounds and coordinates', () => {
    const cities = [
      {
        id: 'lahore',
        name: 'Lahore',
        urduName: 'لاہور',
        provinceId: 'punjab',
        coordinates: { lat: 31.5204, lng: 74.3587 },
        bounds: { minLat: 31.3, maxLat: 31.7, minLng: 74.1, maxLng: 74.5 },
        postalCodeRange: ['54000', '54999'],
        totalAreasCount: 575,
      },
    ];
    const code = generatePhpCities(cities as any);
    assert.match(code, /'name' => 'Lahore'/);
    assert.match(code, /'coordinates' => \['lat' => 31.5204, 'lng' => 74.3587\]/);
    assert.match(code, /'totalAreasCount' => 575/);
  });

  it('generates valid PHP return array code for areas with aliases and postal code', () => {
    const areas = [
      {
        id: 'lahore-dha-phase-5',
        cityId: 'lahore',
        provinceId: 'punjab',
        name: 'DHA Phase 5',
        urduName: 'ڈی ایچ اے فیز 5',
        postalCode: '54792',
        coordinates: { lat: 31.4697, lng: 74.4133 },
        aliases: ['dha 5', 'defence phase 5'],
        type: 'housing_scheme',
        verified: true,
        sources: ['survey'],
      },
    ];
    const code = generatePhpAreas(areas as any);
    assert.match(code, /'id' => 'lahore-dha-phase-5'/);
    assert.match(code, /'aliases' => \['dha 5', 'defence phase 5'\]/);
    assert.match(code, /'verified' => true/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/codegen/php.test.ts`
Expected: FAIL with "Cannot find module './php.js'"

- [ ] **Step 3: Implement `scripts/codegen/php.ts`**

Implement `scripts/codegen/php.ts` with clean PHP array formatting, proper quote escaping, and UTF-8 preservation:
```typescript
function escapePhpString(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '0';
  if (typeof v === 'string') return `'${escapePhpString(v)}'`;
  if (Array.isArray(v)) {
    return '[' + v.map(formatValue).join(', ') + ']';
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `'${k}' => ${formatValue(val)}`);
    return '[' + entries.join(', ') + ']';
  }
  return 'null';
}

export function generatePhpProvinces(provinces: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const p of provinces) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(p.id)},\n`;
    out += `        'name' => ${formatValue(p.name)},\n`;
    out += `        'urduName' => ${formatValue(p.urduName)},\n`;
    out += `        'capitalCityId' => ${formatValue(p.capitalCityId)},\n`;
    out += `        'type' => ${formatValue(p.type)},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}

export function generatePhpCities(cities: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const c of cities) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(c.id)},\n`;
    out += `        'name' => ${formatValue(c.name)},\n`;
    out += `        'urduName' => ${formatValue(c.urduName)},\n`;
    out += `        'provinceId' => ${formatValue(c.provinceId)},\n`;
    out += `        'division' => ${formatValue(c.division)},\n`;
    out += `        'district' => ${formatValue(c.district)},\n`;
    out += `        'coordinates' => ${formatValue(c.coordinates)},\n`;
    out += `        'bounds' => ${formatValue(c.bounds)},\n`;
    out += `        'postalCodeRange' => ${formatValue(c.postalCodeRange)},\n`;
    out += `        'totalAreasCount' => ${formatValue(c.totalAreasCount)},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}

export function generatePhpAreas(areas: any[]): string {
  let out = '<?php\n\ndeclare(strict_types=1);\n\nnamespace PakGeoData\\Data;\n\nreturn [\n';
  for (const a of areas) {
    out += `    [\n`;
    out += `        'id' => ${formatValue(a.id)},\n`;
    out += `        'cityId' => ${formatValue(a.cityId)},\n`;
    out += `        'provinceId' => ${formatValue(a.provinceId)},\n`;
    out += `        'name' => ${formatValue(a.name)},\n`;
    out += `        'urduName' => ${formatValue(a.urduName)},\n`;
    out += `        'postalCode' => ${formatValue(a.postalCode)},\n`;
    out += `        'coordinates' => ${formatValue(a.coordinates)},\n`;
    out += `        'aliases' => ${formatValue(a.aliases || [])},\n`;
    out += `        'type' => ${formatValue(a.type)},\n`;
    out += `        'verified' => ${formatValue(a.verified)},\n`;
    out += `        'sources' => ${formatValue(a.sources || [])},\n`;
    out += `    ],\n`;
  }
  out += '];\n';
  return out;
}
```

- [ ] **Step 4: Wire into `scripts/build.ts`**

Update `scripts/build.ts` Step 3 to write `packages/php/src/Data/Provinces.php`, `Cities.php`, `Areas.php`. Also synchronize `LICENSE`, `LICENSE-DATA`, and `ATTRIBUTION.md` into `packages/php/`.

- [ ] **Step 5: Run tests and verify pass**

Run: `node --import tsx --test scripts/codegen/php.test.ts`
Expected: PASS with 3 tests passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/codegen/php.ts scripts/codegen/php.test.ts scripts/build.ts
git commit -m "feat(codegen): add PHP OPcache array generator and wire into build pipeline"
```

---

### Task 2: PHP Package Scaffolding & Data Models (`packages/php`)

**Files:**
- Create: `packages/php/composer.json`
- Create: `packages/php/phpunit.xml.dist`
- Create: `packages/php/src/Models/Coordinates.php`
- Create: `packages/php/src/Models/CityBounds.php`
- Create: `packages/php/src/Models/Province.php`
- Create: `packages/php/src/Models/City.php`
- Create: `packages/php/src/Models/Area.php`
- Create: `packages/php/src/Models/SearchResult.php`
- Create: `packages/php/src/Models/NearestAreaResult.php`

**Interfaces:**
- Consumes: PHP array structures from `src/Data/`
- Produces: Strongly typed readonly PHP 8.1+ models in `PakGeoData\Models\` namespace.

- [ ] **Step 1: Create `composer.json` and `phpunit.xml.dist`**

`packages/php/composer.json`:
```json
{
  "name": "sohaibbinmohsin/pak-geodata",
  "description": "Comprehensive, typed, offline geographic data for all areas and cities in Pakistan",
  "type": "library",
  "license": "MIT",
  "authors": [
    {
      "name": "Sohaib Bin Mohsin",
      "email": "sohaibbinmohsin@gmail.com",
      "homepage": "https://sohaibbinmohsin.com"
    }
  ],
  "require": {
    "php": "^8.1"
  },
  "require-dev": {
    "phpunit/phpunit": "^10.0"
  },
  "autoload": {
    "psr-4": {
      "PakGeoData\\": "src/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "PakGeoData\\Tests\\": "tests/"
    }
  },
  "config": {
    "sort-packages": true
  }
}
```

`packages/php/phpunit.xml.dist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/10.0/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         executionOrder="depends,defects"
         beStrictAboutOutputDuringTests="true"
         failOnRisky="true"
         failOnWarning="true">
    <testsuites>
        <testsuite name="PakGeoData Test Suite">
            <directory>tests</directory>
        </testsuite>
    </testsuites>
    <source>
        <include>
            <directory>src</directory>
        </include>
        <exclude>
            <directory>src/Data</directory>
        </exclude>
    </source>
</phpunit>
```

- [ ] **Step 2: Implement Models**

- `packages/php/src/Models/Coordinates.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Coordinates
{
    public function __construct(
        public readonly float $lat,
        public readonly float $lng
    ) {}

    public function toArray(): array
    {
        return ['lat' => $this->lat, 'lng' => $this->lng];
    }
}
```

- `packages/php/src/Models/CityBounds.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class CityBounds
{
    public function __construct(
        public readonly float $minLat,
        public readonly float $maxLat,
        public readonly float $minLng,
        public readonly float $maxLng
    ) {}
}
```

- `packages/php/src/Models/Province.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Province
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $urduName,
        public readonly string $capitalCityId,
        public readonly string $type
    ) {}
}
```

- `packages/php/src/Models/City.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class City
{
    /**
     * @param array<string>|null $postalCodeRange
     */
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $urduName,
        public readonly string $provinceId,
        public readonly Coordinates $coordinates,
        public readonly int $totalAreasCount,
        public readonly ?string $division = null,
        public readonly ?string $district = null,
        public readonly ?CityBounds $bounds = null,
        public readonly ?array $postalCodeRange = null
    ) {}
}
```

- `packages/php/src/Models/Area.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Area
{
    /**
     * @param array<string> $aliases
     * @param array<string> $sources
     */
    public function __construct(
        public readonly string $id,
        public readonly string $cityId,
        public readonly string $provinceId,
        public readonly string $name,
        public readonly Coordinates $coordinates,
        public readonly ?string $urduName = null,
        public readonly ?string $postalCode = null,
        public readonly array $aliases = [],
        public readonly ?string $type = null,
        public readonly bool $verified = false,
        public readonly array $sources = []
    ) {}
}
```

- `packages/php/src/Models/SearchResult.php` & `NearestAreaResult.php`:
```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class SearchResult
{
    public function __construct(
        public readonly Area $area,
        public readonly float $score,
        public readonly string $matchType = 'exact'
    ) {}
}
```

```php
<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class NearestAreaResult
{
    public function __construct(
        public readonly Area $area,
        public readonly float $distanceKm
    ) {}
}
```

- [ ] **Step 3: Run build to generate `packages/php/src/Data/*.php`**

Run: `npx tsx scripts/build.ts`
Expected: Step 3 prints `✔ PHP OPcache array datasets generated for packages/php/src/Data/`.

- [ ] **Step 4: Commit**

```bash
git add packages/php
git commit -m "feat(php): scaffold composer package and create typed models"
```

---

### Task 3: Spatial Calculations & Core In-Memory Lookups (`PakGeoData`)

**Files:**
- Create: `packages/php/src/Geo.php`
- Create: `packages/php/src/PakGeoData.php`
- Create: `packages/php/tests/PakGeoDataTest.php`

**Interfaces:**
- Consumes: `PakGeoData\Models\*` and `src/Data/*.php` arrays
- Produces: `PakGeoData::getAllProvinces()`, `getCityById()`, `getAreaById()`, `findAreaByPostalCode()`, `haversineDistanceKm()`, `getNearestArea()`.

- [ ] **Step 1: Implement `packages/php/src/Geo.php`**

Clamped spherical Haversine distance with Earth radius $6371.0088\text{ km}$:
```php
<?php

declare(strict_types=1);

namespace PakGeoData;

use PakGeoData\Models\Coordinates;

final class Geo
{
    public const EARTH_RADIUS_KM = 6371.0088;

    public static function haversineDistanceKm(Coordinates $c1, Coordinates $c2): float
    {
        if ($c1->lat === $c2->lat && $c1->lng === $c2->lng) {
            return 0.0;
        }

        $dLat = deg2rad($c2->lat - $c1->lat);
        $dLng = deg2rad($c2->lng - $c1->lng);

        $lat1Rad = deg2rad($c1->lat);
        $lat2Rad = deg2rad($c2->lat);

        $a = sin($dLat / 2.0) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * (sin($dLng / 2.0) ** 2);

        // Clamp antipodal precision
        if ($a > 1.0) {
            $a = 1.0;
        } elseif ($a < 0.0) {
            $a = 0.0;
        }

        $c = 2.0 * atan2(sqrt($a), sqrt(1.0 - $a));
        return self::EARTH_RADIUS_KM * $c;
    }
}
```

- [ ] **Step 2: Implement `packages/php/src/PakGeoData.php`**

Thread-safe/process-cached in-memory lookups:
- `getAllProvinces()`, `getProvinceById(string $id)`
- `getAllCities()`, `getCityById(string $id)`, `getCitiesByProvince(string $provinceId)`
- `getAllAreas()`, `getAreasByCity(string $cityId)`, `getAreaById(string $id)`
- `findAreaByPostalCode(string|int $postalCode)`, `findAreasByPostalCode(string|int $postalCode)`
- `haversineDistanceKm(Coordinates $c1, Coordinates $c2)`
- `getNearestArea(Coordinates $coords, ?string $cityId = null, ?float $maxRadiusKm = null, ?string $provinceId = null): ?NearestAreaResult`

- [ ] **Step 3: Write PHPUnit tests in `packages/php/tests/PakGeoDataTest.php`**

Assert:
- `count(PakGeoData::getAllProvinces()) === 7`
- `count(PakGeoData::getAllCities()) === 79`
- `count(PakGeoData::getAllAreas()) === 3953`
- `PakGeoData::findAreaByPostalCode('54000')->id === 'lahore-gpo'`
- Nearest area for `31.4697, 74.4133` is `lahore-dha-phase-5` with distance `< 0.1` km.
- City case-insensitive lookup (`PakGeoData::getCityById('LAHORE')`).

- [ ] **Step 4: Run tests via Docker / PHPUnit**

Run: `docker run --rm -v $(pwd)/packages/php:/app -w /app composer:2 sh -c "composer dump-autoload" && docker run --rm -v $(pwd)/packages/php:/app -w /app php:8.2-cli php -r "require 'vendor/autoload.php'; require 'tests/PakGeoDataTest.php';"` (or PHPUnit).
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/php
git commit -m "feat(php): implement Geo Haversine calculations and core in-memory lookups"
```

---

### Task 4: Urdu NLP & Multi-Script Search (`Search.php`)

**Files:**
- Create: `packages/php/src/Search.php`
- Modify: `packages/php/src/PakGeoData.php`
- Modify: `packages/php/tests/PakGeoDataTest.php`

**Interfaces:**
- Consumes: Raw text queries and Area entities
- Produces: `Search::normalizeUrduText(string $text): string`, `Search::stripDiacritics(string $text): string`, `Search::toWesternDigits(string $text): string`, `Search::searchAreas(string $query, ?string $cityId = null, int $limit = 20): array<SearchResult>`.

- [ ] **Step 1: Implement `packages/php/src/Search.php`**

- City colloquial aliases map: `isb` -> Islamabad, `lhe` -> Lahore, `khi` -> Karachi, `pindi` -> Rawalpindi, etc.
- Multi-byte Urdu character normalization:
  - `preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $text)`
  - Unify Alef (`/[آأإٱ]/u` -> `ا`), Yeh (`/[يىئے]/u` -> `ی`), Kaf (`/ك/u` -> `ک`), Heh (`/[ةھ]/u` -> `ہ`).
  - Convert Eastern numerals `[۰-۹]` and `[٠-٩]` to `0-9`.
- Ranking tiers:
  1. Exact match ($1000$)
  2. Prefix match ($700$)
  3. Urdu script match ($650$)
  4. Colloquial alias match ($600$)
  5. Token match ($300$)
  6. Levenshtein fuzzy match ($150$)

- [ ] **Step 2: Expose `PakGeoData::searchAreas` and `PakGeoData::normalizeUrduText`**

Wire into `packages/php/src/PakGeoData.php`.

- [ ] **Step 3: Add unit tests in `packages/php/tests/PakGeoDataTest.php`**

- Query `"گلبرگ"` in Lahore resolves top match `lahore-gulberg`.
- Query `"dha 5"` in Lahore resolves `lahore-dha-phase-5`.
- Query `"pindi"` resolves Rawalpindi areas.
- Query `"54000"` or typo `"gulbrg"` matches.

- [ ] **Step 4: Run tests and verify pass**

Run: PHP test runner.
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/php
git commit -m "feat(php): add Urdu NLP normalization and multi-script ranked search"
```

---

### Task 5: 6-Target Parity Gate & Cross-Language Parity Integration

**Files:**
- Modify: `scripts/verify.ts:250-320`
- Modify: `scripts/build.ts:160-200`
- Modify: `package.json:scripts`
- Modify: `tests/parity/golden_vectors.test.ts`

**Interfaces:**
- Consumes: Master JSON, NPM, PyPI, Go, Dart, and PHP datasets
- Produces: 6-target parity verification gate asserting 7 provinces, 79 cities, 3,953 areas.

- [ ] **Step 1: Write parity verification for PHP arrays in `scripts/verify.ts`**

Update `verifyMultiPackageParity` to check `packages/php/src/Data/Areas.php`, `Cities.php`, `Provinces.php`:
- Count regex matches for `'id' =>` in `Areas.php` (must be 3,953).
- Count regex matches for `'id' =>` in `Cities.php` (must be 79).
- Count regex matches for `'id' =>` in `Provinces.php` (must be 7).

- [ ] **Step 2: Update `scripts/build.ts` Step 5**

Include PHP in the multi-package dataset count parity gate.

- [ ] **Step 3: Update `package.json` scripts**

Add scripts:
```json
"test:php": "which php >/dev/null 2>&1 && (cd packages/php && (vendor/bin/phpunit 2>/dev/null || php tests/runner.php)) || docker run --rm -v $(pwd)/packages/php:/app -w /app php:8.2-cli php tests/runner.php"
```
Update root `"test"`:
```json
"test": "npm run test:ts && npm run test:python && npm run test:go && npm run test:dart && npm run test:php"
```

- [ ] **Step 4: Run full `npm test` and `npm run build`**

Run: `npm test && npm run build`
Expected: All 5 suites (TS, Python, Go, Dart, PHP) pass; build passes with 0 errors across 6 targets.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify.ts scripts/build.ts package.json
git commit -m "feat(parity): expand parity gate to 6 targets and add test:php to monorepo test runner"
```

---

### Task 6: Documentation, CI/CD Streamlining & Version Bump (0.11.0)

**Files:**
- Create: `packages/php/README.md`
- Modify: `README.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`
- Modify: `package.json`
- Modify: `packages/npm/package.json`
- Modify: `packages/pypi/pyproject.toml`
- Modify: `packages/pypi/pak_geodata/__init__.py`
- Modify: `packages/dart/pubspec.yaml`
- Modify: `packages/dart/CHANGELOG.md`
- Modify: `apps/demo/package.json`

**Interfaces:**
- Produces: Complete PHP documentation, CI pipeline testing all 5 languages, streamlined release workflow with zero race conditions, and SemVer bumped to `0.11.0`.

- [ ] **Step 1: Create `packages/php/README.md`**

Complete PHP package documentation with Packagist badge, Composer installation, Laravel/Symfony usage, models, and API reference table.

- [ ] **Step 2: Update root `README.md`**

- Add Packagist badge in header.
- Update Core Highlights to emphasize quint-distribution (TypeScript, Python, Go, Dart, PHP).
- Add PHP installation (`composer require sohaibbinmohsin/pak-geodata`) and Quickstart section.
- Update multi-language architecture diagram to include PHP OPcache arrays.

- [ ] **Step 3: Update `.github/workflows/ci.yml`**

Add PHP setup and test step:
```yaml
      - name: Set up PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, json
          tools: composer:v2

      - name: Run PHP tests
        run: |
          cd packages/php
          composer install --prefer-dist --no-interaction
          npm run test:php
```

- [ ] **Step 4: Fix `.github/workflows/release.yml` Race Condition**

Remove duplicate `release: types: [published]` trigger:
```yaml
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
```

- [ ] **Step 5: Proactively bump versions from `0.10.1` to `0.11.0`**

Bump version across:
- `package.json`: `"0.11.0"`
- `packages/npm/package.json`: `"0.11.0"`
- `packages/pypi/pyproject.toml`: `"0.11.0"`
- `packages/pypi/pak_geodata/__init__.py`: `__version__ = "0.11.0"`
- `packages/dart/pubspec.yaml`: `0.11.0`
- `packages/dart/CHANGELOG.md`: add `## 0.11.0` entry
- `packages/dart/README.md`: `pak_geodata: ^0.11.0`
- `apps/demo/package.json`: `"0.11.0"`

- [ ] **Step 6: Run full production build and test suites**

Run: `npm test && npm run build`
Expected: 0 errors across all 5 languages and all packages.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs(php): add README, update root docs, streamline release workflow, and bump version to 0.11.0"
```
