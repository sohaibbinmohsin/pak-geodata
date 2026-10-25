# pak-geodata

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` is an open-source, production-grade Python client library providing offline access to verified geographic data for Pakistan, created and maintained by [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) at [The Mohsin Project Global](https://themohsinproject.org).

It covers all administrative provinces, 40 major cities, and foundational flagship metropolitan areas (sectors, housing schemes, neighborhoods, and commercial centers).

Designed with **zero runtime dependencies** (pure Python standard library), strict geofencing, and sub-millisecond lookups.

---

## Features

- **Zero Runtime Dependencies**: Powered entirely by the Python standard library (`dataclasses`, `json`, `math`, `re`, `pathlib`).
- **Offline & Self-Contained**: All verified golden datasets are bundled with the library: no remote API calls or internet access required.
- **Strict Geofencing & Validation**: Every coordinate is rigorously validated within Pakistan territorial boundaries (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`) and city district bounding boxes.
- **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` identifiers across all datasets (e.g. `lahore-dha-phase-5`).
- **Multi-Script & Alias Search**: Full support for English queries, colloquial aliases (e.g. `"dha 5"`), Urdu script queries (e.g. `"کلفٹن"`), and fuzzy typo tolerance.
- **Spatial Nearest Neighbor**: Instant reverse geocoding via spherical Haversine distance calculations.
- **Postal Code Resolution**: 5-digit Pakistan Post postal code lookup and reverse mapping.
- **Fully Typed & PEP 561 Compliant**: Includes `py.typed` marker and immutable frozen dataclasses for full IDE auto-completion.

---

## Installation

```bash
pip install pak-geodata
```

---

## Quick Start

### 1. Provinces & Cities

```python
from pak_geodata import (
    get_all_provinces,
    get_province_by_id,
    get_all_cities,
    get_cities_by_province,
    get_city_by_id,
)

# List all 7 provinces and federal territories
provinces = get_all_provinces()
for p in provinces:
    print(f"{p.name} ({p.urdu_name}) - Capital: {p.capital_city_id}")

# Find a province by ID
punjab = get_province_by_id("punjab")
print(punjab.name)  # "Punjab"

# Retrieve all cities in a province
punjab_cities = get_cities_by_province("punjab")
print(f"Found {len(punjab_cities)} cities in Punjab")

# Get specific city details
lahore = get_city_by_id("lahore")
print(f"{lahore.name} coordinates: {lahore.coordinates.lat}, {lahore.coordinates.lng}")
print(f"Verified areas count: {lahore.total_areas_count}")
```

### 2. Areas by City

```python
from pak_geodata import get_areas_by_city

# Retrieve all verified areas for a city
lahore_areas = get_areas_by_city("lahore")
for area in lahore_areas[:5]:
    print(f"{area.name} [{area.id}] - Postal Code: {area.postal_code}")
```

### 3. Intelligent Search

The search engine ranks results across multiple matching tiers:
1. Exact match on name, id, Urdu name, or alias
2. Prefix match
3. Substring / multi-word token match
4. Fuzzy edit-distance fallback for typos

```python
from pak_geodata import search_areas

# Search by colloquial alias scoped to a city
results = search_areas("dha 5", city_id="lahore")
print(results[0].id)    # "lahore-dha-phase-5"
print(results[0].name)  # "DHA Phase 5"

# Search using Urdu script
results = search_areas("کلفٹن")
for r in results:
    print(f"{r.name} ({r.urdu_name}) in {r.city_id}")

# Scoped city search with limit
results = search_areas("phase", city_id="islamabad", limit=3)
```

### 4. Reverse Geocoding & Spatial Nearest Neighbor

Find the closest verified neighborhood or society to given GPS coordinates:

```python
from pak_geodata import Coordinates, get_nearest_area, haversine_distance_km

# Distance calculation
lahore_lat, lahore_lng = 31.5204, 74.3587
rawalpindi_lat, rawalpindi_lng = 33.5651, 73.0169
distance_km = haversine_distance_km(lahore_lat, lahore_lng, rawalpindi_lat, rawalpindi_lng)
print(f"Distance: {distance_km:.2f} km")

# Nearest area from coordinates (or Coordinates object)
coords = Coordinates(lat=31.4581, lng=74.4121)
nearest = get_nearest_area(coords)
print(f"Nearest area: {nearest.name} ({nearest.id})")

# Filtered nearest search with maximum distance threshold
area_within_5km = get_nearest_area(
    lat=33.5651,
    lng=73.0169,
    city_id="rawalpindi",
    max_distance_km=5.0
)
```

### 5. Postal Code Resolution

```python
from pak_geodata import find_area_by_postal_code, find_areas_by_postal_code

# Find primary area by 5-digit postal code
area = find_area_by_postal_code("54792")
print(area.name)  # "DHA Phase 1"

# Find all areas sharing a postal code
all_dha = find_areas_by_postal_code("54792")
print(f"{len(all_dha)} areas share postal code 54792")
```

---

## Data Models

All models are immutable frozen dataclasses (`@dataclass(frozen=True)`):

### `Coordinates`
| Field | Type | Description |
|---|---|---|
| `lat` | `float` | WGS 84 latitude in decimal degrees |
| `lng` | `float` | WGS 84 longitude in decimal degrees |

### `PakistanProvince`
| Field | Type | Description |
|---|---|---|
| `id` | `str` | Canonical slug identifier (e.g. `'punjab'`, `'sindh'`) |
| `name` | `str` | English province name |
| `urdu_name` | `str` | Nastaliq Urdu name |
| `capital_city_id` | `str` | ID of capital city |
| `type` | `str` | Administrative type (`'province'`, `'federal_capital'`, `'autonomous_territory'`) |

### `PakistanCity`
| Field | Type | Description |
|---|---|---|
| `id` | `str` | Canonical slug identifier (e.g. `'lahore'`, `'karachi'`) |
| `name` | `str` | English city name |
| `urdu_name` | `str` | Nastaliq Urdu name |
| `province_id` | `str` | Enclosing province identifier |
| `district` | `str` | Enclosing administrative district |
| `coordinates` | `Coordinates` | City centroid coordinates |
| `division` | `Optional[str]` | Administrative division |
| `postal_code_range`| `Optional[List[str]]` | Range of postal codes |
| `bounds` | `Optional[CityBounds]`| Geographic bounding box |
| `total_areas_count`| `int` | Number of verified metropolitan areas |

### `PakistanArea`
| Field | Type | Description |
|---|---|---|
| `id` | `str` | Canonical slug (`<city-id>-<area-slug>`) |
| `city_id` | `str` | City identifier |
| `province_id` | `str` | Enclosing province identifier |
| `name` | `str` | Primary English area name |
| `aliases` | `List[str]` | Alternate names, abbreviations, and colloquial names |
| `coordinates` | `Optional[Coordinates]`| Centroid coordinates |
| `urdu_name` | `Optional[str]` | Nastaliq Urdu name |
| `postal_code` | `Optional[str]` | 5-digit Pakistan Post postal code |
| `type` | `Optional[str]` | Area type (`'neighborhood'`, `'suburb'`, `'commercial'`, `'housing_society'`, etc.) |
| `verified` | `bool` | True if verified against survey and GIS boundaries |
| `sources` | `List[str]` | Verification sources |

---

## API Reference

| Function | Return Type | Description |
|---|---|---|
| `get_all_provinces()` | `List[PakistanProvince]` | Returns all 7 provinces/territories |
| `get_province_by_id(id)` | `Optional[PakistanProvince]` | Case-insensitive province lookup |
| `get_all_cities()` | `List[PakistanCity]` | Returns all 40 verified cities |
| `get_cities_by_province(province_id)` | `List[PakistanCity]` | Filters cities by province |
| `get_city_by_id(id)` | `Optional[PakistanCity]` | Finds city by canonical slug |
| `get_all_areas()` | `List[PakistanArea]` | Returns all verified areas (189 total) |
| `get_areas_by_city(city_id)` | `List[PakistanArea]` | Returns verified areas in a city |
| `search_areas(query, city_id=None, limit=None, province_id=None)` | `List[PakistanArea]` | Ranked multi-tier search |
| `find_area_by_postal_code(postal_code)` | `Optional[PakistanArea]` | Resolves area by 5-digit postal code |
| `find_areas_by_postal_code(postal_code)` | `List[PakistanArea]` | Returns all areas sharing a postal code |
| `haversine_distance_km(lat1, lng1, lat2, lng2)` | `float` | Spherical distance in kilometers |
| `get_nearest_area(lat, lng, city_id=None, max_distance_km=None, province_id=None)` | `Optional[PakistanArea]` | Spatial nearest neighbor resolver |

---

## License

MIT © 2026 [Sohaib Bin Mohsin](https://sohaibbinmohsin.com) • [The Mohsin Project Global](https://themohsinproject.org)
