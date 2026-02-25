"use server";

import { calcBaziChart } from "@/lib/astro/bazi";
import { interpretWesternChart } from "@/lib/astro/interpretation";
import { calcVedicChart } from "@/lib/astro/vedic";
import type { BaziReading } from "@/lib/astro/bazi-types";
import type { VedicReading } from "@/lib/astro/vedic-types";
import { calcWesternChart } from "@/lib/astro/western";
import type { WesternReading } from "@/lib/astro/western-types";
import { saveFortune } from "@/lib/firebase/fortune";

export async function calcAndSaveFortune(params: {
  uid: string;
  personId: string;
  birthDate: string;
  birthTime?: string;
}): Promise<{ fortuneId: string; western: WesternReading; vedic: VedicReading; bazi: BaziReading }> {
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

  const bazi = calcBaziChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
  });

  const fortuneId = await saveFortune(params.uid, params.personId, western, vedic, bazi);

  return { fortuneId, western, vedic, bazi };
}
