# pak-geodata Interactive Web Demo Specification

## 1. Overview & Objectives

The goal of this project is to build an Apple-inspired, production-grade interactive single-page web application that showcases `pak-geodata` in real-time, hosted on GitHub Pages (`https://sohaibbinmohsin.github.io/pak-geodata/`).

The application will demonstrate:
1. **Zero-Latency Client-Side Search**: Multi-script search supporting English, colloquial aliases (e.g. "dha 5"), and native Urdu Nastaliq (e.g. "ماڈل ٹاؤن", "کلفٹن") in under 1 millisecond.
2. **Interactive Living Canvas**: Full-screen, high-contrast Leaflet map displaying 189 flagship metropolitan areas across Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad.
3. **Spatial Reverse Geocoding Playground**: Tap/click anywhere on the map to drop a radar ping, draw an animated radius vector to the nearest area, and report exact distance calculated via `getNearestArea()`.
4. **Interactive Code Generator**: Real-time TypeScript and Python code snippets demonstrating how developers can query the exact selected area or coordinates in their own applications.
5. **Apple Design Foundations**: Translucent floating materials (`backdrop-filter: blur(24px)`), direct manipulation, instant press response (`:active { transform: scale(0.97) }`), size-specific optical tracking, and critically damped spring transitions.

---

## 2. Architecture & Monorepo Integration

### 2.1 Workspace Structure
The demo application is located in `apps/demo` as an npm workspace package:

```
pak-geodata/
├── apps/
│   └── demo/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── tsconfig.json
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── types.ts
│           ├── components/
│           │   ├── Header.tsx         # Floating branding, stats ticker, registry badges
│           │   ├── Omnibar.tsx        # Search bar with instant autocomplete & Urdu badges
│           │   ├── CityPills.tsx      # Smooth-scrolling city filter capsules
│           │   ├── MapCanvas.tsx      # Full-screen Leaflet canvas with custom markers & radius
│           │   ├── AreaInspector.tsx  # Floating glass drawer with details & slug copy
│           │   ├── ReverseGeoCard.tsx # Tapped point indicator with distance & nearest area
│           │   └── CodeGenerator.tsx  # Segmented TypeScript / Python copyable snippet box
│           └── index.css              # Translucent glass utilities & Leaflet styling
├── packages/
│   ├── npm/                           # Core pak-geodata TypeScript library
│   └── pypi/                          # Core pak-geodata Python library
├── .github/
│   └── workflows/
│       └── deploy-pages.yml           # Automated GitHub Pages CI/CD workflow
```

### 2.2 Dependency & Build Strategy
- **Framework**: React 18 + Vite + TypeScript.
- **Styling**: Tailwind CSS + Lucide React icons.
- **Mapping**: Leaflet + React Leaflet with CartoDB Dark Matter / Voyager high-contrast vector raster tiles.
- **Geodata Source**: Directly imports `pak-geodata` from the local workspace (`workspace:*` or `../../packages/npm/src`).
- **Base Path**: Configured with `base: '/pak-geodata/'` in `vite.config.ts` for GitHub Pages hosting.

---

## 3. UI/UX & Apple Design Specifications

### 3.1 Materials & Depth
- **Ground Layer**: The map occupies the entire viewport (`100vw`, `100vh`) with dark charcoal tiles and subtle geographic boundaries.
- **Floating Glass Chrome**: All navigation, search, and inspector cards float above the map canvas using:
  ```css
  background: rgba(18, 18, 24, 0.75);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  ```
- **Light Catcher**: A `1px` subtle top border highlight simulating light catching the bevel of glass.

### 3.2 Typography & Optical Sizing
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif`.
- **Urdu Nastaliq Stack**: `'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', serif` with `line-height: 1.8` for diacritic clearance.
- **Optical Tracking**:
  - Headings: `letter-spacing: -0.025em` for compact, polished appearance.
  - Micro-labels and stats: `letter-spacing: 0.05em`, uppercase, `font-size: 11px`.

### 3.3 Interactive Components

#### A. Floating Header & Stats
- Displays `pak-geodata` logo with an emerald heartbeat indicator.
- Live metric badges: `7 Provinces`, `40 Cities`, `189 Areas`, `0 Dependencies`.
- Direct links:
  - GitHub repository: `https://github.com/sohaibbinmohsin/pak-geodata`
  - NPM package: `https://www.npmjs.com/package/pak-geodata` (`v0.1.0`)
  - PyPI package: `https://pypi.org/project/pak-geodata/` (`v0.1.0`)
- Author & Company links: [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) and [The Mohsin Project Global](https://themohsinproject.org).

#### B. Omnibar Search & Autocomplete
- Centered floating search capsule at top.
- Instant search triggered on input without network delay.
- Highlights match type:
  - `Exact` or `Prefix Match`
  - `Alias Match: "dha 5"`
  - `Urdu Match: "ماڈل ٹاؤن"`
  - `Postal Code: "54792"`
- Pressing `Enter` or clicking an item selects the area, flies the camera to the coordinate with smooth deceleration, and opens the inspector.

#### C. City Filter Pills
- Horizontal pill-bar: `All (189)`, `Karachi (51)`, `Lahore (50)`, `Islamabad (36)`, `Rawalpindi (28)`, `Faisalabad (24)`.
- Selecting a city zooms the map to the city bounding box (`bounds`) and scopes area markers.

#### D. Map Canvas & Click-to-Locate Playground
- Custom glowing SVG pin markers for each area.
- Click-to-locate: Clicking anywhere on the map triggers:
  1. Pulsing radar ripple at the tapped coordinate.
  2. Call to `getNearestArea(tappedCoords)`.
  3. Animated dashed connecting line to the nearest area centroid.
  4. Tooltip/popup displaying: `Nearest: <Area Name> • <Distance> km away`.

#### E. Floating Area Inspector & Code Generator
- Slides up from bottom-left when an area is selected.
- Shows:
  - English Name & Urdu Nastaliq Name.
  - Canonical Slug (with 1-click copy button).
  - Pakistan Post 5-digit postal code.
  - Centroid Coordinates & Category.
- **Live Code Generator**:
  - Tab 1: TypeScript snippet (`import { getNearestArea } from 'pak-geodata'`).
  - Tab 2: Python snippet (`from pak_geodata import get_nearest_area`).
  - One-click "Copy Code" button with tactile checkmark feedback.

---

## 4. GitHub Pages Deployment Workflow

A dedicated GitHub Actions workflow `.github/workflows/deploy-pages.yml` will be added:
- Triggers on `push` to `main` branch when files in `apps/demo/**`, `packages/npm/**`, or `data/**` change, plus `workflow_dispatch`.
- Steps:
  1. Checkout repository.
  2. Setup Node.js 22.
  3. Run `npm install` and build core packages (`npm run build`).
  4. Build demo app (`npm run build:demo` -> outputs to `apps/demo/dist`).
  5. Upload GitHub Pages artifact via `actions/upload-pages-artifact@v3`.
  6. Deploy to GitHub Pages via `actions/deploy-pages@v4`.

---

## 5. Verification & Testing Criteria

1. **Build Verification**:
   - `npm run build:demo` builds successfully with 0 TypeScript and bundling errors.
   - Core monorepo build (`npm run build && npm test && npm run lint`) continues to pass with 100% success.
2. **Interactive Testing**:
   - Autocomplete correctly matches English names, colloquial aliases, and Urdu script.
   - Map smoothly flies to selected cities and areas without clipping or lag.
   - Clicking map accurately computes Haversine distance and identifies nearest area.
   - Code snippet generator updates reactively when selecting different areas.
3. **Accessibility & Responsive Testing**:
   - Works seamlessly on desktop and mobile viewports.
   - Respects `prefers-reduced-motion` with cross-fades instead of spring movement.
