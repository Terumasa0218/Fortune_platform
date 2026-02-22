"use server";

import { calcWesternChart } from "@/lib/astro/western";
import { interpretWesternChart } from "@/lib/astro/interpretation";
import { saveFortune } from "@/lib/firebase/fortune";
import type { WesternReading } from "@/lib/astro/western-types";

export async function calcAndSaveFortune(params: {
  uid: string;
  personId: string;
  birthDate: string;
  birthTime?: string;
}): Promise<{ fortuneId: string; western: WesternReading }> {
  const calculated = calcWesternChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
  });

  const western = interpretWesternChart({
    sunSign: calculated.sunSign,
    moonSign: calculated.moonSign,
    planets: calculated.planets,
  });

  const fortuneId = await saveFortune(params.uid, params.personId, western);

  return { fortuneId, western };
}
