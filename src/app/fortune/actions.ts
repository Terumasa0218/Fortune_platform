"use server";

import type { WesternReading } from "@/lib/astro/types";
import { interpretWesternChart } from "@/lib/astro/interpretation";
import { calcWesternChart } from "@/lib/astro/western";
import { saveFortune } from "@/lib/firebase/fortune";

export async function calcAndSaveFortune(params: {
  uid: string;
  personId: string;
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ fortuneId: string; western: WesternReading }> {
  const calculated = calcWesternChart(params);
  const western = interpretWesternChart(calculated);
  const fortuneId = await saveFortune(params.uid, params.personId, western);

  return { fortuneId, western };
}
