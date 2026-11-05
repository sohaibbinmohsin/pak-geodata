# pakgeodata (Go)

[![Go Reference](https://pkg.go.dev/badge/github.com/sohaibbinmohsin/pak-geodata/packages/go.svg)](https://pkg.go.dev/github.com/sohaibbinmohsin/pak-geodata/packages/go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<a href="https://geodata.themohsinproject.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Live%20Demo-Interactive%20Studio-blue?logo=leaflet&color=10B981" alt="Live Interactive Demo" /></a>

> Comprehensive, typed, offline geographic dataset and search library for all areas and cities in Pakistan.

`pakgeodata` is a pure Go package providing offline access to verified geographic data for Pakistan with **zero external runtime dependencies**. It embeds the complete dataset via `//go:embed` and provides thread-safe, high-performance in-memory spatial lookups and Urdu search.

Explore the [Interactive Live Demo](https://geodata.themohsinproject.org/) to test multi-script search, interactive map exploration, and reverse geocoding in real-time.

---

## Features

- ⚡ **Zero External Runtime Dependencies**: Standard library only (`math`, `strings`, `sync`, `embed`, `encoding/json`).
- 📦 **Offline & Embedded**: 7 provinces, 79 cities, and 3,953 areas embedded directly into the Go binary with thread-safe `sync.Once` lazy initialization.
- 🎯 **Strict Geofencing**: All coordinates strictly verified within Pakistan's geographical bounding box (`23.5 <= lat <= 37.1`, `60.8 <= lng <= 77.8`).
- 🏷️ **Canonical Slugs**: Standardized `<city-slug>-<area-slug>` identifiers (e.g. `lahore-dha-phase-5`, `karachi-clifton-block-2`).
- 🔍 **Multi-Script & Alias Search**: English queries, colloquial aliases (e.g. `"dha 5"`, `"isb"`, `"pindi"`), native Urdu script (`"گلبرگ"`, `"کلفٹن"`), and fuzzy typo tolerance.
- 📍 **Spatial Reverse Geocoding**: Nearest neighbor resolution via spherical Haversine formula ($R = 6371.0088\text{ km}$).
- 📮 **Pakistan Post Codes**: 5-digit postal code resolution and reverse lookups.

---

## Dataset Statistics

| Level | Count | Coverage | Key Details |
| :--- | :--- | :--- | :--- |
| **Provinces & Territories** | **7** | 100% of Pakistan | Punjab, Sindh, KPK, Balochistan, Islamabad (ICT), AJK, Gilgit-Baltistan |
| **Verified Cities** | **79** | 100% Coverage | Centroids, bounding boxes, administrative divisions, postal code ranges |
| **Verified Areas** | **3,953** | All 79 Cities | Neighborhoods, sectors, housing schemes, commercial centers |

---

## Installation

```bash
go get github.com/sohaibbinmohsin/pak-geodata/packages/go
```

---

## Quick Start

```go
package main

import (
	"fmt"

	pakgeodata "github.com/sohaibbinmohsin/pak-geodata/packages/go"
)

func main() {
	// 1. Provinces & Cities
	provinces := pakgeodata.GetAllProvinces()
	fmt.Printf("Total provinces: %d\n", len(provinces))

	lahore, found := pakgeodata.GetCityByID("lahore")
	if found {
		fmt.Printf("City: %s (%s)\n", lahore.Name, lahore.UrduName)
	}

	// 2. Areas & Postal Codes
	dha5, found := pakgeodata.GetAreaByID("lahore-dha-phase-5")
	if found {
		fmt.Printf("Area: %s (Postal Code: %s)\n", dha5.Name, dha5.PostalCode)
	}

	postalArea, found := pakgeodata.FindAreaByPostalCode("54000")
	if found {
		fmt.Printf("Postal 54000: %s, %s\n", postalArea.Name, postalArea.CityID)
	}

	// 3. Nearest Area Spatial Lookup (Spherical Haversine)
	target := pakgeodata.Coordinates{Lat: 31.4697, Lng: 74.4133}
	nearest, distKm, found := pakgeodata.GetNearestArea(target, pakgeodata.NearestAreaOptions{})
	if found {
		fmt.Printf("Nearest Area: %s (%.2f km)\n", nearest.Name, distKm)
	}

	// 4. Multi-Script Search (English, Urdu, Colloquial)
	results := pakgeodata.SearchAreas("گلبرگ", pakgeodata.SearchOptions{
		CityID: "lahore",
		Limit:  5,
	})
	for _, res := range results {
		fmt.Printf("- %s (Score: %.0f, Match: %s)\n", res.Area.Name, res.Score, res.MatchType)
	}
}
```

---

## Contributing & Repository

Source code and issue tracking are hosted on GitHub:
- **Repository**: [https://github.com/sohaibbinmohsin/pak-geodata](https://github.com/sohaibbinmohsin/pak-geodata)
- **Issue Tracker**: [https://github.com/sohaibbinmohsin/pak-geodata/issues](https://github.com/sohaibbinmohsin/pak-geodata/issues)

---

## License

MIT License. See [LICENSE](LICENSE) for details.
