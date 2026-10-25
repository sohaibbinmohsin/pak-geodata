import type { PakistanArea } from "../../types.js";
import { faisalabadAreas } from "./faisalabad.js";
import { islamabadAreas } from "./islamabad.js";
import { karachiAreas } from "./karachi.js";
import { lahoreAreas } from "./lahore.js";
import { rawalpindiAreas } from "./rawalpindi.js";

export { faisalabadAreas, islamabadAreas, karachiAreas, lahoreAreas, rawalpindiAreas };

export const allAreas: readonly PakistanArea[] = [
  ...faisalabadAreas,
  ...islamabadAreas,
  ...karachiAreas,
  ...lahoreAreas,
  ...rawalpindiAreas
];
