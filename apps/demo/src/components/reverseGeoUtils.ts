import type { PakistanArea } from 'pak-geodata';

export interface ReverseGeoPoint {
  clicked: { lat: number; lng: number };
  nearest: PakistanArea;
  distanceKm: number;
  computationTimeMs?: number;
}

/**
 * Formats geographic coordinates into human-readable cardinal format.
 * Example: { lat: 31.45124, lng: 74.39809 } -> "31.4512° N, 74.3981° E"
 */
export function formatCoordinates(coords: { lat: number; lng: number }): string {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coords.lat).toFixed(4)}° ${latDir}, ${Math.abs(coords.lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Formats distance with adaptive precision.
 * Distance < 1 km is formatted in meters (e.g. "340 m").
 * Distance >= 1 km is formatted in kilometers (e.g. "2.4 km").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    if (meters >= 1000) {
      return '1.0 km';
    }
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export const DEFAULT_SPEED_BADGE = '< 0.4 ms (Offline Client-Side)';

/**
 * Formats client-side execution benchmark badge.
 */
export function formatSpeedBadge(durationMs?: number): string {
  if (durationMs !== undefined && durationMs >= 0.4) {
    return `${durationMs.toFixed(1)} ms (Offline Client-Side)`;
  }
  return DEFAULT_SPEED_BADGE;
}
