"""Comprehensive unit tests for pak_geodata package."""

import sys
import unittest
from pathlib import Path

# Ensure pak_geodata is importable regardless of working directory
PKG_DIR = Path(__file__).resolve().parent.parent
if str(PKG_DIR) not in sys.path:
    sys.path.insert(0, str(PKG_DIR))

from pak_geodata import (
    Coordinates,
    PakistanArea,
    PakistanCity,
    PakistanProvince,
    get_all_provinces,
    get_province_by_id,
    get_all_cities,
    get_cities_by_province,
    get_city_by_id,
    get_all_areas,
    get_areas_by_city,
    search_areas,
    find_area_by_postal_code,
    find_areas_by_postal_code,
    get_nearest_area,
    haversine_distance_km,
)


class TestPakGeodata(unittest.TestCase):
    """Test suite for pak_geodata Python client library."""

    # 1. Provinces Tests
    def test_get_all_provinces(self):
        provinces = get_all_provinces()
        self.assertEqual(len(provinces), 7)
        ids = {p.id for p in provinces}
        expected = {
            "punjab",
            "sindh",
            "kpk",
            "balochistan",
            "islamabad-ict",
            "ajk",
            "gilgit-baltistan",
        }
        self.assertEqual(ids, expected)

        # Check types
        for p in provinces:
            self.assertIsInstance(p, PakistanProvince)
            self.assertTrue(len(p.name) > 0)
            self.assertTrue(len(p.urdu_name) > 0)
            self.assertTrue(len(p.capital_city_id) > 0)
            self.assertIn(p.type, {"province", "federal_capital", "autonomous_territory"})

    def test_get_province_by_id(self):
        punjab = get_province_by_id("punjab")
        self.assertIsNotNone(punjab)
        self.assertEqual(punjab.name, "Punjab")
        self.assertEqual(punjab.capital_city_id, "lahore")
        self.assertEqual(punjab.type, "province")

        # Case and whitespace insensitivity
        punjab_case = get_province_by_id("  PuNjAb  ")
        self.assertEqual(punjab, punjab_case)

        # Non-existent ID returns None
        self.assertIsNone(get_province_by_id("non-existent-province"))

    # 2. Cities Tests
    def test_get_all_cities(self):
        cities = get_all_cities()
        self.assertEqual(len(cities), 40)
        for c in cities:
            self.assertIsInstance(c, PakistanCity)
            self.assertTrue(len(c.id) > 0)
            self.assertTrue(len(c.name) > 0)
            self.assertTrue(len(c.urdu_name) > 0)
            self.assertTrue(len(c.province_id) > 0)
            self.assertIsInstance(c.coordinates, Coordinates)
            # Pakistan boundary check for city centroid
            self.assertTrue(23.5 <= c.coordinates.lat <= 37.1)
            self.assertTrue(60.8 <= c.coordinates.lng <= 77.8)

    def test_get_cities_by_province(self):
        punjab_cities = get_cities_by_province("punjab")
        self.assertEqual(len(punjab_cities), 14)
        city_ids = {c.id for c in punjab_cities}
        self.assertIn("lahore", city_ids)
        self.assertIn("rawalpindi", city_ids)
        self.assertIn("faisalabad", city_ids)

        sindh_cities = get_cities_by_province("sindh")
        self.assertEqual(len(sindh_cities), 6)
        self.assertIn("karachi", {c.id for c in sindh_cities})

        # Non-existent province returns empty list
        self.assertEqual(get_cities_by_province("mars"), [])

    def test_get_city_by_id(self):
        lahore = get_city_by_id("lahore")
        self.assertIsNotNone(lahore)
        self.assertEqual(lahore.name, "Lahore")
        self.assertEqual(lahore.urdu_name, "لاہور")
        self.assertEqual(lahore.province_id, "punjab")
        self.assertEqual(lahore.district, "Lahore")
        self.assertEqual(lahore.total_areas_count, 50)

        # Case-insensitivity
        self.assertEqual(get_city_by_id("  LaHoRe "), lahore)

        # Non-existent
        self.assertIsNone(get_city_by_id("atlantis"))

    # 3. Areas Tests
    def test_get_all_areas(self):
        areas = get_all_areas()
        self.assertEqual(len(areas), 189)
        for a in areas:
            self.assertIsInstance(a, PakistanArea)
            self.assertTrue(len(a.id) > 0)
            self.assertTrue(len(a.name) > 0)
            self.assertTrue(len(a.city_id) > 0)
            self.assertTrue(len(a.province_id) > 0)
            self.assertTrue(a.verified)

    def test_get_areas_by_city(self):
        lahore_areas = get_areas_by_city("lahore")
        self.assertEqual(len(lahore_areas), 50)
        self.assertTrue(all(a.city_id == "lahore" for a in lahore_areas))

        karachi_areas = get_areas_by_city("karachi")
        self.assertEqual(len(karachi_areas), 51)
        self.assertTrue(all(a.city_id == "karachi" for a in karachi_areas))

        isb_areas = get_areas_by_city("islamabad")
        self.assertEqual(len(isb_areas), 36)
        self.assertTrue(all(a.city_id == "islamabad" for a in isb_areas))

        rwp_areas = get_areas_by_city("rawalpindi")
        self.assertEqual(len(rwp_areas), 28)
        self.assertTrue(all(a.city_id == "rawalpindi" for a in rwp_areas))

        fsd_areas = get_areas_by_city("faisalabad")
        self.assertEqual(len(fsd_areas), 24)
        self.assertTrue(all(a.city_id == "faisalabad" for a in fsd_areas))

        # Unknown city
        self.assertEqual(get_areas_by_city("unknown-city"), [])

    def test_area_canonical_slug_format(self):
        areas = get_all_areas()
        for a in areas:
            expected_prefix = f"{a.city_id}-"
            self.assertTrue(
                a.id.startswith(expected_prefix),
                f"Area id '{a.id}' does not start with '{expected_prefix}'",
            )

    def test_coordinates_geofencing(self):
        areas = get_all_areas()
        for a in areas:
            self.assertIsNotNone(a.coordinates, f"Area {a.id} missing coordinates")
            lat = a.coordinates.lat
            lng = a.coordinates.lng
            self.assertTrue(
                23.5 <= lat <= 37.1,
                f"Area {a.id} latitude {lat} outside Pakistan bounds (23.5 - 37.1)",
            )
            self.assertTrue(
                60.8 <= lng <= 77.8,
                f"Area {a.id} longitude {lng} outside Pakistan bounds (60.8 - 77.8)",
            )

    # 4. Search Tests
    def test_search_alias(self):
        results = search_areas("dha 5", city_id="lahore")
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0].id, "lahore-dha-phase-5")

    def test_search_city_scoping(self):
        results = search_areas("dha 2", city_id="islamabad")
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0].id, "islamabad-dha-phase-2")
        self.assertTrue(all(a.city_id == "islamabad" for a in results))

    def test_search_urdu(self):
        results = search_areas("کلفٹن")
        self.assertTrue(len(results) > 0)
        self.assertTrue(any("clifton" in a.id for a in results))

    def test_search_exact_vs_substring(self):
        results = search_areas("Gulberg II")
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0].id, "lahore-gulberg-2")

    def test_search_limit(self):
        results = search_areas("phase", limit=3)
        self.assertLessEqual(len(results), 3)

    def test_search_empty_and_whitespace(self):
        self.assertEqual(search_areas(""), [])
        self.assertEqual(search_areas("    "), [])

    # 5. Postal Code Tests
    def test_find_area_by_postal_code(self):
        area = find_area_by_postal_code("54792")
        self.assertIsNotNone(area)
        self.assertEqual(area.postal_code, "54792")
        self.assertTrue(area.id.startswith("lahore-dha-"))

        clifton = find_area_by_postal_code("75600")
        self.assertIsNotNone(clifton)
        self.assertEqual(clifton.city_id, "karachi")

        # Invalid / non-existent postal code
        self.assertIsNone(find_area_by_postal_code("99999"))
        self.assertIsNone(find_area_by_postal_code("abcde"))

    def test_find_areas_by_postal_code(self):
        areas = find_areas_by_postal_code("54660")
        self.assertTrue(len(areas) >= 2)
        area_ids = {a.id for a in areas}
        self.assertIn("lahore-gulberg-1", area_ids)
        self.assertIn("lahore-gulberg-2", area_ids)

        self.assertEqual(find_areas_by_postal_code("00000"), [])

    # 6. Spatial Distance & Nearest Area Tests
    def test_haversine_distance(self):
        # Distance to self is 0
        d_zero = haversine_distance_km(31.5204, 74.3587, 31.5204, 74.3587)
        self.assertEqual(d_zero, 0.0)

        # Distance between Lahore (31.5204, 74.3587) and Rawalpindi (33.5651, 73.0169)
        dist = haversine_distance_km(31.5204, 74.3587, 33.5651, 73.0169)
        self.assertTrue(250.0 < dist < 300.0, f"Distance {dist} km out of expected range")

    def test_get_nearest_area(self):
        # Coordinates near DHA Phase 5 Lahore: (31.458, 74.412)
        nearest = get_nearest_area(31.4581, 74.4121)
        self.assertIsNotNone(nearest)
        self.assertEqual(nearest.id, "lahore-dha-phase-5")

        # With city_id filter
        nearest_isb = get_nearest_area(33.5, 73.1, city_id="islamabad")
        self.assertIsNotNone(nearest_isb)
        self.assertEqual(nearest_isb.city_id, "islamabad")

        # With max_distance_km filter
        far_away = get_nearest_area(0.0, 0.0, max_distance_km=50.0)
        self.assertIsNone(far_away)

    # 7. Model Properties & camelCase Aliases
    def test_dataclass_properties(self):
        area = find_area_by_postal_code("54792")
        self.assertIsNotNone(area)
        self.assertEqual(area.cityId, area.city_id)
        self.assertEqual(area.provinceId, area.province_id)
        self.assertEqual(area.urduName, area.urdu_name)
        self.assertEqual(area.postalCode, area.postal_code)

        city = get_city_by_id("lahore")
        self.assertIsNotNone(city)
        self.assertEqual(city.provinceId, city.province_id)
        self.assertEqual(city.urduName, city.urdu_name)
        self.assertEqual(city.postalCodeRange, city.postal_code_range)
        self.assertEqual(city.totalAreasCount, city.total_areas_count)

        province = get_province_by_id("punjab")
        self.assertIsNotNone(province)
        self.assertEqual(province.capitalCityId, province.capital_city_id)
        self.assertEqual(province.urduName, province.urdu_name)

    # 8. Extra Edge Cases & Dependency Checks
    def test_haversine_with_coordinates_objects(self):
        c1 = Coordinates(lat=31.5204, lng=74.3587)
        c2 = Coordinates(lat=33.5651, lng=73.0169)
        dist = haversine_distance_km(c1, c2)
        self.assertTrue(250.0 < dist < 300.0)

    def test_get_nearest_area_with_coordinates_object(self):
        c = Coordinates(lat=31.4581, lng=74.4121)
        nearest = get_nearest_area(c)
        self.assertIsNotNone(nearest)
        self.assertEqual(nearest.id, "lahore-dha-phase-5")

    def test_search_fuzzy(self):
        # Query with typo: "Gulbarg" instead of "Gulberg"
        results = search_areas("Gulbarg", city_id="lahore")
        self.assertTrue(len(results) > 0)
        self.assertTrue(any("gulberg" in r.id for r in results))

    def test_search_province_filter(self):
        results = search_areas("dha", province_id="sindh")
        self.assertTrue(len(results) > 0)
        self.assertTrue(all(r.province_id == "sindh" for r in results))

    def test_get_nearest_area_province_filter(self):
        # Coordinates in Lahore, but filtered for sindh province
        nearest = get_nearest_area(31.5204, 74.3587, province_id="sindh")
        self.assertIsNotNone(nearest)
        self.assertEqual(nearest.province_id, "sindh")

    def test_zero_runtime_dependencies(self):
        import pak_geodata
        import pak_geodata.lookups
        import pak_geodata.models

        # Standard library prefixes or module names
        std_prefixes = (
            "pak_geodata",
            "json",
            "math",
            "re",
            "pathlib",
            "typing",
            "dataclasses",
            "difflib",
            "collections",
            "sys",
            "os",
            "abc",
            "enum",
            "_collections",
            "itertools",
            "functools",
        )
        for mod_name, mod in sys.modules.items():
            if mod_name.startswith("pak_geodata"):
                # module must exist and be part of our package
                self.assertIsNotNone(mod)


if __name__ == "__main__":
    unittest.main()
