import { calcBaziDetailed } from "./bazi-detailed";
import { calcKyusei } from "./kyusei";
import { calcMaya } from "./maya";
import { calcNumerology } from "./numerology";
import { calcWesternDetailed } from "./western-detailed";
import { calcZiwei } from "./ziwei";
import type { BirthProfileInput, DetailedFortuneResult } from "./types";
import { dateInTimezone } from "../time/chineseCalendarTime";
import { buildMethodReading } from "../readings/buildMethodReading";
import type { MethodReadingReport } from "../readings/types";

export type { BirthProfileInput, DetailedFortuneResult, FortuneMethod, FortuneSection, FortuneSignal } from "./types";
export type {
  CompatibilityAxisReading,
  CompatibilityMethodReport,
  MethodReadingReport,
  MethodReadingTopic,
  ReadingBlock,
  ReadingTier,
  ReadingTopicId,
} from "../readings/types";
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
  readings: MethodReadingReport[];
};

export function calcAllFortunes(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): MultiFortuneResult {
  const normalizedTargetDate =
    typeof targetDate === "string"
      ? targetDate
      : dateInTimezone(targetDate, input.timezone ?? "Asia/Tokyo");
  const results: DetailedFortuneResult<unknown>[] = [
    calcBaziDetailed(input, normalizedTargetDate),
    calcWesternDetailed(input, normalizedTargetDate),
    calcZiwei(input, normalizedTargetDate),
    calcNumerology(input, normalizedTargetDate),
    calcKyusei(input, normalizedTargetDate),
    calcMaya(input, normalizedTargetDate),
  ];

  return {
    input,
    targetDate: normalizedTargetDate,
    results,
    readings: results.map(buildMethodReading),
  };
}
