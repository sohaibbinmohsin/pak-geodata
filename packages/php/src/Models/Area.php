<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class Area
{
    /**
     * @param array<string> $aliases
     * @param array<string> $sources
     */
    public function __construct(
        public readonly string $id,
        public readonly string $cityId,
        public readonly string $provinceId,
        public readonly string $name,
        public readonly Coordinates $coordinates,
        public readonly ?string $urduName = null,
        public readonly ?string $postalCode = null,
        public readonly array $aliases = [],
        public readonly ?string $type = null,
        public readonly bool $verified = false,
        public readonly array $sources = []
    ) {}
}
