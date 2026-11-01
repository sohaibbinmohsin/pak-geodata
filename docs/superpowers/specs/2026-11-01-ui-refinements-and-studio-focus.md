# Spec: UI Refinements, Studio Pakistan Focus & Directory Simplification

## 1. Overview & Context

This specification addresses 5 critical UI and UX refinements requested by the user for the `pak-geodata` demo site:
1. **Footer & Favicon Title Alignment**: In `Footer.tsx`, change `pak-geodata` to `GeoData`. In `index.html`, align the page title to `GeoData | Pakistan Geographic Intelligence`.
2. **Hero Terminal Install Cards Icons**: In `Hero.tsx`, replace the decorative macOS triple circle dots (red, amber, green) with official/recognizable NPM and Python/PyPI SVG icons.
3. **Streamlined Capabilities Cards**: In `Capabilities.tsx`, remove the bottom terminal metric boxes (`visualBox` containing `>_ RUNTIME FOOTPRINT & SECURITY`, etc.) completely from the 4 production resilience cards.
4. **Studio Map Pakistan Focus & Default Karachi**: In `MapCanvas.tsx`, constrain map panning to Pakistan using Leaflet `maxBounds` with `maxBoundsViscosity: 1.0` and `minZoom: 5`. In `StudioScreen.tsx`, set Karachi as the default selected city (`getCityById('karachi')`). Stack Omnibar and CityPills in a single flex column container to prevent suggestion chips from overlapping city pills.
5. **Metropolitan Coverage Simplification & Mobile Responsiveness**: In `Coverage.tsx`, remove the 7 province cards and flagship metros summary cards, keeping strictly the 40-city searchable directory. Add a dedicated mobile card list (`block md:hidden`) alongside the desktop table (`hidden md:table`) for full mobile responsiveness.

## 2. Requirements & Constraints

### 2.1 Global Constraints
- Never push directly to `main` or `master`; work on `feature/interactive-demo`.
- Zero runtime dependencies in client libraries (`packages/npm` and `packages/pypi` must remain untainted).
- Zero em-dashes (`\u2014`) and zero en-dashes (`\u2013`) in code, documentation, or UI copy.
- Zero personal names or promotional marketing.
- All production builds (`npm run build && npm run build:demo`) and test suites (`npm test`) must pass with 0 errors.

### 2.2 Component Specifications

#### 1. Footer & Favicon Title
- `apps/demo/src/components/Footer.tsx`:
  - Change `<span className="font-mono font-bold text-white tracking-tight">pak-geodata</span>` to `<span className="font-mono font-bold text-white tracking-tight">GeoData</span>`.
- `apps/demo/index.html`:
  - Change `<title>pak-geodata | Pakistan Geographic Intelligence</title>` to `<title>GeoData | Pakistan Geographic Intelligence</title>`.

#### 2. Hero Terminal Install Cards Icons
- `apps/demo/src/components/Hero.tsx`:
  - Replace the 3 circle dots (`bg-red-500/80`, `bg-amber-500/80`, `bg-emerald-500/80`) in the NPM card with a crisp inline SVG of the NPM logo.
  - Replace the 3 circle dots in the PyPI card with a crisp inline SVG of the Python/PyPI logo.
  - Maintain the existing copy button, hover feedback, and checkmark animation.

#### 3. Capabilities Cards (Production Resilience)
- `apps/demo/src/components/Capabilities.tsx`:
  - Remove `visualBox` from `CapabilityItem` interface and `CAPABILITIES` data.
  - Remove the entire bottom `<div className="rounded-xl bg-black/40 border border-white/10 p-4 mt-auto">...</div>` container containing `<Terminal />` and the metric grid.
  - Cards cleanly display: Icon, Badge, Title, Subhead, and Checkmark Bullets.

#### 4. Studio Map Focus on Pakistan & Default Karachi
- `apps/demo/src/components/MapCanvas.tsx`:
  - Configure Leaflet `maxBounds: [[23.0, 60.0], [37.5, 78.0]]` and `maxBoundsViscosity: 1.0`.
  - Set `minZoom: 5` to prevent zooming out into surrounding countries.
- `apps/demo/src/components/StudioScreen.tsx`:
  - Initialize `selectedCity` with `getCityById('karachi')` by default.
  - Layout fix: Wrap Omnibar and CityPills in a single flex column container:
    ```tsx
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-20 flex flex-col items-center gap-2.5 pointer-events-none">
      <div className="w-full pointer-events-auto">
        <Omnibar ... />
      </div>
      <div className="pointer-events-auto">
        <CityPills ... />
      </div>
    </div>
    ```

#### 5. Coverage Directory Simplification & Mobile Responsiveness
- `apps/demo/src/components/Coverage.tsx`:
  - Remove `PROVINCES_BASE_CATALOG` and province cards section.
  - Remove `FLAGSHIP_METROS_BASE` and flagship metros summary cards section.
  - Retain the section header and the Full City Directory container (`id="coverage"`).
  - Add responsive layout:
    - Mobile view (`block md:hidden`): Stack of clean directory cards for each filtered city with City name (EN + Urdu), Province, District, Postal Range badge, and Status badge.
    - Desktop view (`hidden md:block` / `hidden md:table`): The existing 7-column data table.
