import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(23.5).max(37.1),
  lng: z.number().min(60.8).max(77.8)
});

export const CityBoundsSchema = z.object({
  minLat: z.number().min(23.5).max(37.1),
  maxLat: z.number().min(23.5).max(37.1),
  minLng: z.number().min(60.8).max(77.8),
  maxLng: z.number().min(60.8).max(77.8)
});

export const ProvenanceProviderSchema = z.enum([
  'nga_geonames',
  'openstreetmap',
  'un_ocha_hdx',
  'pakistan_post',
  'pbs',
  'manual_verified'
]);

export const ProvenanceSourceSchema = z.object({
  provider: ProvenanceProviderSchema,
  id: z.union([z.string(), z.number()]).optional(),
  featureCode: z.string().optional(),
  datasetVersion: z.string().optional(),
  extractedAt: z.string().optional(),
  license: z.string().optional()
});

export const AreaSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+-[a-z0-9-]+$/),
  cityId: z.string().min(2),
  provinceId: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
  coordinates: CoordinatesSchema,
  bounds: CityBoundsSchema.optional(),
  radiusKm: z.number().positive().optional(),
  type: z.enum([
    'neighborhood',
    'suburb',
    'commercial',
    'housing_society',
    'sector',
    'industrial',
    'administrative'
  ]).optional(),
  verified: z.boolean(),
  sources: z.array(z.union([z.string(), ProvenanceSourceSchema])).optional()
});

export const CitySchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().min(2),
  provinceId: z.string().min(2),
  division: z.string().optional(),
  district: z.string().min(2),
  coordinates: CoordinatesSchema,
  postalCodeRange: z.tuple([z.string().regex(/^\d{5}$/), z.string().regex(/^\d{5}$/)]).optional(),
  bounds: CityBoundsSchema.optional()
});

export const ProvinceSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().min(2),
  capitalCityId: z.string().min(2),
  type: z.enum(['province', 'federal_capital', 'autonomous_territory'])
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type CityBounds = z.infer<typeof CityBoundsSchema>;
export type ProvenanceProvider = z.infer<typeof ProvenanceProviderSchema>;
export type ProvenanceSource = z.infer<typeof ProvenanceSourceSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type City = z.infer<typeof CitySchema>;
export type Province = z.infer<typeof ProvinceSchema>;
