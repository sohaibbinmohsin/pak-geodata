"""Lookups, search, and spatial utilities for Pakistan geographic data.

Standard library only: json, math, re, pathlib, typing. Zero runtime dependencies.
"""

import difflib
import json
import math
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, overload

from .models import (
    CityBounds,
    Coordinates,
    PakistanArea,
    PakistanCity,
    PakistanProvince,
)

# -----------------------------------------------------------------------------
# Data Loading & In-Memory Indexes
# -----------------------------------------------------------------------------

_DATA_DIR = Path(__file__).resolve().parent / "data"

_provinces: List[PakistanProvince] = []
_province_by_id: Dict[str, PakistanProvince] = {}

_cities: List[PakistanCity] = []
_city_by_id: Dict[str, PakistanCity] = {}
_cities_by_province: Dict[str, List[PakistanCity]] = {}

_areas: List[PakistanArea] = []
_area_by_id: Dict[str, PakistanArea] = {}
_areas_by_city: Dict[str, List[PakistanArea]] = {}
_area_by_postal_code: Dict[str, PakistanArea] = {}
_areas_by_postal_code: Dict[str, List[PakistanArea]] = {}


def _init_data() -> None:
    global _provinces, _province_by_id
    global _cities, _city_by_id, _cities_by_province
    global _areas, _area_by_id, _areas_by_city, _area_by_postal_code, _areas_by_postal_code

    if _provinces:
        return

    # 1. Load Provinces
    prov_file = _DATA_DIR / "provinces.json"
    if prov_file.exists():
        with open(prov_file, "r", encoding="utf-8") as f:
            prov_data = json.load(f)
            for p in prov_data:
                prov = PakistanProvince(
                    id=p["id"],
                    name=p["name"],
                    urdu_name=p["urduName"],
                    capital_city_id=p["capitalCityId"],
                    type=p.get("type", "province"),
                )
                _provinces.append(prov)
                _province_by_id[prov.id.lower()] = prov

    # 2. Load Areas
    areas_dir = _DATA_DIR / "areas"
    if areas_dir.exists():
        for area_file in sorted(areas_dir.rglob("*.json")):
            with open(area_file, "r", encoding="utf-8") as f:
                area_list = json.load(f)
                for a in area_list:
                    coords = (
                        Coordinates(
                            lat=float(a["coordinates"]["lat"]),
                            lng=float(a["coordinates"]["lng"]),
                        )
                        if a.get("coordinates")
                        else None
                    )
                    area = PakistanArea(
                        id=a["id"],
                        city_id=a["cityId"],
                        province_id=a["provinceId"],
                        name=a["name"],
                        aliases=list(a.get("aliases", [])),
                        coordinates=coords,
                        urdu_name=a.get("urduName"),
                        postal_code=a.get("postalCode"),
                        type=a.get("type"),
                        verified=bool(a.get("verified", False)),
                        sources=list(a.get("sources", [])),
                    )
                    _areas.append(area)
                    _area_by_id[area.id.lower()] = area

                    city_key = area.city_id.lower()
                    if city_key not in _areas_by_city:
                        _areas_by_city[city_key] = []
                    _areas_by_city[city_key].append(area)

                    if area.postal_code:
                        p_code = area.postal_code.strip()
                        if p_code not in _area_by_postal_code:
                            _area_by_postal_code[p_code] = area
                        if p_code not in _areas_by_postal_code:
                            _areas_by_postal_code[p_code] = []
                        _areas_by_postal_code[p_code].append(area)

    # 3. Load Cities
    cities_dir = _DATA_DIR / "cities"
    if cities_dir.exists():
        for city_file in sorted(cities_dir.glob("*.json")):
            with open(city_file, "r", encoding="utf-8") as f:
                city_list = json.load(f)
                for c in city_list:
                    coords = Coordinates(
                        lat=float(c["coordinates"]["lat"]),
                        lng=float(c["coordinates"]["lng"]),
                    )
                    b = c.get("bounds")
                    bounds = (
                        CityBounds(
                            min_lat=float(b["minLat"]),
                            max_lat=float(b["maxLat"]),
                            min_lng=float(b["minLng"]),
                            max_lng=float(b["maxLng"]),
                        )
                        if b
                        else None
                    )
                    c_id = c["id"].lower()
                    city_areas = _areas_by_city.get(c_id, [])

                    city = PakistanCity(
                        id=c["id"],
                        name=c["name"],
                        urdu_name=c["urduName"],
                        province_id=c["provinceId"],
                        district=c.get("district", c["name"]),
                        coordinates=coords,
                        division=c.get("division"),
                        postal_code_range=c.get("postalCodeRange"),
                        bounds=bounds,
                        total_areas_count=len(city_areas),
                    )
                    _cities.append(city)
                    _city_by_id[c_id] = city

                    prov_key = city.province_id.lower()
                    if prov_key not in _cities_by_province:
                        _cities_by_province[prov_key] = []
                    _cities_by_province[prov_key].append(city)


_init_data()


# -----------------------------------------------------------------------------
# Province Lookups
# -----------------------------------------------------------------------------

def get_all_provinces() -> List[PakistanProvince]:
    """Returns all verified provinces and administrative territories of Pakistan."""
    return list(_provinces)


def get_province_by_id(id: str) -> Optional[PakistanProvince]:
    """Finds a province by its unique identifier (e.g. 'punjab', 'sindh', 'islamabad-ict')."""
    return _province_by_id.get(id.lower().strip())


# -----------------------------------------------------------------------------
# City Lookups
# -----------------------------------------------------------------------------

def get_all_cities() -> List[PakistanCity]:
    """Returns all verified cities across Pakistan."""
    return list(_cities)


def get_cities_by_province(province_id: str) -> List[PakistanCity]:
    """Retrieves all cities belonging to a specified province."""
    return list(_cities_by_province.get(province_id.lower().strip(), []))


def get_city_by_id(id: str) -> Optional[PakistanCity]:
    """Finds a city by its canonical slug identifier (e.g. 'lahore', 'karachi', 'islamabad')."""
    return _city_by_id.get(id.lower().strip())


# -----------------------------------------------------------------------------
# Area Lookups
# -----------------------------------------------------------------------------

def get_all_areas() -> List[PakistanArea]:
    """Returns all verified areas across all cities in Pakistan."""
    return list(_areas)


def get_areas_by_city(city_id: str) -> List[PakistanArea]:
    """Returns all verified areas within a given city."""
    return list(_areas_by_city.get(city_id.lower().strip(), []))


def find_area_by_postal_code(postal_code: Union[str, int]) -> Optional[PakistanArea]:
    """Resolves the primary area associated with a 5-digit Pakistan Post postal code."""
    if postal_code is None:
        return None
    return _area_by_postal_code.get(str(postal_code).strip())


def find_areas_by_postal_code(postal_code: Union[str, int]) -> List[PakistanArea]:
    """Returns all areas sharing a given 5-digit Pakistan Post postal code."""
    if postal_code is None:
        return []
    return list(_areas_by_postal_code.get(str(postal_code).strip(), []))


# -----------------------------------------------------------------------------
# Spatial & Haversine Utilities
# -----------------------------------------------------------------------------

@overload
def haversine_distance_km(
    lat1: Coordinates,
    lng1: Coordinates,
) -> float:
    ...


@overload
def haversine_distance_km(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float,
) -> float:
    ...


def haversine_distance_km(
    lat1: Union[float, Coordinates],
    lng1: Union[float, Coordinates],
    lat2: Optional[float] = None,
    lng2: Optional[float] = None,
) -> float:
    """Calculates great-circle distance in kilometers using the Haversine formula."""
    if isinstance(lat1, Coordinates) and isinstance(lng1, Coordinates):
        t_lat1, t_lng1 = lat1.lat, lat1.lng
        t_lat2, t_lng2 = lng1.lat, lng1.lng
    else:
        t_lat1, t_lng1 = float(lat1), float(lng1)
        t_lat2, t_lng2 = float(lat2), float(lng2)

    if t_lat1 == t_lat2 and t_lng1 == t_lng2:
        return 0.0

    r = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(t_lat2 - t_lat1)
    d_lng = math.radians(t_lng2 - t_lng1)
    lat1_rad = math.radians(t_lat1)
    lat2_rad = math.radians(t_lat2)

    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(d_lng / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def get_nearest_area(
    lat: Union[float, Coordinates],
    lng: Optional[float] = None,
    city_id: Optional[str] = None,
    max_distance_km: Optional[float] = None,
    province_id: Optional[str] = None,
) -> Optional[PakistanArea]:
    """Finds the nearest verified PakistanArea to the given coordinates."""
    if isinstance(lat, Coordinates):
        if isinstance(lng, str) and city_id is None:
            city_id = lng
        target_lat = lat.lat
        target_lng = lat.lng
    else:
        target_lat = float(lat)
        target_lng = float(lng)

    if city_id:
        candidates = _areas_by_city.get(city_id.lower().strip(), [])
    else:
        candidates = _areas

    if province_id:
        p_id = province_id.lower().strip()
        candidates = [a for a in candidates if a.province_id.lower() == p_id]

    if not candidates:
        return None

    nearest: Optional[PakistanArea] = None
    min_distance = float("inf")

    for area in candidates:
        if area.coordinates is None:
            continue
        dist = haversine_distance_km(
            target_lat, target_lng, area.coordinates.lat, area.coordinates.lng
        )
        if dist < min_distance:
            min_distance = dist
            nearest = area

    if max_distance_km is not None and min_distance > max_distance_km:
        return None

    return nearest


# -----------------------------------------------------------------------------
# Search Utilities
# -----------------------------------------------------------------------------

def _normalize_string(s: str) -> str:
    cleaned = re.sub(r"[-_.,/]", " ", s.lower().strip())
    return re.sub(r"\s+", " ", cleaned)


def _levenshtein_distance(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    dp = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev = i
        for j, cb in enumerate(b, 1):
            val = dp[j - 1] if ca == cb else min(dp[j - 1], dp[j], prev) + 1
            dp[j - 1] = prev
            prev = val
        dp[len(b)] = prev
    return dp[len(b)]


def search_areas(
    query: str,
    city_id: Optional[str] = None,
    limit: Optional[int] = None,
    province_id: Optional[str] = None,
) -> List[PakistanArea]:
    """Searches Pakistan areas using structured matching and ranking.

    Exact match > Prefix match > Alias match > Substring / Token match > Fuzzy match.
    """
    trimmed = query.strip()
    if not trimmed:
        return []

    norm_query = _normalize_string(trimmed)
    query_tokens = norm_query.split()

    if city_id:
        candidates = _areas_by_city.get(city_id.lower().strip(), [])
    else:
        candidates = _areas

    if province_id:
        p_id = province_id.lower().strip()
        candidates = [a for a in candidates if a.province_id.lower() == p_id]

    scored: List[Tuple[PakistanArea, float]] = []

    for area in candidates:
        score = 0.0

        norm_name = _normalize_string(area.name)
        norm_id = _normalize_string(area.id)
        norm_urdu = area.urdu_name.strip() if area.urdu_name else ""
        norm_aliases = [_normalize_string(al) for al in area.aliases]

        # 1. Exact matches
        if norm_name == norm_query:
            score = max(score, 1000.0)
        elif norm_id == norm_query:
            score = max(score, 950.0)
        elif norm_urdu and norm_urdu == trimmed:
            score = max(score, 900.0)
        elif any(al == norm_query for al in norm_aliases):
            score = max(score, 850.0)

        # 2. Prefix matches
        if score < 800.0:
            if norm_name.startswith(norm_query):
                score = max(
                    score,
                    700.0 + (len(norm_query) / max(len(norm_name), 1)) * 50.0,
                )
            elif norm_urdu and norm_urdu.startswith(trimmed):
                score = max(score, 650.0)
            elif any(al.startswith(norm_query) for al in norm_aliases):
                score = max(score, 600.0)

        # 3. Substring / Token matches
        if score < 600.0:
            if norm_query in norm_name:
                score = max(score, 500.0)
            elif norm_urdu and trimmed in norm_urdu:
                score = max(score, 450.0)
            elif any(norm_query in al for al in norm_aliases):
                score = max(score, 400.0)
            elif query_tokens:
                area_all_text = f"{norm_name} {norm_id} {' '.join(norm_aliases)}"
                matched_tokens = [t for t in query_tokens if t in area_all_text]
                if len(matched_tokens) == len(query_tokens):
                    score = max(score, 300.0 + (len(query_tokens) * 20.0))
                elif matched_tokens:
                    score = max(
                        score,
                        100.0 + (len(matched_tokens) / len(query_tokens)) * 100.0,
                    )

        # 4. Fuzzy fallback for short queries or slight typos
        if score == 0.0 and len(norm_query) >= 4:
            dist = _levenshtein_distance(norm_query, norm_name)
            max_len = max(len(norm_query), len(norm_name))
            sim = 1.0 - (dist / max_len)
            if sim >= 0.72:
                score = max(score, 150.0 * sim)
            else:
                # Check individual words in area name
                for w in norm_name.split():
                    if len(w) >= 4:
                        w_dist = _levenshtein_distance(norm_query, w)
                        w_sim = 1.0 - (w_dist / max(len(norm_query), len(w)))
                        if w_sim >= 0.75:
                            score = max(score, 130.0 * w_sim)
                            break

                if score == 0.0:
                    for al in norm_aliases:
                        if len(al) >= 3:
                            alias_dist = _levenshtein_distance(norm_query, al)
                            alias_max_len = max(len(norm_query), len(al))
                            alias_sim = 1.0 - (alias_dist / alias_max_len)
                            if alias_sim >= 0.75:
                                score = max(score, 120.0 * alias_sim)
                                break
                            for aw in al.split():
                                if len(aw) >= 4:
                                    aw_dist = _levenshtein_distance(norm_query, aw)
                                    aw_sim = 1.0 - (aw_dist / max(len(norm_query), len(aw)))
                                    if aw_sim >= 0.75:
                                        score = max(score, 110.0 * aw_sim)
                                        break

        if score > 0.0:
            scored.append((area, score))

    scored.sort(key=lambda item: (-item[1], item[0].name))
    results = [item[0] for item in scored]

    if limit is not None:
        if limit <= 0:
            return []
        return results[:limit]

    return results
