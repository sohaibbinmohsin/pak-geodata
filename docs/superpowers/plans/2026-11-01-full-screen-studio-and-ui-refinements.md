# Full-Screen Studio & UI Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the pak-geodata demo application into a two-screen architecture featuring a simplified header, streamlined capabilities cards, footer with The Mohsin Project logo, and a dedicated full-screen Studio screen (Option B: Floating Glass HUD) with zero page padding.

**Architecture:** A two-view application (`'landing' | 'studio'`) with hash-based routing (`#studio` vs root). The landing page features a minimalist header (`🇵🇰 GeoData`, `v0.2.0`, GitHub), a Hero with `Launch Studio →`, streamlined capabilities cards (code snippets removed), production recipes, coverage table, and an updated footer with The Mohsin Project bird logo placed after the name without underline. The Studio view is an edge-to-edge, full-viewport screen (`100vw`, `100vh`) with a full-bleed map, floating Omnibar, floating city pills, slide-in inspector drawer, and a top bar with `← Back to Overview` and language toggle.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Lucide React, `pak-geodata`.

**Spec:** [`docs/superpowers/specs/2026-11-01-full-screen-studio-and-ui-refinements.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/docs/superpowers/specs/2026-11-01-full-screen-studio-and-ui-refinements.md)

## Global Constraints

- Never push directly to `main` or `master`; work exclusively on `feature/interactive-demo`.
- Production build (`npm run build && npm run build:demo && npm test && npm run lint`) must succeed with 0 errors.
- Zero runtime dependencies in published client libraries (`packages/npm` and `packages/pypi` must remain untainted).
- No em-dashes and no en-dashes anywhere in documentation, user-facing text, or code. Use standard hyphens (-) or colons (:).
- Header must strictly contain: Title (`🇵🇰 GeoData`), version badge (`v0.2.0`), and GitHub button.
- Footer attribution must strictly position the logo after "The Mohsin Project" without underline, with "Released under the MIT License." on the line below.

---

### Task 1: Header Simplification & Title Update

**Files:**
- Modify: `apps/demo/src/components/Header.tsx`
- Modify: `tests/demo-header.test.ts`

**Interfaces:**
- Consumes: None (or version constant).
- Produces: `<Header />` with title `🇵🇰 GeoData`, `v0.2.0` badge, and GitHub repository button.

- [ ] **Step 1: Update demo-header test for simplified structure**

```typescript
// tests/demo-header.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Header component contains strictly GeoData title, version, and GitHub', () => {
  const headerPath = resolve(process.cwd(), 'apps/demo/src/components/Header.tsx');
  const content = readFileSync(headerPath, 'utf8');

  assert.ok(content.includes('GeoData'), 'Header must display GeoData title');
  assert.ok(content.includes('v0.2.0'), 'Header must display version tag');
  assert.ok(content.includes('https://github.com/sohaibbinmohsin/pak-geodata'), 'Header must link to GitHub');
  assert.ok(!content.includes('npm i pak-geodata'), 'Header must not contain install snippets');
  assert.ok(!content.includes('#studio'), 'Header must not contain navigation anchor links');
  assert.ok(!content.includes('100% Offline'), 'Header must not contain offline badge');
  assert.ok(!content.includes('\u2014'), 'Header must contain zero em-dashes');
  assert.ok(!content.includes('\u2013'), 'Header must contain zero en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-header.test.ts`
Expected: FAIL (currently contains install snippets and anchor links).

- [ ] **Step 3: Refactor Header.tsx**

Remove the navigation links (`Studio`, `Capabilities`, `Recipes`, `Coverage`), offline badge, and `npm`/`pip` install buttons from `Header.tsx`. Keep only:
- Left: `🇵🇰 GeoData` (with Pakistan flag icon) and `v0.2.0` badge.
- Right: GitHub button (`Star on GitHub`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-header.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Header.tsx tests/demo-header.test.ts
git commit -m "feat(demo): simplify header to title, version, and github"
```

---

### Task 2: Remove Code Blocks from Capabilities Cards

**Files:**
- Modify: `apps/demo/src/components/Capabilities.tsx`
- Modify: `tests/demo-capabilities.test.ts`

**Interfaces:**
- Consumes: None.
- Produces: `<Capabilities />` component rendering 4 clean architectural foundation cards without nested code snippets.

- [ ] **Step 1: Update demo-capabilities test**

```typescript
// tests/demo-capabilities.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Capabilities cards highlight architecture without nested code blocks', () => {
  const capPath = resolve(process.cwd(), 'apps/demo/src/components/Capabilities.tsx');
  const content = readFileSync(capPath, 'utf8');

  assert.ok(content.includes('Zero Runtime Dependencies'), 'Highlights zero dependencies');
  assert.ok(content.includes('Urdu Normalization Engine'), 'Highlights Urdu normalizer');
  assert.ok(!content.includes('codeSnippet'), 'Capabilities must not contain codeSnippet objects');
  assert.ok(!content.includes('<pre'), 'Capabilities must not contain pre code blocks');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: FAIL (currently contains code blocks).

- [ ] **Step 3: Refactor Capabilities.tsx**

Remove the `codeSnippet` field and syntax-highlighted code container from `CAPABILITIES` in `Capabilities.tsx`. Retain the icon, badge, headline, description, and key metrics tags for each card.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Capabilities.tsx tests/demo-capabilities.test.ts
git commit -m "feat(demo): remove redundant code snippet boxes from capabilities cards"
```

---

### Task 3: Footer Logo & Layout Refinement

**Files:**
- Create: `apps/demo/src/assets/mohsin-project-logo.svg`
- Modify: `apps/demo/src/components/Footer.tsx`
- Modify: `tests/demo-footer.test.ts`

**Interfaces:**
- Consumes: Mohsin Project logo asset.
- Produces: `<Footer />` component with logo positioned after "The Mohsin Project" without underline, and MIT License underneath.

- [ ] **Step 1: Update demo-footer test**

```typescript
// tests/demo-footer.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Footer contains logo after company name without underline', () => {
  const footerPath = resolve(process.cwd(), 'apps/demo/src/components/Footer.tsx');
  const content = readFileSync(footerPath, 'utf8');

  assert.ok(content.includes('A free software by'), 'Includes standard software phrase');
  assert.ok(content.includes('The Mohsin Project'), 'Includes company name');
  assert.ok(content.includes('themohsinproject.org'), 'Links to official site');
  assert.ok(content.includes('no-underline'), 'Link has no-underline style');
  assert.ok(content.includes('mohsin-project-logo') || content.includes('MohsinProjectLogo'), 'Includes logo asset');
  assert.ok(content.includes('Released under the MIT License.'), 'Includes MIT license');
  assert.ok(!content.includes('Sohaib Bin Mohsin'), 'No personal names');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: FAIL (logo not yet included in Footer).

- [ ] **Step 3: Add logo and update Footer.tsx**

- Copy `/home/ubuntu/development/sanctuary/public/mohsin-project-logo-white.svg` to `apps/demo/src/assets/mohsin-project-logo.svg`.
- In `Footer.tsx`:
  - Render attribution:
    ```tsx
    A free software by{' '}
    <a
      href="https://themohsinproject.org"
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline text-neutral-300 hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
      title="The Mohsin Project Global"
    >
      <span>The Mohsin Project</span>
      <img src={mohsinLogo} alt="The Mohsin Project logo" className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
    </a>
    ```
  - Put `Released under the MIT License.` on its own line below.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/assets/mohsin-project-logo.svg apps/demo/src/components/Footer.tsx tests/demo-footer.test.ts
git commit -m "feat(demo): add mohsin project logo to footer and refine link styling"
```

---

### Task 4: Create Dedicated Full-Screen Studio Screen (Option B)

**Files:**
- Create: `apps/demo/src/components/StudioScreen.tsx`
- Test: `tests/demo-studio-screen.test.ts`

**Interfaces:**
- Consumes: `PakLocationItem`, `PakistanArea`, `PakistanCity`, `getAllAreas`, `getCityById`, `searchAreas`, `getNearestArea` from `pak-geodata`.
- Produces: `<StudioScreen onClose={() => void} />` rendering full viewport HUD with 100% bleed map, floating Omnibar, floating city pills, slide-in inspector drawer, and reverse geo card.

- [ ] **Step 1: Write test for StudioScreen**

```typescript
// tests/demo-studio-screen.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('StudioScreen component renders full-bleed HUD with back button and controls', () => {
  const screenPath = resolve(process.cwd(), 'apps/demo/src/components/StudioScreen.tsx');
  const content = readFileSync(screenPath, 'utf8');

  assert.ok(content.includes('fixed inset-0'), 'StudioScreen takes full fixed viewport');
  assert.ok(content.includes('MapCanvas'), 'StudioScreen includes MapCanvas');
  assert.ok(content.includes('Omnibar'), 'StudioScreen includes Omnibar');
  assert.ok(content.includes('CityPills'), 'StudioScreen includes CityPills');
  assert.ok(content.includes('Back to Overview') || content.includes('Back'), 'StudioScreen has back button');
  assert.ok(!content.includes('\u2014'), 'No em-dashes');
  assert.ok(!content.includes('\u2013'), 'No en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-studio-screen.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement StudioScreen.tsx**

Build `apps/demo/src/components/StudioScreen.tsx`:
- Container: `fixed inset-0 w-screen h-screen z-50 bg-[#0b0f17] overflow-hidden flex flex-col`.
- Top Floating Bar:
  - Left: Back button (`← Back to Overview`) calling `onClose()`.
  - Center: `🇵🇰 GeoData Studio` beacon.
  - Right: Language toggle pill (`[ English | اردو ]`) and GitHub link.
- Background:
  - `MapCanvas` filling 100% of the remaining area (`absolute inset-0`).
- Floating Controls:
  - Floating Omnibar centered horizontally at top (`max-w-xl mx-auto`).
  - Floating City Pills directly under Omnibar.
- Floating Overlays:
  - Floating Slide-in Area Inspector Drawer on the right (`w-96 max-w-[90vw] absolute right-4 top-20 bottom-4 overflow-y-auto glass-chrome rounded-2xl border border-white/10 p-5 shadow-2xl z-30`).
  - Floating Reverse Geocoding Card in bottom-left.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-studio-screen.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/StudioScreen.tsx tests/demo-studio-screen.test.ts
git commit -m "feat(demo): build dedicated full-screen studio screen with floating glass HUD"
```

---

### Task 5: Screen Routing & App Integration

**Files:**
- Modify: `apps/demo/src/components/Hero.tsx`
- Modify: `apps/demo/src/App.tsx`
- Test: `tests/demo-app-routing.test.ts`

**Interfaces:**
- Consumes: `<Header />`, `<Hero />`, `<Capabilities />`, `<Recipes />`, `<Coverage />`, `<Footer />`, `<StudioScreen />`.
- Produces: Multi-screen navigation between marketing landing page and full-screen Studio.

- [ ] **Step 1: Write routing test**

```typescript
// tests/demo-app-routing.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('App.tsx integrates screen routing for full-screen Studio', () => {
  const appPath = resolve(process.cwd(), 'apps/demo/src/App.tsx');
  const heroPath = resolve(process.cwd(), 'apps/demo/src/components/Hero.tsx');
  const appContent = readFileSync(appPath, 'utf8');
  const heroContent = readFileSync(heroPath, 'utf8');

  assert.ok(appContent.includes('StudioScreen'), 'App imports StudioScreen');
  assert.ok(appContent.includes('currentView') || appContent.includes('isStudioOpen') || appContent.includes('#studio'), 'App manages view state');
  assert.ok(heroContent.includes('Launch Studio') || heroContent.includes('onOpenStudio'), 'Hero triggers Studio opening');
  assert.ok(!appContent.includes('\u2014'), 'No em-dashes');
  assert.ok(!appContent.includes('\u2013'), 'No en-dashes');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-app-routing.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update Hero.tsx and App.tsx**

- In `Hero.tsx`: Add prop `onOpenStudio?: () => void`. Update the CTA button to `Launch Studio →` calling `onOpenStudio` and setting `window.location.hash = '#studio'`.
- In `App.tsx`:
  - Manage state `view: 'landing' | 'studio'`.
  - Listen to window `hashchange`: `#studio` sets `view = 'studio'`, empty/other sets `view = 'landing'`.
  - When `view === 'studio'`: Render `<StudioScreen onClose={() => { setView('landing'); window.location.hash = ''; }} />`.
  - When `view === 'landing'`: Render `<Header onOpenStudio={...} />`, `<main>` with `<Hero />`, `<Capabilities />`, `<Recipes />`, `<Coverage />`, and `<Footer />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-app-routing.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Hero.tsx apps/demo/src/App.tsx tests/demo-app-routing.test.ts
git commit -m "feat(demo): integrate two-screen navigation between landing page and full-screen studio"
```

---

### Task 6: Production Build, Test Suite & Subdomain Verification

**Files:**
- Monorepo full verification.

- [ ] **Step 1: Execute all test suites**

Run: `npm test`
Expected: 100% pass across all tests.

- [ ] **Step 2: Run TypeScript type checker**

Run: `npm run lint`
Expected: 0 errors (`tsc --noEmit`).

- [ ] **Step 3: Execute production builds**

Run: `npm run build && npm run build:demo`
Expected: Clean builds with 0 errors.

- [ ] **Step 4: Test live endpoint on port 5185 and subdomain**

Run: `curl -I http://127.0.0.1:5185/` and `curl -I https://pak-geodata.sohaibbinmohsin.com/`.

- [ ] **Step 5: Commit any final polish**

```bash
git commit --allow-empty -m "chore: verify full-screen studio production build and live subdomain"
```
