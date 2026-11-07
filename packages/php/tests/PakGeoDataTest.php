<?php

declare(strict_types=1);

namespace PakGeoData\Tests;

if (file_exists(dirname(__DIR__) . '/vendor/autoload.php')) {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
} else {
    spl_autoload_register(static function (string $class): void {
        $prefix = 'PakGeoData\\';
        if (str_starts_with($class, $prefix)) {
            $file = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, 11)) . '.php';
            if (file_exists($file)) {
                require_once $file;
            }
        }
    });
}

if (!class_exists(\PHPUnit\Framework\TestCase::class)) {
    class FallbackTestCase
    {
        public function __construct(?string $name = null)
        {
        }

        public function assertSame(mixed $expected, mixed $actual, string $message = ''): void
        {
            if ($expected !== $actual) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that ' . var_export($actual, true) . ' is identical to ' . var_export($expected, true)
                );
            }
        }

        public function assertEquals(mixed $expected, mixed $actual, string $message = ''): void
        {
            if ($expected != $actual) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that ' . var_export($actual, true) . ' is equal to ' . var_export($expected, true)
                );
            }
        }

        public function assertTrue(mixed $condition, string $message = ''): void
        {
            if ($condition !== true) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that condition is true'
                );
            }
        }

        public function assertFalse(mixed $condition, string $message = ''): void
        {
            if ($condition !== false) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that condition is false'
                );
            }
        }

        public function assertNull(mixed $actual, string $message = ''): void
        {
            if ($actual !== null) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that ' . var_export($actual, true) . ' is null'
                );
            }
        }

        public function assertNotNull(mixed $actual, string $message = ''): void
        {
            if ($actual === null) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that value is not null'
                );
            }
        }

        public function assertNotEmpty(mixed $actual, string $message = ''): void
        {
            if (empty($actual)) {
                throw new \AssertionError(
                    $message !== '' ? $message : 'Failed asserting that value is not empty'
                );
            }
        }

        public function assertCount(int $expectedCount, \Countable|iterable $countable, string $message = ''): void
        {
            $actualCount = is_countable($countable) ? count($countable) : (is_array($countable) ? count($countable) : iterator_count($countable));
            if ($actualCount !== $expectedCount) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf('Failed asserting that actual size %d matches expected size %d', $actualCount, $expectedCount)
                );
            }
        }

        public function assertContainsOnlyInstancesOf(string $className, iterable $traversable, string $message = ''): void
        {
            foreach ($traversable as $item) {
                if (!($item instanceof $className)) {
                    throw new \AssertionError(
                        $message !== '' ? $message : sprintf('Failed asserting that element of type %s is an instance of %s', get_debug_type($item), $className)
                    );
                }
            }
        }

        public function assertInstanceOf(string $expected, mixed $actual, string $message = ''): void
        {
            if (!($actual instanceof $expected)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf('Failed asserting that %s is an instance of %s', get_debug_type($actual), $expected)
                );
            }
        }

        public function assertGreaterThan(mixed $expected, mixed $actual, string $message = ''): void
        {
            if (!($actual > $expected)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf('Failed asserting that %s is greater than %s', var_export($actual, true), var_export($expected, true))
                );
            }
        }

        public function assertLessThan(mixed $expected, mixed $actual, string $message = ''): void
        {
            if (!($actual < $expected)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf('Failed asserting that %s is less than %s', var_export($actual, true), var_export($expected, true))
                );
            }
        }

        public function assertLessThanOrEqual(mixed $expected, mixed $actual, string $message = ''): void
        {
            if (!($actual <= $expected)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf('Failed asserting that %s is less than or equal to %s', var_export($actual, true), var_export($expected, true))
                );
            }
        }

        public function assertStringStartsWith(string $prefix, string $string, string $message = ''): void
        {
            if (!str_starts_with($string, $prefix)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf("Failed asserting that '%s' starts with '%s'", $string, $prefix)
                );
            }
        }

        public function assertStringContainsString(string $needle, string $haystack, string $message = ''): void
        {
            if (!str_contains($haystack, $needle)) {
                throw new \AssertionError(
                    $message !== '' ? $message : sprintf("Failed asserting that '%s' contains '%s'", $haystack, $needle)
                );
            }
        }
    }

    class_alias(FallbackTestCase::class, 'PHPUnit\\Framework\\TestCase');
}

use PHPUnit\Framework\TestCase;
use PakGeoData\Geo;
use PakGeoData\PakGeoData;
use PakGeoData\Search;
use PakGeoData\Models\Coordinates;
use PakGeoData\Models\Province;
use PakGeoData\Models\City;
use PakGeoData\Models\Area;
use PakGeoData\Models\NearestAreaResult;
use PakGeoData\Models\SearchResult;

final class PakGeoDataTest extends TestCase
{
    public function testDatasetCounts(): void
    {
        $provinces = PakGeoData::getAllProvinces();
        $this->assertCount(7, $provinces);
        $this->assertContainsOnlyInstancesOf(Province::class, $provinces);

        $cities = PakGeoData::getAllCities();
        $this->assertCount(79, $cities);
        $this->assertContainsOnlyInstancesOf(City::class, $cities);

        $areas = PakGeoData::getAllAreas();
        $this->assertCount(3953, $areas);
        $this->assertContainsOnlyInstancesOf(Area::class, $areas);
    }

    public function testProvinceLookups(): void
    {
        $punjab = PakGeoData::getProvinceById('punjab');
        $this->assertNotNull($punjab);
        $this->assertSame('punjab', $punjab->id);
        $this->assertSame('Punjab', $punjab->name);
        $this->assertSame('پنجاب', $punjab->urduName);
        $this->assertSame('lahore', $punjab->capitalCityId);

        // Case-insensitivity and whitespace trimming
        $punjabUpper = PakGeoData::getProvinceById('  PUNJAB  ');
        $this->assertNotNull($punjabUpper);
        $this->assertSame('punjab', $punjabUpper->id);

        $nonExistent = PakGeoData::getProvinceById('invalid-province');
        $this->assertNull($nonExistent);
    }

    public function testCityLookups(): void
    {
        $lahore = PakGeoData::getCityById('lahore');
        $this->assertNotNull($lahore);
        $this->assertSame('lahore', $lahore->id);
        $this->assertSame('Lahore', $lahore->name);
        $this->assertSame('punjab', $lahore->provinceId);
        $this->assertNotNull($lahore->coordinates);
        $this->assertNotNull($lahore->bounds);

        // Case-insensitive lookup
        $lahoreUpper = PakGeoData::getCityById('LAHORE');
        $this->assertNotNull($lahoreUpper);
        $this->assertSame('lahore', $lahoreUpper->id);

        // Cities by province
        $punjabCities = PakGeoData::getCitiesByProvince('punjab');
        $this->assertNotEmpty($punjabCities);
        foreach ($punjabCities as $city) {
            $this->assertSame('punjab', $city->provinceId);
        }

        // Case-insensitive province id
        $punjabCitiesUpper = PakGeoData::getCitiesByProvince('PUNJAB');
        $this->assertSame(count($punjabCities), count($punjabCitiesUpper));

        $nonExistentCity = PakGeoData::getCityById('invalid-city');
        $this->assertNull($nonExistentCity);

        $emptyCities = PakGeoData::getCitiesByProvince('invalid-province');
        $this->assertSame([], $emptyCities);
    }

    public function testAreaLookups(): void
    {
        $dha5 = PakGeoData::getAreaById('lahore-dha-phase-5');
        $this->assertNotNull($dha5);
        $this->assertSame('lahore-dha-phase-5', $dha5->id);
        $this->assertSame('lahore', $dha5->cityId);
        $this->assertSame('punjab', $dha5->provinceId);
        $this->assertSame('DHA Phase 5', $dha5->name);
        $this->assertSame('54792', $dha5->postalCode);

        // Case-insensitive lookup
        $dha5Upper = PakGeoData::getAreaById('LAHORE-DHA-PHASE-5');
        $this->assertNotNull($dha5Upper);
        $this->assertSame('lahore-dha-phase-5', $dha5Upper->id);

        // Areas by city
        $lahoreAreas = PakGeoData::getAreasByCity('lahore');
        $this->assertNotEmpty($lahoreAreas);
        foreach ($lahoreAreas as $area) {
            $this->assertSame('lahore', $area->cityId);
        }

        // Case-insensitive city id
        $lahoreAreasUpper = PakGeoData::getAreasByCity('LAHORE');
        $this->assertSame(count($lahoreAreas), count($lahoreAreasUpper));

        $nonExistentArea = PakGeoData::getAreaById('invalid-area');
        $this->assertNull($nonExistentArea);

        $emptyAreas = PakGeoData::getAreasByCity('invalid-city');
        $this->assertSame([], $emptyAreas);
    }

    public function testPostalCodeLookups(): void
    {
        // 54000 primary area resolution (Lahore Walled City / Old City)
        $area54000 = PakGeoData::findAreaByPostalCode('54000');
        $this->assertNotNull($area54000);
        $this->assertSame('54000', $area54000->postalCode);
        $this->assertSame('lahore', $area54000->cityId);
        $this->assertSame('lahore-walled-city', $area54000->id);

        // Integer postal code support
        $area54000Int = PakGeoData::findAreaByPostalCode(54000);
        $this->assertNotNull($area54000Int);
        $this->assertSame($area54000->id, $area54000Int->id);

        // Multiple areas sharing postal code 54000
        $areas54000 = PakGeoData::findAreasByPostalCode('54000');
        $this->assertGreaterThan(1, count($areas54000));
        foreach ($areas54000 as $a) {
            $this->assertSame('54000', $a->postalCode);
        }

        // Integer support for findAreasByPostalCode
        $areas54000Int = PakGeoData::findAreasByPostalCode(54000);
        $this->assertSame(count($areas54000), count($areas54000Int));

        // DHA Lahore postal code 54792
        $dhaArea = PakGeoData::findAreaByPostalCode('54792');
        $this->assertNotNull($dhaArea);
        $this->assertSame('lahore', $dhaArea->cityId);

        // Clifton Karachi postal code 75600
        $clifton = PakGeoData::findAreaByPostalCode('75600');
        $this->assertNotNull($clifton);
        $this->assertSame('karachi', $clifton->cityId);

        // Non-existent postal code
        $missing = PakGeoData::findAreaByPostalCode('99999');
        $this->assertNull($missing);

        $missingList = PakGeoData::findAreasByPostalCode('99999');
        $this->assertSame([], $missingList);
    }

    public function testHaversineDistanceKm(): void
    {
        $lahore = new Coordinates(31.5204, 74.3587);
        $karachi = new Coordinates(24.8607, 67.0011);

        // Distance to self is 0
        $this->assertSame(0.0, Geo::haversineDistanceKm($lahore, $lahore));
        $this->assertSame(0.0, PakGeoData::haversineDistanceKm($lahore, $lahore));

        // Distance between Lahore and Karachi is approx 1025 - 1035 km
        $dist = Geo::haversineDistanceKm($lahore, $karachi);
        $this->assertGreaterThan(1020.0, $dist);
        $this->assertLessThan(1040.0, $dist);

        // PakGeoData static delegate matches Geo
        $this->assertSame($dist, PakGeoData::haversineDistanceKm($lahore, $karachi));
    }

    public function testGetNearestArea(): void
    {
        // Centroid very close to DHA Phase 5 Lahore
        $dha5Coords = new Coordinates(31.4581, 74.4121);
        $nearestDha = PakGeoData::getNearestArea($dha5Coords);
        $this->assertNotNull($nearestDha);
        $this->assertInstanceOf(NearestAreaResult::class, $nearestDha);
        $this->assertSame('lahore-dha-phase-5', $nearestDha->area->id);
        $this->assertLessThan(0.1, $nearestDha->distanceKm);

        // Vicinity of DHA Phase 5 / State Life Phase 2
        $stateLifeCoords = new Coordinates(31.4697, 74.4133);
        $nearestStateLife = PakGeoData::getNearestArea($stateLifeCoords);
        $this->assertNotNull($nearestStateLife);
        $this->assertSame('lahore-state-life-phase-2', $nearestStateLife->area->id);
        $this->assertLessThan(0.5, $nearestStateLife->distanceKm);

        // Filter by cityId: query from Lahore targeting Islamabad
        $lahoreCoords = new Coordinates(31.4698, 74.3985);
        $nearestIsb = PakGeoData::getNearestArea($lahoreCoords, cityId: 'islamabad');
        $this->assertNotNull($nearestIsb);
        $this->assertSame('islamabad', $nearestIsb->area->cityId);

        // Filter by cityId with maxRadiusKm: should return null when distance exceeds maxRadiusKm
        $nearestIsbConstrained = PakGeoData::getNearestArea(
            $lahoreCoords,
            cityId: 'islamabad',
            maxRadiusKm: 10.0
        );
        $this->assertNull($nearestIsbConstrained);

        // Filter by provinceId: query from Lahore coords targeting Sindh
        $nearestSindh = PakGeoData::getNearestArea($lahoreCoords, provinceId: 'sindh');
        $this->assertNotNull($nearestSindh);
        $this->assertSame('sindh', $nearestSindh->area->provinceId);

        // Non-existent city filter returns null
        $nonExistentCity = PakGeoData::getNearestArea($lahoreCoords, cityId: 'non-existent-city');
        $this->assertNull($nonExistentCity);
    }

    public function testUrduNormalization(): void
    {
        // Diacritics stripping (Tashkeel and Tatweel)
        $withDiacritics = 'گُلبَرگ';
        $this->assertSame('گلبرگ', Search::stripDiacritics($withDiacritics));
        $this->assertSame('گلبرگ', Search::normalizeUrduText($withDiacritics));
        $this->assertSame('گلبرگ', PakGeoData::normalizeUrduText($withDiacritics));

        // Eastern Arabic-Indic digits (۰-۹) to Western ASCII digits (0-9)
        $easternDigits = '۰۱۲۳۴۵۶۷۸۹';
        $this->assertSame('0123456789', Search::toWesternDigits($easternDigits));

        // Standard Arabic-Indic digits (٠-٩) to Western ASCII digits (0-9)
        $arabicDigits = '٠١٢٣٤٥٦٧۸۹';
        // Note: ٠١٢٣٤٥٦٧٨٩
        $this->assertSame('0123456789', Search::toWesternDigits('٠١٢٣٤٥٦٧٨٩'));

        // Letter normalizations: Alef, Yeh, Kaf, Heh
        $variations = 'آكےة';
        $this->assertSame('اکیہ', Search::normalizeUrduText($variations));
        $this->assertSame('اکیہ', PakGeoData::normalizeUrduText($variations));

        // Unify Alef variants [آأإٱ] -> ا
        $alefVariants = 'آأإٱ';
        $this->assertSame('اااا', Search::normalizeUrduText($alefVariants));

        // Unify Yeh variants [يىئے] -> ی
        $yehVariants = 'يىئے';
        $this->assertSame('یییی', Search::normalizeUrduText($yehVariants));

        // Unify Kaf variants [ك] -> ک
        $this->assertSame('ک', Search::normalizeUrduText('ك'));

        // Mixed text with whitespace and eastern digits
        $mixed = '  گلبرگ    ۳  ';
        $this->assertSame('گلبرگ 3', PakGeoData::normalizeUrduText($mixed));
        $this->assertSame('لاہور', PakGeoData::normalizeUrduText('  لاہور  '));
        $this->assertSame('', PakGeoData::normalizeUrduText(''));
    }

    public function testSearchAreas(): void
    {
        // 1. Urdu query "گلبرگ" in Lahore -> resolves top match lahore-gulberg
        $urduResults = PakGeoData::searchAreas('گلبرگ', cityId: 'lahore');
        $this->assertNotEmpty($urduResults);
        $this->assertContainsOnlyInstancesOf(SearchResult::class, $urduResults);
        $this->assertStringStartsWith('lahore-gulberg', $urduResults[0]->area->id);
        $this->assertSame('lahore', $urduResults[0]->area->cityId);
        $this->assertGreaterThan(0.0, $urduResults[0]->score);

        // 2. Colloquial alias "dha 5" in Lahore -> resolves lahore-dha-phase-5
        $dhaResults = PakGeoData::searchAreas('dha 5', cityId: 'lahore');
        $this->assertNotEmpty($dhaResults);
        $this->assertSame('lahore-dha-phase-5', $dhaResults[0]->area->id);

        // 3. Colloquial alias "pindi" resolves Rawalpindi areas
        $pindiResults = PakGeoData::searchAreas('pindi', limit: 5);
        $this->assertNotEmpty($pindiResults);
        $this->assertLessThanOrEqual(5, count($pindiResults));
        foreach ($pindiResults as $r) {
            $this->assertSame('rawalpindi', $r->area->cityId);
        }

        // Additional city colloquial aliases
        $isbResults = PakGeoData::searchAreas('isb', limit: 5);
        $this->assertNotEmpty($isbResults);
        foreach ($isbResults as $r) {
            $this->assertSame('islamabad', $r->area->cityId);
        }

        $lheResults = PakGeoData::searchAreas('lhe', limit: 5);
        $this->assertNotEmpty($lheResults);
        foreach ($lheResults as $r) {
            $this->assertSame('lahore', $r->area->cityId);
        }

        $khiResults = PakGeoData::searchAreas('khi', limit: 5);
        $this->assertNotEmpty($khiResults);
        foreach ($khiResults as $r) {
            $this->assertSame('karachi', $r->area->cityId);
        }

        // 4. Postal code query "54000" matches
        $postalResults = PakGeoData::searchAreas('54000');
        $this->assertNotEmpty($postalResults);
        $matched54000 = false;
        foreach ($postalResults as $r) {
            if ($r->area->postalCode === '54000' && $r->area->cityId === 'lahore') {
                $matched54000 = true;
                break;
            }
        }
        $this->assertTrue($matched54000, 'Expected searchAreas("54000") to match Lahore area with postal code 54000');

        // 5. Typo / fuzzy matching: "gulbrg" matches gulberg
        $fuzzyResults = PakGeoData::searchAreas('gulbrg', cityId: 'lahore');
        $this->assertNotEmpty($fuzzyResults);
        $this->assertStringContainsString('gulberg', $fuzzyResults[0]->area->id);

        // Typo "Gulbarg"
        $fuzzyResults2 = PakGeoData::searchAreas('Gulbarg', cityId: 'lahore');
        $this->assertNotEmpty($fuzzyResults2);
        $this->assertStringContainsString('gulberg', $fuzzyResults2[0]->area->id);

        // 6. Exact match ranking: "Gulberg II"
        $exactResults = PakGeoData::searchAreas('Gulberg II', cityId: 'lahore');
        $this->assertNotEmpty($exactResults);
        $this->assertSame('lahore-gulberg-2', $exactResults[0]->area->id);
        $this->assertSame(1000.0, $exactResults[0]->score);
        $this->assertSame('exact', $exactResults[0]->matchType);

        // 7. Scoping by cityId and provinceId
        $isbDha = PakGeoData::searchAreas('dha 2', cityId: 'islamabad');
        $this->assertNotEmpty($isbDha);
        $this->assertSame('islamabad', $isbDha[0]->area->cityId);

        $sindhDha = PakGeoData::searchAreas('dha', provinceId: 'sindh', limit: 5);
        $this->assertNotEmpty($sindhDha);
        foreach ($sindhDha as $r) {
            $this->assertSame('sindh', $r->area->provinceId);
        }

        // 8. Empty, whitespace, invalid city filters, and limit 0
        $this->assertSame([], PakGeoData::searchAreas(''));
        $this->assertSame([], PakGeoData::searchAreas('   '));
        $this->assertSame([], PakGeoData::searchAreas('dha', limit: 0));
        $this->assertSame([], PakGeoData::searchAreas('dha', cityId: 'non-existent-city'));

        // Static delegate parity: Search::searchAreas matches PakGeoData::searchAreas
        $direct = Search::searchAreas('dha 5', cityId: 'lahore');
        $delegated = PakGeoData::searchAreas('dha 5', cityId: 'lahore');
        $this->assertCount(count($direct), $delegated);
        $this->assertSame($direct[0]->area->id, $delegated[0]->area->id);
    }

    public function testCrossLanguageGoldenVectorsSearch(): void
    {
        $urduSearches = [
            ['query' => 'گلبرگ', 'mustMatchKeyword' => 'gulberg'],
            ['query' => 'صدر', 'mustMatchKeyword' => 'saddar'],
            ['query' => 'ڈی ایچ اے', 'mustMatchKeyword' => 'dha'],
        ];

        foreach ($urduSearches as $v) {
            $res = PakGeoData::searchAreas($v['query'], limit: 5);
            $this->assertNotEmpty($res, "Expected results for {$v['query']}");
            $matched = false;
            foreach ($res as $r) {
                if (str_contains(strtolower($r->area->id), $v['mustMatchKeyword']) ||
                    str_contains(strtolower($r->area->name), $v['mustMatchKeyword'])) {
                    $matched = true;
                    break;
                }
            }
            $this->assertTrue($matched, "Expected {$v['query']} to match {$v['mustMatchKeyword']}");
        }

        $colloquialAliases = [
            ['alias' => 'isb', 'expectedCityId' => 'islamabad'],
            ['alias' => 'lhe', 'expectedCityId' => 'lahore'],
            ['alias' => 'khi', 'expectedCityId' => 'karachi'],
            ['alias' => 'pindi', 'expectedCityId' => 'rawalpindi'],
        ];

        foreach ($colloquialAliases as $v) {
            $res = PakGeoData::searchAreas($v['alias'], limit: 5);
            $this->assertNotEmpty($res, "Expected results for {$v['alias']}");
            foreach ($res as $r) {
                $this->assertSame($v['expectedCityId'], $r->area->cityId);
            }
        }
    }
}

// Standalone runner execution fallback if invoked directly via PHP CLI without phpunit binary
if (!defined('PHPUNIT_COMPOSER_INSTALL') && !class_exists(\PHPUnit\TextUI\Application::class, false)) {
    echo "Running PakGeoDataTest standalone...\n";
    $test = new PakGeoDataTest('standalone');
    $methods = get_class_methods($test);
    $passed = 0;
    $failed = 0;

    foreach ($methods as $method) {
        if (str_starts_with($method, 'test')) {
            try {
                $test->$method();
                echo "  ✔ {$method}\n";
                $passed++;
            } catch (\Throwable $e) {
                echo "  ✖ {$method}: " . $e->getMessage() . "\n";
                echo $e->getTraceAsString() . "\n";
                $failed++;
            }
        }
    }

    echo "\nResults: {$passed} passed, {$failed} failed.\n";
    if ($failed > 0) {
        exit(1);
    }
}
