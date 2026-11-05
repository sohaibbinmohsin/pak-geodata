package pakgeodata

// Coordinates represents geographic latitude and longitude coordinates.
type Coordinates struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// CityBounds defines the geographic bounding box of a city.
type CityBounds struct {
	MinLat float64 `json:"minLat"`
	MaxLat float64 `json:"maxLat"`
	MinLng float64 `json:"minLng"`
	MaxLng float64 `json:"maxLng"`
}

// Province represents a province or administrative territory of Pakistan.
type Province struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	UrduName      string `json:"urduName"`
	CapitalCityID string `json:"capitalCityId"`
	Type          string `json:"type"`
}

// City represents an administrative city in Pakistan.
type City struct {
	ID              string      `json:"id"`
	Name            string      `json:"name"`
	UrduName        string      `json:"urduName"`
	ProvinceID      string      `json:"provinceId"`
	Division        string      `json:"division,omitempty"`
	District        string      `json:"district"`
	Coordinates     Coordinates `json:"coordinates"`
	PostalCodeRange [2]string   `json:"postalCodeRange,omitempty"`
	Bounds          *CityBounds `json:"bounds,omitempty"`
	TotalAreasCount int         `json:"totalAreasCount"`
}

// Area represents a verified neighborhood, sector, or locality in Pakistan.
type Area struct {
	ID          string      `json:"id"`
	CityID      string      `json:"cityId"`
	ProvinceID  string      `json:"provinceId"`
	Name        string      `json:"name"`
	UrduName    string      `json:"urduName,omitempty"`
	Aliases     []string    `json:"aliases"`
	PostalCode  string      `json:"postalCode,omitempty"`
	Coordinates Coordinates `json:"coordinates"`
	Type        string      `json:"type,omitempty"`
	Verified    bool        `json:"verified"`
	RadiusKm    float64     `json:"radiusKm,omitempty"`
	Bounds      *CityBounds `json:"bounds,omitempty"`
	Sources     []any       `json:"sources,omitempty"`
}

// SearchResult wraps an Area match with its relevance score.
// Area is embedded to support both result.Area.ID and result.ID.
type SearchResult struct {
	Area  `json:"area"`
	Score float64 `json:"score"`
}

// NearestAreaOptions provides filtering parameters for spatial nearest area lookup.
type NearestAreaOptions struct {
	CityID        string  `json:"cityId,omitempty"`
	ProvinceID    string  `json:"provinceId,omitempty"`
	MaxDistanceKm float64 `json:"maxDistanceKm,omitempty"`
}

// SearchOptions configures filtering and result limits for area searches.
type SearchOptions struct {
	CityID     string `json:"cityId,omitempty"`
	ProvinceID string `json:"provinceId,omitempty"`
	Limit      int    `json:"limit,omitempty"`
}
