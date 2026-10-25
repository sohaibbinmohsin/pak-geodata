import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(23.5).max(37.1),
  lng: z.number().min(60.8).max(77.8)
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
  sources: z.array(z.string()).optional()
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
  bounds: z.object({
    minLat: z.number(),
    maxLat: z.number(),
    minLng: z.number(),
    maxLng: z.number()
  }).optional()
});

export const ProvinceSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  urduName: z.string().min(2),
  capitalCityId: z.string().min(2),
  type: z.enum(['province', 'federal_capital', 'autonomous_territory'])
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type City = z.infer<typeof CitySchema>;
export type Province = z.infer<typeof ProvinceSchema>;
