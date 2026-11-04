import 'package:pak_geodata/pak_geodata.dart';
import 'package:test/test.dart';

void main() {
  group('Provinces', () {
    test('loads all 7 provinces', () {
      final provinces = getAllProvinces();
      expect(provinces.length, equals(7));

      final expectedIds = {
        'punjab',
        'sindh',
        'kpk',
        'balochistan',
        'islamabad-ict',
        'ajk',
        'gilgit-baltistan',
      };

      final actualIds = provinces.map((p) => p.id).toSet();
      expect(actualIds, equals(expectedIds));

      for (final p in provinces) {
        expect(p.name, isNotEmpty);
        expect(p.urduName, isNotEmpty);
        expect(p.capitalCityId, isNotEmpty);
        expect(p.type, isNotEmpty);
      }
    });

    test('lookup by ID is case and whitespace insensitive', () {
      final punjab = getProvinceById('punjab');
      expect(punjab, isNotNull);
      expect(punjab!.name, equals('Punjab'));
      expect(punjab.capitalCityId, equals('lahore'));

      final punjabUpper = getProvinceById('  PuNjAb  ');
      expect(punjabUpper, isNotNull);
      expect(punjabUpper!.id, equals('punjab'));

      final nonExistent = getProvinceById('non-existent-province');
      expect(nonExistent, isNull);
    });
  });

  group('Cities', () {
    test('loads all 79 cities with valid coordinates and bounds', () {
      final cities = getAllCities();
      expect(cities.length, equals(79));

      for (final c in cities) {
        expect(c.id, isNotEmpty);
        expect(c.name, isNotEmpty);
        expect(c.urduName, isNotEmpty);
        expect(c.provinceId, isNotEmpty);
        expect(c.district, isNotEmpty);
        expect(c.coordinates.lat, inInclusiveRange(23.5, 37.1));
        expect(c.coordinates.lng, inInclusiveRange(60.8, 77.8));
      }
    });

    test('lookup by ID is case and whitespace insensitive', () {
      final lahore = getCityById('lahore');
      expect(lahore, isNotNull);
      expect(lahore!.name, equals('Lahore'));
      expect(lahore.provinceId, equals('punjab'));

      final lahoreCase = getCityById('  LaHoRe  ');
      expect(lahoreCase, isNotNull);
      expect(lahoreCase!.id, equals('lahore'));

      final nonExistent = getCityById('atlantis');
      expect(nonExistent, isNull);
    });

    test('getCitiesByProvince returns correct cities', () {
      final punjabCities = getCitiesByProvince('punjab');
      expect(punjabCities.length, equals(37));

      final sindhCities = getCitiesByProvince('sindh');
      expect(sindhCities.length, equals(8));

      final emptyCities = getCitiesByProvince('mars');
      expect(emptyCities, isEmpty);

      expect(
        () => getCitiesByProvince('punjab').clear(),
        throwsUnsupportedError,
      );
    });
  });

  group('Areas', () {
    test('loads all 3953 areas with prefixed IDs and valid coordinates', () {
      final areas = getAllAreas();
      expect(areas.length, equals(3953));

      for (final a in areas) {
        expect(a.id, isNotEmpty);
        expect(a.cityId, isNotEmpty);
        expect(a.provinceId, isNotEmpty);
        expect(a.name, isNotEmpty);
        expect(a.id.startsWith('${a.cityId}-'), isTrue);
        expect(a.coordinates.lat, inInclusiveRange(23.5, 37.1));
        expect(a.coordinates.lng, inInclusiveRange(60.8, 77.8));
      }
    });

    test('getAreaById and getAreasByCity work as expected', () {
      final area = getAreaById('lahore-dha-phase-5');
      expect(area, isNotNull);
      expect(area!.name, equals('DHA Phase 5'));
      expect(area.cityId, equals('lahore'));

      final lahoreAreas = getAreasByCity('lahore');
      expect(lahoreAreas, isNotEmpty);
      expect(lahoreAreas.every((a) => a.cityId == 'lahore'), isTrue);

      final emptyAreas = getAreasByCity('unknown-city');
      expect(emptyAreas, isEmpty);

      expect(
        () => getAreasByCity('lahore').clear(),
        throwsUnsupportedError,
      );
    });
  });

  group('Postal Codes', () {
    test('resolves primary postal code 54000', () {
      final area = findAreaByPostalCode('54000');
      expect(area, isNotNull);
      expect(area!.postalCode, equals('54000'));
      expect(area.cityId, equals('lahore'));
    });

    test('findAreasByPostalCode returns all areas sharing postal code 54000', () {
      final areas54000 = findAreasByPostalCode('54000');
      expect(areas54000.length, greaterThan(1));
      for (final a in areas54000) {
        expect(a.postalCode, equals('54000'));
      }

      expect(
        () => findAreasByPostalCode('54000').clear(),
        throwsUnsupportedError,
      );
    });

    test('resolves specific postal code 54792 to DHA', () {
      final dhaArea = findAreaByPostalCode('54792');
      expect(dhaArea, isNotNull);
      expect(dhaArea!.id.startsWith('lahore-dha-'), isTrue);

      final dhaAreas = findAreasByPostalCode('54792');
      expect(dhaAreas.any((a) => a.id == 'lahore-dha-phase-5'), isTrue);
    });

    test('resolves Clifton Karachi postal code 75600', () {
      final clifton = findAreaByPostalCode('75600');
      expect(clifton, isNotNull);
      expect(clifton!.cityId, equals('karachi'));
    });

    test('returns null / empty for non-existent postal codes', () {
      expect(findAreaByPostalCode('99999'), isNull);
      expect(findAreasByPostalCode('99999'), isEmpty);
    });
  });

  group('Haversine & Spatial', () {
    test('haversineDistanceKm returns accurate spherical distance', () {
      const c1 = Coordinates(lat: 31.5204, lng: 74.3587); // Lahore
      const c2 = Coordinates(lat: 33.5651, lng: 73.0169); // Rawalpindi

      expect(haversineDistanceKm(c1, c1), equals(0.0));

      final distLahoreRwp = haversineDistanceKm(c1, c2);
      expect(distLahoreRwp, inInclusiveRange(250.0, 300.0));

      const c3 = Coordinates(lat: 24.8607, lng: 67.0011); // Karachi
      final distLahoreKhi = haversineDistanceKm(c1, c3);
      expect(distLahoreKhi, inInclusiveRange(1000.0, 1050.0));
    });

    test('getNearestArea finds closest area with sub-kilometer accuracy', () {
      // Near DHA Phase 5 Lahore: [31.4581, 74.4121]
      const coords = Coordinates(lat: 31.4581, lng: 74.4121);
      final nearest = getNearestArea(coords);
      expect(nearest, isNotNull);
      expect(nearest!.id, equals('lahore-dha-phase-5'));
      expect(nearest.distanceKm, lessThan(0.1));

      // Coordinates [31.4697, 74.4133] (sub-kilometer)
      const nearbyCoords = Coordinates(lat: 31.4697, lng: 74.4133);
      final nearestNearby = getNearestArea(nearbyCoords);
      expect(nearestNearby, isNotNull);
      expect(nearestNearby!.distanceKm, lessThan(1.0));

      // With cityId filter
      const isbCoords = Coordinates(lat: 33.7297, lng: 73.0747);
      final isbNearest = getNearestArea(isbCoords, cityId: 'islamabad');
      expect(isbNearest, isNotNull);
      expect(isbNearest!.cityId, equals('islamabad'));

      // With maxRadiusKm filter that excludes
      final farResult = getNearestArea(
        const Coordinates(lat: 0.0, lng: 0.0),
        maxRadiusKm: 50.0,
      );
      expect(farResult, isNull);

      // With provinceId filter
      final sindhNearest = getNearestArea(coords, provinceId: 'sindh');
      expect(sindhNearest, isNotNull);
      expect(sindhNearest!.provinceId, equals('sindh'));
    });
  });

  group('Urdu NLP Utilities', () {
    test('stripUrduDiacritics strips tashkeel and tatweel', () {
      expect(stripUrduDiacritics('گُلبَرگ'), equals('گلبرگ'));
    });

    test('toWesternDigits converts Eastern and Arabic digits', () {
      expect(toWesternDigits('۰۱۲۳۴۵۶۷۸۹'), equals('0123456789'));
      expect(toWesternDigits('٠١٢٣٤٥٦٧٨٩'), equals('0123456789'));
    });

    test('normalizeUrduText normalizes diacritics, letters, digits, and whitespace', () {
      expect(normalizeUrduText('گُلبَرگ'), equals('گلبرگ'));
      expect(normalizeUrduText('آكےة'), equals('اکیہ'));
      expect(normalizeUrduText('  لاہور  '), equals('لاہور'));
    });
  });

  group('Search', () {
    test('searches by alias', () {
      final results = searchAreas('dha 5', cityId: 'lahore');
      expect(results, isNotEmpty);
      expect(results.first.id, equals('lahore-dha-phase-5'));
      expect(results.first.area.id, equals('lahore-dha-phase-5'));
    });

    test('searches by Urdu text', () {
      final results = searchAreas('گلبرگ', cityId: 'lahore');
      expect(results, isNotEmpty);
      expect(results.first.id, contains('gulberg'));

      final cliftonResults = searchAreas('کلفٹن');
      expect(cliftonResults, isNotEmpty);
      expect(cliftonResults.any((r) => r.id.contains('clifton')), isTrue);
    });

    test('searches by colloquial city aliases', () {
      final isbResults = searchAreas('isb', limit: 5);
      expect(isbResults, isNotEmpty);
      expect(isbResults.every((r) => r.cityId == 'islamabad'), isTrue);

      final pindiResults = searchAreas('pindi', limit: 5);
      expect(pindiResults, isNotEmpty);
      expect(pindiResults.every((r) => r.cityId == 'rawalpindi'), isTrue);
    });

    test('applies limit parameter', () {
      final results = searchAreas('phase', limit: 3);
      expect(results.length, inInclusiveRange(1, 3));
    });

    test('empty or whitespace query returns empty list', () {
      expect(searchAreas(''), isEmpty);
      expect(searchAreas('   '), isEmpty);
    });

    test('fuzzy search matches minor typos', () {
      final results = searchAreas('Gulbarg', cityId: 'lahore');
      expect(results, isNotEmpty);
      expect(results.first.id, contains('gulberg'));
    });

    test('exact match promotion', () {
      final results = searchAreas('Gulberg II');
      expect(results, isNotEmpty);
      expect(results.first.id, equals('lahore-gulberg-2'));

      final isbDha = searchAreas('dha 2', cityId: 'islamabad');
      expect(isbDha, isNotEmpty);
      expect(isbDha.first.id, equals('islamabad-dha-phase-2'));
    });
  });
}
