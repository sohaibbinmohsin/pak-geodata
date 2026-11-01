# UI Refinements, Studio Pakistan Focus & Directory Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 5 specific UI/UX refinements requested by the user: title consistency across footer and browser tab, npm/python icons in hero terminal cards, complete removal of inner code/terminal boxes from capabilities cards, studio map focus on Pakistan with Karachi selected by default and layout collision fix, and simplification of metropolitan coverage to just a mobile-responsive city directory list.

**Architecture:** Frontend updates across `Footer.tsx`, `index.html`, `Hero.tsx`, `Capabilities.tsx`, `StudioScreen.tsx`, `MapCanvas.tsx`, and `Coverage.tsx`.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Lucide React, `pak-geodata`.

**Spec:** [`docs/superpowers/specs/2026-11-01-ui-refinements-and-studio-focus.md`](file:///home/ubuntu/Documents/antigravity/valiant-babbage/docs/superpowers/specs/2026-11-01-ui-refinements-and-studio-focus.md)

## Global Constraints

- Never push directly to `main` or `master`; work exclusively on `feature/interactive-demo`.
- Production build (`npm run build && npm run build:demo && npm test && npm run lint`) must succeed with 0 errors.
- Zero runtime dependencies in client libraries (`packages/npm` and `packages/pypi` must remain untainted).
- No em-dashes and no en-dashes anywhere in documentation, user-facing text, or code. Use standard hyphens (-) or colons (:).
- Zero personal names or promotional marketing.

---

### Task 1: Footer & Favicon Title Alignment

**Files:**
- Modify: `apps/demo/src/components/Footer.tsx`
- Modify: `apps/demo/index.html`
- Modify: `tests/demo-footer.test.ts`

- [ ] **Step 1: Update demo-footer test for GeoData title**

Update `tests/demo-footer.test.ts` to assert that `Footer.tsx` uses `GeoData` and does not use `pak-geodata` as its brand title.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update Footer.tsx and index.html**

- In `apps/demo/src/components/Footer.tsx`: change `pak-geodata` to `GeoData`.
- In `apps/demo/index.html`: change `<title>pak-geodata | Pakistan Geographic Intelligence</title>` to `<title>GeoData | Pakistan Geographic Intelligence</title>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-footer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Footer.tsx apps/demo/index.html tests/demo-footer.test.ts
git commit -m "feat(demo): align footer title and browser title to GeoData"
```

---

### Task 2: Hero Section Terminal Icons

**Files:**
- Modify: `apps/demo/src/components/Hero.tsx`
- Modify: `tests/demo-hero.test.ts`

- [ ] **Step 1: Update demo-hero test**

Update `tests/demo-hero.test.ts` to assert that `Hero.tsx` renders npm and python SVG logos instead of triple circle dots (`bg-red-500/80`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-hero.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update Hero.tsx**

Replace the red, amber, and green circular dots in both terminal cards with crisp SVG logos:
- NPM Card: Red NPM vector logo.
- PyPI Card: Python dual-snake vector logo.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-hero.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Hero.tsx tests/demo-hero.test.ts
git commit -m "feat(demo): replace terminal window dots with npm and python logos in hero"
```

---

### Task 3: Remove Terminal Metric Boxes from Capabilities Cards

**Files:**
- Modify: `apps/demo/src/components/Capabilities.tsx`
- Modify: `tests/demo-capabilities.test.ts`

- [ ] **Step 1: Update demo-capabilities test**

Update `tests/demo-capabilities.test.ts` to assert that `Capabilities.tsx` contains no `visualBox`, `<Terminal`, or inner terminal box.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Refactor Capabilities.tsx**

Remove the `visualBox` field from `CapabilityItem` and `CAPABILITIES`, and remove the entire bottom `<div className="rounded-xl bg-black/40 border border-white/10 p-4 mt-auto">...</div>` container. Retain icon, badge, title, subhead, and checkmark bullets.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Capabilities.tsx tests/demo-capabilities.test.ts
git commit -m "feat(demo): remove inner code and terminal boxes from capabilities cards"
```

---

### Task 4: Studio Map Focus on Pakistan & Default Karachi

**Files:**
- Modify: `apps/demo/src/components/MapCanvas.tsx`
- Modify: `apps/demo/src/components/StudioScreen.tsx`
- Modify: `tests/demo-studio-screen.test.ts`
- Modify: `tests/demo-map.test.ts`

- [ ] **Step 1: Update demo-studio-screen and demo-map tests**

Update tests to assert that `StudioScreen.tsx` defaults `selectedCity` to Karachi (`karachi`), stacks Omnibar and CityPills in a flex column container, and `MapCanvas.tsx` defines `maxBounds` for Pakistan.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx tsx --test tests/demo-studio-screen.test.ts tests/demo-map.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update MapCanvas.tsx and StudioScreen.tsx**

- In `MapCanvas.tsx`:
  - Set `maxBounds: [[23.0, 60.0], [37.5, 78.0]]`, `maxBoundsViscosity: 1.0`, and `minZoom: 5`.
- In `StudioScreen.tsx`:
  - Set default `selectedCity` state to `getCityById('karachi') || null`.
  - Wrap Omnibar and CityPills in a single vertical flex container (`flex flex-col items-center gap-2.5`) to eliminate layout overlap.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx tsx --test tests/demo-studio-screen.test.ts tests/demo-map.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/MapCanvas.tsx apps/demo/src/components/StudioScreen.tsx tests/demo-studio-screen.test.ts tests/demo-map.test.ts
git commit -m "feat(demo): focus studio map on pakistan with default karachi and fix hud layout"
```

---

### Task 5: Coverage Directory Simplification & Mobile Responsiveness

**Files:**
- Modify: `apps/demo/src/components/Coverage.tsx`
- Modify: `tests/demo-capabilities.test.ts`

- [ ] **Step 1: Update demo-capabilities test**

Update `tests/demo-capabilities.test.ts` to assert that `Coverage.tsx` contains only the city directory without separate province cards or flagship summary cards, and contains responsive mobile directory cards.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Refactor Coverage.tsx**

- Remove the 7 province cards and flagship summary cards.
- Keep the section header and the searchable Full City Directory list.
- Add a mobile-friendly card layout (`block md:hidden`) alongside the desktop table (`hidden md:table`):
  - Each mobile card displays: City name (English & Urdu), Province and District, Postal Code range, and Verified Areas badge.
- Ensure zero em-dashes and zero en-dashes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/demo-capabilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/src/components/Coverage.tsx tests/demo-capabilities.test.ts
git commit -m "feat(demo): simplify coverage section to mobile-responsive city directory list"
```

---

### Task 6: Production Build, Test Suite & Subdomain Verification

**Files:**
- Monorepo full verification.

- [ ] **Step 1: Run all test suites**
Run: `npm test`
Expected: 100% pass across all tests.

- [ ] **Step 2: Run TypeScript type checker**
Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Run production builds**
Run: `npm run build && npm run build:demo`
Expected: Clean builds with 0 errors.

- [ ] **Step 4: Verify live endpoints**
Run: `curl -I http://127.0.0.1:5185/` and `curl -I https://pak-geodata.sohaibbinmohsin.com/`.

- [ ] **Step 5: Commit any polish**
```bash
git commit --allow-empty -m "chore: verify ui refinements, studio pakistan focus, and mobile directory"
```
