"use server";

import { interpretWesternChart } from "@/lib/astro/interpretation";
import { calcVedicChart } from "@/lib/astro/vedic";
import { calcWesternChart } from "@/lib/astro/western";
import { saveFortune } from "@/lib/firebase/fortune";
import type { VedicReading } from "@/lib/astro/vedic-types";
import type { WesternReading } from "@/lib/astro/western-types";

export async function calcAndSaveFortune(params: {
  uid: string;
  personId: string;
  birthDate: string;
  birthTime?: string;
}): Promise<{ fortuneId: string; western: WesternReading; vedic: VedicReading }> {
  const calculated = calcWesternChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
  });

  const western = interpretWesternChart({
    sunSign: calculated.sunSign,
    moonSign: calculated.moonSign,
    planets: calculated.planets,
  });

  const vedic = calcVedicChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
  });

  const fortuneId = await saveFortune(params.uid, params.personId, western, vedic);

  return { fortuneId, western, vedic };
}
