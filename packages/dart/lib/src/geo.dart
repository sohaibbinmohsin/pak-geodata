/// Geographic spatial calculations and Haversine distance.
library;

import 'dart:math' as math;
import 'data/areas.dart';
import 'models.dart';

/// Mean spherical Earth radius in kilometers (IUGG recommended value).
const double earthRadiusKm = 6371.0088;

/// Calculates the great-circle distance between two geographic coordinates
/// using the spherical Earth Haversine formula with radius R = 6371.0088 km.
double haversineDistanceKm(Coordinates c1, Coordinates c2) {
  if (c1.lat == c2.lat && c1.lng == c2.lng) {
    return 0.0;
  }

  final dLat = (c2.lat - c1.lat) * math.pi / 180.0;
  final dLng = (c2.lng - c1.lng) * math.pi / 180.0;
  final lat1Rad = c1.lat * math.pi / 180.0;
  final lat2Rad = c2.lat * math.pi / 180.0;

  final sinDLat = math.sin(dLat / 2.0);
  final sinDLng = math.sin(dLng / 2.0);

  var a = sinDLat * sinDLat +
      math.cos(lat1Rad) * math.cos(lat2Rad) * sinDLng * sinDLng;

  // Float clamp to [0.0, 1.0] to guard against numerical precision issues
  if (a > 1.0) a = 1.0;
  if (a < 0.0) a = 0.0;

  final c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a));
  return earthRadiusKm * c;
}

/// Checks if a coordinate point falls inside a city's bounding box.
bool isPointInBoundingBox(Coordinates coords, CityBounds? bounds) {
  if (bounds == null) return false;
  return bounds.contains(coords);
}

/// Finds the nearest verified area to [target] coordinates.
///
/// Can optionally be filtered by [cityId] and/or [provinceId], or constrained
/// by [maxRadiusKm]. Alternatively, pass a configured [options] object.
NearestAreaResult? getNearestArea(
  Coordinates target, {
  String? cityId,
  String? provinceId,
  double? maxRadiusKm,
  NearestAreaOptions? options,
  List<PakistanArea>? candidateAreas,
}) {
  final effectiveCityId = (options?.cityId ?? cityId)?.trim().toLowerCase();
  final effectiveProvinceId =
      (options?.provinceId ?? provinceId)?.trim().toLowerCase();
  final effectiveMaxRadius = options?.maxRadiusKm ?? maxRadiusKm;

  Iterable<PakistanArea> candidates = candidateAreas ?? pakistanAreas;

  if (effectiveCityId != null && effectiveCityId.isNotEmpty) {
    candidates = candidates.where(
      (a) => a.cityId.toLowerCase() == effectiveCityId,
    );
  }

  if (effectiveProvinceId != null && effectiveProvinceId.isNotEmpty) {
    candidates = candidates.where(
      (a) => a.provinceId.toLowerCase() == effectiveProvinceId,
    );
  }

  PakistanArea? nearest;
  var minDistance = double.infinity;

  for (final area in candidates) {
    final dist = haversineDistanceKm(target, area.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = area;
    }
  }

  if (nearest == null) {
    return null;
  }

  if (effectiveMaxRadius != null && minDistance > effectiveMaxRadius) {
    return null;
  }

  return NearestAreaResult(area: nearest, distanceKm: minDistance);
}
