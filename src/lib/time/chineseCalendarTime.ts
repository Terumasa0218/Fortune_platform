import { Solar } from "lunar-typescript";
import { toUTC } from "./parseBirth";

type DatePart = "year" | "month" | "day" | "hour" | "minute" | "second";

function zonedParts(instant: Date, timezone: string): Record<DatePart, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const value = (type: DatePart) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function solarAtSameInstant(
  date: string,
  time: string,
  sourceTimezone: string,
  targetTimezone = "Asia/Shanghai",
): Solar {
  const parts = zonedParts(toUTC(date, time, sourceTimezone), targetTimezone);
  return Solar.fromYmdHms(
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
}

export function chinaSolarToTimezone(solar: Solar, timezone?: string): string {
  if (!timezone || timezone === "Asia/Shanghai") return solar.toYmdHms();
  const match = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/.exec(solar.toYmdHms());
  if (!match) return solar.toYmdHms();
  const instant = new Date(
    toUTC(match[1], match[2], "Asia/Shanghai").getTime() + Number(match[3]) * 1000,
  );
  const parts = zonedParts(instant, timezone);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function dateInTimezone(date: Date, timezone: string): string {
  const parts = zonedParts(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}
