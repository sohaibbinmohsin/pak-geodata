# pak-geodata (PHP)

[![Packagist Version](https://img.shields.io/packagist/v/sohaibbinmohsin/pak-geodata?color=orange)](https://packagist.org/packages/sohaibbinmohsin/pak-geodata)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<a href="https://geodata.themohsinproject.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Live%20Demo-Interactive%20Studio-blue?logo=leaflet&color=10B981" alt="Live Interactive Demo" /></a>
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.1-8892BF.svg)](https://www.php.net/)

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak-geodata` for PHP is a zero-dependency, production-grade library providing offline access to verified geographic data for Pakistan. Built with native PHP 8.1+ typed readonly classes and pre-compiled OPcache array storage for instant cold starts and sub-millisecond lookups.

Explore the [Interactive Live Demo](https://geodata.themohsinproject.org/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

---

## Features

- ⚡ **Zero Runtime Dependencies**: Pure PHP standard library implementation (requires only PHP 8.1+ and `ext-mbstring`). No external Composer runtime dependencies.
- 🚀 **OPcache Architecture**: 7 provinces, 79 cities, and 3,953 areas pre-compiled into native PHP return arrays (`Data/Provinces.php`, `Data/Cities.php`, `Data/Areas.php`). When OPcache is enabled (default in production PHP-FPM / Octane / Swoole), datasets reside directly in shared memory (`SHM`) with zero filesystem I/O and zero JSON parsing overhead.
- 📦 **100% Offline & Instant Cold-Start**: Perform spatial radius checks, multi-script searches, and postal code lookups in microseconds with zero network calls.
- 🎯 **Strict Geofencing**: All coordinates strictly verified within Pakistan's geographical bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`) and verified city district boundaries.
- 🏷️ **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` identifiers (e.g. `lahore-dha-phase-5`, `karachi-clifton-block-2`).
- 🔍 **Multi-Script & Alias Search**: English queries, colloquial aliases (e.g. `"dha 5"`, `"isb"`, `"pindi"`), native Urdu script (`"گلبرگ"`, `"کلفٹن"`), and fuzzy typo tolerance.
- 📍 **Spatial Reverse Geocoding**: Nearest neighbor resolution via spherical Haversine formula ($R = 6371.0088\text{ km}$).
- 📮 **Pakistan Post Codes**: 5-digit postal code resolution and reverse lookups.

---

## Dataset Statistics

| Level | Count | Coverage | Key Details |
| :--- | :--- | :--- | :--- |
| **Provinces & Territories** | **7** | 100% of Pakistan | Punjab, Sindh, KPK, Balochistan, Islamabad (ICT), AJK, Gilgit-Baltistan |
| **Verified Cities** | **79** | 100% Coverage | Centroids, bounding boxes, administrative divisions, postal code ranges |
| **Verified Areas** | **3,953** | All 79 Cities | Neighborhoods, sectors, housing schemes, commercial centers |

---

## Installation

Install via Composer:

```bash
composer require sohaibbinmohsin/pak-geodata
```

### Requirements
- **PHP**: `^8.1` (PHP 8.1, 8.2, 8.3, 8.4+)
- **Extensions**: `ext-mbstring` (standard multibyte string extension)

---

## Quickstart

```php
<?php

use PakGeoData\PakGeoData;
use PakGeoData\Models\Coordinates;

require_once __DIR__ . '/vendor/autoload.php';

// 1. Provinces & Cities
$provinces = PakGeoData::getAllProvinces();
$lahore = PakGeoData::getCityById('lahore');
$punjabCities = PakGeoData::getCitiesByProvince('punjab');

echo "City: {$lahore->name} ({$lahore->urduName}) has {$lahore->totalAreasCount} areas\n";

// 2. Areas & Postal Codes
$dha5 = PakGeoData::getAreaById('lahore-dha-phase-5');
$lahoreAreas = PakGeoData::getAreasByCity('lahore');
$area = PakGeoData::findAreaByPostalCode('54000');

echo "Area: {$dha5->name} [Postal: {$dha5->postalCode}]\n";

// 3. Nearest Area Spatial Lookup (Spherical Haversine)
$nearest = PakGeoData::getNearestArea(
    new Coordinates(31.4581, 74.4121),
    cityId: 'lahore',
    maxRadiusKm: 5.0
);

if ($nearest !== null) {
    echo "Nearest: {$nearest->area->name} (" . round($nearest->distanceKm, 2) . " km)\n";
}

// 4. Great-Circle Distance
$dist = PakGeoData::haversineDistanceKm(
    new Coordinates(31.5204, 74.3587), // Lahore Center
    new Coordinates(24.8607, 67.0011)  // Karachi Center
);
echo "Distance Lahore -> Karachi: " . round($dist) . " km\n";

// 5. Multi-Script & Colloquial Search
// Multi-tier ranked: Exact > Prefix > Urdu > Alias > Token > Fuzzy
$results = PakGeoData::searchAreas('dha 5', cityId: 'lahore');
foreach ($results as $res) {
    echo "{$res->area->name} (Score: {$res->score}, Type: {$res->matchType})\n";
}

// Urdu script search
$urduResults = PakGeoData::searchAreas('گلبرگ', cityId: 'lahore');
foreach ($urduResults as $res) {
    echo "{$res->area->name} ({$res->area->urduName})\n";
}

// 6. Urdu NLP Text Normalization
$normalized = PakGeoData::normalizeUrduText('گُلبرگ ۵');
echo "Normalized Urdu: {$normalized}\n";
```

---

## Framework Integration

### Laravel Integration

`pak-geodata` integrates seamlessly into Laravel controllers, Form Requests, and Eloquent model attributes.

#### Controller Autocomplete Endpoint

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PakGeoData\PakGeoData;

class GeoController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->input('q', '');
        $cityId = $request->input('city_id');
        $limit = (int) $request->input('limit', 15);

        if (trim($query) === '') {
            return response()->json([]);
        }

        $results = PakGeoData::searchAreas($query, $cityId, $limit);

        return response()->json(array_map(static fn($r) => [
            'id' => $r->area->id,
            'name' => $r->area->name,
            'urdu_name' => $r->area->urduName,
            'city_id' => $r->area->cityId,
            'postal_code' => $r->area->postalCode,
            'coordinates' => $r->area->coordinates->toArray(),
            'score' => $r->score,
            'match_type' => $r->matchType,
        ], $results));
    }
}
```

#### Custom Validation Rule

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use PakGeoData\PakGeoData;

class ValidPakistanArea implements ValidationRule
{
    public function __construct(private ?string $cityId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a valid area identifier.');
            return;
        }

        $area = PakGeoData::getAreaById($value);
        if ($area === null) {
            $fail('The selected :attribute does not exist in Pakistan geodata.');
            return;
        }

        if ($this->cityId !== null && strtolower($area->cityId) !== strtolower($this->cityId)) {
            $fail("The selected :attribute does not belong to {$this->cityId}.");
        }
    }
}
```

### Symfony Integration

```php
<?php

namespace App\Controller;

use PakGeoData\PakGeoData;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class GeodataController extends AbstractController
{
    #[Route('/api/geo/areas', name: 'api_geo_areas', methods: ['GET'])]
    public function getAreas(Request $request): JsonResponse
    {
        $cityId = $request->query->get('city_id');
        if ($cityId) {
            $areas = PakGeoData::getAreasByCity($cityId);
        } else {
            $areas = PakGeoData::getAllAreas();
        }

        return $this->json(array_map(static fn($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'urdu_name' => $a->urduName,
            'postal_code' => $a->postalCode,
            'lat' => $a->coordinates->lat,
            'lng' => $a->coordinates->lng,
        ], $areas));
    }
}
```

---

## Data Models

All models are defined as PHP 8.1+ typed readonly classes in the `PakGeoData\Models` namespace:

### `PakistanProvince` (`PakGeoData\Models\Province`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$id` | `string` | Canonical slug identifier (`"punjab"`, `"sindh"`, etc.) |
| `$name` | `string` | Official English name (`"Punjab"`) |
| `$urduName` | `string` | Native Urdu name (`"پنجاب"`) |
| `$capitalCityId` | `string` | Foreign key referencing capital city (`"lahore"`) |
| `$type` | `string` | Classification (`"province"`, `"federal_capital"`, `"autonomous_territory"`) |

### `PakistanCity` (`PakGeoData\Models\City`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$id` | `string` | Canonical city slug identifier (`"lahore"`) |
| `$name` | `string` | City English name (`"Lahore"`) |
| `$urduName` | `string` | City Urdu name (`"لاہور"`) |
| `$provinceId` | `string` | Province slug (`"punjab"`) |
| `$coordinates` | `Coordinates` | Centroid GPS coordinates |
| `$totalAreasCount` | `int` | Number of verified areas in the dataset |
| `$division` | `?string` | Administrative division (`"Lahore Division"`) |
| `$district` | `?string` | Administrative district |
| `$bounds` | `?CityBounds` | District bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`) |
| `$postalCodeRange` | `?array<string>` | Postal code boundaries (`["54000", "54999"]`) |

### `PakistanArea` (`PakGeoData\Models\Area`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$id` | `string` | Canonical slug `<city-slug>-<area-slug>` (`"lahore-dha-phase-5"`) |
| `$name` | `string` | Official English display name (`"DHA Phase 5"`) |
| `$urduName` | `?string` | Native Urdu Nastaliq name (`"ڈی ایچ اے فیز 5"`) |
| `$cityId` | `string` | Parent city identifier (`"lahore"`) |
| `$provinceId` | `string` | Parent province identifier (`"punjab"`) |
| `$coordinates` | `Coordinates` | Centroid coordinates within Pakistan territorial bounds |
| `$postalCode` | `?string` | 5-digit Pakistan Post postal code (`"54792"`) |
| `$aliases` | `array<string>` | Colloquial aliases, alternative spellings |
| `$type` | `?string` | Area classification (`"sector"`, `"neighborhood"`, `"commercial"`) |
| `$verified` | `bool` | `true` once validated by 3-tier triangulation gate |
| `$sources` | `array<string>` | Audit trail of data sources |

### `Coordinates` (`PakGeoData\Models\Coordinates`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$lat` | `float` | Latitude (WGS 84) |
| `$lng` | `float` | Longitude (WGS 84) |

### `NearestAreaResult` (`PakGeoData\Models\NearestAreaResult`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$area` | `Area` | The matched nearest area |
| `$distanceKm` | `float` | Spherical Haversine distance in kilometers |

### `SearchResult` (`PakGeoData\Models\SearchResult`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `$area` | `Area` | The matched area |
| `$score` | `float` | Relevance score (higher is better) |
| `$matchType` | `string` | Match classification: `exact`, `prefix`, `urdu`, `alias`, `token`, `fuzzy` |

---

## API Reference

All methods are static on `PakGeoData\PakGeoData`:

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `getAllProvinces()` | `array<Province>` | Returns all 7 verified provinces and administrative territories |
| `getProvinceById(string $id)` | `?Province` | Finds province by unique slug (case-insensitive) |
| `getAllCities()` | `array<City>` | Returns all 79 verified cities |
| `getCityById(string $id)` | `?City` | Finds city by unique slug (case-insensitive) |
| `getCitiesByProvince(string $provinceId)` | `array<City>` | Returns all cities within a province |
| `getAllAreas()` | `array<Area>` | Returns all 3,953 verified areas across Pakistan |
| `getAreasByCity(string $cityId)` | `array<Area>` | Returns all areas in a city |
| `getAreaById(string $id)` | `?Area` | Finds area by unique slug (case-insensitive) |
| `findAreaByPostalCode(string\|int $postalCode)` | `?Area` | Resolves primary area by 5-digit Pakistan Post code |
| `findAreasByPostalCode(string\|int $postalCode)` | `array<Area>` | Returns all areas sharing a postal code |
| `haversineDistanceKm(Coordinates $c1, Coordinates $c2)` | `float` | Calculates spherical distance between two coordinates in kilometers |
| `getNearestArea(Coordinates $coords, ?string $cityId = null, ?float $maxRadiusKm = null, ?string $provinceId = null)` | `?NearestAreaResult` | Finds the closest area to target coordinates |
| `searchAreas(string $query, ?string $cityId = null, int $limit = 20, ?string $provinceId = null)` | `array<SearchResult>` | Multi-script ranked search across English, Urdu, and aliases |
| `normalizeUrduText(string $text)` | `string` | Standard Urdu NLP normalization (diacritics, letters, digits) |

---

## Architecture: OPcache In-Memory Performance

In traditional PHP applications, reading large JSON files on every request incurs severe performance penalties:
1. `file_get_contents()` triggers filesystem disk I/O.
2. `json_decode()` consumes CPU cycles and transient memory allocation.

`pak-geodata` solves this through code-generated native PHP return arrays (`src/Data/Provinces.php`, `src/Data/Cities.php`, `src/Data/Areas.php`). When OPcache is enabled:
- The compiled PHP bytecode of all 3,953 areas, 79 cities, and 7 provinces is loaded once into shared memory (`SHM`).
- Successive web requests share the pre-allocated memory structures with zero re-parsing.
- Static lookup dictionaries are constructed lazily on first access and cached statically for the lifetime of worker processes in long-running runtimes (Laravel Octane, Swoole, RoadRunner, FrankenPHP).

---

## Contributing & Repository

Source code and issue tracking are hosted on GitHub:
- **Repository**: [https://github.com/sohaibbinmohsin/pak-geodata](https://github.com/sohaibbinmohsin/pak-geodata)
- **Issue Tracker**: [https://github.com/sohaibbinmohsin/pak-geodata/issues](https://github.com/sohaibbinmohsin/pak-geodata/issues)

---

## License

- **Code**: [MIT License](LICENSE) © 2026 [The Mohsin Project Global](https://themohsinproject.org)
- **Data**: [ODbL 1.0](LICENSE-DATA) & [CC-BY 4.0](LICENSE-DATA) © OpenStreetMap contributors & NGA/GeoNames
