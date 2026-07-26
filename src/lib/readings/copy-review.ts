import type { MultiFortuneResult } from "@/lib/engines";
import type { ReadingTier, ReadingTopicId } from "./types";

export type CopyReviewWarningKind =
  | "abstract"
  | "jargon"
  | "length"
  | "sales"
  | "specific-job"
  | "structure";

export type CopyReviewWarning = {
  kind: CopyReviewWarningKind;
  label: string;
  detail: string;
};

export type CopyReviewRecord = {
  id: string;
  sampleId: string;
  sampleLabel: string;
  method: MultiFortuneResult["readings"][number]["method"];
  methodName: string;
  methodVersion: string;
  topic: ReadingTopicId;
  topicTitle: string;
  tier: ReadingTier;
  blockTitle: string;
  body: string[];
  characterCount: number;
  warnings: CopyReviewWarning[];
};

const ABSTRACT_TERMS = [
  ["本質", "何の本質かが読み手に伝わる具体語へ置き換えます。"],
  ["可能性", "どの能力や変化を指すのかを明示します。"],
  ["改革", "変える対象と行動を具体化します。"],
  ["昇華", "日常語で結果や行動を説明します。"],
  ["形にする", "何を作る・決める・伝えるのかを補います。"],
  ["価値へ変える", "誰にどんな役立ち方をするのかを補います。"],
  ["役立つ形", "資料、説明、判断など、結果の種類を確認します。"],
] as const;

const JARGON_TERMS = [
  "日主",
  "身強",
  "身弱",
  "印綬",
  "劫財",
  "比肩",
  "用神",
  "命宮",
  "夫妻宮",
  "官禄宮",
  "財帛宮",
  "四化",
  "ライフパス",
  "ピナクル",
  "本命星",
  "月命星",
  "傾斜",
  "ツォルキン",
  "トレセーナ",
];

const SALES_TERMS = ["有料", "購入", "解放", "続きは", "詳しい鑑定では"];

const JOB_TERMS = [
  "研究者",
  "教師",
  "講師",
  "編集者",
  "ライター",
  "エンジニア",
  "デザイナー",
  "コンサルタント",
  "経営者",
  "営業職",
  "公務員",
];

function countCharacters(body: string[]): number {
  return body.join("").replace(/\s/g, "").length;
}

function warningsForBlock(
  title: string,
  body: string[],
  tier: ReadingTier,
  topic: ReadingTopicId,
): CopyReviewWarning[] {
  const text = [title, ...body].join("\n");
  const characterCount = countCharacters(body);
  const warnings: CopyReviewWarning[] = [];

  for (const [term, detail] of ABSTRACT_TERMS) {
    if (text.includes(term)) {
      warnings.push({ kind: "abstract", label: `抽象語「${term}」`, detail });
    }
  }

  if (topic !== "evidence") {
    const found = JARGON_TERMS.filter((term) => text.includes(term));
    if (found.length > 0) {
      warnings.push({
        kind: "jargon",
        label: "専門用語",
        detail: `${found.join("・")}は鑑定根拠へ移し、通常文では日常語に置き換えます。`,
      });
    }
  }

  if (tier === "free" && topic !== "evidence") {
    if (characterCount < 250) {
      warnings.push({
        kind: "length",
        label: `無料文が短い（${characterCount}字）`,
        detail: "250〜650字を目安に、傾向と活きやすい場面まで伝えます。",
      });
    } else if (characterCount > 650) {
      warnings.push({
        kind: "length",
        label: `無料文が長い（${characterCount}字）`,
        detail: "無料枠は650字以内を目安にし、具体的な職業や弱みは詳しい鑑定へ分けます。",
      });
    }

    if (body.length < 3) {
      warnings.push({
        kind: "structure",
        label: "見出し構造が不足",
        detail: "結論、2〜3個の傾向、活きやすい場面に分けて読みやすくします。",
      });
    }

    const jobs = JOB_TERMS.filter((term) => text.includes(term));
    if (jobs.length > 0) {
      warnings.push({
        kind: "specific-job",
        label: "無料枠に具体的な職業",
        detail: `${jobs.join("・")}は詳しい鑑定へ移し、無料枠では適性の方向だけ示します。`,
      });
    }
  }

  const sales = SALES_TERMS.filter((term) => text.includes(term));
  if (sales.length > 0) {
    warnings.push({
      kind: "sales",
      label: "課金誘導が文章内にある",
      detail: `${sales.join("・")}を削り、続きの案内はUI側で行います。`,
    });
  }

  return warnings;
}

export function buildCopyReviewRecords(
  sampleId: string,
  sampleLabel: string,
  result: MultiFortuneResult,
): CopyReviewRecord[] {
  return result.readings.flatMap((report) =>
    report.topics.flatMap((topic) =>
      topic.blocks.map((block) => ({
        id: `${sampleId}:${report.method}:${topic.id}:${block.id}`,
        sampleId,
        sampleLabel,
        method: report.method,
        methodName: report.displayName,
        methodVersion: report.version,
        topic: topic.id,
        topicTitle: topic.title,
        tier: block.tier,
        blockTitle: block.title,
        body: block.sections
          ? block.sections.flatMap((section) => [section.title ?? "", ...section.body]).filter(Boolean)
          : block.body,
        characterCount: countCharacters(
          block.sections
            ? block.sections.flatMap((section) => [section.title ?? "", ...section.body]).filter(Boolean)
            : block.body,
        ),
        warnings: warningsForBlock(
          block.title,
          block.sections
            ? block.sections.flatMap((section) => [section.title ?? "", ...section.body]).filter(Boolean)
            : block.body,
          block.tier,
          topic.id,
        ),
      })),
    ),
  );
}
