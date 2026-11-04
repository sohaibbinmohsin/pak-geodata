/// Comprehensive, typed, offline geographic data for all areas and cities in Pakistan.
///
/// Pure Dart with zero runtime dependencies.
library;

import 'src/data/areas.dart';
import 'src/data/cities.dart';
import 'src/data/provinces.dart';
import 'src/models.dart';

export 'src/data/areas.dart';
export 'src/data/cities.dart';
export 'src/data/provinces.dart';
export 'src/geo.dart';
export 'src/models.dart';
export 'src/search.dart';

// -----------------------------------------------------------------------------
// In-Memory Fast Lookup Indexes
// -----------------------------------------------------------------------------

final Map<String, PakistanProvince> _provinceById = {
  for (final p in pakistanProvinces) p.id.toLowerCase(): p,
};

final Map<String, PakistanCity> _cityById = {
  for (final c in pakistanCities) c.id.toLowerCase(): c,
};

final Map<String, List<PakistanCity>> _citiesByProvince = () {
  final map = <String, List<PakistanCity>>{};
  for (final c in pakistanCities) {
    (map[c.provinceId.toLowerCase()] ??= []).add(c);
  }
  return map;
}();

final Map<String, PakistanArea> _areaById = {
  for (final a in pakistanAreas) a.id.toLowerCase(): a,
};

final Map<String, List<PakistanArea>> _areasByCity = () {
  final map = <String, List<PakistanArea>>{};
  for (final a in pakistanAreas) {
    (map[a.cityId.toLowerCase()] ??= []).add(a);
  }
  return map;
}();

final Map<String, PakistanArea> _areaByPostalCode = () {
  final map = <String, PakistanArea>{};
  for (final a in pakistanAreas) {
    if (a.postalCode != null && a.postalCode!.isNotEmpty) {
      final code = a.postalCode!.trim();
      map.putIfAbsent(code, () => a);
    }
  }
  return map;
}();

final Map<String, List<PakistanArea>> _areasByPostalCode = () {
  final map = <String, List<PakistanArea>>{};
  for (final a in pakistanAreas) {
    if (a.postalCode != null && a.postalCode!.isNotEmpty) {
      final code = a.postalCode!.trim();
      (map[code] ??= []).add(a);
    }
  }
  return map;
}();

// -----------------------------------------------------------------------------
// Province Lookups
// -----------------------------------------------------------------------------

/// Returns all 7 verified provinces and administrative territories of Pakistan.
List<PakistanProvince> getAllProvinces() => pakistanProvinces;

/// Finds a province by its unique identifier (e.g. 'punjab', 'sindh', 'islamabad-ict').
/// Lookup is case and whitespace insensitive.
PakistanProvince? getProvinceById(String id) =>
    _provinceById[id.trim().toLowerCase()];

// -----------------------------------------------------------------------------
// City Lookups
// -----------------------------------------------------------------------------

/// Returns all 79 verified cities across Pakistan.
List<PakistanCity> getAllCities() => pakistanCities;

/// Finds a city by its slug identifier (e.g. 'lahore', 'karachi', 'islamabad').
/// Lookup is case and whitespace insensitive.
PakistanCity? getCityById(String id) => _cityById[id.trim().toLowerCase()];

/// Retrieves all cities belonging to a specified province.
List<PakistanCity> getCitiesByProvince(String provinceId) =>
    _citiesByProvince[provinceId.trim().toLowerCase()] ?? const [];

// -----------------------------------------------------------------------------
// Area Lookups
// -----------------------------------------------------------------------------

/// Returns all 3,953 verified areas across Pakistan.
List<PakistanArea> getAllAreas() => pakistanAreas;

/// Finds an area by its unique identifier (e.g. 'lahore-dha-phase-5').
PakistanArea? getAreaById(String id) => _areaById[id.trim().toLowerCase()];

/// Returns all verified areas within a given city.
List<PakistanArea> getAreasByCity(String cityId) =>
    _areasByCity[cityId.trim().toLowerCase()] ?? const [];

/// Resolves the primary area associated with a 5-digit Pakistan Post postal code.
PakistanArea? findAreaByPostalCode(String postalCode) =>
    _areaByPostalCode[postalCode.trim()];

/// Returns all areas sharing a given 5-digit Pakistan Post postal code.
List<PakistanArea> findAreasByPostalCode(String postalCode) =>
    _areasByPostalCode[postalCode.trim()] ?? const [];
