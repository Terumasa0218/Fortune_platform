import type {
  DetailedFortuneResult,
  FortuneDomain,
  FortuneDomainReading,
  FortuneDomainTopic,
  FortuneTopicKey,
} from "@/lib/engines/types";
import type {
  MethodReadingReport,
  MethodReadingTopic,
  ReadingBlock,
  ReadingBlockKind,
  ReadingTier,
} from "./types";

const DOMAIN_ORDER: FortuneDomain[] = ["talent", "love", "career", "money"];

const DOMAIN_TITLE: Record<FortuneDomain, string> = {
  talent: "才能",
  love: "恋愛",
  career: "仕事",
  money: "金運",
};

const PRIMARY_TOPIC_ORDER: Record<FortuneDomain, FortuneTopicKey[]> = {
  talent: ["hiddenPotential", "coreTalent", "growthAdvice"],
  love: ["loveStyle", "marriage", "compatiblePartner"],
  career: ["careerStrengths", "careerStyle", "successKeys"],
  money: ["earningStyle", "assetBuilding", "moneyRisk"],
};

const INTERNAL_TOPIC_REPLACEMENTS: Partial<Record<FortuneTopicKey, FortuneTopicKey>> = {
  coreTalent: "hiddenPotential",
  careerStyle: "careerStrengths",
};

function block(
  id: string,
  kind: ReadingBlockKind,
  title: string,
  body: string[],
  tier: ReadingTier,
): ReadingBlock | null {
  const uniqueBody = [...new Set(body.map((item) => item.trim()).filter(Boolean))];
  if (uniqueBody.length === 0) return null;
  return { id, kind, title, body: uniqueBody, tier };
}

function topicBlocks(
  topic: FortuneDomainTopic,
  index: number,
  isPrimary: boolean,
): ReadingBlock[] {
  const tier: ReadingTier = isPrimary ? "free" : "premium";
  return [
    block(String(index) + "-interpretation", "interpretation", topic.title, [topic.summary], tier),
    block(String(index) + "-strength", "strength", "活かしやすいところ", topic.strengths, "premium"),
    block(
      String(index) + "-challenge",
      "challenge",
      "つまずきやすいところ",
      topic.challenges,
      "premium",
    ),
    block(String(index) + "-advice", "advice", "より良く活かすには", topic.advice, "premium"),
  ].filter((item): item is ReadingBlock => item !== null);
}

function primaryTopic(domain: FortuneDomainReading): FortuneDomainTopic | undefined {
  return PRIMARY_TOPIC_ORDER[domain.domain]
    .map((topicKey) => domain.topics.find((topic) => topic.topic === topicKey))
    .find((topic): topic is FortuneDomainTopic => topic !== undefined) ?? domain.topics[0];
}

function visibleTopics(domain: FortuneDomainReading, primary: FortuneDomainTopic): FortuneDomainTopic[] {
  const filtered = domain.topics.filter((topic) => {
    if (!topic.topic) return true;
    const replacement = INTERNAL_TOPIC_REPLACEMENTS[topic.topic];
    return !replacement || !domain.topics.some((candidate) => candidate.topic === replacement);
  });

  return [primary, ...filtered.filter((topic) => topic !== primary)];
}

function domainTopic(
  domain: FortuneDomainReading,
  displayName: string,
): MethodReadingTopic {
  const primary = primaryTopic(domain);
  const topics = primary ? visibleTopics(domain, primary) : [];
  return {
    id: domain.domain,
    title: domain.title,
    overview: `${displayName}の視点から、あなたの${domain.title}に表れやすい傾向と、活かし方を読み解きます。`,
    confidence: domain.confidence,
    blocks: topics.flatMap((topic, index) => topicBlocks(topic, index, topic === primary)),
  };
}

function uniqueEvidence(domain: FortuneDomainReading): string[] {
  return [
    ...new Set(
      domain.topics.flatMap((topic) => topic.evidence).map((item) => item.trim()).filter(Boolean),
    ),
  ];
}

function evidenceTopic(result: DetailedFortuneResult<unknown>): MethodReadingTopic {
  const domainEvidence = DOMAIN_ORDER.map((domainId) => {
    const domain = result.domains.find((item) => item.domain === domainId);
    if (!domain) return null;
    return block(
      "evidence-" + domainId,
      "evidence",
      DOMAIN_TITLE[domainId] + "を判断した配置",
      uniqueEvidence(domain),
      "free",
    );
  }).filter((item): item is ReadingBlock => item !== null);

  const methodology = block(
    "evidence-methodology",
    "methodology",
    "計算範囲と精度",
    result.confidence.reasons,
    "free",
  );
  const notes = block("evidence-notes", "methodology", "この占術での読み方", result.notes, "free");

  return {
    id: "evidence",
    title: "鑑定根拠",
    overview:
      result.displayName + "で使った星、宮、数、干支などの計算要素を、分野ごとに確認できます。",
    confidence: result.confidence.score,
    blocks: [
      ...(methodology ? [methodology] : []),
      ...domainEvidence,
      ...(notes ? [notes] : []),
    ],
  };
}

export function buildMethodReading(
  result: DetailedFortuneResult<unknown>,
): MethodReadingReport {
  const topics = DOMAIN_ORDER.map((domainId) => {
    const domain = result.domains.find((item) => item.domain === domainId);
    if (!domain) {
      return {
        id: domainId,
        title: DOMAIN_TITLE[domainId],
        overview: DOMAIN_TITLE[domainId] + "は、この占術では補助的に扱います。",
        confidence: 0,
        blocks: [],
      } satisfies MethodReadingTopic;
    }
    return domainTopic(domain, result.displayName);
  });

  return {
    method: result.method,
    displayName: result.displayName,
    version: result.version,
    inputRequirement: result.inputRequirement,
    confidence: result.confidence,
    topics: [...topics, evidenceTopic(result)],
  };
}
