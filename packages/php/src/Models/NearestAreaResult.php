<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class NearestAreaResult
{
    public function __construct(
        public readonly Area $area,
        public readonly float $distanceKm
    ) {}
}
