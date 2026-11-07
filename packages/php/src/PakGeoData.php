<?php

declare(strict_types=1);

namespace PakGeoData;

use PakGeoData\Models\Area;
use PakGeoData\Models\City;
use PakGeoData\Models\CityBounds;
use PakGeoData\Models\Coordinates;
use PakGeoData\Models\NearestAreaResult;
use PakGeoData\Models\Province;

final class PakGeoData
{
    /** @var array<Province>|null */
    private static ?array $provinces = null;

    /** @var array<string, Province>|null */
    private static ?array $provincesById = null;

    /** @var array<City>|null */
    private static ?array $cities = null;

    /** @var array<string, City>|null */
    private static ?array $citiesById = null;

    /** @var array<string, array<City>>|null */
    private static ?array $citiesByProvince = null;

    /** @var array<Area>|null */
    private static ?array $areas = null;

    /** @var array<string, Area>|null */
    private static ?array $areasById = null;

    /** @var array<string, array<Area>>|null */
    private static ?array $areasByCity = null;

    /** @var array<string, array<Area>>|null */
    private static ?array $areasByPostalCode = null;

    private function __construct() {}

    /**
     * Returns all verified provinces and administrative territories of Pakistan.
     *
     * @return array<Province>
     */
    public static function getAllProvinces(): array
    {
        self::ensureProvincesLoaded();
        return self::$provinces;
    }

    /**
     * Finds a province by its unique identifier (e.g. "punjab", "sindh", "islamabad-ict").
     * Lookup is case-insensitive.
     */
    public static function getProvinceById(string $id): ?Province
    {
        self::ensureProvincesLoaded();
        $key = strtolower(trim($id));
        return self::$provincesById[$key] ?? null;
    }

    /**
     * Returns all verified cities in Pakistan.
     *
     * @return array<City>
     */
    public static function getAllCities(): array
    {
        self::ensureCitiesLoaded();
        return self::$cities;
    }

    /**
     * Finds a city by its unique identifier (e.g. "lahore", "karachi", "islamabad").
     * Lookup is case-insensitive.
     */
    public static function getCityById(string $id): ?City
    {
        self::ensureCitiesLoaded();
        $key = strtolower(trim($id));
        return self::$citiesById[$key] ?? null;
    }

    /**
     * Returns all cities within a given province identifier.
     * Lookup is case-insensitive.
     *
     * @return array<City>
     */
    public static function getCitiesByProvince(string $provinceId): array
    {
        self::ensureCitiesLoaded();
        $key = strtolower(trim($provinceId));
        return self::$citiesByProvince[$key] ?? [];
    }

    /**
     * Returns all verified areas across Pakistan.
     *
     * @return array<Area>
     */
    public static function getAllAreas(): array
    {
        self::ensureAreasLoaded();
        return self::$areas;
    }

    /**
     * Returns all verified areas within a given city identifier.
     * Lookup is case-insensitive.
     *
     * @return array<Area>
     */
    public static function getAreasByCity(string $cityId): array
    {
        self::ensureAreasLoaded();
        $key = strtolower(trim($cityId));
        return self::$areasByCity[$key] ?? [];
    }

    /**
     * Finds an area by its unique identifier (e.g. "lahore-dha-phase-5").
     * Lookup is case-insensitive.
     */
    public static function getAreaById(string $id): ?Area
    {
        self::ensureAreasLoaded();
        $key = strtolower(trim($id));
        return self::$areasById[$key] ?? null;
    }

    /**
     * Resolves the primary area associated with a 5-digit Pakistan Post postal code.
     */
    public static function findAreaByPostalCode(string|int $postalCode): ?Area
    {
        self::ensureAreasLoaded();
        $code = trim((string) $postalCode);
        if ($code === '') {
            return null;
        }
        return self::$areasByPostalCode[$code][0] ?? null;
    }

    /**
     * Returns all areas sharing a given 5-digit Pakistan Post postal code.
     *
     * @return array<Area>
     */
    public static function findAreasByPostalCode(string|int $postalCode): array
    {
        self::ensureAreasLoaded();
        $code = trim((string) $postalCode);
        if ($code === '') {
            return [];
        }
        return self::$areasByPostalCode[$code] ?? [];
    }

    /**
     * Calculates the great-circle Haversine distance in kilometers between two coordinates.
     */
    public static function haversineDistanceKm(Coordinates $c1, Coordinates $c2): float
    {
        return Geo::haversineDistanceKm($c1, $c2);
    }

    /**
     * Finds the nearest verified area to given coordinates.
     * Can optionally be filtered by cityId and/or provinceId, or constrained by maxRadiusKm.
     */
    public static function getNearestArea(
        Coordinates $coords,
        ?string $cityId = null,
        ?float $maxRadiusKm = null,
        ?string $provinceId = null
    ): ?NearestAreaResult {
        $candidates = $cityId !== null
            ? self::getAreasByCity($cityId)
            : self::getAllAreas();

        if ($provinceId !== null) {
            $pId = strtolower(trim($provinceId));
            $candidates = array_values(array_filter(
                $candidates,
                static fn(Area $a): bool => strtolower($a->provinceId) === $pId
            ));
        }

        if (empty($candidates)) {
            return null;
        }

        $nearest = null;
        $minDistance = INF;

        foreach ($candidates as $area) {
            $dist = Geo::haversineDistanceKm($coords, $area->coordinates);
            if ($dist < $minDistance) {
                $minDistance = $dist;
                $nearest = $area;
            }
        }

        if ($nearest === null) {
            return null;
        }

        if ($maxRadiusKm !== null && $minDistance > $maxRadiusKm) {
            return null;
        }

        return new NearestAreaResult($nearest, $minDistance);
    }

    /**
     * Lazily loads and indexes province datasets.
     */
    private static function ensureProvincesLoaded(): void
    {
        if (self::$provinces !== null) {
            return;
        }

        /** @var array<array<string, mixed>> $raw */
        $raw = require __DIR__ . '/Data/Provinces.php';
        $provinces = [];
        $provincesById = [];

        foreach ($raw as $item) {
            $province = new Province(
                id: (string) $item['id'],
                name: (string) $item['name'],
                urduName: (string) $item['urduName'],
                capitalCityId: (string) $item['capitalCityId'],
                type: (string) $item['type']
            );

            $provinces[] = $province;
            $provincesById[strtolower(trim($province->id))] = $province;
        }

        self::$provinces = $provinces;
        self::$provincesById = $provincesById;
    }

    /**
     * Lazily loads and indexes city datasets.
     */
    private static function ensureCitiesLoaded(): void
    {
        if (self::$cities !== null) {
            return;
        }

        /** @var array<array<string, mixed>> $raw */
        $raw = require __DIR__ . '/Data/Cities.php';
        $cities = [];
        $citiesById = [];
        $citiesByProvince = [];

        foreach ($raw as $item) {
            /** @var array{lat: float, lng: float} $coordRaw */
            $coordRaw = $item['coordinates'];
            $coordinates = new Coordinates((float) $coordRaw['lat'], (float) $coordRaw['lng']);

            $bounds = null;
            if (!empty($item['bounds'])) {
                /** @var array{minLat: float, maxLat: float, minLng: float, maxLng: float} $bRaw */
                $bRaw = $item['bounds'];
                $bounds = new CityBounds(
                    minLat: (float) $bRaw['minLat'],
                    maxLat: (float) $bRaw['maxLat'],
                    minLng: (float) $bRaw['minLng'],
                    maxLng: (float) $bRaw['maxLng']
                );
            }

            $city = new City(
                id: (string) $item['id'],
                name: (string) $item['name'],
                urduName: (string) $item['urduName'],
                provinceId: (string) $item['provinceId'],
                coordinates: $coordinates,
                totalAreasCount: (int) $item['totalAreasCount'],
                division: isset($item['division']) ? (string) $item['division'] : null,
                district: isset($item['district']) ? (string) $item['district'] : null,
                bounds: $bounds,
                postalCodeRange: isset($item['postalCodeRange']) ? (array) $item['postalCodeRange'] : null
            );

            $cities[] = $city;
            $citiesById[strtolower(trim($city->id))] = $city;
            $citiesByProvince[strtolower(trim($city->provinceId))][] = $city;
        }

        self::$cities = $cities;
        self::$citiesById = $citiesById;
        self::$citiesByProvince = $citiesByProvince;
    }

    /**
     * Lazily loads and indexes area datasets.
     */
    private static function ensureAreasLoaded(): void
    {
        if (self::$areas !== null) {
            return;
        }

        /** @var array<array<string, mixed>> $raw */
        $raw = require __DIR__ . '/Data/Areas.php';
        $areas = [];
        $areasById = [];
        $areasByCity = [];
        $areasByPostalCode = [];

        foreach ($raw as $item) {
            /** @var array{lat: float, lng: float} $coordRaw */
            $coordRaw = $item['coordinates'];
            $coordinates = new Coordinates((float) $coordRaw['lat'], (float) $coordRaw['lng']);

            $area = new Area(
                id: (string) $item['id'],
                cityId: (string) $item['cityId'],
                provinceId: (string) $item['provinceId'],
                name: (string) $item['name'],
                coordinates: $coordinates,
                urduName: isset($item['urduName']) ? (string) $item['urduName'] : null,
                postalCode: isset($item['postalCode']) ? (string) $item['postalCode'] : null,
                aliases: isset($item['aliases']) ? (array) $item['aliases'] : [],
                type: isset($item['type']) ? (string) $item['type'] : null,
                verified: (bool) ($item['verified'] ?? false),
                sources: isset($item['sources']) ? (array) $item['sources'] : []
            );

            $areas[] = $area;
            $areasById[strtolower(trim($area->id))] = $area;
            $areasByCity[strtolower(trim($area->cityId))][] = $area;

            if ($area->postalCode !== null && $area->postalCode !== '') {
                $code = trim($area->postalCode);
                $areasByPostalCode[$code][] = $area;
            }
        }

        self::$areas = $areas;
        self::$areasById = $areasById;
        self::$areasByCity = $areasByCity;
        self::$areasByPostalCode = $areasByPostalCode;
    }
}
