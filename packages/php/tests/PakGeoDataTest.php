<?php

declare(strict_types=1);

namespace PakGeoData\Tests;

use PHPUnit\Framework\TestCase;
use PakGeoData\Geo;
use PakGeoData\PakGeoData;
use PakGeoData\Models\Coordinates;
use PakGeoData\Models\Province;
use PakGeoData\Models\City;
use PakGeoData\Models\Area;
use PakGeoData\Models\NearestAreaResult;

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
