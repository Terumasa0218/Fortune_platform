import { calcBaziDetailed } from "./bazi-detailed";
import { calcKyusei } from "./kyusei";
import { calcMaya } from "./maya";
import { calcNumerology } from "./numerology";
import { calcWesternDetailed } from "./western-detailed";
import { calcZiwei } from "./ziwei";
import type { BirthProfileInput, DetailedFortuneResult } from "./types";
import { dateInTimezone } from "../time/chineseCalendarTime";

export type { BirthProfileInput, DetailedFortuneResult, FortuneMethod, FortuneSection, FortuneSignal } from "./types";
export { calcBaziDetailed } from "./bazi-detailed";
export { calcKyusei } from "./kyusei";
export { calcMaya } from "./maya";
export { calcNumerology } from "./numerology";
export { calcWesternDetailed } from "./western-detailed";
export { calcZiwei } from "./ziwei";

export type MultiFortuneResult = {
  input: BirthProfileInput;
  targetDate: string;
  results: DetailedFortuneResult<unknown>[];
};

export function calcAllFortunes(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): MultiFortuneResult {
  const normalizedTargetDate =
    typeof targetDate === "string"
      ? targetDate
      : dateInTimezone(targetDate, input.timezone ?? "Asia/Tokyo");
  return {
    input,
    targetDate: normalizedTargetDate,
    results: [
      calcBaziDetailed(input, normalizedTargetDate),
      calcWesternDetailed(input, normalizedTargetDate),
      calcZiwei(input, normalizedTargetDate),
      calcNumerology(input, normalizedTargetDate),
      calcKyusei(input, normalizedTargetDate),
      calcMaya(input, normalizedTargetDate),
    ],
  };
}
