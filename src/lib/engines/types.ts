export type FortuneMethod =
  | "bazi"
  | "western"
  | "ziwei"
  | "numerology"
  | "kyusei"
  | "maya";

export type FortuneTheme =
  | "personality"
  | "talent"
  | "career"
  | "love"
  | "marriage"
  | "money"
  | "health"
  | "timing"
  | "growth";

export type FortuneDomain = "love" | "career" | "money" | "talent";

export type FortuneTopicKey =
  | "loveStyle"
  | "marriage"
  | "meetingChance"
  | "partnerFeelings"
  | "relationshipTurningPoint"
  | "reconciliation"
  | "compatiblePartner"
  | "difficultPartner"
  | "careerStyle"
  | "lifeTurningPoint"
  | "goodTiming"
  | "badTiming"
  | "overallFlow"
  | "successKeys"
  | "careerStrengths"
  | "careerWeaknesses"
  | "earningStyle"
  | "moneyRisk"
  | "assetBuilding"
  | "interpersonal"
  | "healthCare"
  | "coreTalent"
  | "hiddenPotential"
  | "growthAdvice";

export type BirthConfidence = {
  time: "unknown" | "approximate" | "exact";
  place: "unknown" | "city" | "exact";
};

export type BirthProfileInput = {
  name?: string;
  gender?: "male" | "female" | "other";
  birthDate: string;
  birthTime?: string | null;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  confidence?: BirthConfidence;
};

export type FortuneSignal = {
  method: FortuneMethod;
  theme: FortuneTheme;
  trait: string;
  polarity: "strength" | "challenge" | "neutral";
  score: number;
  confidence: number;
  evidence: string;
};

export type FortuneCopyContext = {
  key: string;
  variables: Record<string, string | string[]>;
};

export type FortuneSection = {
  theme: FortuneTheme;
  topic?: FortuneTopicKey;
  title: string;
  summary: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  advice: string[];
  evidence: string[];
  copyContext?: FortuneCopyContext;
};

export type FortuneDomainTopic = {
  topic?: FortuneTopicKey;
  title: string;
  summary: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  advice: string[];
  evidence: string[];
  copyContext?: FortuneCopyContext;
};

export type FortuneDomainReading = {
  domain: FortuneDomain;
  title: string;
  overview: string;
  topics: FortuneDomainTopic[];
  confidence: number;
};

export type InputRequirement = {
  birthDate: "required" | "optional" | "unused";
  birthTime: "required" | "recommended" | "optional" | "unused";
  birthPlace: "required" | "recommended" | "optional" | "unused";
};

export type EngineConfidence = {
  score: number;
  level: "low" | "medium" | "high";
  reasons: string[];
};

export type DetailedFortuneResult<TChart> = {
  method: FortuneMethod;
  displayName: string;
  version: string;
  inputRequirement: InputRequirement;
  confidence: EngineConfidence;
  chart: TChart;
  domains: FortuneDomainReading[];
  sections: FortuneSection[];
  signals: FortuneSignal[];
  notes: string[];
};

export function confidenceFromScore(score: number, reasons: string[]): EngineConfidence {
  const bounded = Math.max(0, Math.min(1, score));
  return {
    score: bounded,
    level: bounded >= 0.75 ? "high" : bounded >= 0.45 ? "medium" : "low",
    reasons,
  };
}

export function defaultConfidence(input: BirthProfileInput): BirthConfidence {
  return {
    time: input.confidence?.time ?? (input.birthTime ? "exact" : "unknown"),
    place:
      input.confidence?.place ??
      (input.latitude != null && input.longitude != null ? "city" : "unknown"),
  };
}

export function parseBirthParts(birthDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) {
    throw new Error("Invalid birthDate. Expected YYYY-MM-DD.");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function birthTimeHour(birthTime?: string | null): number | undefined {
  if (!birthTime) return undefined;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(birthTime);
  if (!match) return undefined;
  return Number(match[1]);
}

const DOMAIN_THEME_MAP: Record<FortuneDomain, FortuneTheme[]> = {
  love: ["love", "marriage"],
  career: ["career", "timing"],
  money: ["money"],
  talent: ["talent", "personality", "growth"],
};

const DOMAIN_TITLE: Record<FortuneDomain, string> = {
  love: "恋愛",
  career: "仕事",
  money: "金運",
  talent: "才能",
};

export function sectionsToDomainReadings(
  sections: FortuneSection[],
  signals: FortuneSignal[],
): FortuneDomainReading[] {
  return (Object.keys(DOMAIN_THEME_MAP) as FortuneDomain[]).map((domain) => {
    const themes = DOMAIN_THEME_MAP[domain];
    const matchedSections = sections.filter((section) => themes.includes(section.theme));
    const matchedSignals = signals.filter((signal) => themes.includes(signal.theme));
    const confidence =
      matchedSignals.length > 0
        ? matchedSignals.reduce((sum, signal) => sum + signal.confidence, 0) / matchedSignals.length
        : 0;

    return {
      domain,
      title: DOMAIN_TITLE[domain],
      overview:
        matchedSections[0]?.summary ??
        `${DOMAIN_TITLE[domain]}については、この占術では補助的な情報として扱います。`,
      topics: matchedSections.map((section) => ({
        topic: section.topic,
        title: section.title,
        summary: section.summary,
        keywords: section.keywords,
        strengths: section.strengths,
        challenges: section.challenges,
        advice: section.advice,
        evidence: section.evidence,
        copyContext: section.copyContext,
      })),
      confidence,
    };
  });
}
