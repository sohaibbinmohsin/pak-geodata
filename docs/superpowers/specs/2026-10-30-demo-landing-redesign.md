# pak-geodata Developer Landing Page & Interactive Studio Redesign

**Date:** 2026-10-30  
**Status:** In Review  
**Target App:** `apps/demo` (Single-Page Developer Showcase)  
**Package Version:** `pak-geodata` v0.2.0  

---

## 1. Executive Summary & Goals

The initial prototype demo loaded a full-screen map with broken, watermarked CartoDB tiles ("API KEY REQUIRED"), no narrative context, and no clear user journey. It failed to communicate what `pak-geodata` is, why developers need it, or how to use it in production.

This design overhauls `apps/demo` into a developer-first landing page and interactive studio (Option A) following Apple and Linear design principles:
1. **Clear Narrative & Value Proposition**: A clean, technical hero section explaining offline geospatial intelligence for Pakistan with 1-click install snippets (`npm` and `pip`).
2. **Interactive Studio Widget**: A split-screen playground combining:
   - Clean, watermark-free map tiles (CartoDB Positron / OSM Standard / Esri Dark Gray).
   - Live bilingual toggle (`EN` | `اردو`) switching all UI, labels, and code snippets in real time.
   - Multi-script search input supporting colloquial aliases (`"dha 5"`), 5-digit postal codes (`"54000"`), and Urdu script with Eastern numerals (`"فیز ۳"`).
   - Administrative hierarchy breadcrumb (`Province -> City/District -> Tehsil -> Area`).
   - Reverse geocoding click-to-locate playground with benchmark execution counter (`< 0.4 ms`).
   - Live code generator with segmented TypeScript and Python tabs.
3. **Core Capabilities & Production Recipes**: Real-world architectural recipes for emergency rescue field ops (Sanctuary PWA), e-commerce checkout dropdowns, and PWA code splitting (`pak-geodata/hierarchy` < 5 KB).
4. **Quiet, Standard Attribution**: Header and hero are strictly focused on the software with zero personal names or promotional marketing. The footer contains standard software attribution: "A free software by The Mohsin Project", MIT License, and repository links.
5. **No Dashes Constraint**: Zero em-dashes and zero en-dashes across all code, markdown, and user-facing copy.

---

## 2. Page Architecture & Section Layout

The web application is structured as a vertical scrollable page with glass navigation, dark theme typography, and fluid micro-interactions:

```
┌────────────────────────────────────────────────────────────────────────┐
│ NAVIGATION BAR (Sticky Glass Header)                                   │
│ [🇵🇰 pak-geodata v0.2.0]     Studio   Capabilities   Recipes   [GitHub] │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HERO SECTION                                                        │
│    "Canonical Geographic Intelligence for Pakistan"                    │
│    100% offline, zero runtime dependencies, dual TypeScript & Python   │
│    [ npm i pak-geodata 📋 ]                [ pip install pak-geodata 📋 ]│
│    Live Metrics Ticker: 7 Provinces · 40 Cities · 189 Foundational Areas│
├────────────────────────────────────────────────────────────────────────┤
│ 2. INTERACTIVE STUDIO (Split-Screen Container)                         │
│    ┌──────────────────────────────────┬──────────────────────────────┐ │
│    │ Left Column: Controls            │ Right Column: Visualizer     │ │
│    │ • Language Pill: [ EN | اردو ]   │ • Watermark-free Dark Map    │ │
│    │ • City Filter Pills              │ • Administrative Breadcrumbs │ │
│    │ • Search Input with Chips        │ • Live Entity Card           │ │
│    │ • Reverse Geocoding Playground   │ • Copyable TS/Python Snippet │ │
│    └──────────────────────────────────┴──────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CORE CAPABILITIES (4 Grid Cards)                                    │
│    • Zero Runtime Dependencies (Pure standard library / JS)            │
│    • Urdu Normalization Engine (Numerals, letters, Aerab stripping)    │
│    • Sub-Millisecond Reverse Geocoding (Spherical Haversine)           │
│    • Lightweight Hierarchy Subpath (< 5 KB for offline PWAs)           │
├────────────────────────────────────────────────────────────────────────┤
│ 4. PRODUCTION CODE RECIPES (Interactive Tabbed Code Block)             │
│    • Tab 1: Emergency & Rescue Dispatch (Sanctuary PWA pattern)       │
│    • Tab 2: Bilingual E-Commerce Checkout Dropdowns                    │
│    • Tab 3: Tree-Shaken Subpath Area Imports                           │
├────────────────────────────────────────────────────────────────────────┤
│ 5. DATASET COVERAGE METRICS                                            │
│    Province and city breakdown with verified bounds and postal ranges  │
├────────────────────────────────────────────────────────────────────────┤
│ 6. FOOTER                                                              │
│    "A free software by The Mohsin Project" · MIT License · GitHub      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Navigation Header (`apps/demo/src/components/Header.tsx`)
- Floating sticky glass capsule (`backdrop-blur-md bg-[#0b0f17]/80 border border-white/10`).
- Left: Package title `pak-geodata` with version pill `v0.2.0` and green offline indicator dot.
- Center: Quick navigation links to `#studio`, `#capabilities`, `#recipes`, `#coverage`.
- Right: Quick links to GitHub repository, NPM package, and PyPI project with hover glows.
- No personal names or company branding in the header.

### 3.2 Hero Section (`apps/demo/src/components/Hero.tsx`)
- Headline: "Canonical Geographic Intelligence for Pakistan"
- Description: "Offline-first geospatial datasets, administrative hierarchies, and spatial utilities for TypeScript and Python. Zero runtime dependencies, instant search, and native Urdu normalization."
- Primary Action: Two terminal install cards with one-click copy and instant checkmark feedback:
  - `npm i pak-geodata`
  - `pip install pak-geodata`
- Key Metrics Ticker:
  - 7 Provinces and Territories
  - 40 Major Cities
  - 189 Golden Metros
  - 0 Runtime Dependencies

### 3.3 Interactive Studio (`apps/demo/src/components/Studio.tsx`)
The studio container is an integrated two-column responsive dashboard (`min-h-[640px]`):

#### Left Column (Interactive Controls & Search)
1. **Language Segmented Control:**
   - Toggle between `English` and `اردو`.
   - Modifies active display language across the entire studio and generated code samples (`lang: 'en'` vs `lang: 'ur'`).
2. **City Selector Pills:**
   - Quick selection across `All (189)`, `Karachi (51)`, `Lahore (50)`, `Islamabad (36)`, `Rawalpindi (28)`, `Faisalabad (24)`.
   - Bilingual labels: `Lahore / لاہور`, `Karachi / کراچی`, etc.
3. **Multi-Script Omnibar Search:**
   - Instant search input querying `searchAreas()` with multi-script ranking.
   - Quick query suggestion chips:
     - `"dha 5"` (colloquial alias)
     - `"54000"` (postal code)
     - `"گلبرگ"` (Urdu script)
     - `"فیز ۳"` (Eastern Arabic numeral match)
   - Results list displays match reason badge (`[Alias]`, `[Postal]`, `[Urdu]`, `[Exact]`), English name, and native Nastaliq typography.
4. **Reverse Geocoding Playground Trigger:**
   - Map click listener computes `getNearestArea({ lat, lng })` in real time.
   - Shows clicked GPS coordinates, nearest identified area, spherical distance, and execution speed badge (`< 0.4 ms`).

#### Right Column (Map Canvas & Inspector)
1. **Map Canvas (`MapCanvas.tsx`):**
   - Tile Provider: Replaced with clean raster tiles without watermarks or API key requirements (CartoDB Positron / OSM Standard / OpenStreetMap HOT).
   - Smooth camera flight animations (`flyTo`, `flyToBounds`) on area or city selection.
   - Custom emerald glowing drop-pins for selected areas.
   - Radar ping marker and dashed vector connector line for reverse geocoding mode.
2. **Administrative Hierarchy Breadcrumb:**
   - Visual breadcrumb showing administrative tree:
     `Province > City/District > Area`
     (e.g., `Punjab > Lahore > Gulberg III` / `پنجاب > لاہور > گلبرگ ۳`).
3. **Area Inspector Drawer / Card:**
   - Canonical slug (e.g. `lahore-dha-phase-5`) with 1-click copy button.
   - 5-digit Pakistan Post code.
   - GPS centroid with cardinal direction notation (`31.4697° N, 74.3781° E`).
   - Area classification badge (`housing_scheme`, `neighborhood`, `sector`, `commercial`).
   - Known colloquial aliases tags.
4. **Synchronized Code Generator (`CodeGenerator.tsx`):**
   - Segmented `TypeScript` and `Python` tabs.
   - Generates exact working code for the currently inspected area and selected language.

### 3.4 Production Recipes & Capabilities (`apps/demo/src/components/Recipes.tsx`)
Showcases three real-world production use cases:
1. **Emergency Rescue (Sanctuary PWA):**
   Demonstrates offline GPS reverse lookup to identify the closest neighborhood and nearest district hospital/station.
2. **Bilingual E-Commerce Checkout:**
   Demonstrates cascading `Province -> City -> Area` dropdowns that store canonical English slugs in the database while rendering localized Urdu labels to the customer.
3. **PWA Code Splitting (< 5 KB):**
   Demonstrates using `pak-geodata/hierarchy` to load all provinces and cities with zero neighborhood bundle bloat.

### 3.5 Footer (`apps/demo/src/components/Footer.tsx`)
- Standard open-source software footer:
  - Text: "A free software by The Mohsin Project" with hyperlink to `https://themohsinproject.org`.
  - Open source statement: "Released under the MIT License."
  - Links: GitHub repository, NPM package, PyPI package.
  - No personal names or marketing slogans.

---

## 4. Tile Provider Fix

To eliminate the "API KEY REQUIRED" watermark issue seen in CartoDB Dark Matter:
- Primary Provider: OpenStreetMap Carto Standard (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) or Carto Voyager/Positron free endpoint (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`).
- Dark map container styling: Apply CSS filter on tile layer container if dark mode is preferred:
  `filter: brightness(0.7) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);` or use clean Voyager tiles directly.
- Leaflet attribution updated cleanly in bottom right.

---

## 5. Testing & Verification Plan

1. **Unit & Component Testing:**
   - Validate Omnibar search filtering with Eastern numerals and colloquial aliases.
   - Validate language toggle switching between English and Urdu strings.
   - Validate reverse geocoding math and formatters.
   - Run `npm test` to verify all 109 TypeScript and 29 Python tests continue to pass.
2. **Build & Type Checking:**
   - `npm run build`: Monorepo build and distribution sync succeeds with 0 errors.
   - `npm run build:demo`: Vite and TypeScript compilation succeeds with 0 errors.
   - `npm run lint`: `tsc --noEmit` passes with 0 errors.
3. **Live Deployment Verification:**
   - Test on live subdomain `https://pak-geodata.sohaibbinmohsin.com`.
   - Confirm map loads crisp, watermark-free tiles.
   - Confirm layout is responsive on desktop and mobile viewports.
