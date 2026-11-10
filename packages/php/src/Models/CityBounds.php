<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class CityBounds
{
    public function __construct(
        public readonly float $minLat,
        public readonly float $maxLat,
        public readonly float $minLng,
        public readonly float $maxLng
    ) {}
}
