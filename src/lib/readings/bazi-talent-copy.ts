import talentCopyData from "../../content/readings/ja/bazi-talent.json";
import type { FortuneCopyContext } from "@/lib/engines/types";
import type { ReadingBlockSection } from "./types";

export type ReadingTone = "standard" | "warm" | "playful";

export type BaziTalentDayMasterCopy = {
  primaryHeading: string;
  primaryBody: string;
  secondaryHeading: string;
  secondaryBody: string;
  scene: string;
  growth: string;
};

export type BaziTalentTenGodCopy = {
  heading: string;
  body: string;
  scene: string;
};

type ToneEntry<T> = {
  standard: T;
  warm?: Partial<T>;
  playful?: Partial<T>;
};

export type BaziTalentCopyPack = {
  schemaVersion: number;
  title: string;
  dayMasters: Record<string, ToneEntry<BaziTalentDayMasterCopy>>;
  tenGods: Record<string, ToneEntry<BaziTalentTenGodCopy>>;
};

export type StructuredReadingCopy = {
  title: string;
  sections: ReadingBlockSection[];
};

export const baziTalentCopyPack = talentCopyData as BaziTalentCopyPack;

function toneCopy<T>(entry: ToneEntry<T>, tone: ReadingTone): T {
  if (tone === "standard") return entry.standard;
  return { ...entry.standard, ...entry[tone] };
}

export function buildBaziTalentFreeCopy(
  context: FortuneCopyContext,
  tone: ReadingTone = "standard",
  pack: BaziTalentCopyPack = baziTalentCopyPack,
): StructuredReadingCopy | null {
  if (context.key !== "bazi-talent-free-v1") return null;

  const dayMaster = context.variables.dayMaster;
  const dominantGods = context.variables.dominantGods;
  if (typeof dayMaster !== "string" || !Array.isArray(dominantGods)) return null;

  const dayMasterEntry = pack.dayMasters[dayMaster];
  const tenGodEntry = dominantGods
    .map((god) => pack.tenGods[god])
    .find((entry): entry is ToneEntry<BaziTalentTenGodCopy> => Boolean(entry));
  if (!dayMasterEntry || !tenGodEntry) return null;

  const dayMasterCopy = toneCopy(dayMasterEntry, tone);
  const tenGodCopy = toneCopy(tenGodEntry, tone);

  return {
    title: pack.title,
    sections: [
      {
        title: `1）${dayMasterCopy.primaryHeading}`,
        body: [dayMasterCopy.primaryBody],
      },
      {
        title: `2）${tenGodCopy.heading}`,
        body: [tenGodCopy.body],
      },
      {
        title: `3）${dayMasterCopy.secondaryHeading}`,
        body: [dayMasterCopy.secondaryBody],
      },
      {
        title: "才能が活きやすい場面",
        body: [dayMasterCopy.scene, tenGodCopy.scene],
      },
      {
        title: "才能を伸ばす鍵",
        body: [dayMasterCopy.growth],
      },
    ],
  };
}
