package pakgeodata

import (
	"embed"
	"encoding/json"
	"io/fs"
	"sort"
	"strings"
	"sync"
)

//go:embed data
var dataFS embed.FS

var (
	initOnce sync.Once

	provinces         []Province
	provinceByID      map[string]Province
	cities            []City
	cityByID          map[string]City
	citiesByProvince  map[string][]City
	areas             []Area
	areaByID          map[string]Area
	areasByCity       map[string][]Area
	areaByPostalCode  map[string]Area
	areasByPostalCode map[string][]Area
)

func initData() {
	initOnce.Do(func() {
		provinceByID = make(map[string]Province)
		cityByID = make(map[string]City)
		citiesByProvince = make(map[string][]City)
		areaByID = make(map[string]Area)
		areasByCity = make(map[string][]Area)
		areaByPostalCode = make(map[string]Area)
		areasByPostalCode = make(map[string][]Area)

		// 1. Load Provinces
		provBytes, err := dataFS.ReadFile("data/provinces.json")
		if err == nil {
			var provList []Province
			if err := json.Unmarshal(provBytes, &provList); err == nil {
				provinces = provList
				for _, p := range provinces {
					provinceByID[strings.ToLower(strings.TrimSpace(p.ID))] = p
				}
			}
		}

		// 2. Load Areas (walk and sort files for deterministic ordering)
		var areaFiles []string
		_ = fs.WalkDir(dataFS, "data/areas", func(path string, d fs.DirEntry, err error) error {
			if err == nil && !d.IsDir() && strings.HasSuffix(path, ".json") {
				areaFiles = append(areaFiles, path)
			}
			return nil
		})
		sort.Strings(areaFiles)

		for _, filePath := range areaFiles {
			fileBytes, err := dataFS.ReadFile(filePath)
			if err != nil {
				continue
			}
			var fileAreas []Area
			if err := json.Unmarshal(fileBytes, &fileAreas); err != nil {
				continue
			}
			for _, a := range fileAreas {
				areas = append(areas, a)
				aID := strings.ToLower(strings.TrimSpace(a.ID))
				areaByID[aID] = a

				cityKey := strings.ToLower(strings.TrimSpace(a.CityID))
				areasByCity[cityKey] = append(areasByCity[cityKey], a)

				if a.PostalCode != "" {
					pCode := strings.TrimSpace(a.PostalCode)
					if _, exists := areaByPostalCode[pCode]; !exists {
						areaByPostalCode[pCode] = a
					}
					areasByPostalCode[pCode] = append(areasByPostalCode[pCode], a)
				}
			}
		}

		// 3. Load Cities (walk and sort files for deterministic ordering)
		var cityFiles []string
		_ = fs.WalkDir(dataFS, "data/cities", func(path string, d fs.DirEntry, err error) error {
			if err == nil && !d.IsDir() && strings.HasSuffix(path, ".json") {
				cityFiles = append(cityFiles, path)
			}
			return nil
		})
		sort.Strings(cityFiles)

		for _, filePath := range cityFiles {
			fileBytes, err := dataFS.ReadFile(filePath)
			if err != nil {
				continue
			}
			var fileCities []City
			if err := json.Unmarshal(fileBytes, &fileCities); err != nil {
				continue
			}
			for _, c := range fileCities {
				cID := strings.ToLower(strings.TrimSpace(c.ID))
				c.TotalAreasCount = len(areasByCity[cID])
				cities = append(cities, c)
				cityByID[cID] = c

				provKey := strings.ToLower(strings.TrimSpace(c.ProvinceID))
				citiesByProvince[provKey] = append(citiesByProvince[provKey], c)
			}
		}
	})
}

// GetAllProvinces returns all 7 administrative provinces and territories of Pakistan.
func GetAllProvinces() []Province {
	initData()
	res := make([]Province, len(provinces))
	copy(res, provinces)
	return res
}

// GetProvinceByID retrieves a province by its unique identifier (e.g., "punjab", "sindh", "islamabad-ict").
func GetProvinceByID(id string) (Province, bool) {
	initData()
	key := strings.ToLower(strings.TrimSpace(id))
	p, ok := provinceByID[key]
	return p, ok
}

// GetAllCities returns all 79 verified cities across Pakistan.
func GetAllCities() []City {
	initData()
	res := make([]City, len(cities))
	copy(res, cities)
	return res
}

// GetCityByID retrieves a city by its canonical identifier (e.g., "lahore", "karachi", "islamabad").
func GetCityByID(id string) (City, bool) {
	initData()
	key := strings.ToLower(strings.TrimSpace(id))
	c, ok := cityByID[key]
	return c, ok
}

// GetCitiesByProvince retrieves all cities belonging to a specified province ID.
func GetCitiesByProvince(id string) []City {
	initData()
	key := strings.ToLower(strings.TrimSpace(id))
	list, ok := citiesByProvince[key]
	if !ok {
		return []City{}
	}
	res := make([]City, len(list))
	copy(res, list)
	return res
}

// GetAllAreas returns all verified areas across Pakistan.
func GetAllAreas() []Area {
	initData()
	res := make([]Area, len(areas))
	copy(res, areas)
	return res
}

// GetAreasByCity retrieves all verified areas within a given city.
func GetAreasByCity(cityID string) []Area {
	initData()
	key := strings.ToLower(strings.TrimSpace(cityID))
	list, ok := areasByCity[key]
	if !ok {
		return []Area{}
	}
	res := make([]Area, len(list))
	copy(res, list)
	return res
}

// FindAreaByPostalCode resolves the primary area associated with a 5-digit Pakistan Post postal code.
func FindAreaByPostalCode(code string) (Area, bool) {
	initData()
	key := strings.TrimSpace(code)
	a, ok := areaByPostalCode[key]
	return a, ok
}

// FindAreasByPostalCode returns all areas sharing a given 5-digit Pakistan Post postal code.
func FindAreasByPostalCode(code string) []Area {
	initData()
	key := strings.TrimSpace(code)
	list, ok := areasByPostalCode[key]
	if !ok {
		return []Area{}
	}
	res := make([]Area, len(list))
	copy(res, list)
	return res
}
