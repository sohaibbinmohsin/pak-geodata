# pak-geodata Interactive Web Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Apple-inspired, production-grade interactive single-page web application in `apps/demo` showcasing `pak-geodata` in real-time, deployed automatically to GitHub Pages.

**Architecture:** Monorepo workspace React 18 + Vite + Tailwind CSS application importing `pak-geodata` directly. Features a full-screen interactive Leaflet map canvas, floating translucent glass chrome, zero-latency multi-script search with Urdu support, click-to-reverse-geocode playground, and live TypeScript/Python code generator.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Lucide React, GitHub Actions (`actions/deploy-pages`).

**Spec:** `docs/superpowers/specs/2026-10-26-interactive-demo-design.md`

## Global Constraints

- Never push directly to `main` without confirmation; work on feature branch `feature/interactive-demo`.
- Production build (`npm run build && npm run build:demo && npm test && npm run lint`) must succeed with 0 errors before completion.
- Zero runtime dependencies in the distributed NPM and PyPI client libraries (`packages/npm` and `packages/pypi` must remain untainted).
- Strict coordinates geofencing: all points must fall within Pakistan bounds (`lat: 23.5 - 37.1`, `lng: 60.8 - 77.8`).
- Canonical slugs must follow `<city-slug>-<area-slug>` format.
- Apple Design foundations: floating glass chrome (`backdrop-filter: blur(24px)`), instant press feedback (`:active { transform: scale(0.97) }`), size-specific optical tracking, and clean responsive layouts.

---

### Task 1: Demo App Scaffolding & Monorepo Wiring

**Files:**
- Modify: `package.json` (add `"apps/*"` to workspaces and `"build:demo"` / `"dev:demo"` scripts)
- Create: `apps/demo/package.json`
- Create: `apps/demo/vite.config.ts`
- Create: `apps/demo/tsconfig.json`
- Create: `apps/demo/tailwind.config.js`
- Create: `apps/demo/postcss.config.js`
- Create: `apps/demo/index.html`
- Create: `apps/demo/src/main.tsx`
- Create: `apps/demo/src/index.css`
- Create: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `pak-geodata` exports from `packages/npm/src/index.ts`
- Produces: Executable Vite dev server and production bundle in `apps/demo/dist`

- [ ] **Step 1: Update root `package.json` with workspace and build scripts**

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev:demo": "npm run dev --workspace=apps/demo",
    "build:demo": "npm run build --workspace=apps/demo"
  }
}
```

- [ ] **Step 2: Create `apps/demo/package.json`**

```json
{
  "name": "@pak-geodata/demo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pak-geodata": "*",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.14",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.9"
  }
}
```

- [ ] **Step 3: Create `apps/demo/vite.config.ts` with `/pak-geodata/` base path**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/pak-geodata/',
  resolve: {
    alias: {
      'pak-geodata': resolve(__dirname, '../../packages/npm/src/index.ts')
    }
  }
});
```

- [ ] **Step 4: Create `apps/demo/index.html`, `tailwind.config.js`, and `src/index.css`**
Include Apple-style glass utility classes and Leaflet CSS import.

- [ ] **Step 5: Run `npm install` and verify `npm run build:demo` builds cleanly**
Expected: Build passes with exit code 0 and outputs static files to `apps/demo/dist`.

- [ ] **Step 6: Commit**

```bash
git add package.json apps/demo
git commit -m "chore: scaffold apps/demo with Vite, React, and Tailwind CSS"
```

---

### Task 2: Header, Quick Stats Ticker & Branding

**Files:**
- Create: `apps/demo/src/components/Header.tsx`
- Modify: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `getAllProvinces()`, `getAllCities()`, `getAllAreas()` from `pak-geodata`
- Produces: Floating Apple-style glass header with live metrics and registry links

- [ ] **Step 1: Implement `Header.tsx`**
Create a floating capsule header at the top of the viewport with:
- `pak-geodata` title with glowing emerald live beacon (`100% Offline & Typed`).
- Metric pills: `7 Provinces`, `40 Cities`, `189 Areas`, `0 Dependencies`.
- Registry links:
  - `NPM v0.1.0` (with 1-click copy command `npm i pak-geodata`)
  - `PyPI v0.1.0` (with 1-click copy command `pip install pak-geodata`)
  - GitHub repo link with Star count badge.
- Company & Founder links: [The Mohsin Project Global](https://themohsinproject.org) and [Sohaib Bin Mohsin](https://sohaibbinmohsin.com).

- [ ] **Step 2: Add tactile copy feedback**
When clicking the install command, show a smooth checkmark micro-animation.

- [ ] **Step 3: Test and Commit**

```bash
npm run build:demo
git add apps/demo/src/components/Header.tsx apps/demo/src/App.tsx
git commit -m "feat(demo): add floating Apple-style header with live stats and registry links"
```

---

### Task 3: Interactive Full-Screen Leaflet Map Canvas

**Files:**
- Create: `apps/demo/src/components/MapCanvas.tsx`
- Modify: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `allAreas`, `cities`, `selectedArea`, `selectedCity`, `onSelectArea(area)`
- Produces: Full-screen interactive Leaflet map canvas with custom glowing area pins and boundary zooming

- [ ] **Step 1: Implement `MapCanvas.tsx`**
- Initialize Leaflet map with CartoDB Dark Matter / Voyager tiles centered on Pakistan (`[30.3753, 69.3451]`, zoom 6).
- Create custom SVG marker icon with glowing emerald drop-pin styling.
- Render markers for all areas in the active city filter (or all 189 areas when 'all' is selected).
- Implement smooth `map.flyToBounds(city.bounds)` when a city is selected.
- Implement smooth `map.flyTo([area.coordinates.lat, area.coordinates.lng], 14)` when an individual area is selected.

- [ ] **Step 2: Add marker click and hover tooltips**
Marker popup shows English name, Urdu Nastaliq script, postal code, and click-to-inspect trigger.

- [ ] **Step 3: Test and Commit**

```bash
npm run build:demo
git add apps/demo/src/components/MapCanvas.tsx apps/demo/src/App.tsx
git commit -m "feat(demo): implement full-screen interactive Leaflet map with custom area markers"
```

---

### Task 4: Omnibar Search & City Filter Pills

**Files:**
- Create: `apps/demo/src/components/CityPills.tsx`
- Create: `apps/demo/src/components/Omnibar.tsx`
- Modify: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `searchAreas(query, { cityId })`, `getAllCities()`, `selectedCityId`, `onSelectCity`, `onSelectArea`
- Produces: Instant multi-script autocomplete search with Urdu support and city filter pills

- [ ] **Step 1: Implement `CityPills.tsx`**
- Floating horizontal pill selector bar: `All (189)`, `Karachi (51)`, `Lahore (50)`, `Islamabad (36)`, `Rawalpindi (28)`, `Faisalabad (24)`.
- Active capsule indicator smoothly glides to active pill with spring physics.

- [ ] **Step 2: Implement `Omnibar.tsx`**
- Centered floating search capsule below the header.
- Instant search input with keyboard shortcut hint (`⌘K` or `/` to focus).
- Live dropdown list of matching areas:
  - Highlights match reason: `[Alias: "dha 5"]`, `[Urdu: "ماڈل ٹاؤن"]`, `[Postal Code: 54000]`.
  - Arrow key navigation and `Enter` to select.
- Selecting an item pans the map and triggers the area inspector.

- [ ] **Step 3: Test and Commit**

```bash
npm run build:demo
git add apps/demo/src/components/CityPills.tsx apps/demo/src/components/Omnibar.tsx apps/demo/src/App.tsx
git commit -m "feat(demo): add multi-script search omnibar and city filter pills"
```

---

### Task 5: Click-to-Locate Reverse Geocoding Playground

**Files:**
- Create: `apps/demo/src/components/ReverseGeoCard.tsx`
- Modify: `apps/demo/src/components/MapCanvas.tsx`
- Modify: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `getNearestArea({ lat, lng }, { cityId })`, `haversineDistanceKm`
- Produces: Interactive tap-to-locate mode with radar pin, animated dashed vector, and distance calculation

- [ ] **Step 1: Add Map click listener in `MapCanvas.tsx`**
- Clicking on the map (outside an existing marker) records `clickedCoords = { lat, lng }`.
- Calls `getNearestArea(clickedCoords)`.
- Drops a pulsating radar marker at `clickedCoords`.
- Draws a stylish dashed vector line connecting `clickedCoords` to `nearestArea.coordinates`.

- [ ] **Step 2: Implement `ReverseGeoCard.tsx`**
- Floating glass card anchored above the clicked point or at the screen edge displaying:
  > **Reverse Geocoding Result**
  > Coordinates: `31.4512° N, 74.3981° E`
  > Nearest Area: **DHA Phase 5** (`lahore-dha-phase-5`)
  > Distance: **420 meters**
  > Computation Time: `< 0.4 ms (Offline Client-Side)`

- [ ] **Step 3: Test and Commit**

```bash
npm run build:demo
git add apps/demo/src/components/ReverseGeoCard.tsx apps/demo/src/components/MapCanvas.tsx apps/demo/src/App.tsx
git commit -m "feat(demo): add click-to-reverse-geocode playground with radar pin and distance vector"
```

---

### Task 6: Area Inspector Drawer & Multi-Language Code Generator

**Files:**
- Create: `apps/demo/src/components/AreaInspector.tsx`
- Create: `apps/demo/src/components/CodeGenerator.tsx`
- Modify: `apps/demo/src/App.tsx`

**Interfaces:**
- Consumes: `selectedArea`, `onClose`
- Produces: Floating glass inspector card with Urdu typography, slug copy, postal code badge, and copyable TS/Python code snippets

- [ ] **Step 1: Implement `AreaInspector.tsx`**
- Slides in smoothly from bottom-left when an area is selected.
- Header: English display name + native Urdu Nastaliq name.
- Data chips:
  - Canonical Slug: `lahore-dha-phase-5` (with 1-click copy).
  - Postal Code: `54792` (Pakistan Post badge).
  - Coordinates: `31.4581, 74.4121`.
  - Type: `housing_scheme` / `sector` / `neighborhood`.
  - Aliases: `["DHA 5", "Defence Phase 5"]`.

- [ ] **Step 2: Implement `CodeGenerator.tsx`**
- Segmented toggle (`TypeScript` | `Python`).
- Generates dynamic code snippet tailored to the currently selected area or reverse geocode query:
  - TypeScript:
    ```typescript
    import { getCityById, searchAreas } from 'pak-geodata';
    const area = searchAreas('dha 5', { cityId: 'lahore' })[0];
    ```
  - Python:
    ```python
    from pak_geodata import search_areas
    area = search_areas('dha 5', city_id='lahore')[0]
    ```
- One-click "Copy Code" button with visual confirmation.

- [ ] **Step 3: Test and Commit**

```bash
npm run build:demo
git add apps/demo/src/components/AreaInspector.tsx apps/demo/src/components/CodeGenerator.tsx apps/demo/src/App.tsx
git commit -m "feat(demo): add area inspector drawer and live TS/Python code generator"
```

---

### Task 7: GitHub Pages CI/CD Workflow & Full Production Verification

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md` (add live demo link and badge)

**Interfaces:**
- Consumes: `apps/demo` build artifacts
- Produces: Fully automated GitHub Pages deployment pipeline and documentation link

- [ ] **Step 1: Create `.github/workflows/deploy-pages.yml`**
Configures automated build and deployment to GitHub Pages using `actions/deploy-pages@v4` on pushes to `main`.

- [ ] **Step 2: Update root `README.md`**
Add prominent **"Live Interactive Demo"** button and link: `https://sohaibbinmohsin.github.io/pak-geodata/`.

- [ ] **Step 3: Full monorepo verification**
Execute:
- `npm run build`
- `npm run build:demo`
- `npm test`
- `npm run lint`
All must pass with 0 errors!

- [ ] **Step 4: Commit and push**

```bash
git add .github/workflows/deploy-pages.yml README.md
git commit -m "ci: add GitHub Pages deployment workflow and link demo in README"
```
