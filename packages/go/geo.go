package pakgeodata

import (
	"math"
	"strings"
)

// HaversineDistanceKm calculates the great-circle distance between two geographic coordinates
// using the spherical Earth Haversine formula with radius R = 6371.0088 km.
func HaversineDistanceKm(c1, c2 Coordinates) float64 {
	if c1.Lat == c2.Lat && c1.Lng == c2.Lng {
		return 0.0
	}

	const earthRadiusKm = 6371.0088
	dLat := (c2.Lat - c1.Lat) * math.Pi / 180.0
	dLng := (c2.Lng - c1.Lng) * math.Pi / 180.0
	lat1Rad := c1.Lat * math.Pi / 180.0
	lat2Rad := c2.Lat * math.Pi / 180.0

	sinDLat := math.Sin(dLat / 2.0)
	sinDLng := math.Sin(dLng / 2.0)

	a := sinDLat*sinDLat + math.Cos(lat1Rad)*math.Cos(lat2Rad)*sinDLng*sinDLng
	c := 2.0 * math.Atan2(math.Sqrt(a), math.Sqrt(1.0-a))

	return earthRadiusKm * c
}

// IsPointInBoundingBox checks if a coordinate point falls inside a city's bounding box.
func IsPointInBoundingBox(coords Coordinates, b *CityBounds) bool {
	if b == nil {
		return false
	}
	return coords.Lat >= b.MinLat && coords.Lat <= b.MaxLat &&
		coords.Lng >= b.MinLng && coords.Lng <= b.MaxLng
}

// GetNearestArea finds the nearest verified Area to the given coordinates.
// Returns the nearest Area pointer, great-circle distance in kilometers, and true if found.
func GetNearestArea(coords Coordinates, opts NearestAreaOptions) (*Area, float64, bool) {
	initData()

	var candidates []Area
	if opts.CityID != "" {
		cityKey := strings.ToLower(strings.TrimSpace(opts.CityID))
		candidates = areasByCity[cityKey]
	} else {
		candidates = areas
	}

	if opts.ProvinceID != "" {
		provKey := strings.ToLower(strings.TrimSpace(opts.ProvinceID))
		filtered := make([]Area, 0, len(candidates))
		for _, a := range candidates {
			if strings.ToLower(strings.TrimSpace(a.ProvinceID)) == provKey {
				filtered = append(filtered, a)
			}
		}
		candidates = filtered
	}

	if len(candidates) == 0 {
		return nil, 0, false
	}

	var nearest Area
	minDist := math.Inf(1)
	foundAny := false

	for _, a := range candidates {
		dist := HaversineDistanceKm(coords, a.Coordinates)
		if dist < minDist {
			minDist = dist
			nearest = a
			foundAny = true
		}
	}

	if !foundAny {
		return nil, 0, false
	}

	if opts.MaxDistanceKm > 0 && minDist > opts.MaxDistanceKm {
		return nil, 0, false
	}

	res := nearest
	return &res, minDist, true
}
