"use server";

import { calcBaziChart } from "@/lib/astro/bazi";
import { interpretWesternChart } from "@/lib/astro/interpretation";
import { calcVedicChart } from "@/lib/astro/vedic";
import type { BaziReading } from "@/lib/astro/bazi-types";
import type { VedicReading } from "@/lib/astro/vedic-types";
import { calcWesternChart } from "@/lib/astro/western";
import type { WesternReading } from "@/lib/astro/western-types";
import { calcAllFortunes, type MultiFortuneResult } from "@/lib/engines";
import { saveFortune } from "@/lib/firebase/fortune";

export async function calcAndSaveFortune(params: {
  uid: string;
  personId: string;
  name?: string;
  gender?: "male" | "female" | "other";
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  confidence?: {
    time: "unknown" | "approximate" | "exact";
    place: "unknown" | "city" | "exact";
  };
}): Promise<{
  fortuneId: string;
  western: WesternReading;
  vedic: VedicReading;
  bazi: BaziReading;
  detailed: MultiFortuneResult;
}> {
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

  const detailed = calcAllFortunes({
    name: params.name,
    gender: params.gender,
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    birthPlace: params.birthPlace,
    latitude: params.latitude,
    longitude: params.longitude,
    timezone: params.timezone,
    confidence: params.confidence,
  });

  const fortuneId = await saveFortune(params.uid, params.personId, western, vedic, bazi, detailed);

  return { fortuneId, western, vedic, bazi, detailed };
}
