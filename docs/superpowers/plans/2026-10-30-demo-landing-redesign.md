# pak-geodata Developer Landing Page & Interactive Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `apps/demo` from an aimless full-screen map with broken watermarked tiles into a high-performance, developer-first landing page and interactive studio (Option A) showcasing `pak-geodata` v0.2.0.

**Architecture:** A vertical scrollable showcase built with React 18, Vite, Tailwind CSS, Lucide icons, and Leaflet. Features a sticky glass navigation header, value-proposition hero section with 1-click terminal install snippets, an integrated two-column Interactive Studio widget (bilingual toggle, multi-script search with Urdu numeral normalization, hierarchy breadcrumbs, watermark-free map, and live code generator), real-world production recipes, and a quiet standard footer.

**Tech Stack:** TypeScript, React 18, Vite, Tailwind CSS, Leaflet, Lucide React, `pak-geodata` (local monorepo packages).

**Spec:** [`docs/superpowers/specs/2026-10-30-demo-landing-redesign.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/docs/superpowers/specs/2026-10-30-demo-landing-redesign.md)

## Global Constraints

- Never push directly to `main` or `master`; work exclusively on `feature/interactive-demo`.
- Production build (`npm run build && npm run build:demo && npm test && npm run lint`) must succeed with 0 errors.
- Zero runtime dependencies in published client libraries (`packages/npm` and `packages/pypi` must remain untainted).
- No em-dashes and no en-dashes anywhere in documentation, user-facing text, or code. Use standard hyphens (-) or colons (:).
- Footer attribution must strictly read: "A free software by The Mohsin Project" linking to `https://themohsinproject.org`. No personal names or company branding in the header or hero.
- Map tiles must never show "API KEY REQUIRED" watermarks.

---

### Task 1: Clean Up Header & Navigation

**Files:**
- Modify: `apps/demo/src/components/Header.tsx`
- Test: `tests/demo-header.test.ts`

**Interfaces:**
- Consumes: `getAllProvinces()`, `getAllCities()`, `getAllAreas()` from `pak-geodata`.
- Produces: `<Header />` component rendering sticky glass capsule with navigation anchors (`#studio`, `#capabilities`, `#recipes`, `#coverage`), version tag `v0.2.0`, offline status beacon, and GitHub/NPM/PyPI buttons.

- [ ] **Step 1: Write the component test for Header**

```typescript
// tests/demo-header.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Header component does not contain personal names or promotional marketing', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');
  
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Header must not contain personal name');
  assert.ok(!content.includes('The Mohsin Project'), 'Header must not contain company name');
  assert.ok(content.includes('pak-geodata'), 'Header must display package name');
  assert.ok(content.includes('v0.2.0'), 'Header must display version tag');
  assert.ok(content.includes('#studio'), 'Header must link to studio anchor');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-header.test.ts`
Expected: FAIL (currently contains personal name and company in header).

- [ ] **Step 3: Refactor Header.tsx**

Remove the personal and company attribution links from the header capsule. Add smooth anchor navigation links (`#studio`, `#capabilities`, `#recipes`, `#coverage`) and maintain the 1-click copy buttons for `npm i pak-geodata` and `pip install pak-geodata` with checkmark animation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-header.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Header.tsx tests/demo-header.test.ts
git commit -m "feat(demo): streamline header with navigation anchors and remove intrusive attribution"
```

---

### Task 2: Create Hero Section Component

**Files:**
- Create: `apps/demo/src/components/Hero.tsx`
- Test: `tests/demo-hero.test.ts`

**Interfaces:**
- Consumes: Metric getters from `pak-geodata`.
- Produces: `<Hero />` component with headline, technical subhead, dual terminal install snippets, and dynamic metrics ticker.

- [ ] **Step 1: Write the component test for Hero**

```typescript
// tests/demo-hero.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Hero component renders headline, install snippets, and dynamic metrics', () => {
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const content = readFileSync(heroPath, 'utf8');

  assert.ok(content.includes('Canonical Geographic Intelligence for Pakistan'), 'Hero has required headline');
  assert.ok(content.includes('npm i pak-geodata'), 'Hero includes npm install snippet');
  assert.ok(content.includes('pip install pak-geodata'), 'Hero includes pip install snippet');
  assert.ok(!content.includes('\u2014'), 'Hero must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Hero must contain zero en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-hero.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement Hero.tsx**

Create `apps/demo/src/components/Hero.tsx` featuring:
- Badge: `100% Offline & Typed Foundation`
- Headline: `Canonical Geographic Intelligence for Pakistan`
- Subhead: `Standardized administrative hierarchies, multi-script area aliases, and sub-millisecond reverse geocoding for TypeScript and Python. Zero runtime dependencies.`
- Dual copyable terminal cards for `npm i pak-geodata` and `pip install pak-geodata`.
- 4-card live metrics ticker: `7 Provinces & Territories`, `40 Verified Cities`, `189 Foundational Areas`, `0 Runtime Dependencies`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-hero.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Hero.tsx tests/demo-hero.test.ts
git commit -m "feat(demo): add developer hero section with install cards and metrics ticker"
```

---

### Task 3: Watermark-Free Map Tile Provider & Dark Styling

**Files:**
- Modify: `apps/demo/src/components/MapCanvas.tsx`
- Test: `tests/demo-map.test.ts`

**Interfaces:**
- Consumes: Selected area/city, click coordinates, reverse geo state.
- Produces: Embedded responsive Leaflet map using reliable, watermark-free raster tiles with smooth dark mode styling.

- [ ] **Step 1: Write test for MapCanvas tile provider**

```typescript
// tests/demo-map.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('MapCanvas uses clean tile provider without broken CartoDB dark_all watermark', () => {
  const mapPath = resolve(process.cwd(), 'apps/demo/src/components/MapCanvas.tsx');
  const content = readFileSync(mapPath, 'utf8');

  assert.ok(!content.includes('cartocdn.com/dark_all'), 'Must not use watermarked CartoDB dark_all endpoint');
  assert.ok(content.includes('tile.openstreetmap.org') || content.includes('cartocdn.com/rastertiles/voyager') || content.includes('basemaps.cartocdn.com/light_all'), 'Must use free watermark-free tile endpoint');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-map.test.ts`
Expected: FAIL (currently points to `cartocdn.com/dark_all`).

- [ ] **Step 3: Update MapCanvas.tsx**

Switch the tile URL to OpenStreetMap Carto Standard or Carto Voyager free raster tiles with an elegant dark CSS filter container overlay (`filter: brightness(0.75) contrast(1.2)`) to preserve the dark developer aesthetic while guaranteeing crisp, watermark-free tiles.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-map.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/MapCanvas.tsx tests/demo-map.test.ts
git commit -m "fix(demo): replace watermarked map tiles with clean raster tile provider"
```

---

### Task 4: Interactive Studio & Bilingual Controller

**Files:**
- Create: `apps/demo/src/components/Studio.tsx`
- Modify: `apps/demo/src/components/Omnibar.tsx`
- Modify: `apps/demo/src/components/AreaInspector.tsx`
- Modify: `apps/demo/src/components/CodeGenerator.tsx`
- Test: `tests/demo-studio.test.ts`

**Interfaces:**
- Consumes: `PakLocationItem`, `getCityName`, `getAreaName`, `searchAreas`, `getNearestArea` from `pak-geodata`.
- Produces: `<Studio />` component integrating controls (language toggle, city pills, search with suggestion chips, reverse geo tester) and visualizer (map, hierarchy breadcrumb, area inspector, code generator).

- [ ] **Step 1: Write test for Studio bilingual and hierarchy integration**

```typescript
// tests/demo-studio.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Studio integrates bilingual language toggle and hierarchy breadcrumb', () => {
  const studioPath = resolve(process.cwd(), 'apps/demo/src/components/Studio.tsx');
  const content = readFileSync(studioPath, 'utf8');

  assert.ok(content.includes('English'), 'Studio includes English option');
  assert.ok(content.includes('اردو'), 'Studio includes Urdu option');
  assert.ok(content.includes('breadcrumb') || content.includes('Hierarchy'), 'Studio includes hierarchy breadcrumb');
  assert.ok(!content.includes('\u2014'), 'Studio contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Studio contains zero en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-studio.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement Studio.tsx and update child components**

- Add language state: `'en' | 'ur'`.
- In `Omnibar.tsx`, add quick search suggestion chips: `"dha 5"`, `"54000"`, `"گلبرگ"`, `"فیز ۳"`.
- In `AreaInspector.tsx`, display the administrative breadcrumb: `Punjab > Lahore > Gulberg III` / `پنجاب > لاہور > گلبرگ ۳`.
- In `CodeGenerator.tsx`, generate bilingual code snippets reflecting the active language: `searchAreas('lahore', 'Gulberg', 'en')` vs `searchAreas('lahore', 'گلبرگ', 'ur')`.
- Assemble the two-column Studio container with card borders, dark glass styling, and responsive layout.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-studio.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Studio.tsx apps/demo/src/components/Omnibar.tsx apps/demo/src/components/AreaInspector.tsx apps/demo/src/components/CodeGenerator.tsx tests/demo-studio.test.ts
git commit -m "feat(demo): build interactive studio with bilingual toggle, suggestion chips, and hierarchy breadcrumbs"
```

---

### Task 5: Production Recipes Section Component

**Files:**
- Create: `apps/demo/src/components/Recipes.tsx`
- Test: `tests/demo-recipes.test.ts`

**Interfaces:**
- Consumes: Code templates for Sanctuary rescue PWA, bilingual dropdowns, and subpath tree-shaking.
- Produces: `<Recipes />` component with interactive tabbed code blocks and copy buttons.

- [ ] **Step 1: Write test for Recipes component**

```typescript
// tests/demo-recipes.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Recipes component renders production tabs with Sanctuary and PWA recipes', () => {
  const recipesPath = resolve(process.cwd(), 'apps/demo/src/components/Recipes.tsx');
  const content = readFileSync(recipesPath, 'utf8');

  assert.ok(content.includes('Emergency & Rescue Dispatch') || content.includes('Sanctuary'), 'Includes emergency recipe');
  assert.ok(content.includes('Bilingual Checkout Dropdowns') || content.includes('PakLocationItem'), 'Includes bilingual dropdown recipe');
  assert.ok(content.includes('pak-geodata/hierarchy'), 'Includes subpath hierarchy recipe');
  assert.ok(!content.includes('\u2014'), 'Recipes contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Recipes contains zero en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-recipes.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement Recipes.tsx**

Build `apps/demo/src/components/Recipes.tsx` with segmented tabs:
1. **Emergency & Field Operations (Sanctuary PWA):**
   Offline reverse geocoding from GPS coordinates to the nearest neighborhood with `< 0.4 ms` latency.
2. **Bilingual E-Commerce Checkout:**
   Cascading `Province -> City -> Area` dropdowns storing canonical English keys in SQLite/Postgres while rendering native Urdu strings to users.
3. **PWA Code Splitting (< 5 KB):**
   Importing from `pak-geodata/hierarchy` to load all administrative lookups without loading 189 neighborhood datasets into client memory.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-recipes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Recipes.tsx tests/demo-recipes.test.ts
git commit -m "feat(demo): add production code recipes showcasing Sanctuary and PWA patterns"
```

---

### Task 6: Core Capabilities & Coverage Components

**Files:**
- Create: `apps/demo/src/components/Capabilities.tsx`
- Create: `apps/demo/src/components/Coverage.tsx`
- Test: `tests/demo-capabilities.test.ts`

**Interfaces:**
- Consumes: Master dataset metrics from `pak-geodata`.
- Produces: `<Capabilities />` (4 grid cards) and `<Coverage />` (province/city statistics table).

- [ ] **Step 1: Write test for Capabilities and Coverage**

```typescript
// tests/demo-capabilities.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Capabilities and Coverage components render architectural highlights', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const covPath = resolve(process.cwd(), 'apps/demo/src/components/Coverage.tsx');
  const capContent = readFileSync(capPath, 'utf8');
  const covContent = readFileSync(covPath, 'utf8');

  assert.ok(capContent.includes('Zero Runtime Dependencies'), 'Highlights zero dependencies');
  assert.ok(capContent.includes('Urdu Normalization Engine'), 'Highlights Urdu normalizer');
  assert.ok(covContent.includes('Punjab'), 'Coverage lists provinces');
  assert.ok(!capContent.includes('\u2014') && !covContent.includes('\u2014'), 'No em-dashes');
  assert.ok(!capContent.includes('\u2013') && !covContent.includes('\u2013'), 'No en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: FAIL (files do not exist).

- [ ] **Step 3: Implement Capabilities.tsx and Coverage.tsx**

- `Capabilities.tsx`: 4 glass cards with icons detailing:
  1. Zero Runtime Dependencies (Pure standard library / JS).
  2. Urdu Normalization Engine (Arabic letter variants, numerals, diacritics).
  3. Sub-Millisecond Reverse Geocoding (Spherical Haversine).
  4. Lightweight Hierarchy Subpath (< 5 KB PWA bundle).
- `Coverage.tsx`: Clean data table summarizing the 7 provinces, 40 cities, district bounding boxes, and postal code ranges.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Capabilities.tsx apps/demo/src/components/Coverage.tsx tests/demo-capabilities.test.ts
git commit -m "feat(demo): add core capabilities cards and dataset coverage breakdown"
```

---

### Task 7: Footer Component & Full App Integration

**Files:**
- Create: `apps/demo/src/components/Footer.tsx`
- Modify: `apps/demo/src/App.tsx`
- Test: `tests/demo-footer.test.ts`

**Interfaces:**
- Consumes: None.
- Produces: `<Footer />` component with "A free software by The Mohsin Project" and `<App />` assembling all page sections in vertical scroll order.

- [ ] **Step 1: Write test for Footer and App integration**

```typescript
// tests/demo-footer.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Footer contains exact standard line without personal names', () => {
  const footerPath = resolve(process.cwd(), 'apps/demo/src/components/Footer.tsx');
  const content = readFileSync(footerPath, 'utf8');

  assert.ok(content.includes('A free software by The Mohsin Project'), 'Footer has standard software line');
  assert.ok(content.includes('themohsinproject.org'), 'Footer links to official site');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'Footer must not contain personal name');
  assert.ok(!content.includes('\u2014'), 'Footer contains zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Footer contains zero en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement Footer.tsx and assemble App.tsx**

- Create `Footer.tsx` with:
  - Text: "A free software by The Mohsin Project" linking to `https://themohsinproject.org`.
  - "Released under the MIT License."
  - Links: GitHub, NPM, PyPI.
- Refactor `apps/demo/src/App.tsx`:
  - Structure as a clean scrollable page (`overflow-y-auto min-h-screen bg-[#0b0f17] text-white`).
  - Section stack: `<Header />` -> `<Hero />` -> `<Studio />` -> `<Capabilities />` -> `<Recipes />` -> `<Coverage />` -> `<Footer />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Footer.tsx apps/demo/src/App.tsx tests/demo-footer.test.ts
git commit -m "feat(demo): assemble landing page layout and add standard footer attribution"
```

---

### Task 8: Production Build & Live Verification

**Files:**
- Test all components and builds across monorepo.

- [ ] **Step 1: Execute full test suite**

Run: `npm test`
Expected: 100% pass across all TypeScript and Python test suites.

- [ ] **Step 2: Execute linting check**

Run: `npm run lint`
Expected: 0 errors (`tsc --noEmit`).

- [ ] **Step 3: Execute production builds**

Run: `npm run build && npm run build:demo`
Expected: Clean builds with 0 errors.

- [ ] **Step 4: Verify live subdomain on port 5185**

Run: `curl -I http://127.0.0.1:5185/` and verify live page on `https://pak-geodata.sohaibbinmohsin.com`.

- [ ] **Step 5: Commit any final polish**

```bash
git commit --allow-empty -m "chore: verify landing page production build and live subdomain"
```
