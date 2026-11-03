# Phase 3: National Working-Class Settlements & Tier-3 Regional Depth Implementation Plan

**Goal:** Elevate `pak-geodata` to a comprehensive, ground-truth national atlas across all 79 Pakistani cities by executing:
1. **Dense Working-Class & Industrial Fringe Colonies (The Heuristic)**: Systematic inclusion of regularized labor colonies, goths, dhoks, killis, garhis/bandas, and transit chokepoints (e.g. Qasba Colony / Kati Pahari, Banaras Chowk, GM Abad, Dhok Hassu, Killi Deba, Hazarkhwani) across all major and secondary cities.
2. **Flagship Deep Metro Localities**: Remaining high-traffic residential, transit, and academic hubs in Karachi (+15) and Lahore (+12).
3. **Tier-3 Regional Hubs Expansion**: Elevate all remaining 50+ secondary cities across Punjab, Sindh, KPK, Balochistan, AJK, and Gilgit-Baltistan from baseline (8–10) up to 12–16 verified areas each.

**Target Branch:** `feat/areas-phase-3-national-depth`  
**Working Directory:** `.worktrees/areas-phase-3-national-depth`  
**Base Commit:** `feat/areas-phase-2-deep-tier` (`a5064d2`)  
**Target Release:** `v0.8.0`  

---

## Scope & Batches Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│           PHASE 3: NATIONAL WORKING-CLASS & TIER-3 DEPTH               │
├───────┬───────────────────────────┬────────┬───────────────────────────┤
│ Batch │ Scope                     │ Cities │ Key Localities            │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   1   │ Flagship Metros Deep      │ Karachi│ Qasba Colony (Kati Pahari)│
│       │ Localities & Labor Hubs   │ Lahore │ Banaras Chowk, Orangi,    │
│       │                           │        │ Baldia, Keamari, Kharadar,│
│       │                           │        │ Marghzar, Hanjarwal,      │
│       │                           │        │ Kalma Chowk, PU, UVAS     │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   2   │ Secondary Metros Working- │ RWP/ISB│ Dhok Hassu, Dhok Mangtal, │
│       │ Class Quarters & Toponyms │ FSD    │ GM Abad, D-Type, Samanabad│
│       │                           │ Guj/Slk│ Kangniwala, Naikapura,    │
│       │                           │ Pesh/Qta Hazarkhwani, Killi Deba   │
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   3   │ Tier-3 Punjab Hubs        │ 18     │ Sheikhupura, Jhang, RYK,  │
│       │ (4 areas per city)        │ Cities │ Sahiwal, Okara, Chiniot,  │
│       │                           │        │ D.G. Khan, Jaranwala, etc.│
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   4   │ Tier-3 Sindh, KPK,        │ 31     │ Larkana, Nawabshah, Kohat,│
│       │ Balochistan, AJK & GB     │ Cities │ D.I. Khan, Gwadar, Khuzdar│
│       │                           │        │ Muzaffarabad, Gilgit, etc.│
├───────┼───────────────────────────┼────────┼───────────────────────────┤
│   5   │ Dual-Ecosystem Build,     │ Monorepo Recompile, 0 errors,     │
│       │ Verification & Release PR │        │ bump v0.8.0, open PR      │
└───────┴───────────────────────────┴────────┴───────────────────────────┘
```

---

## Detailed Task Breakdown

### Task 1: Batch 1 — Flagship Metros Deep Localities & Labor Hubs (Karachi & Lahore, +27 areas)
- **Karachi (`data/areas/sindh/karachi.json`)** (+15 areas):
  1. `karachi-qasba-colony`: Qasba Colony, Kati Pahari, Qasba Mor [24.9421, 67.0237]
  2. `karachi-banaras-chowk`: Banaras Chowk & Banaras Colony [24.9280, 67.0080]
  3. `karachi-frontier-colony`: Frontier Colony, SITE Hill border [24.9350, 67.0150]
  4. `karachi-orangi-town`: Orangi Town Central / 1-E [24.9450, 66.9950]
  5. `karachi-baldia-town`: Baldia Town / Saeedabad [24.9120, 66.9580]
  6. `karachi-machar-colony`: Machar Colony, Mauripur corridor [24.8450, 66.9750]
  7. `karachi-keamari`: Keamari Port & Docks [24.8150, 66.9850]
  8. `karachi-kharadar`: Kharadar Old Town [24.8510, 66.9980]
  9. `karachi-mithadar`: Mithadar Old Town [24.8550, 67.0020]
  10. `karachi-chakiwara`: Chakiwara / Lyari Central [24.8720, 66.9950]
  11. `karachi-landhi`: Landhi Town / Babur Market [24.8420, 67.1950]
  12. `karachi-korangi-industrial-area`: Korangi Industrial Area [24.8320, 67.1250]
  13. `karachi-malir-city`: Malir City / Kala Board [24.8850, 67.1980]
  14. `karachi-site-area`: Sindh Industrial Trading Estate (SITE) [24.8980, 67.0050]
  15. `karachi-water-pump`: Water Pump Chowrangi / FB Area [24.9320, 67.0780]

- **Lahore (`data/areas/punjab/lahore.json`)** (+12 areas):
  1. `lahore-marghzar-colony`: Marghzar Scheme, Multan Road [31.4880, 74.2620]
  2. `lahore-mansoora`: Mansoora, Multan Road [31.4920, 74.2540]
  3. `lahore-hanjarwal`: Hanjarwal, Multan Road [31.4820, 74.2480]
  4. `lahore-kalma-chowk`: Kalma Chowk & Flyover [31.5030, 74.3340]
  5. `lahore-kahna`: Kahna Nau, Ferozepur Road [31.3650, 74.3690]
  6. `lahore-jallo-mor`: Jallo Mor, Canal Road East [31.5780, 74.4820]
  7. `lahore-punjab-university`: Punjab University New Campus, Canal Road [31.5010, 74.2980]
  8. `lahore-uvas`: UVAS, Outfall Road [31.5700, 74.3050]
  9. `lahore-chungi-amar-sidhu`: Chungi Amar Sidhu, Ferozepur Road [31.4550, 74.3580]
  10. `lahore-youhanabad`: Youhanabad, Ferozepur Road [31.4350, 74.3610]
  11. `lahore-babu-sabu`: Babu Sabu, Bund Road / Motorway Interchange [31.5320, 74.2650]
  12. `lahore-kot-lakhpat`: Kot Lakhpat Industrial / Worker Quarters [31.4500, 74.3350]

- Verification: `npx tsx scripts/verify.ts`
- Commit: `feat(areas): add working-class colonies and deep metro hubs for Karachi and Lahore`

---

### Task 2: Batch 2 — Secondary Metros Working-Class Quarters & Toponyms (+27 areas)
- **Rawalpindi & Islamabad (`data/areas/punjab/rawalpindi.json`, `data/areas/islamabad-ict/islamabad.json`)** (+10 areas):
  - Rawalpindi: `rawalpindi-dhok-hassu` [33.6150, 73.0350], `rawalpindi-dhok-mangtal` [33.6120, 73.0480], `rawalpindi-dhok-khabba` [33.6080, 73.0720], `rawalpindi-tench-bhatta` [33.5780, 73.0280], `rawalpindi-dheri-hassanabad` [33.5850, 73.0450], `rawalpindi-khanna-pul` [33.6320, 73.1180].
  - Islamabad: `islamabad-i-10-industrial` [33.6520, 73.0320], `islamabad-kuri-road` [33.6680, 73.1350], `islamabad-rawat-chowk` [33.4980, 73.1890], `islamabad-barakahu-bazaar` [33.7420, 73.1750].
- **Faisalabad (`data/areas/punjab/faisalabad.json`)** (+5 areas):
  - `faisalabad-ghulam-muhammad-abad` (GM Abad) [31.4320, 73.0550]
  - `faisalabad-d-type-colony` [31.3920, 73.0620]
  - `faisalabad-samanabad` [31.3980, 73.0850]
  - `faisalabad-tata-bazaar` [31.4080, 73.0750]
  - `faisalabad-mansoorabad` [31.4280, 73.1150]
- **Gujranwala & Sialkot (`data/areas/punjab/gujranwala.json`, `data/areas/punjab/sialkot.json`)** (+6 areas):
  - Gujranwala: `gujranwala-kangniwala` [32.1420, 74.2150], `gujranwala-climax-abadi` [32.1650, 74.1750], `gujranwala-peoples-colony` [32.1480, 74.1950].
  - Sialkot: `sialkot-naikapura` [32.4850, 74.5420], `sialkot-small-industries` [32.5120, 74.5150], `sialkot-ugoki-road` [32.4550, 74.4520].
- **Peshawar & Quetta (`data/areas/kpk/peshawar.json`, `data/areas/balochistan/quetta.json`)** (+6 areas):
  - Peshawar: `peshawar-hazarkhwani` [33.9850, 71.5950], `peshawar-yakatoot` [33.9980, 71.5820], `peshawar-gulbahar-worker-colony` [34.0120, 71.5980].
  - Quetta: `quetta-killi-deba` [30.1780, 66.9950], `quetta-killi-ismail` [30.2150, 67.0250], `quetta-hazara-town` [30.1650, 66.9620].
- Verification: `npx tsx scripts/verify.ts`
- Commit: `feat(areas): add working-class mohallahs and industrial fringes for secondary metros`

---

### Task 3: Batch 3 — Tier-3 Punjab Secondary Cities (18 Cities, +72 areas: 4 areas per city)
Elevating all 18 Punjab secondary cities from 8–10 to 12–14 areas each by auditing their industrial fringes and labor colonies:
- Cities: Sheikhupura, Rahim Yar Khan, Jhang, Okara, Sahiwal, Chiniot, Dera Ghazi Khan, Bahawalnagar, Chishtian, Kamalia, Gojra, Jaranwala, Muzaffargarh, Kot Addu, Khanewal, Vehari, Muridke, Mandi Bahauddin.
- Verification: `npx tsx scripts/verify.ts`
- Commit: `feat(areas): deepen secondary cities in Punjab with industrial and labor settlements`

---

### Task 4: Batch 4 — Tier-3 Sindh, KPK, Balochistan, AJK & GB Hubs (31 Cities, +112 areas)
Elevating all remaining 31 secondary cities across Sindh (6), KPK (6), Balochistan (7), AJK (7), and Gilgit-Baltistan (5) from 8–10 to 12–14 areas:
- Sindh: Larkana, Nawabshah, Mirpur Khas, Jacobabad, Shikarpur, Hub (+24 areas).
- KPK: Dera Ismail Khan, Kohat, Swabi, Nowshera, Mansehra, Mingora (+24 areas).
- Balochistan: Gwadar, Khuzdar, Turbat, Chaman, Sibi, Loralai, Zhob (+28 areas).
- AJK & GB: Muzaffarabad, Mirpur, Rawalakot, Kotli, Bagh, Bhimber, Pallandri, Gilgit, Skardu, Chilas, Gahkuch, Khaplu (+36 areas).
- Verification: `npx tsx scripts/verify.ts`
- Commit: `feat(areas): deepen secondary cities across Sindh, KPK, Balochistan, AJK, and GB`

---

### Task 5: Batch 5 — Dual-Ecosystem Build, Verification, SemVer (`v0.8.0`), Demo & Release PR
- Update package versions:
  - `packages/npm/package.json` -> `0.8.0`
  - `packages/pypi/pyproject.toml` -> `0.8.0`
  - `packages/pypi/pak_geodata/__init__.py` -> `0.8.0`
- Recompile datasets: `npm run build`
- Update test assertions: `packages/npm/tests/index.test.ts`, `packages/npm/tests/dist.test.ts`, `packages/pypi/tests/test_lookups.py`
- Update README statistics tables and counts across `README.md`, `packages/npm/README.md`, `packages/pypi/README.md`
- Run test suite: `npm test` (146+ node tests, 29+ python tests)
- Run linter: `npm run lint` (`tsc --noEmit`)
- Run demo build: `npm run build:demo`
- Commit: `chore(release): bump package versions to 0.8.0 and synchronize national deep-tier datasets`
- Push branch: `git push -u origin feat/areas-phase-3-national-depth`
- Open Pull Request on GitHub.
