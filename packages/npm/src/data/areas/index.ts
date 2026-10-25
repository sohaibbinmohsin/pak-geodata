import type { PakistanArea } from "../../types.js";
import { lahoreAreas } from "./lahore.js";
import { karachiAreas } from "./karachi.js";
import { islamabadAreas } from "./islamabad.js";
import { rawalpindiAreas } from "./rawalpindi.js";
import { faisalabadAreas } from "./faisalabad.js";

export { lahoreAreas, karachiAreas, islamabadAreas, rawalpindiAreas, faisalabadAreas };

export const allAreas: readonly PakistanArea[] = [
  ...lahoreAreas,
  ...karachiAreas,
  ...islamabadAreas,
  ...rawalpindiAreas,
  ...faisalabadAreas
];
