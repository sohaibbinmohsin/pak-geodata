# Contributing to pak-geodata

Thank you for your interest in contributing to `pak-geodata`! 🇵🇰

`pak-geodata` is an open-source, community-driven geospatial foundation for Pakistan. Our goal is to provide developers, researchers, logistics operators, and startups with an authoritative, offline, and typed dataset of Pakistan's provinces, cities, neighborhoods, and postal codes with **zero runtime dependencies**.

Every contribution—whether adding missing areas in your home city, refining coordinates, fixing Urdu translations, or adding new features to our client libraries—helps improve Pakistan's digital infrastructure.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How You Can Contribute](#how-you-can-contribute)
- [Data Guidelines & Standards](#data-guidelines--standards)
- [Development Setup](#development-setup)
- [Step-by-Step Contribution Workflow](#step-by-step-contribution-workflow)
- [Adding a New City or Area](#adding-a-new-city-or-area)
- [Verification & Quality Gates](#verification--quality-gates)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Code of Conduct

This project and everyone participating in it is governed by the [pak-geodata Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How You Can Contribute

1. **Curate & Verify Geospatial Data**:
   - Add missing areas, sectors, housing schemes, or commercial zones to existing cities.
   - Expand coverage to secondary and tertiary cities (Peshawar, Quetta, Multan, Gujranwala, Sialkot, Hyderabad, etc.).
   - Refine inaccurate centroid coordinates or boundaries.
   - Add colloquial aliases (e.g. `"DHA 5"`, `"Gulberg 3"`) and authentic Urdu Nastaliq typography.
   - Verify Pakistan Post 5-digit postal codes.

2. **Improve Client Libraries**:
   - Enhance the TypeScript / Node.js package (`packages/npm`).
   - Enhance the Python 3 package (`packages/pypi`).
   - Optimize lookup performance, search algorithms, or memory footprints.

3. **Pipelines & Automation**:
   - Improve candidate harvesters (Overpass / OSM / Pakistan Post).
   - Enhance spatial validation scripts and collision detectors.

---

## Data Guidelines & Standards

All datasets in `pak-geodata` are subjected to automated quality checks. Contributions that fail any of these rules cannot be merged:

### 1. Canonical Slug Format
- Every area must have a unique `id` formatted as `<city-slug>-<area-slug>`.
- Slugs must be entirely lowercase, containing only alphanumeric characters and hyphens:
  - Good: `lahore-dha-phase-5`, `karachi-clifton-block-2`, `islamabad-sector-f-7`
  - Bad: `LHR_DHA_5`, `clifton_block_2`, `lahore--gulberg`

### 2. Strict Geofencing
- Centroids must lie strictly within Pakistan's geographic bounding box:
  - Latitude: `23.5` to `37.1`
  - Longitude: `60.8` to `77.8`
- Area coordinates must fall completely inside their parent city's district bounding box defined in `data/cities/*.json`.

### 3. Spatial Deduplication & Coordinate Accuracy
- No two areas in the same city may share identical coordinates.
- Proximity check: If two areas are within 150 meters of each other, they cannot share identical or near-identical name tokens (to prevent duplicate entries under different spelling variants).

### 4. Postal Codes
- Postal codes must be exact 5-digit strings matching `/^\d{5}$/`.
- Postal codes must fall within the parent city's `postalCodeRange` (e.g., Lahore `54000`–`54999`, Islamabad `44000`–`44999`).

### 5. Multi-Script & Colloquial Aliases
- Provide authentic Urdu Nastaliq names (`urduName`) whenever available.
- Include colloquial variations, common abbreviations, and Roman Urdu variants in the `aliases` array (e.g., `["DHA 5", "DHA V", "Defence 5"]`).

### 6. Audit Trail (`sources`)
- Every area must specify a `sources` array documenting where the data was derived or verified (e.g., `["survey", "curated", "osm"]`).

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; v20+ recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)

### Clone & Install
```bash
git clone https://github.com/sohaibbinmohsin/pak-geodata.git
cd pak-geodata

# Install npm dependencies
npm install
```

---

## Step-by-Step Contribution Workflow

1. **Fork & Branch**:
   Fork the repository on GitHub, then create a topic branch from `main`:
   ```bash
   git checkout -b feat/add-multan-cantt-areas
   ```

2. **Make Changes**:
   Edit or add JSON datasets in `data/` or modify package source code.

3. **Run Validation & Verifier**:
   Validate all coordinates, bounding boxes, postal codes, and references:
   ```bash
   npm run verify
   ```

4. **Run Full Build & Tests**:
   Ensure the automated code-generator synchronizes data to both packages and that all TypeScript and Python tests pass with 0 errors:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

5. **Commit Your Changes**:
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(data): add 25 verified areas for Multan"
   ```

6. **Push & Open a Pull Request**:
   Push to your fork and submit a PR to `main` with a clear description of the data added and sources used.

---

## Adding a New City or Area

### Adding an Area to an Existing City
Open the city's JSON file (e.g. `data/areas/punjab/lahore.json`) and append your entry:

```json
{
  "id": "lahore-valancia-town",
  "cityId": "lahore",
  "provinceId": "punjab",
  "name": "Valencia Town",
  "urduName": "ویلنشیا ٹاؤن",
  "aliases": ["Valencia", "Valencia Society", "ویلنشیا"],
  "postalCode": "54770",
  "coordinates": {
    "lat": 31.4012,
    "lng": 74.2618
  },
  "type": "housing_scheme",
  "verified": true,
  "sources": ["curated", "survey"]
}
```

### Adding a New City
1. Locate or create the city entry in `data/cities/<province>.json`.
2. Define the city centroid, bounding box (`bounds`), and postal code range (`postalCodeRange`).
3. Create `data/areas/<province>/<city-slug>.json` with the city's areas.
4. Run `npm run build && npm test`. The build pipeline will automatically:
   - Validate all boundaries.
   - Generate modular TypeScript data files in `packages/npm/src/data/areas/<city-slug>.ts`.
   - Create the subpath export in `packages/npm/src/areas/<city-slug>.ts`.
   - Synchronize JSON datasets to `packages/pypi/pak_geodata/data/`.

---

## Verification & Quality Gates

Before opening a pull request, verify that every command passes with zero errors:

| Command | Purpose |
| :--- | :--- |
| `npm run verify` | Validates master JSON schema, referential integrity, geofencing, postal ranges, and spatial deduplication. |
| `npm run build` | Runs verification, updates PyPI data, generates TypeScript subpaths, and builds ESM + CJS bundles. |
| `npm test` | Runs the full test suite (TypeScript tests + Python `unittest` suite). |
| `npm run lint` | Typechecks the entire TypeScript codebase (`tsc --noEmit`). |

---

## Pull Request Guidelines

- Provide a summary of what data was added or modified and the sources consulted.
- Ensure all automated checks (CI) pass cleanly.
- Keep PRs focused: avoid bundling unrelated changes or massive formatting re-writes in a single PR.
- Maintainers will review your submission and provide feedback or merge your contribution.

Thank you for helping build the premier open geospatial standard for Pakistan! 🇵🇰
