/// Immutable data models representing Pakistan geographical entities.
library;

/// Geographic latitude and longitude coordinates in decimal degrees.
class Coordinates {
  /// Latitude coordinate in decimal degrees.
  final double lat;

  /// Longitude coordinate in decimal degrees.
  final double lng;

  /// Creates a [Coordinates] instance with [lat] and [lng].
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
  /// Minimum latitude (southern boundary).
  final double minLat;

  /// Maximum latitude (northern boundary).
  final double maxLat;

  /// Minimum longitude (western boundary).
  final double minLng;

  /// Maximum longitude (eastern boundary).
  final double maxLng;

  /// Creates a [CityBounds] bounding box instance.
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
  /// Unique canonical slug identifier (e.g. "punjab", "sindh", "islamabad-ict").
  final String id;

  /// English name of the province or territory (e.g. "Punjab").
  final String name;

  /// Native Urdu script name (e.g. "پنجاب").
  final String urduName;

  /// Canonical slug identifier of the provincial capital city.
  final String capitalCityId;

  /// Administrative classification (e.g. "province", "territory", "autonomous_territory").
  final String type;

  /// Creates a [PakistanProvince] instance.
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
  /// Unique canonical slug identifier (e.g. "lahore", "karachi", "islamabad").
  final String id;

  /// English city name (e.g. "Lahore").
  final String name;

  /// Native Urdu script name (e.g. "لاہور").
  final String urduName;

  /// Canonical identifier of the parent province.
  final String provinceId;

  /// Administrative division if applicable (e.g. "Lahore Division").
  final String? division;

  /// Administrative district name (e.g. "Lahore").
  final String district;

  /// Centroid geographic coordinates of the city.
  final Coordinates coordinates;

  /// 5-digit Pakistan Post postal code range `[min, max]` for the city.
  final List<String>? postalCodeRange;

  /// Geographic bounding box enclosing the city limits.
  final CityBounds? bounds;

  /// Total count of verified urban areas belonging to this city.
  final int totalAreasCount;

  /// Creates a [PakistanCity] instance.
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
  /// Canonical area slug identifier (e.g. "lahore-dha-phase-5").
  final String id;

  /// Canonical identifier of the parent city.
  final String cityId;

  /// Canonical identifier of the parent province.
  final String provinceId;

  /// English area name (e.g. "DHA Phase 5").
  final String name;

  /// Native Urdu script name if available (e.g. "ڈی ایچ اے فیز 5").
  final String? urduName;

  /// Common alternative names, spelling variations, and colloquial abbreviations.
  final List<String> aliases;

  /// 5-digit Pakistan Post postal code if assigned.
  final String? postalCode;

  /// Geographic coordinates (centroid) of the area.
  final Coordinates coordinates;

  /// Locality classification (e.g. "sector", "housing_scheme", "neighborhood", "commercial").
  final String? type;

  /// Whether coordinates and boundaries have been human/dataset verified.
  final bool verified;

  /// Provenance and verification sources.
  final List<dynamic>? sources;

  /// Creates a [PakistanArea] instance.
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
  /// The matched Pakistan area entity.
  final PakistanArea area;

  /// Relevance ranking score calculated by the search engine.
  final double score;

  /// Matching tier (e.g. "exact", "prefix", "urdu", "alias", "token", "fuzzy").
  final String matchType;

  /// Creates a [SearchResult] instance.
  const SearchResult({
    required this.area,
    required this.score,
    this.matchType = 'exact',
  });

  /// Canonical slug identifier of the matched area.
  String get id => area.id;

  /// English name of the matched area.
  String get name => area.name;

  /// Parent city slug identifier.
  String get cityId => area.cityId;

  /// Parent province slug identifier.
  String get provinceId => area.provinceId;

  /// Native Urdu script name if available.
  String? get urduName => area.urduName;

  /// Common aliases and alternative spellings.
  List<String> get aliases => area.aliases;

  /// 5-digit Pakistan Post postal code.
  String? get postalCode => area.postalCode;

  /// Geographic coordinates of the area centroid.
  Coordinates get coordinates => area.coordinates;

  /// Locality classification type.
  String? get type => area.type;

  /// Whether the area is verified.
  bool get verified => area.verified;

  @override
  String toString() => 'SearchResult(id: $id, score: $score, matchType: $matchType)';
}

/// Result of nearest area spatial calculation.
class NearestAreaResult {
  /// The closest resolved Pakistan area entity.
  final PakistanArea area;

  /// Spherical great-circle distance in kilometers from query coordinates.
  final double distanceKm;

  /// Creates a [NearestAreaResult] instance.
  const NearestAreaResult({
    required this.area,
    required this.distanceKm,
  });

  /// Canonical slug identifier of the nearest area.
  String get id => area.id;

  /// English name of the nearest area.
  String get name => area.name;

  /// Parent city slug identifier.
  String get cityId => area.cityId;

  /// Parent province slug identifier.
  String get provinceId => area.provinceId;

  /// Geographic coordinates of the nearest area centroid.
  Coordinates get coordinates => area.coordinates;

  @override
  String toString() => 'NearestAreaResult(id: $id, distanceKm: $distanceKm)';
}

/// Options to configure nearest area spatial query.
class NearestAreaOptions {
  /// Filter query to a specific city slug.
  final String? cityId;

  /// Filter query to a specific province slug.
  final String? provinceId;

  /// Maximum search radius in kilometers. Areas further away are excluded.
  final double? maxRadiusKm;

  /// Creates a [NearestAreaOptions] instance.
  const NearestAreaOptions({
    this.cityId,
    this.provinceId,
    double? maxRadiusKm,
    double? maxDistanceKm,
  }) : maxRadiusKm = maxRadiusKm ?? maxDistanceKm;

  /// Alias for [maxRadiusKm].
  double? get maxDistanceKm => maxRadiusKm;
}

/// Options to configure area text search query.
class SearchOptions {
  /// Optional city slug to scope search results.
  final String? cityId;

  /// Optional province slug to scope search results.
  final String? provinceId;

  /// Maximum number of search results to return (defaults to 20).
  final int limit;

  /// Creates a [SearchOptions] configuration instance.
  const SearchOptions({
    this.cityId,
    this.provinceId,
    this.limit = 20,
  });
}
