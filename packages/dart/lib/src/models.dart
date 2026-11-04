/// Immutable data models representing Pakistan geographical entities.
library;

/// Geographic latitude and longitude coordinates in decimal degrees.
class Coordinates {
  final double lat;
  final double lng;

  const Coordinates({required this.lat, required this.lng});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Coordinates &&
          runtimeType == other.runtimeType &&
          lat == other.lat &&
          lng == other.lng;

  @override
  int get hashCode => Object.hash(lat, lng);

  @override
  String toString() => 'Coordinates(lat: $lat, lng: $lng)';
}

/// Axis-aligned geographical bounding box for a city.
class CityBounds {
  final double minLat;
  final double maxLat;
  final double minLng;
  final double maxLng;

  const CityBounds({
    required this.minLat,
    required this.maxLat,
    required this.minLng,
    required this.maxLng,
  });

  /// Returns true if [coords] falls within the bounding box.
  bool contains(Coordinates coords) =>
      coords.lat >= minLat &&
      coords.lat <= maxLat &&
      coords.lng >= minLng &&
      coords.lng <= maxLng;

  @override
  String toString() =>
      'CityBounds(lat: [$minLat, $maxLat], lng: [$minLng, $maxLng])';
}

/// A province or administrative territory of Pakistan.
class PakistanProvince {
  final String id;
  final String name;
  final String urduName;
  final String capitalCityId;
  final String type;

  const PakistanProvince({
    required this.id,
    required this.name,
    required this.urduName,
    this.capitalCityId = '',
    required this.type,
  });

  @override
  String toString() => 'PakistanProvince(id: $id, name: $name)';
}

/// A verified city or urban center in Pakistan.
class PakistanCity {
  final String id;
  final String name;
  final String urduName;
  final String provinceId;
  final String? division;
  final String district;
  final Coordinates coordinates;
  final List<String>? postalCodeRange;
  final CityBounds? bounds;
  final int totalAreasCount;

  const PakistanCity({
    required this.id,
    required this.name,
    required this.urduName,
    required this.provinceId,
    this.division,
    required this.district,
    required this.coordinates,
    this.postalCodeRange,
    this.bounds,
    this.totalAreasCount = 0,
  });

  @override
  String toString() => 'PakistanCity(id: $id, name: $name, province: $provinceId)';
}

/// A neighborhood, sector, suburb, or locality in Pakistan.
class PakistanArea {
  final String id;
  final String cityId;
  final String provinceId;
  final String name;
  final String? urduName;
  final List<String> aliases;
  final String? postalCode;
  final Coordinates coordinates;
  final String? type;
  final bool verified;
  final List<dynamic>? sources;

  const PakistanArea({
    required this.id,
    required this.cityId,
    required this.provinceId,
    required this.name,
    this.urduName,
    this.aliases = const [],
    this.postalCode,
    required this.coordinates,
    this.type,
    this.verified = false,
    this.sources,
  });

  @override
  String toString() => 'PakistanArea(id: $id, name: $name, city: $cityId)';
}

/// Matched area result from search ranking.
class SearchResult {
  final PakistanArea area;
  final double score;
  final String matchType;

  const SearchResult({
    required this.area,
    required this.score,
    this.matchType = 'exact',
  });

  String get id => area.id;
  String get name => area.name;
  String get cityId => area.cityId;
  String get provinceId => area.provinceId;
  String? get urduName => area.urduName;
  List<String> get aliases => area.aliases;
  String? get postalCode => area.postalCode;
  Coordinates get coordinates => area.coordinates;
  String? get type => area.type;
  bool get verified => area.verified;

  @override
  String toString() => 'SearchResult(id: $id, score: $score, matchType: $matchType)';
}

/// Result of nearest area spatial calculation.
class NearestAreaResult {
  final PakistanArea area;
  final double distanceKm;

  const NearestAreaResult({
    required this.area,
    required this.distanceKm,
  });

  String get id => area.id;
  String get name => area.name;
  String get cityId => area.cityId;
  String get provinceId => area.provinceId;
  Coordinates get coordinates => area.coordinates;

  @override
  String toString() => 'NearestAreaResult(id: $id, distanceKm: $distanceKm)';
}

/// Options to configure nearest area spatial query.
class NearestAreaOptions {
  final String? cityId;
  final String? provinceId;
  final double? maxRadiusKm;

  const NearestAreaOptions({
    this.cityId,
    this.provinceId,
    double? maxRadiusKm,
    double? maxDistanceKm,
  }) : maxRadiusKm = maxRadiusKm ?? maxDistanceKm;

  double? get maxDistanceKm => maxRadiusKm;
}

/// Options to configure area text search query.
class SearchOptions {
  final String? cityId;
  final String? provinceId;
  final int limit;

  const SearchOptions({
    this.cityId,
    this.provinceId,
    this.limit = 20,
  });
}
