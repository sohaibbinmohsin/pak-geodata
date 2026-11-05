# pak_geodata

[![Pub Version](https://img.shields.io/pub/v/pak_geodata?color=green)](https://pub.dev/packages/pak_geodata)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<a href="https://geodata.themohsinproject.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Live%20Demo-Interactive%20Studio-blue?logo=leaflet&color=10B981" alt="Live Interactive Demo" /></a>

> Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.

`pak_geodata` is a pure Dart package providing offline access to verified geographic data for Pakistan with **zero runtime dependencies**. Built for Flutter mobile applications, web apps, and Dart backend services.

Explore the [Interactive Live Demo](https://geodata.themohsinproject.org/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

---

## Features

- ⚡ **Zero Runtime Dependencies**: Pure Dart SDK only (`dart:core`, `dart:math`). No Flutter dependency required; runs on iOS, Android, Web, Desktop, and Server.
- 📦 **Offline & Instant Cold-Start**: 7 provinces, 79 cities, and 3,953 areas compiled directly as typed `const` models with zero runtime JSON parsing latency.
- 🎯 **Strict Geofencing**: All coordinates strictly verified within Pakistan's geographical bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`).
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

Add to your `pubspec.yaml`:

```yaml
dependencies:
  pak_geodata: ^0.10.1
```

Or run:

```bash
dart pub add pak_geodata
```

For Flutter:

```bash
flutter pub add pak_geodata
```

---

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

  // 3. Nearest Area Spatial Lookup (Spherical Haversine)
  final nearest = getNearestArea(
    const Coordinates(lat: 31.4581, lng: 74.4121),
  );
  if (nearest != null) {
    print('Nearest: ${nearest.name} (${nearest.distanceKm.toStringAsFixed(2)} km)');
  }

  // 4. Multi-Script Search (English, Urdu, Colloquial)
  final searchResults = searchAreas('گلبرگ', cityId: 'lahore');
  for (final result in searchResults) {
    print('${result.name} (Score: ${result.score.toInt()})');
  }
}
```

Check out the full runnable example in [`example/main.dart`](example/main.dart).

---

## Flutter Autocomplete Example

```dart
Autocomplete<PakistanArea>(
  displayStringForOption: (PakistanArea area) => '${area.name}, ${area.cityId}',
  optionsBuilder: (TextEditingValue textEditingValue) {
    if (textEditingValue.text.isEmpty) {
      return const Iterable<PakistanArea>.empty();
    }
    return searchAreas(textEditingValue.text, limit: 10).map((r) => r.area);
  },
  onSelected: (PakistanArea selection) {
    print('Selected area: ${selection.id} with coords (${selection.coordinates.lat}, ${selection.coordinates.lng})');
  },
)
```

---

## Contributing & Repository

Source code and issue tracking are hosted on GitHub:
- **Repository**: [https://github.com/sohaibbinmohsin/pak-geodata](https://github.com/sohaibbinmohsin/pak-geodata)
- **Issue Tracker**: [https://github.com/sohaibbinmohsin/pak-geodata/issues](https://github.com/sohaibbinmohsin/pak-geodata/issues)

---

## License

MIT License. See [LICENSE](LICENSE) for details.
