# Phase 1: Zero-Area Cities National Coverage Expansion Implementation Plan

**Goal:** Elevate `pak-geodata` to true 100% national urban coverage by populating all **37 currently empty cities** across Pakistan with 8–10 verified foundational areas per city (~300–350 new areas), bringing total national coverage from 812 areas to over 1,120 areas across all 79 cities.

**Target Branch:** `feat/areas-phase-1-zero-cities`  
**Working Directory:** `.worktrees/areas-phase-1-zero-cities`  
**Prerequisites:** 
- Strict adherence to city bounding boxes (`city.bounds`).
- Strict adherence to Pakistan Post postal code ranges (`city.postalCodeRange`).
- 0 lint errors, 0 build errors, 100% test pass rate across all Node.js and Python test suites.
- Automatic version bump to `v0.6.0` on completion.

---

## 37 Target Cities by Region

```
┌────────────────────────────────────────────────────────────────────────┐
│                        37 ZERO-AREA CITIES AUDIT                       │
├─────────────────────────┬───────┬──────────────────────────────────────┤
│ Region / Province       │ Count │ Target Cities                        │
├─────────────────────────┼───────┼──────────────────────────────────────┤
│ Azad Jammu & Kashmir    │   4   │ Kotli, Bhimber, Bagh, Pallandri      │
│ Gilgit-Baltistan        │   4   │ Karimabad, Khaplu, Chilas, Gahkuch   │
│ Balochistan             │   5   │ Chaman, Zhob, Sibi, Loralai, DMJ     │
│ Sindh                   │   1   │ Shikarpur                            │
│ Khyber Pakhtunkhwa      │   3   │ Mansehra, Nowshera, Swabi            │
│ North & Central Punjab  │  10   │ Taxila, Attock, Chakwal, M.B.Din,    │
│                         │       │ Wazirabad, Daska, Hafizabad, Chiniot,│
│                         │       │ Muridke, Jhang                       │
│ South & West Punjab     │  10   │ Khanewal, Vehari, Muzaffargarh,      │
│                         │       │ Kot Addu, Jaranwala, Gojra, Kamalia, │
│                         │       │ Samundri, Bahawalnagar, Chishtian    │
├─────────────────────────┼───────┼──────────────────────────────────────┤
│ Total                   │  37   │ ~300 - 350 Verified Areas Added      │
└─────────────────────────┴───────┴──────────────────────────────────────┘
```

---

## Proposed Execution Batches

### Task 1: Batch 1 — Northern Territories (AJK & Gilgit-Baltistan, 8 Cities)
- **Target Cities**:
  - AJK: `data/areas/ajk/kotli.json`, `data/areas/ajk/bhimber.json`, `data/areas/ajk/bagh.json`, `data/areas/ajk/pallandri.json`
  - GB: `data/areas/gilgit-baltistan/karimabad-hunza.json`, `data/areas/gilgit-baltistan/khaplu.json`, `data/areas/gilgit-baltistan/chilas.json`, `data/areas/gilgit-baltistan/gahkuch.json`
- **Deliverables**: 8 new JSON datasets with 8–10 verified areas each, verified bounding boxes, Nastaliq Urdu names, and postal codes.
- **Verification**: `npx tsx scripts/verify.ts`.
- **Commit**: `feat(areas): add foundational localities for AJK and Gilgit-Baltistan (8 cities)`

### Task 2: Batch 2 — Frontier & Historic Hubs (Balochistan & Sindh, 6 Cities)
- **Target Cities**:
  - Balochistan: `data/areas/balochistan/chaman.json`, `data/areas/balochistan/zhob.json`, `data/areas/balochistan/sibi.json`, `data/areas/balochistan/loralai.json`, `data/areas/balochistan/dera-murad-jamali.json`
  - Sindh: `data/areas/sindh/shikarpur.json`
- **Deliverables**: 6 new JSON datasets with verified trade, rail, and municipal centers.
- **Verification**: `npx tsx scripts/verify.ts`.
- **Commit**: `feat(areas): add foundational localities for Balochistan and Sindh (6 cities)`

### Task 3: Batch 3 — Khyber Pakhtunkhwa Hubs (3 Cities)
- **Target Cities**:
  - KPK: `data/areas/kpk/mansehra.json`, `data/areas/kpk/nowshera.json`, `data/areas/kpk/swabi.json`
- **Deliverables**: 3 new JSON datasets with 8–10 verified areas each.
- **Verification**: `npx tsx scripts/verify.ts`.
- **Commit**: `feat(areas): add foundational localities for KPK cities (Mansehra, Nowshera, Swabi)`

### Task 4: Batch 4 — North & Central Punjab Industrial & Agricultural Hubs (10 Cities)
- **Target Cities**:
  - Punjab: `taxila`, `attock`, `chakwal`, `mandi-bahauddin`, `wazirabad`, `daska`, `hafizabad`, `chiniot`, `muridke`, `jhang`
- **Deliverables**: 10 new JSON datasets under `data/areas/punjab/`.
- **Verification**: `npx tsx scripts/verify.ts`.
- **Commit**: `feat(areas): add foundational localities for North and Central Punjab (10 cities)`

### Task 5: Batch 5 — South & Western Punjab Agricultural & Riverine Centers (10 Cities)
- **Target Cities**:
  - Punjab: `khanewal`, `vehari`, `muzaffargarh`, `kot-addu`, `jaranwala`, `gojra`, `kamalia`, `samundri`, `bahawalnagar`, `chishtian`
- **Deliverables**: 10 new JSON datasets under `data/areas/punjab/`.
- **Verification**: `npx tsx scripts/verify.ts`.
- **Commit**: `feat(areas): add foundational localities for South and Western Punjab (10 cities)`

### Task 6: Build Pipeline, PyPI Sync & Distribution Artifacts
- Run `npm run build` to:
  - Generate TypeScript subpath modules for all 37 new cities in `packages/npm/src/areas/`
  - Synchronize JSON datasets to `packages/pypi/pak_geodata/data/`
  - Compile ESM, CommonJS, and DTS bundles.
- Update city stats in `data/cities/*.json` (`totalAreasCount`).
- Run full test suite:
  - `npm test`
  - `python3 -m unittest discover -s packages/pypi/tests`
  - `npm run lint`
- **Commit**: `feat(build): synchronize 37 new city area modules across npm and pypi distributions`

### Task 7: Documentation, Version Bump (v0.6.0) & PR Creation
- Update dataset statistics in root `README.md`, `packages/npm/README.md`, and `packages/pypi/README.md`:
  - 79 Verified Cities: **100% coverage with areas**
  - Total Areas: **~1,120+ areas**
- Bump versions to `0.6.0`:
  - `packages/npm/package.json`
  - `packages/pypi/pyproject.toml`
  - `packages/pypi/pak_geodata/__init__.py`
- Push branch `feat/areas-phase-1-zero-cities` and open Pull Request.
