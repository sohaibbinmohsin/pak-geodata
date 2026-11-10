<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class City
{
    /**
     * @param array<string>|null $postalCodeRange
     */
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $urduName,
        public readonly string $provinceId,
        public readonly Coordinates $coordinates,
        public readonly int $totalAreasCount,
        public readonly ?string $division = null,
        public readonly ?string $district = null,
        public readonly ?CityBounds $bounds = null,
        public readonly ?array $postalCodeRange = null
    ) {}
}
