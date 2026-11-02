import type { PakistanArea } from 'pak-geodata';

export interface ClusterBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface AreaCluster {
  id: string;
  center: { lat: number; lng: number };
  bounds: ClusterBounds;
  areas: PakistanArea[];
  count: number;
  hasSelected: boolean;
}

export interface PixelPoint {
  x: number;
  y: number;
}

/**
 * Groups areas whose screen projections are within clusterRadiusPx into clusters.
 * If an area has no other areas within clusterRadiusPx, it forms a cluster of size 1
 * (which the map renders as an individual pin).
 * When 2 or more areas collide/overlap, they form a cluster of size > 1
 * (which the map renders as a number circle).
 */
export function clusterAreas(
  areas: readonly PakistanArea[],
  project: (lat: number, lng: number) => PixelPoint,
  clusterRadiusPx: number = 45,
  selectedAreaId?: string | null
): AreaCluster[] {
  if (areas.length === 0) return [];

  // Project all areas to 2D screen coordinates
  const projected = areas.map((area) => ({
    area,
    pt: project(area.coordinates.lat, area.coordinates.lng),
  }));

  const visited = new Uint8Array(projected.length);
  const clusters: AreaCluster[] = [];
  const rSq = clusterRadiusPx * clusterRadiusPx;

  for (let i = 0; i < projected.length; i++) {
    if (visited[i]) continue;
    visited[i] = 1;

    const seed = projected[i];
    const clusterAreasList: PakistanArea[] = [seed.area];

    let sumLat = seed.area.coordinates.lat;
    let sumLng = seed.area.coordinates.lng;
    let minLat = seed.area.coordinates.lat;
    let maxLat = seed.area.coordinates.lat;
    let minLng = seed.area.coordinates.lng;
    let maxLng = seed.area.coordinates.lng;

    for (let j = i + 1; j < projected.length; j++) {
      if (visited[j]) continue;
      const target = projected[j];
      const dx = seed.pt.x - target.pt.x;
      const dy = seed.pt.y - target.pt.y;
      if (dx * dx + dy * dy <= rSq) {
        visited[j] = 1;
        clusterAreasList.push(target.area);

        sumLat += target.area.coordinates.lat;
        sumLng += target.area.coordinates.lng;
        minLat = Math.min(minLat, target.area.coordinates.lat);
        maxLat = Math.max(maxLat, target.area.coordinates.lat);
        minLng = Math.min(minLng, target.area.coordinates.lng);
        maxLng = Math.max(maxLng, target.area.coordinates.lng);
      }
    }

    const count = clusterAreasList.length;
    const center = {
      lat: sumLat / count,
      lng: sumLng / count,
    };

    const hasSelected = selectedAreaId
      ? clusterAreasList.some((a) => a.id === selectedAreaId)
      : false;

    clusters.push({
      id: count === 1 ? clusterAreasList[0].id : `cluster-${i}-${count}`,
      center,
      bounds: { minLat, maxLat, minLng, maxLng },
      areas: clusterAreasList,
      count,
      hasSelected,
    });
  }

  return clusters;
}
