<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Coordinates
{
    public function __construct(
        public readonly float $lat,
        public readonly float $lng
    ) {}

    public function toArray(): array
    {
        return ['lat' => $this->lat, 'lng' => $this->lng];
    }
}
