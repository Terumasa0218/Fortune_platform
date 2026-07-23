import { describe, expect, it } from "vitest";
import { calcBaziDetailed } from "./bazi-detailed";
import { calcKyusei } from "./kyusei";

// National Astronomical Observatory of Japan, 2004 calendar bulletin.
// https://eco.mtk.nao.ac.jp/koyomi/yoko/2004/rekiyou042.html
const JIE_2004 = [
  { name: "小寒", date: "2004-01-06", time: "09:19", branch: "丑", previousBranch: "子" },
  { name: "立春", date: "2004-02-04", time: "20:56", branch: "寅", previousBranch: "丑" },
  { name: "啓蟄", date: "2004-03-05", time: "14:56", branch: "卯", previousBranch: "寅" },
  { name: "清明", date: "2004-04-04", time: "19:43", branch: "辰", previousBranch: "卯" },
  { name: "立夏", date: "2004-05-05", time: "13:02", branch: "巳", previousBranch: "辰" },
  { name: "芒種", date: "2004-06-05", time: "17:14", branch: "午", previousBranch: "巳" },
  { name: "小暑", date: "2004-07-07", time: "03:31", branch: "未", previousBranch: "午" },
  { name: "立秋", date: "2004-08-07", time: "13:20", branch: "申", previousBranch: "未" },
  { name: "白露", date: "2004-09-07", time: "16:13", branch: "酉", previousBranch: "申" },
  { name: "寒露", date: "2004-10-08", time: "07:49", branch: "戌", previousBranch: "酉" },
  { name: "立冬", date: "2004-11-07", time: "10:59", branch: "亥", previousBranch: "戌" },
  { name: "大雪", date: "2004-12-07", time: "03:49", branch: "子", previousBranch: "亥" },
] as const;

function shiftLocal(date: string, time: string, minutes: number): { date: string; time: string } {
  const value = new Date(`${date}T${time}:00Z`);
  value.setUTCMinutes(value.getUTCMinutes() + minutes);
  return {
    date: value.toISOString().slice(0, 10),
    time: value.toISOString().slice(11, 16),
  };
}

function roundedMinute(dateTime: string): string {
  const value = new Date(`${dateTime.replace(" ", "T")}Z`);
  if (value.getUTCSeconds() >= 30) value.setUTCMinutes(value.getUTCMinutes() + 1);
  value.setUTCSeconds(0, 0);
  return value.toISOString().slice(0, 16).replace("T", " ");
}

describe("2004年の節入り境界", () => {
  it.each(JIE_2004)("$nameの前後で四柱推命の月支を切り替える", (fixture) => {
    const before = shiftLocal(fixture.date, fixture.time, -2);
    const after = shiftLocal(fixture.date, fixture.time, 2);
    const beforeResult = calcBaziDetailed({
      birthDate: before.date,
      birthTime: before.time,
      timezone: "Asia/Tokyo",
    });
    const afterResult = calcBaziDetailed({
      birthDate: after.date,
      birthTime: after.time,
      timezone: "Asia/Tokyo",
    });

    expect(beforeResult.chart.monthPillar.branch).toBe(fixture.previousBranch);
    expect(afterResult.chart.monthPillar.branch).toBe(fixture.branch);
    expect(afterResult.chart.solarMonth.termName).toBe(fixture.name);
    expect(roundedMinute(afterResult.chart.solarMonth.termDateTime)).toBe(
      `${fixture.date} ${fixture.time}`,
    );
  });

  it.each(JIE_2004)("$nameの前後で九星気学の節月を切り替える", (fixture) => {
    const before = shiftLocal(fixture.date, fixture.time, -2);
    const after = shiftLocal(fixture.date, fixture.time, 2);
    const beforeResult = calcKyusei({
      birthDate: before.date,
      birthTime: before.time,
      timezone: "Asia/Tokyo",
    });
    const afterResult = calcKyusei({
      birthDate: after.date,
      birthTime: after.time,
      timezone: "Asia/Tokyo",
    });

    expect(beforeResult.chart.monthGanZhi.endsWith(fixture.previousBranch)).toBe(true);
    expect(afterResult.chart.monthGanZhi.endsWith(fixture.branch)).toBe(true);
    expect(afterResult.chart.previousJie.name).toBe(fixture.name);
    expect(roundedMinute(afterResult.chart.previousJie.dateTime)).toBe(
      `${fixture.date} ${fixture.time}`,
    );
  });
});
