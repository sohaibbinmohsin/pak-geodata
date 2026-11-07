<?php

declare(strict_types=1);

namespace PakGeoData;

use PakGeoData\Models\Coordinates;

final class Geo
{
    public const EARTH_RADIUS_KM = 6371.0088;

    public static function haversineDistanceKm(Coordinates $c1, Coordinates $c2): float
    {
        if ($c1->lat === $c2->lat && $c1->lng === $c2->lng) {
            return 0.0;
        }

        $dLat = deg2rad($c2->lat - $c1->lat);
        $dLng = deg2rad($c2->lng - $c1->lng);

        $lat1Rad = deg2rad($c1->lat);
        $lat2Rad = deg2rad($c2->lat);

        $a = sin($dLat / 2.0) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * (sin($dLng / 2.0) ** 2);

        // Clamp antipodal precision
        if ($a > 1.0) {
            $a = 1.0;
        } elseif ($a < 0.0) {
            $a = 0.0;
        }

        $c = 2.0 * atan2(sqrt($a), sqrt(1.0 - $a));
        return self::EARTH_RADIUS_KM * $c;
    }
}
