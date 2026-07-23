import type {
  EngineConfidence,
  FortuneDomain,
  FortuneMethod,
  InputRequirement,
} from "@/lib/engines/types";

export type ReadingTier = "free" | "premium";

export type ReadingTopicId = FortuneDomain | "evidence";

export type ReadingBlockKind =
  | "interpretation"
  | "strength"
  | "challenge"
  | "advice"
  | "timing"
  | "evidence"
  | "methodology";

export type ReadingBlock = {
  id: string;
  kind: ReadingBlockKind;
  title: string;
  body: string[];
  tier: ReadingTier;
};

export type MethodReadingTopic = {
  id: ReadingTopicId;
  title: string;
  overview: string;
  confidence: number;
  blocks: ReadingBlock[];
};

export type MethodReadingReport = {
  method: FortuneMethod;
  displayName: string;
  version: string;
  inputRequirement: InputRequirement;
  confidence: EngineConfidence;
  topics: MethodReadingTopic[];
};

export type CompatibilityAxisId =
  | "personality"
  | "communication"
  | "love"
  | "lifestyle"
  | "destiny"
  | "intimacy";

export type CompatibilityRating = 1 | 2 | 3 | 4 | 5;

export type CompatibilityAxisReading = {
  id: CompatibilityAxisId;
  title: string;
  rating: CompatibilityRating;
  overview: string;
  matchingPoints: string[];
  frictionPoints: string[];
  fromPersonA: string[];
  fromPersonB: string[];
  advice: string[];
  evidence: string[];
  tier: ReadingTier;
};

export type CompatibilityMethodReport = {
  method: FortuneMethod;
  displayName: string;
  overview: string;
  confidence: EngineConfidence;
  axes: CompatibilityAxisReading[];
};
