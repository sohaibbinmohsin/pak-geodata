## 0.11.0

- Added official PHP package (`sohaibbinmohsin/pak-geodata`) with pre-compiled OPcache arrays.
- Expanded multi-language parity gate to 6 targets (Master JSON, TypeScript, Python, Go, Dart, PHP).
- Streamlined release workflow to eliminate parallel publication race conditions.
- Updated documentation and quickstarts across all five language targets.

## 0.10.1

- Add comprehensive dartdocs across all public model constructors and fields.
- Add `example/main.dart` demonstrating lookups, spatial Haversine distance, and multi-script search.
- Enhanced README with Flutter autocomplete example and pub.dev badges.
- Full verification and parity with master dataset (7 provinces, 79 cities, 3,953 areas).

## 0.10.0

- Initial release of `pak_geodata` for Dart and Flutter.
- Offline access to all 7 provinces/territories, 79 verified cities, and 3,953 verified urban areas across Pakistan.
- Fast in-memory lookups by ID, city, province, and 5-digit postal code.
- Spatial reverse-geocoding via spherical Haversine formula ($R = 6371.0088\text{ km}$).
- Multi-script Urdu text normalization, colloquial city aliases, and fuzzy search.
- Pure Dart SDK with zero runtime external dependencies.
