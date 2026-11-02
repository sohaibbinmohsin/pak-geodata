# Full-Screen Studio & UI Refinements Design Specification

**Date:** 2026-11-01  
**Status:** In Review  
**Target App:** `apps/demo`  
**Package Version:** `pak-geodata` v0.2.0  

---

## 1. Executive Summary & Goals

Following live testing on `https://pak-geodata.sohaibbinmohsin.com`, this design refines the application structure into a two-screen experience and simplifies key UI elements:
1. **Simplified Header**: Strips away nav links, offline pill, and redundant install badges. Keeps only title (`🇵🇰 GeoData`), version badge (`v0.2.0`), and GitHub link.
2. **Dedicated Full-Screen Studio (Option B - Floating Glass HUD)**:
   - Moves the Studio from an inline bounded card into an edge-to-edge, full-viewport screen (`100vw`, `100vh`) with zero page container padding.
   - Background: 100% full-screen interactive Leaflet map canvas with dark raster tiles.
   - Floating Chrome:
     - Top-left: `← Back to Overview` navigation button.
     - Top-center: Floating Omnibar search with suggestion chips (`"dha 5"`, `"54000"`, `"گلبرگ"`, `"فیز ۳"`) and city pills beneath it.
     - Top-right: Language toggle (`[ EN | اردو ]`) and GitHub link.
     - Right edge: Floating glass Area Inspector drawer that slides in when an area is selected, containing hierarchy breadcrumbs, area details, coordinates, and live TypeScript/Python code generator.
     - Floating Reverse Geocoding card when clicking on the map.
3. **Streamlined Production Resilience Cards**: Removes the code snippet blocks from the 4 cards in `Capabilities.tsx`, keeping them focused purely on architecture, descriptions, and performance metrics.
4. **Footer Refinement**:
   - Includes The Mohsin Project bird mark SVG logo positioned immediately after "The Mohsin Project".
   - Removes underline on the link while keeping it fully clickable to `https://themohsinproject.org`.
   - "Released under the MIT License." placed directly underneath on its own line.
5. **No Dashes Constraint**: Zero em-dashes and zero en-dashes across all code, markdown, and user-facing text.

---

## 2. Navigation & Screen Routing Architecture

The demo application supports two views:
- **`'landing'`**: The marketing showcase (Header, Hero with `Launch Studio →`, Capabilities, Recipes, Coverage, Footer).
- **`'studio'`**: The dedicated full-bleed Studio screen.

Screen switching is synchronized with the URL hash (`#studio` vs root `#` / default) and browser history (`popstate`), ensuring bookmarkability and browser back-button support:
- Clicking `Launch Studio →` in the Hero transitions immediately to `'studio'`.
- Clicking `← Back to Overview` in the Studio returns to `'landing'`.

---

## 3. Detailed Component Specifications

### 3.1 Header (`apps/demo/src/components/Header.tsx`)
- Container: Sticky floating glass capsule (`backdrop-blur-md bg-[#0b0f17]/80 border-b border-white/10`).
- Left:
  - Title: `🇵🇰 GeoData`
  - Version: `v0.2.0` badge
- Right:
  - GitHub star/repo button
- Removed:
  - Navigation anchors (`Studio`, `Capabilities`, `Recipes`, `Coverage`).
  - Offline badge (`100% Offline`).
  - `npm` and `pip` install buttons (which already live prominently in the Hero).

### 3.2 Full-Screen Studio Screen (`apps/demo/src/components/StudioScreen.tsx`)
- Viewport: `fixed inset-0 w-screen h-screen overflow-hidden z-40 bg-[#0b0f17]`.
- Layer 0 (Full Map Canvas):
  - Leaflet map fills the entire viewport (`w-full h-full inset-0`).
  - Clean OpenStreetMap raster tiles with dark CSS filter container.
  - Smooth camera kinematics (`flyTo`, `flyToBounds`).
  - Glowing drop pins, radar ping, and dashed vector line.
- Layer 1 (Floating Top Navigation Bar):
  - Left: `← Back to Overview` button returning to landing page.
  - Center: Title `🇵🇰 GeoData Studio`.
  - Right: Language toggle pill (`[ EN | اردو ]`) and GitHub link.
- Layer 2 (Floating Omnibar & City Pills):
  - Centered horizontally below top navigation.
  - Multi-script search input (`⌘K` shortcut) with suggestion chips (`"dha 5"`, `"54000"`, `"گلبرگ"`, `"فیز ۳"`).
  - Floating horizontal city filter pills (`All`, `Karachi`, `Lahore`, `Islamabad`, `Rawalpindi`, `Faisalabad`) directly below Omnibar.
- Layer 3 (Floating Right Inspector Drawer):
  - Slides in smoothly from the right viewport edge when an area is selected.
  - Header with English display name and native Urdu Nastaliq typography.
  - Administrative hierarchy breadcrumbs (`Province > City > Area`).
  - Slug copy button, postal code, GPS coordinates, category badge, and aliases tags.
  - Live TypeScript and Python code generator with copy button.
  - Close button `✕` to dismiss drawer.
- Layer 4 (Floating Reverse Geocoding Card):
  - Appears in bottom-left when map is clicked.
  - Coordinates, nearest area, distance, `< 0.4 ms` benchmark speed badge, and `Inspect Area →` button.

### 3.3 Capabilities Section (`apps/demo/src/components/Capabilities.tsx`)
- The 4 cards retain:
  1. Icon with colored tone.
  2. Headline and technical badge.
  3. Clear architectural explanation.
  4. Metric highlights (e.g. `0 Runtime Dependencies`, `< 0.4 ms Speed`, `< 5 KB Bundle`).
- Removed:
  - The nested code snippet blocks at the bottom of each card (code examples are dedicated to the Recipes section).

### 3.4 Footer (`apps/demo/src/components/Footer.tsx`)
- Logo Asset: Embed the official Mohsin Project bird mark SVG (`mohsin-project-logo-white.svg`) into `apps/demo/src/assets/mohsin-project-logo.svg`.
- Layout:
  ```
  A free software by <a href="https://themohsinproject.org" className="no-underline text-neutral-300 hover:text-white inline-flex items-center gap-1.5">The Mohsin Project <MohsinLogo className="w-5 h-5 text-emerald-400" /></a>
  Released under the MIT License.
  ```
- Links: GitHub, NPM, PyPI pills.
- No underline on the link, fully clickable.
- No personal names or promotional marketing.

---

## 4. Testing & Verification Plan

1. **Unit Tests:**
   - Update `tests/demo-header.test.ts` to assert simplified header (`🇵🇰 GeoData`, `v0.2.0`, GitHub button, no nav links or install buttons).
   - Update `tests/demo-capabilities.test.ts` to assert absence of code blocks in capabilities cards.
   - Update `tests/demo-footer.test.ts` to assert logo presence after company name, absence of underlines, and MIT license formatting.
   - Add `tests/demo-screen-routing.test.ts` to verify screen state switching between landing and full-screen studio.
2. **Build & Lint Verification:**
   - `npm run build`: Core packages compile with 0 errors.
   - `npm run build:demo`: Demo app compiles with 0 errors.
   - `npm test`: All Node and Python tests pass 100%.
   - `npm run lint`: `tsc --noEmit` passes with 0 errors.
3. **Live Subdomain Verification:**
   - Test live on `https://pak-geodata.sohaibbinmohsin.com`.
   - Confirm full-screen Studio fills 100% of viewport with zero page padding.
   - Confirm footer logo rendering and link behavior.
