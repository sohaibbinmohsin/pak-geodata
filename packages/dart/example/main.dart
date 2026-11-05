import 'package:pak_geodata/pak_geodata.dart';

void main() {
  print('=== Pakistan GeoData (pak_geodata) Dart Example ===\n');

  // 1. Administrative Hierarchy Lookups
  final provinces = getAllProvinces();
  print('Total provinces & territories: ${provinces.length}');
  for (final province in provinces) {
    print(' - ${province.name} (${province.urduName}) [${province.id}]');
  }

  // 2. City Lookups
  final lahore = getCityById('lahore');
  if (lahore != null) {
    print('\nCity: ${lahore.name} (${lahore.urduName})');
    print('District: ${lahore.district}, Province: ${lahore.provinceId}');
    print('Coordinates: (${lahore.coordinates.lat}, ${lahore.coordinates.lng})');
    print('Total verified areas: ${lahore.totalAreasCount}');
  }

  // 3. Areas in a City
  final islamabadAreas = getAreasByCity('islamabad');
  print('\nIslamabad has ${islamabadAreas.length} verified areas.');
  print('Sample area: ${islamabadAreas.first.name} (${islamabadAreas.first.id})');

  // 4. Postal Code Resolution
  const postalCode = '54000';
  final primaryArea = findAreaByPostalCode(postalCode);
  print('\nPrimary area for postal code $postalCode:');
  print(' -> ${primaryArea?.name} (${primaryArea?.cityId})');

  final allSharingPostal = findAreasByPostalCode(postalCode);
  print('Total areas sharing postal code $postalCode: ${allSharingPostal.length}');

  // 5. Spatial Reverse Geocoding (Spherical Haversine)
  // Coordinates for DHA Phase 5 Lahore
  const targetCoords = Coordinates(lat: 31.4581, lng: 74.4121);
  final nearest = getNearestArea(targetCoords);
  if (nearest != null) {
    print('\nNearest area to (31.4581, 74.4121):');
    print(' -> ${nearest.name} in ${nearest.cityId}');
    print(' -> Distance: ${nearest.distanceKm.toStringAsFixed(2)} km');
  }

  // 6. Multi-Script and Fuzzy Search
  print('\nSearching for Urdu query "گلبرگ" in Lahore:');
  final urduResults = searchAreas('گلبرگ', cityId: 'lahore', limit: 3);
  for (final res in urduResults) {
    print(' - ${res.name} (Score: ${res.score.toInt()}, Match: ${res.matchType})');
  }

  print('\nSearching for colloquial query "dha 5":');
  final aliasResults = searchAreas('dha 5', limit: 3);
  for (final res in aliasResults) {
    print(' - ${res.name} in ${res.cityId} (Score: ${res.score.toInt()})');
  }
}
