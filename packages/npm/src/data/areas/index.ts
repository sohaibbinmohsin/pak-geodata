import type { PakistanArea } from "../../types.js";
import { faisalabadAreas } from "./faisalabad.js";
import { gujranwalaAreas } from "./gujranwala.js";
import { hyderabadAreas } from "./hyderabad.js";
import { islamabadAreas } from "./islamabad.js";
import { karachiAreas } from "./karachi.js";
import { lahoreAreas } from "./lahore.js";
import { multanAreas } from "./multan.js";
import { peshawarAreas } from "./peshawar.js";
import { quettaAreas } from "./quetta.js";
import { rawalpindiAreas } from "./rawalpindi.js";

export { faisalabadAreas, gujranwalaAreas, hyderabadAreas, islamabadAreas, karachiAreas, lahoreAreas, multanAreas, peshawarAreas, quettaAreas, rawalpindiAreas };

export const allAreas: readonly PakistanArea[] = [
  ...faisalabadAreas,
  ...gujranwalaAreas,
  ...hyderabadAreas,
  ...islamabadAreas,
  ...karachiAreas,
  ...lahoreAreas,
  ...multanAreas,
  ...peshawarAreas,
  ...quettaAreas,
  ...rawalpindiAreas
];
