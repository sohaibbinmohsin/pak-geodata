"""pak_geodata: Comprehensive, offline geographic data for all areas and cities in Pakistan."""

from .lookups import (
    find_area_by_postal_code,
    find_areas_by_postal_code,
    get_all_areas,
    get_all_cities,
    get_all_provinces,
    get_areas_by_city,
    get_cities_by_province,
    get_city_by_id,
    get_nearest_area,
    get_province_by_id,
    haversine_distance_km,
    search_areas,
)
from .models import (
    CityBounds,
    Coordinates,
    PakistanArea,
    PakistanCity,
    PakistanProvince,
)

__version__ = "0.1.0"

__all__ = [
    "Coordinates",
    "CityBounds",
    "PakistanProvince",
    "PakistanCity",
    "PakistanArea",
    "get_all_provinces",
    "get_province_by_id",
    "get_all_cities",
    "get_cities_by_province",
    "get_city_by_id",
    "get_all_areas",
    "get_areas_by_city",
    "search_areas",
    "find_area_by_postal_code",
    "find_areas_by_postal_code",
    "get_nearest_area",
    "haversine_distance_km",
]
