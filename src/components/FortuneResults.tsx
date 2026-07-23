"use client";

import {
  BookOpenText,
  BriefcaseBusiness,
  Coins,
  Heart,
  LockKeyhole,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type {
  FortuneMethod,
  MultiFortuneResult,
  ReadingBlock,
  ReadingTopicId,
} from "@/lib/engines";

const TOPIC_TABS = [
  { id: "talent", label: "才能", icon: Sparkles },
  { id: "love", label: "恋愛", icon: Heart },
  { id: "career", label: "仕事", icon: BriefcaseBusiness },
  { id: "money", label: "金運", icon: Coins },
  { id: "evidence", label: "鑑定根拠", icon: BookOpenText },
] as const satisfies ReadonlyArray<{
  id: ReadingTopicId;
  label: string;
  icon: typeof Sparkles;
}>;

type FortuneResultsProps = {
  result: MultiFortuneResult;
  activeMethod: FortuneMethod;
  activeTopic: ReadingTopicId;
  onMethodChange: (method: FortuneMethod) => void;
  onTopicChange: (topic: ReadingTopicId) => void;
  onReset: () => void;
};

function confidenceLabel(score: number): string {
  if (score >= 0.75) return "高精度";
  if (score >= 0.45) return "標準";
  return "参考";
}

function ReadingContentBlock({ block }: { block: ReadingBlock }) {
  return (
    <section className={"reading-block reading-block-" + block.kind}>
      <h4>{block.title}</h4>
      {block.body.length === 1 ? (
        <p>{block.body[0]}</p>
      ) : (
        <ul>
          {block.body.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FortuneResults({
  result,
  activeMethod,
  activeTopic,
  onMethodChange,
  onTopicChange,
  onReset,
}: FortuneResultsProps) {
  const activeReport =
    result.readings.find((reading) => reading.method === activeMethod) ?? result.readings[0];
  const activeTopicReport =
    activeReport?.topics.find((topic) => topic.id === activeTopic) ?? activeReport?.topics[0];

  if (!activeReport || !activeTopicReport) return null;

  const freeBlocks = activeTopicReport.blocks.filter((block) => block.tier === "free");
  const premiumBlocks = activeTopicReport.blocks.filter((block) => block.tier === "premium");

  return (
    <section className="reading-results" aria-labelledby="reading-results-title">
      <header className="results-heading">
        <div>
          <p className="section-kicker">READING</p>
          <h2 id="reading-results-title">あなたの鑑定結果</h2>
          <p>{result.targetDate}時点の結果です。まず、詳しく見たい占術を選んでください。</p>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={18} />
          入力を変える
        </button>
      </header>

      <div className="method-selector" role="tablist" aria-label="占術を選ぶ">
        {result.readings.map((reading, index) => {
          const selected = activeReport.method === reading.method;
          return (
            <button
              key={reading.method}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? "method-select-button is-active" : "method-select-button"}
              onClick={() => {
                onMethodChange(reading.method);
                onTopicChange("talent");
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{reading.displayName}</strong>
              <small>{confidenceLabel(reading.confidence.score)}</small>
            </button>
          );
        })}
      </div>

      <article className="active-method-report">
        <header className="active-method-heading">
          <div>
            <p className="section-kicker">METHOD</p>
            <h3>{activeReport.displayName}</h3>
          </div>
          <span className={"confidence confidence-" + activeReport.confidence.level}>
            {confidenceLabel(activeReport.confidence.score)}
          </span>
        </header>

        <div className="topic-tabs" role="tablist" aria-label={activeReport.displayName + "の項目"}>
          {TOPIC_TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTopicReport.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={selected ? "topic-tab is-active" : "topic-tab"}
                onClick={() => onTopicChange(tab.id)}
              >
                <Icon aria-hidden="true" size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className="method-topic-panel"
          role="tabpanel"
          aria-label={activeReport.displayName + "の" + activeTopicReport.title}
        >
          <div className="topic-overview">
            <div>
              <p className="topic-eyebrow">
                {activeTopicReport.id === "evidence" ? "HOW IT WAS READ" : "FREE READING"}
              </p>
              <h3>{activeTopicReport.title}</h3>
            </div>
            <p>{activeTopicReport.overview}</p>
          </div>

          <div className="reading-tier reading-tier-free">
            {freeBlocks.map((block) => (
              <ReadingContentBlock key={block.id} block={block} />
            ))}
          </div>

          {premiumBlocks.length > 0 && (
            <div className="reading-tier reading-tier-premium">
              <header>
                <div>
                  <LockKeyhole aria-hidden="true" size={18} />
                  <strong>詳しい鑑定</strong>
                  <span>有料予定</span>
                </div>
                <p>現在は文章設計を確認するため、内容を表示しています。</p>
              </header>
              {premiumBlocks.map((block) => (
                <ReadingContentBlock key={block.id} block={block} />
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
