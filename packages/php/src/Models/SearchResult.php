<?php

declare(strict_types=1);

namespace PakGeoData\Models;

final class SearchResult
{
    public function __construct(
        public readonly Area $area,
        public readonly float $score,
        public readonly string $matchType = 'exact'
    ) {}
}
