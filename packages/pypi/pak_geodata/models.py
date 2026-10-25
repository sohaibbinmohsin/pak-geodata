"""Data models for Pakistan geographic entities.

All models are immutable (frozen) typed dataclasses with zero external runtime dependencies.
"""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class Coordinates:
    """Geographic coordinates in WGS 84 decimal degrees."""

    lat: float
    lng: float


@dataclass(frozen=True)
class CityBounds:
    """Bounding box for a city."""

    min_lat: float
    max_lat: float
    min_lng: float
    max_lng: float

    @property
    def minLat(self) -> float:
        return self.min_lat

    @property
    def maxLat(self) -> float:
        return self.max_lat

    @property
    def minLng(self) -> float:
        return self.min_lng

    @property
    def maxLng(self) -> float:
        return self.max_lng


@dataclass(frozen=True)
class PakistanProvince:
    """Administrative province or territory of Pakistan."""

    id: str
    name: str
    urdu_name: str
    capital_city_id: str
    type: str = "province"

    @property
    def urduName(self) -> str:
        return self.urdu_name

    @property
    def capitalCityId(self) -> str:
        return self.capital_city_id


@dataclass(frozen=True)
class PakistanCity:
    """City in Pakistan with district, coordinates, and bounding box."""

    id: str
    name: str
    urdu_name: str
    province_id: str
    district: str
    coordinates: Coordinates
    division: Optional[str] = None
    postal_code_range: Optional[List[str]] = None
    bounds: Optional[CityBounds] = None
    total_areas_count: int = 0

    @property
    def urduName(self) -> str:
        return self.urdu_name

    @property
    def provinceId(self) -> str:
        return self.province_id

    @property
    def postalCodeRange(self) -> Optional[List[str]]:
        return self.postal_code_range

    @property
    def totalAreasCount(self) -> int:
        return self.total_areas_count


@dataclass(frozen=True)
class PakistanArea:
    """Specific neighborhood, suburb, society, or sector within a Pakistani city."""

    id: str
    city_id: str
    province_id: str
    name: str
    aliases: List[str] = field(default_factory=list)
    coordinates: Optional[Coordinates] = None
    urdu_name: Optional[str] = None
    postal_code: Optional[str] = None
    type: Optional[str] = None
    verified: bool = False
    sources: List[str] = field(default_factory=list)

    @property
    def cityId(self) -> str:
        return self.city_id

    @property
    def provinceId(self) -> str:
        return self.province_id

    @property
    def urduName(self) -> Optional[str]:
        return self.urdu_name

    @property
    def postalCode(self) -> Optional[str]:
        return self.postal_code
