export interface Coordinates {
  lat: number;
  lng: number;
}

export type AreaType =
  | 'neighborhood'
  | 'suburb'
  | 'commercial'
  | 'housing_society'
  | 'sector'
  | 'industrial'
  | 'administrative';

export interface PakistanArea {
  id: string;
  cityId: string;
  provinceId: string;
  name: string;
  urduName?: string;
  aliases: string[];
  postalCode?: string;
  coordinates: Coordinates;
  type?: AreaType;
  verified: boolean;
  sources?: string[];
}

export interface PakistanCity {
  id: string;
  name: string;
  urduName: string;
  provinceId: string;
  division?: string;
  district: string;
  coordinates: Coordinates;
  postalCodeRange?: [string, string];
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  totalAreasCount: number;
}

export type ProvinceType = 'province' | 'federal_capital' | 'autonomous_territory';

export interface PakistanProvince {
  id: string;
  name: string;
  urduName: string;
  capitalCityId: string;
  type: ProvinceType;
}

export interface SearchOptions {
  cityId?: string;
  provinceId?: string;
  limit?: number;
}

export interface NearestAreaOptions {
  cityId?: string;
  provinceId?: string;
  maxDistanceKm?: number;
}
