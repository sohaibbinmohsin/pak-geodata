<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Province
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $urduName,
        public readonly string $capitalCityId,
        public readonly string $type
    ) {}
}
