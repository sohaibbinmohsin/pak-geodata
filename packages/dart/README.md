# pak_geodata

[![Pub Version](https://img.shields.io/pub/v/pak_geodata?color=green)](https://pub.dev/packages/pak_geodata)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak_geodata` is a pure Dart package providing offline access to verified geographic data for Pakistan with **zero runtime dependencies**.

## Features

- **Zero Runtime Dependencies**: Pure Dart SDK only (`dart:math`).
- **Offline & Self-Contained**: 7 provinces, 79 cities, and 3,953 areas bundled directly as typed const data.
- **Strict Geofencing**: Coordinates verified within Pakistan territorial boundaries.
- **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` identifiers (e.g. `lahore-dha-phase-5`).
- **Multi-Script & Alias Search**: English queries, colloquial aliases (e.g. `"dha 5"`), Urdu script (`"گلبرگ"`, `"کلفٹن"`), and fuzzy typo tolerance.
- **Spatial Nearest Neighbor**: Reverse geocoding via spherical Haversine formula ($R = 6371.0088\text{ km}$).
- **Postal Code Resolution**: 5-digit Pakistan Post postal code lookup and reverse mapping.

## Dataset Statistics

| Level | Count | Coverage |
| :--- | :--- | :--- |
| **Provinces & Territories** | **7** | Punjab, Sindh, KPK, Balochistan, Islamabad (ICT), AJK, Gilgit-Baltistan |
| **Verified Cities** | **79** | All 79 cities across Pakistan with centroids, bounds, and postal code ranges |
| **Verified Areas** | **3,953** | Neighborhoods, sectors, housing schemes, commercial centers |

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  pak_geodata: ^0.9.1
```

Or run:

```bash
dart pub add pak_geodata
# Or for Flutter
flutter pub add pak_geodata
```

## Quick Start

```dart
import 'package:pak_geodata/pak_geodata.dart';

void main() {
  // 1. Provinces & Cities
  final provinces = getAllProvinces();
  final lahore = getCityById('lahore');
  final punjabCities = getCitiesByProvince('punjab');

  // 2. Areas & Postal Codes
  final dha5 = getAreaById('lahore-dha-phase-5');
  final lahoreAreas = getAreasByCity('lahore');
  final postalArea = findAreaByPostalCode('54000');

  // 3. Nearest Area Spatial Lookup
  final nearest = getNearestArea(
    const Coordinates(lat: 31.4581, lng: 74.4121),
  );
  print('Nearest: ${nearest?.name} (${nearest?.distanceKm.toStringAsFixed(2)} km)');

  // 4. Multi-Script Search
  final searchResults = searchAreas('گلبرگ', cityId: 'lahore');
  for (final result in searchResults) {
    print('${result.name} (${result.score})');
  }
}
```

## License

MIT License. See [LICENSE](LICENSE) for details.
