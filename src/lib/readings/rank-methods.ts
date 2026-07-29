import type { BirthProfileInput, FortuneDomain, FortuneMethod } from "@/lib/engines/types";
import type { MethodReadingReport } from "./types";

export const METHOD_DISPLAY_ORDER: FortuneMethod[] = [
  "bazi",
  "western",
  "ziwei",
  "numerology",
  "kyusei",
  "maya",
];

const DOMAIN_FIT: Record<FortuneDomain, Record<FortuneMethod, number>> = {
  talent: {
    bazi: 6,
    western: 5,
    ziwei: 6,
    numerology: 5,
    kyusei: 4,
    maya: 3,
  },
  love: {
    bazi: 5,
    western: 6,
    ziwei: 6,
    numerology: 4,
    kyusei: 4,
    maya: 3,
  },
  career: {
    bazi: 6,
    western: 5,
    ziwei: 6,
    numerology: 4,
    kyusei: 5,
    maya: 3,
  },
  money: {
    bazi: 6,
    western: 5,
    ziwei: 6,
    numerology: 4,
    kyusei: 5,
    maya: 3,
  },
};

function missingInputFactor(requirement: "required" | "recommended" | "optional" | "unused") {
  if (requirement === "required") return 0.55;
  if (requirement === "recommended") return 0.78;
  if (requirement === "optional") return 0.92;
  return 1;
}

function inputCoverage(report: MethodReadingReport, input: BirthProfileInput): number {
  const hasTime = Boolean(input.birthTime);
  const hasPlace = input.latitude != null && input.longitude != null;
  let coverage = 1;

  if (!hasTime) coverage *= missingInputFactor(report.inputRequirement.birthTime);
  if (!hasPlace) coverage *= missingInputFactor(report.inputRequirement.birthPlace);

  return coverage;
}

export function rankReadingsForDomain(
  readings: MethodReadingReport[],
  input: BirthProfileInput,
  domain: FortuneDomain,
): MethodReadingReport[] {
  return [...readings].sort((left, right) => {
    const leftTopic = left.topics.find((topic) => topic.id === domain);
    const rightTopic = right.topics.find((topic) => topic.id === domain);
    const leftHasContent = Boolean(leftTopic?.blocks.length);
    const rightHasContent = Boolean(rightTopic?.blocks.length);

    if (leftHasContent !== rightHasContent) return leftHasContent ? -1 : 1;

    const leftScore = DOMAIN_FIT[domain][left.method] * inputCoverage(left, input);
    const rightScore = DOMAIN_FIT[domain][right.method] * inputCoverage(right, input);

    if (rightScore !== leftScore) return rightScore - leftScore;
    return METHOD_DISPLAY_ORDER.indexOf(left.method) - METHOD_DISPLAY_ORDER.indexOf(right.method);
  });
}
