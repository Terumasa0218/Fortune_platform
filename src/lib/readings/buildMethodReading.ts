import type {
  DetailedFortuneResult,
  FortuneDomain,
  FortuneDomainReading,
  FortuneDomainTopic,
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

function topicBlocks(topic: FortuneDomainTopic, index: number): ReadingBlock[] {
  const tier: ReadingTier = index === 0 ? "free" : "premium";
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

function domainTopic(domain: FortuneDomainReading): MethodReadingTopic {
  return {
    id: domain.domain,
    title: domain.title,
    overview: domain.overview,
    confidence: domain.confidence,
    blocks: domain.topics.flatMap(topicBlocks),
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
    return domainTopic(domain);
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
