package pakgeodata

import (
	"strings"
	"sync"
	"testing"
)

func TestProvinces(t *testing.T) {
	provinces := GetAllProvinces()
	if len(provinces) != 7 {
		t.Fatalf("expected 7 provinces, got %d", len(provinces))
	}

	expectedIDs := map[string]bool{
		"punjab":           true,
		"sindh":            true,
		"kpk":              true,
		"balochistan":      true,
		"islamabad-ict":    true,
		"ajk":              true,
		"gilgit-baltistan": true,
	}

	for _, p := range provinces {
		if !expectedIDs[p.ID] {
			t.Errorf("unexpected province ID: %s", p.ID)
		}
		if p.Name == "" {
			t.Errorf("province %s has empty name", p.ID)
		}
		if p.UrduName == "" {
			t.Errorf("province %s has empty urdu name", p.ID)
		}
		if p.CapitalCityID == "" {
			t.Errorf("province %s has empty capital city ID", p.ID)
		}
	}

	// Lookup by ID
	punjab, found := GetProvinceByID("punjab")
	if !found {
		t.Fatal("expected punjab to be found")
	}
	if punjab.Name != "Punjab" {
		t.Errorf("expected Punjab, got %s", punjab.Name)
	}
	if punjab.CapitalCityID != "lahore" {
		t.Errorf("expected lahore, got %s", punjab.CapitalCityID)
	}

	// Case and whitespace insensitivity
	punjabCase, found := GetProvinceByID("  PuNjAb  ")
	if !found || punjabCase.ID != "punjab" {
		t.Errorf("case-insensitive lookup failed for punjab")
	}

	// Non-existent province
	_, found = GetProvinceByID("non-existent-province")
	if found {
		t.Errorf("expected false for non-existent province")
	}
}

func TestCities(t *testing.T) {
	cities := GetAllCities()
	if len(cities) != 79 {
		t.Fatalf("expected 79 cities, got %d", len(cities))
	}

	for _, c := range cities {
		if c.ID == "" || c.Name == "" || c.UrduName == "" || c.ProvinceID == "" {
			t.Errorf("city %s has empty mandatory fields", c.ID)
		}
		if c.Coordinates.Lat < 23.5 || c.Coordinates.Lat > 37.1 {
			t.Errorf("city %s lat %f out of Pakistan bounds", c.ID, c.Coordinates.Lat)
		}
		if c.Coordinates.Lng < 60.8 || c.Coordinates.Lng > 77.8 {
			t.Errorf("city %s lng %f out of Pakistan bounds", c.ID, c.Coordinates.Lng)
		}
	}

	// Lookup by ID
	lahore, found := GetCityByID("lahore")
	if !found {
		t.Fatal("expected lahore to be found")
	}
	if lahore.Name != "Lahore" || lahore.ProvinceID != "punjab" {
		t.Errorf("unexpected city details for lahore: %+v", lahore)
	}

	// Case insensitivity
	lahoreCase, found := GetCityByID("  LaHoRe  ")
	if !found || lahoreCase.ID != "lahore" {
		t.Errorf("case-insensitive lookup failed for lahore")
	}

	// Cities by province
	punjabCities := GetCitiesByProvince("punjab")
	if len(punjabCities) != 37 {
		t.Errorf("expected 37 cities in Punjab, got %d", len(punjabCities))
	}

	sindhCities := GetCitiesByProvince("sindh")
	if len(sindhCities) != 8 {
		t.Errorf("expected 8 cities in Sindh, got %d", len(sindhCities))
	}

	// Non-existent province returns empty slice
	emptyCities := GetCitiesByProvince("mars")
	if len(emptyCities) != 0 {
		t.Errorf("expected 0 cities for non-existent province, got %d", len(emptyCities))
	}
}

func TestAreas(t *testing.T) {
	areas := GetAllAreas()
	if len(areas) != 3953 {
		t.Fatalf("expected 3953 areas, got %d", len(areas))
	}

	for _, a := range areas {
		if a.ID == "" || a.CityID == "" || a.ProvinceID == "" || a.Name == "" {
			t.Errorf("area %s has empty mandatory fields", a.ID)
		}
		expectedPrefix := a.CityID + "-"
		if !strings.HasPrefix(a.ID, expectedPrefix) {
			t.Errorf("area ID %s does not start with prefix %s", a.ID, expectedPrefix)
		}
		if a.Coordinates.Lat < 23.5 || a.Coordinates.Lat > 37.1 {
			t.Errorf("area %s lat %f out of Pakistan bounds", a.ID, a.Coordinates.Lat)
		}
		if a.Coordinates.Lng < 60.8 || a.Coordinates.Lng > 77.8 {
			t.Errorf("area %s lng %f out of Pakistan bounds", a.ID, a.Coordinates.Lng)
		}
	}

	// Areas by city
	lahoreAreas := GetAreasByCity("lahore")
	if len(lahoreAreas) == 0 {
		t.Fatal("expected areas for lahore")
	}
	for _, a := range lahoreAreas {
		if a.CityID != "lahore" {
			t.Errorf("expected cityID lahore, got %s", a.CityID)
		}
	}

	// Unknown city
	if len(GetAreasByCity("unknown-city")) != 0 {
		t.Error("expected 0 areas for unknown city")
	}
}

func TestPostalCodes(t *testing.T) {
	// Primary postal code lookup: 54000
	area, found := FindAreaByPostalCode("54000")
	if !found {
		t.Fatal("expected area for postal code 54000")
	}
	if area.PostalCode != "54000" {
		t.Errorf("expected postal code 54000, got %s", area.PostalCode)
	}

	// Find all areas sharing postal code 54000
	areas54000 := FindAreasByPostalCode("54000")
	if len(areas54000) == 0 {
		t.Fatal("expected multiple areas for postal code 54000")
	}
	for _, a := range areas54000 {
		if a.PostalCode != "54000" {
			t.Errorf("expected postal code 54000, got %s", a.PostalCode)
		}
	}

	// DHA Phase 5 postal code: 54792
	dhaArea, found := FindAreaByPostalCode("54792")
	if !found {
		t.Fatal("expected area for postal code 54792")
	}
	if !strings.HasPrefix(dhaArea.ID, "lahore-dha-") {
		t.Errorf("expected lahore-dha- prefix, got %s", dhaArea.ID)
	}

	// Clifton Karachi: 75600
	clifton, found := FindAreaByPostalCode("75600")
	if !found {
		t.Fatal("expected area for postal code 75600")
	}
	if clifton.CityID != "karachi" {
		t.Errorf("expected karachi city for clifton, got %s", clifton.CityID)
	}

	// Non-existent postal code
	_, found = FindAreaByPostalCode("99999")
	if found {
		t.Error("expected false for non-existent postal code")
	}

	emptyList := FindAreasByPostalCode("00000")
	if len(emptyList) != 0 {
		t.Errorf("expected 0 areas for 00000, got %d", len(emptyList))
	}
}

func TestHaversineDistanceKm(t *testing.T) {
	c1 := Coordinates{Lat: 31.5204, Lng: 74.3587} // Lahore
	c2 := Coordinates{Lat: 33.5651, Lng: 73.0169} // Rawalpindi

	// Distance to self is 0
	if dist := HaversineDistanceKm(c1, c1); dist != 0.0 {
		t.Errorf("expected distance 0, got %f", dist)
	}

	// Lahore to Rawalpindi ~260-290 km
	dist := HaversineDistanceKm(c1, c2)
	if dist < 250.0 || dist > 300.0 {
		t.Errorf("Lahore-Rawalpindi distance %f out of expected range [250, 300]", dist)
	}

	// Lahore to Karachi ~1000-1050 km
	c3 := Coordinates{Lat: 24.8607, Lng: 67.0011}
	distKhi := HaversineDistanceKm(c1, c3)
	if distKhi < 1000.0 || distKhi > 1050.0 {
		t.Errorf("Lahore-Karachi distance %f out of expected range [1000, 1050]", distKhi)
	}
}

func TestGetNearestArea(t *testing.T) {
	// Coordinates near DHA Phase 5 Lahore: [31.4581, 74.4121]
	coords := Coordinates{Lat: 31.4581, Lng: 74.4121}
	nearest, distKm, found := GetNearestArea(coords, NearestAreaOptions{})
	if !found || nearest == nil {
		t.Fatal("expected nearest area to be found")
	}
	if nearest.ID != "lahore-dha-phase-5" {
		t.Errorf("expected lahore-dha-phase-5, got %s", nearest.ID)
	}
	if distKm > 0.1 {
		t.Errorf("expected distance < 0.1 km, got %f", distKm)
	}

	// With CityID filter
	isbCoords := Coordinates{Lat: 33.7297, Lng: 73.0747}
	nearestIsb, _, found := GetNearestArea(isbCoords, NearestAreaOptions{CityID: "islamabad"})
	if !found || nearestIsb == nil {
		t.Fatal("expected nearest area in Islamabad")
	}
	if nearestIsb.CityID != "islamabad" {
		t.Errorf("expected city islamabad, got %s", nearestIsb.CityID)
	}

	// With MaxDistanceKm filter that excludes
	_, _, found = GetNearestArea(Coordinates{Lat: 0.0, Lng: 0.0}, NearestAreaOptions{MaxDistanceKm: 50.0})
	if found {
		t.Error("expected false when point is too far")
	}

	// With ProvinceID filter
	nearestSindh, _, found := GetNearestArea(coords, NearestAreaOptions{ProvinceID: "sindh"})
	if !found || nearestSindh == nil {
		t.Fatal("expected nearest area in Sindh")
	}
	if nearestSindh.ProvinceID != "sindh" {
		t.Errorf("expected province sindh, got %s", nearestSindh.ProvinceID)
	}
}

func TestSearchAreas(t *testing.T) {
	// 1. Alias search: "dha 5" in Lahore
	results := SearchAreas("dha 5", SearchOptions{CityID: "lahore"})
	if len(results) == 0 {
		t.Fatal("expected results for 'dha 5'")
	}
	if results[0].ID != "lahore-dha-phase-5" && results[0].Area.ID != "lahore-dha-phase-5" {
		t.Errorf("expected lahore-dha-phase-5 as top match, got %s", results[0].ID)
	}

	// 2. Urdu search: "گلبرگ"
	urduResults := SearchAreas("گلبرگ", SearchOptions{CityID: "lahore"})
	if len(urduResults) == 0 {
		t.Fatal("expected results for 'گلبرگ'")
	}
	if !strings.Contains(urduResults[0].ID, "gulberg") {
		t.Errorf("expected top match to contain 'gulberg', got %s", urduResults[0].ID)
	}

	// 3. Urdu search: "کلفٹن"
	cliftonResults := SearchAreas("کلفٹن", SearchOptions{})
	if len(cliftonResults) == 0 {
		t.Fatal("expected results for 'کلفٹن'")
	}
	foundClifton := false
	for _, r := range cliftonResults {
		if strings.Contains(r.ID, "clifton") {
			foundClifton = true
			break
		}
	}
	if !foundClifton {
		t.Errorf("expected clifton in search results for 'کلفٹن'")
	}

	// 4. Colloquial city aliases
	isbResults := SearchAreas("isb", SearchOptions{Limit: 5})
	if len(isbResults) == 0 {
		t.Fatal("expected results for 'isb'")
	}
	for _, r := range isbResults {
		if r.CityID != "islamabad" {
			t.Errorf("expected city islamabad for 'isb', got %s", r.CityID)
		}
	}

	pindiResults := SearchAreas("pindi", SearchOptions{Limit: 5})
	if len(pindiResults) == 0 {
		t.Fatal("expected results for 'pindi'")
	}
	for _, r := range pindiResults {
		if r.CityID != "rawalpindi" {
			t.Errorf("expected city rawalpindi for 'pindi', got %s", r.CityID)
		}
	}

	// 5. Limit option
	limited := SearchAreas("phase", SearchOptions{Limit: 3})
	if len(limited) == 0 || len(limited) > 3 {
		t.Errorf("expected 1-3 results for Limit: 3, got %d", len(limited))
	}

	// 6. Empty / whitespace query
	if len(SearchAreas("", SearchOptions{})) != 0 {
		t.Error("expected 0 results for empty query")
	}
	if len(SearchAreas("   ", SearchOptions{})) != 0 {
		t.Error("expected 0 results for whitespace query")
	}

	// 7. Fuzzy search with slight typo: "Gulbarg" -> "Gulberg"
	fuzzyResults := SearchAreas("Gulbarg", SearchOptions{CityID: "lahore"})
	if len(fuzzyResults) == 0 {
		t.Fatal("expected results for fuzzy query 'Gulbarg'")
	}
	if !strings.Contains(fuzzyResults[0].ID, "gulberg") {
		t.Errorf("expected gulberg match for fuzzy 'Gulbarg', got %s", fuzzyResults[0].ID)
	}
}

func TestUrduNormalization(t *testing.T) {
	// Diacritics stripping
	withDiacritics := "گُلبَرگ"
	normalized := NormalizeUrduText(withDiacritics)
	if normalized != "گلبرگ" {
		t.Errorf("expected 'گلبرگ', got '%s'", normalized)
	}

	// Eastern to Western digits
	easternDigits := "۰۱۲۳۴۵۶۷۸۹"
	western := ToWesternDigits(easternDigits)
	if western != "0123456789" {
		t.Errorf("expected '0123456789', got '%s'", western)
	}

	// Arabic digits to Western
	arabicDigits := "٠١٢٣٤٥٦٧٨٩"
	western2 := ToWesternDigits(arabicDigits)
	if western2 != "0123456789" {
		t.Errorf("expected '0123456789', got '%s'", western2)
	}

	// Letter normalizations: Alef, Yeh, Kaf, Heh
	variations := "آكےة"
	norm := NormalizeUrduText(variations)
	if norm != "اکیہ" {
		t.Errorf("expected 'اکیہ', got '%s'", norm)
	}
}

func TestSearchExactAndPromotion(t *testing.T) {
	results := SearchAreas("Gulberg II", SearchOptions{})
	if len(results) == 0 {
		t.Fatal("expected results for 'Gulberg II'")
	}
	// Verify field promotion and explicit embedded field access
	if results[0].ID != "lahore-gulberg-2" {
		t.Errorf("expected promoted field ID 'lahore-gulberg-2', got %s", results[0].ID)
	}
	if results[0].Area.ID != "lahore-gulberg-2" {
		t.Errorf("expected embedded field Area.ID 'lahore-gulberg-2', got %s", results[0].Area.ID)
	}

	// Islamabad DHA Phase 2
	isbResults := SearchAreas("dha 2", SearchOptions{CityID: "islamabad"})
	if len(isbResults) == 0 {
		t.Fatal("expected results for 'dha 2' in islamabad")
	}
	if isbResults[0].ID != "islamabad-dha-phase-2" {
		t.Errorf("expected 'islamabad-dha-phase-2', got %s", isbResults[0].ID)
	}
}

func TestNearestAreaIslamabad(t *testing.T) {
	coords := Coordinates{Lat: 33.7297, Lng: 73.0747}
	nearest, distKm, found := GetNearestArea(coords, NearestAreaOptions{})
	if !found || nearest == nil {
		t.Fatal("expected nearest area in Islamabad")
	}
	if !strings.Contains(nearest.ID, "f-6") {
		t.Errorf("expected F-6 area, got %s", nearest.ID)
	}
	if distKm > 0.5 {
		t.Errorf("expected distance < 0.5 km, got %f", distKm)
	}
}

func TestConcurrentAccess(t *testing.T) {
	var wg sync.WaitGroup
	workers := 50

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			_ = GetAllProvinces()
			_ = GetAllCities()
			_ = GetAllAreas()

			_, _ = GetProvinceByID("punjab")
			_, _ = GetCityByID("lahore")
			_ = GetAreasByCity("lahore")

			_, _ = FindAreaByPostalCode("54000")
			_ = FindAreasByPostalCode("54000")

			_, _, _ = GetNearestArea(Coordinates{Lat: 31.4581, Lng: 74.4121}, NearestAreaOptions{})
			_ = SearchAreas("گلبرگ", SearchOptions{CityID: "lahore"})
		}(i)
	}

	wg.Wait()
}
