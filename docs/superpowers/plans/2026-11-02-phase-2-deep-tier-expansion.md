# Phase 2: National Deep-Tier Density Expansion Implementation Plan

**Goal:** Elevate `pak-geodata` from foundational baseline coverage to rich deep-tier urban density by adding ~100+ verified high-density localities across both primary metropolitan centers and secondary industrial/provincial hubs. This addresses the 5 historically ignored urban categories: historic walled quarters & gates, central bazaars, metro & intercity transit termini, arterial highway/canal strips, and dense working-class colonies.

**Target Branch:** `feat/areas-phase-2-deep-tier`  
**Working Directory:** `.worktrees/areas-phase-2-deep-tier`  
**Base Commit:** `feat/areas-phase-1-zero-cities` (`71a1f27`)  
**Target Release:** `v0.7.0`  

---

## Scope & Target Batches

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 2 DEEP-TIER DENSITY EXPANSION                  │
├───────┬───────────────────────────┬────────┬───────────────────────────┤
│ Batch │ Category / Region         │ Cities │ Key Localities            │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   1   │ Major Metros Wards &      │ Lahore │ Harbanspura, Baghbanpura, │
│       │ Transit Corridors         │ Karachi│ Gajjumata, Shahdara,      │
│       │                           │        │ Chauburji, Islampura,     │
│       │                           │        │ Bhatti Gate, Lyari,       │
│       │                           │        │ Sohrab Goth, Numaish      │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   2   │ Twin Cities & Frontier    │ RWP    │ Raja Bazaar, Bhabra Bazar,│
│       │ Metros                    │ ISB    │ Pirwadhai Adda, Faizabad, │
│       │                           │ Pesh   │ Qissa Khwani, Namak Mandi,│
│       │                           │ Quetta │ Liaquat Bazaar, Chaman Ptk│
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   3   │ Central Punjab Industrial │ FSD    │ 8 Bazaars (Clock Tower),  │
│       │ Hubs                      │ Gujran │ Garjakh, Dhullay, Ugoki,  │
│       │                           │ Sialkot│ Adda Pasrurian, Hajipura  │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   4   │ Regional Economic &       │ Multan │ Delhi Gate, Bohar Gate,   │
│       │ Cultural Centers          │ Bwp    │ Shahi Bazaar, Farid Gate, │
│       │                           │ Sgd    │ Block 1-12, Karkhana Bzr, │
│       │                           │ Kasur  │ Kot Ghulam Mohd, Bulleh Sh│
│       │                           │ Jhl/Gjt│ GTS Chowks, Machine Moh   │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   5   │ Sindh & KPK Regional      │ Hyd    │ Phuleli, Paretabad, Tower,│
│       │ Hubs                      │ Sukkur │ Old Sukkur, Bunder Road,  │
│       │                           │ Abd/Mrd│ Supply Bazar, Baghdada    │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   6   │ Synchronization, Tests,   │ All 79 │ Build TS/PyPI subpaths,   │
│       │ SemVer Bump & Release PR  │ Cities │ Bump v0.7.0, Open PR      │
└───────┴───────────────────────────┴────────┴───────────────────────────┘
```

---

## Detailed Task Breakdown

### Task 1: Batch 1 — Major Metros (Lahore & Karachi, 24 Areas)
- **Lahore (`data/areas/punjab/lahore.json`)** (+14 areas):
  1. `lahore-harbanspura`: Harbanspura, Canal Road corridor [31.5670, 74.4320]
  2. `lahore-baghbanpura`: Baghbanpura, GT Road corridor [31.5810, 74.3910]
  3. `lahore-islampura`: Islampura / Krishan Nagar [31.5620, 74.3030]
  4. `lahore-gajjumata`: Gajjumata, Metrobus Southern Terminus [31.3720, 74.3640]
  5. `lahore-chauburji`: Chauburji Chowk & Monument Area [31.5540, 74.3050]
  6. `lahore-shahdara`: Shahdara Town, Metrobus Northern Terminus [31.6210, 74.2820]
  7. `lahore-nishtar-town`: Nishtar Town / Colony [31.4110, 74.3630]
  8. `lahore-gawalmandi`: Gawalmandi Food Street [31.5720, 74.3220]
  9. `lahore-sanda`: Sanda (Kalan & Khurd) [31.5620, 74.2880]
  10. `lahore-mozang`: Mozang Chungi [31.5480, 74.3180]
  11. `lahore-data-darbar`: Data Darbar & Bhati Chowk [31.5790, 74.3050]
  12. `lahore-bhatti-gate`: Bhatti Gate Walled City [31.5830, 74.3110]
  13. `lahore-delhi-gate`: Delhi Gate Walled City [31.5815, 74.3245]
  14. `lahore-misri-shah`: Misri Shah [31.5880, 74.3360]

- **Karachi (`data/areas/sindh/karachi.json`)** (+10 areas):
  1. `karachi-lyari`: Lyari Town [24.8720, 66.9980]
  2. `karachi-ranchore-line`: Ranchore Line / Burns Road Area [24.8580, 67.0160]
  3. `karachi-sohrab-goth`: Sohrab Goth, M-9 Northern Intercity Terminus [24.9450, 67.0860]
  4. `karachi-numaish`: Numaish Chowrangi / Gurumandir Green Line Hub [24.8760, 67.0350]
  5. `karachi-kharadar`: Kharadar / Mithadar Historic Quarter [24.8510, 66.9970]
  6. `karachi-golimar`: Golimar / Rizvia Society [24.8960, 67.0250]
  7. `karachi-malir-city`: Malir City [24.8980, 67.1950]
  8. `karachi-landhi-town`: Landhi Town [24.8450, 67.1850]
  9. `karachi-orangi-town`: Orangi Town [24.9480, 67.0050]
  10. `karachi-korangi-industrial-area`: Korangi Industrial Area [24.8250, 67.1250]

- **Verification:** `npx tsx scripts/verify.ts`.
- **Commit:** `feat(areas): add high-density historic quarters and transit corridors for Lahore and Karachi`

---

### Task 2: Batch 2 — Twin Cities & Frontier Metros (RWP, ISB, Peshawar, Quetta, 24 Areas)
- **Rawalpindi (`data/areas/punjab/rawalpindi.json`)** (+8 areas):
  - Raja Bazaar, Bhabra Bazaar, Mohanpura, Kartarpura, Pirwadhai Adda, Faizabad Adda, Dhok Ratta, Dhok Khabba.
- **Islamabad (`data/areas/federal-capital/islamabad.json`)** (+4 areas):
  - Sector I-14, Sector G-16, Sector H-13, Tarnol.
- **Peshawar (`data/areas/kpk/peshawar.json`)** (+6 areas):
  - Qissa Khwani, Kohati Gate, Namak Mandi, Haji Camp / General Bus Stand, Karkhano Market, Gor Gathri.
- **Quetta (`data/areas/balochistan/quetta.json`)** (+6 areas):
  - Liaquat Bazaar, Suraj Ganj Bazaar, Kandahari Bazaar, Chaman Phatak, Nawan Killi, Brewery Road.
- **Verification:** `npx tsx scripts/verify.ts`.
- **Commit:** `feat(areas): add historic bazaars and transit nodes for Rawalpindi, Islamabad, Peshawar, and Quetta`

---

### Task 3: Batch 3 — Central Punjab Industrial Hubs (FSD, Gujranwala, Sialkot, 26 Areas)
- **Faisalabad (`data/areas/punjab/faisalabad.json`)** (+10 areas):
  - 8 Bazaars radiating from Clock Tower (Karkhana, Rail, Kutchery, Chiniot, Aminpur, Bhawana, Jhang, Montgomery), Dijkot Road, Samundri Road.
- **Gujranwala (`data/areas/punjab/gujranwala.json`)** (+8 areas):
  - Garjakh, Dhullay, Gondlanwala, Khiali Shahpur, Kangniwala, Ferozwala, Nowshera Road, Climax Industrial Zone.
- **Sialkot (`data/areas/punjab/sialkot.json`)** (+8 areas):
  - Adda Pasrurian, Hajipura, Ugoki, Hunterpura, Gohadpur, Circular Road, Kotli Behram, Small Industrial Estate.
- **Verification:** `npx tsx scripts/verify.ts`.
- **Commit:** `feat(areas): add historic bazaars and industrial zones for Faisalabad, Gujranwala, and Sialkot`

---

### Task 4: Batch 4 — Regional Economic & Cultural Centers (Multan, Bahawalpur, Sargodha, Kasur, Jhelum, Gujrat, 30 Areas)
- **Multan (`data/areas/punjab/multan.json`)** (+6 areas):
  - Delhi Gate, Bohar Gate, Haram Gate, Pak Gate, Hussain Agahi, Dera Adda.
- **Bahawalpur (`data/areas/punjab/bahawalpur.json`)** (+6 areas):
  - Shahi Bazaar, Farid Gate, Circular Road, Baghdad-ul-Jadeed Campus, One Unit Colony, Bindrabi Colony.
- **Sargodha (`data/areas/punjab/sargodha.json`)** (+6 areas):
  - Block 1, Block 12, Karkhana Bazaar, 47 Pull, Silanwali Road, Faisalabad Road Adda.
- **Kasur (`data/areas/punjab/kasur.json`)** (+6 areas):
  - Kot Ghulam Muhammad, Kot Murad Khan, Bhasarpura, Railway Road, Darbar Bulleh Shah, Ferozepur Road Kasur Bypass.
- **Jhelum & Gujrat (`data/areas/punjab/jhelum.json`, `data/areas/punjab/gujrat.json`)** (+6 areas):
  - Jhelum: Shandar Chowk, Machine Mohallah, GTS Chowk.
  - Gujrat: GTS Chowk, Circular Road, Shah Daula Darbar.
- **Verification:** `npx tsx scripts/verify.ts`.
- **Commit:** `feat(areas): add historic gates, bazaars, and shrines for Multan, Bahawalpur, Sargodha, Kasur, Jhelum, and Gujrat`

---

### Task 5: Batch 5 — Sindh & KPK Regional Hubs (Hyderabad, Sukkur, Abbottabad, Mardan, 20 Areas)
- **Hyderabad (`data/areas/sindh/hyderabad.json`)** (+8 areas):
  - Phuleli, Paretabad, Tower Market, Shahi Bazaar, Tilak Incline, Halanaka, GOR Colony, Hussainabad.
- **Sukkur (`data/areas/sindh/sukkur.json`)** (+6 areas):
  - Old Sukkur, Bunder Road, Queens Road, Golimar, Ayub Gate, Clock Tower Sukkur.
- **Abbottabad & Mardan (`data/areas/kpk/abbottabad.json`, `data/areas/kpk/mardan.json`)** (+6 areas):
  - Abbottabad: Supply Bazar, Jinnahabad, Mandian Chowk.
  - Mardan: Bank Road, Baghdada, Charsadda Road.
- **Verification:** `npx tsx scripts/verify.ts`.
- **Commit:** `feat(areas): add historic commercial quarters for Hyderabad, Sukkur, Abbottabad, and Mardan`

---

### Task 6: Batch 6 — Build Pipeline Sync, Test Suites, Version Bump (v0.7.0) & PR
- Update and compile TypeScript and PyPI distribution files (`npm run build`).
- Update test suites for new total areas count (~1,232+ areas).
- Run full test suite: `npm test` and `python3 -m unittest discover -s packages/pypi/tests`.
- Run linter and demo build: `npm run lint && npm run build:demo`.
- Proactively bump SemVer versions to `0.7.0`:
  - `packages/npm/package.json` -> `"version": "0.7.0"`
  - `packages/pypi/pyproject.toml` -> `version = "0.7.0"`
  - `packages/pypi/pak_geodata/__init__.py` -> `__version__ = "0.7.0"`
- Update documentation and statistics tables across READMEs.
- Push topic branch `feat/areas-phase-2-deep-tier` and open PR.
