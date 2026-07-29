"use client";

import {
  BookOpenText,
  BriefcaseBusiness,
  CalendarRange,
  Coins,
  Compass,
  Grid3X3,
  Hash,
  Heart,
  Layers3,
  LockKeyhole,
  Orbit,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  FortuneMethod,
  MultiFortuneResult,
  ReadingBlock,
  ReadingTopicId,
} from "@/lib/engines";
import type { FortuneDomain } from "@/lib/engines/types";
import type { MethodReadingTopic } from "@/lib/readings/types";
import { METHOD_DISPLAY_ORDER, rankReadingsForDomain } from "@/lib/readings/rank-methods";

const DOMAIN_TABS = [
  { id: "talent", label: "才能", icon: Sparkles },
  { id: "love", label: "恋愛", icon: Heart },
  { id: "career", label: "仕事", icon: BriefcaseBusiness },
  { id: "money", label: "金運", icon: Coins },
] as const satisfies ReadonlyArray<{
  id: FortuneDomain;
  label: string;
  icon: typeof Sparkles;
}>;

const METHOD_TOPIC_TABS = [
  ...DOMAIN_TABS,
  { id: "evidence", label: "鑑定根拠", icon: BookOpenText },
] as const satisfies ReadonlyArray<{
  id: ReadingTopicId;
  label: string;
  icon: typeof Sparkles;
}>;

const METHOD_ICONS: Record<FortuneMethod, typeof Sparkles> = {
  bazi: Layers3,
  western: Orbit,
  ziwei: Grid3X3,
  numerology: Hash,
  kyusei: Compass,
  maya: CalendarRange,
};

type ResultView = "domain" | "method";

type FortuneResultsProps = {
  result: MultiFortuneResult;
  activeMethod: FortuneMethod;
  activeTopic: ReadingTopicId;
  onMethodChange: (method: FortuneMethod) => void;
  onTopicChange: (topic: ReadingTopicId) => void;
  onReset: () => void;
};

function ReadingContentBlock({
  block,
  hideFirstSectionTitle = false,
}: {
  block: ReadingBlock;
  hideFirstSectionTitle?: boolean;
}) {
  return (
    <section className={"reading-block reading-block-" + block.kind}>
      <h4>{block.title}</h4>
      {block.sections ? (
        <div className="reading-block-sections">
          {block.sections.map((section, index) => (
            <section key={`${block.id}-section-${index}`}>
              {section.title && !(hideFirstSectionTitle && index === 0) && <h5>{section.title}</h5>}
              {section.body.map((line, lineIndex) => (
                <p key={`${block.id}-section-${index}-${lineIndex}`}>{line}</p>
              ))}
            </section>
          ))}
        </div>
      ) : block.body.length === 1 ? (
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

function topicConclusion(topic: MethodReadingTopic): string {
  const freeBlock = topic.blocks.find((block) => block.tier === "free");
  const sectionTitle = freeBlock?.sections?.[0]?.title?.replace(/^\d+）\s*/, "").trim();
  return sectionTitle || freeBlock?.body[0] || topic.overview;
}

function methodAnchor(topic: FortuneDomain, method: FortuneMethod) {
  return `reading-${topic}-${method}`;
}

export function FortuneResults({
  result,
  activeMethod,
  activeTopic,
  onMethodChange,
  onTopicChange,
  onReset,
}: FortuneResultsProps) {
  const [view, setView] = useState<ResultView>("domain");
  const activeDomain: FortuneDomain = activeTopic === "evidence" ? "talent" : activeTopic;
  const sortedDomainReadings = useMemo(
    () => rankReadingsForDomain(result.readings, result.input, activeDomain),
    [activeDomain, result.input, result.readings],
  );
  const methodReadings = useMemo(
    () => [...result.readings].sort(
      (left, right) => METHOD_DISPLAY_ORDER.indexOf(left.method) - METHOD_DISPLAY_ORDER.indexOf(right.method),
    ),
    [result.readings],
  );
  const activeReport =
    methodReadings.find((reading) => reading.method === activeMethod) ?? methodReadings[0];
  const activeTopicReport =
    activeReport?.topics.find((topic) => topic.id === activeTopic) ?? activeReport?.topics[0];

  if (!activeReport || !activeTopicReport) return null;

  const freeBlocks = activeTopicReport.blocks.filter((block) => block.tier === "free");
  const premiumBlocks = activeTopicReport.blocks.filter((block) => block.tier === "premium");

  const selectDomain = (domain: FortuneDomain) => {
    onTopicChange(domain);
  };

  const showMethodEvidence = (method: FortuneMethod) => {
    onMethodChange(method);
    onTopicChange("evidence");
    setView("method");
  };

  return (
    <section className="reading-results" aria-labelledby="reading-results-title">
      <header className="results-heading">
        <div>
          <p className="section-kicker">READING</p>
          <h2 id="reading-results-title">あなたの鑑定結果</h2>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={18} />
          入力を変える
        </button>
      </header>

      <div className="result-view-switch" role="group" aria-label="結果の表示方法">
        <button
          type="button"
          className={view === "domain" ? "is-active" : ""}
          onClick={() => {
            if (activeTopic === "evidence") onTopicChange("talent");
            setView("domain");
          }}
        >
          分野ごとに見る
        </button>
        <button
          type="button"
          className={view === "method" ? "is-active" : ""}
          onClick={() => setView("method")}
        >
          占術ごとに見る
        </button>
      </div>

      {view === "domain" ? (
        <div className="domain-view">
          <div className="domain-tabs" role="tablist" aria-label="知りたい分野を選ぶ">
            {DOMAIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "domain-tab is-active" : "domain-tab"}
                  onClick={() => selectDomain(tab.id)}
                >
                  <Icon aria-hidden="true" size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <nav className="domain-method-jumps" aria-label={`${activeTopicReport.title}の占術へ移動`}>
            {sortedDomainReadings.map((reading) => {
              const Icon = METHOD_ICONS[reading.method];
              return (
                <button
                  key={reading.method}
                  type="button"
                  onClick={() => document.getElementById(methodAnchor(activeDomain, reading.method))
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                  <span>{reading.displayName}</span>
                </button>
              );
            })}
          </nav>

          <div className="domain-reading-list">
            {sortedDomainReadings.map((reading, index) => {
              const topic = reading.topics.find((item) => item.id === activeDomain);
              if (!topic) return null;
              const Icon = METHOD_ICONS[reading.method];
              const domainFreeBlocks = topic.blocks.filter((block) => block.tier === "free");
              const domainPremiumBlocks = topic.blocks.filter((block) => block.tier === "premium");
              return (
                <article
                  key={reading.method}
                  id={methodAnchor(activeDomain, reading.method)}
                  className="domain-method-report"
                >
                  <header className="domain-method-heading">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden="true" size={24} strokeWidth={1.7} />
                    <div>
                      <p>{reading.displayName}で見る</p>
                      <h3>{topic.title}</h3>
                    </div>
                  </header>

                  <p className="domain-conclusion">{topicConclusion(topic)}</p>

                  <div className="reading-tier reading-tier-free">
                    {domainFreeBlocks.map((block, blockIndex) => (
                      <ReadingContentBlock
                        key={block.id}
                        block={block}
                        hideFirstSectionTitle={blockIndex === 0}
                      />
                    ))}
                  </div>

                  {domainPremiumBlocks.length > 0 && (
                    <div className="reading-tier reading-tier-premium">
                      <header>
                        <div>
                          <LockKeyhole aria-hidden="true" size={18} />
                          <strong>詳しい鑑定</strong>
                          <span>有料予定</span>
                        </div>
                      </header>
                      {domainPremiumBlocks.map((block) => (
                        <ReadingContentBlock key={block.id} block={block} />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="evidence-link-button"
                    onClick={() => showMethodEvidence(reading.method)}
                  >
                    <BookOpenText aria-hidden="true" size={17} />
                    {reading.displayName}の鑑定根拠を見る
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="method-view">
          <div className="method-selector" role="tablist" aria-label="占術を選ぶ">
            {methodReadings.map((reading, index) => {
              const selected = activeReport.method === reading.method;
              const Icon = METHOD_ICONS[reading.method];
              return (
                <button
                  key={reading.method}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "method-select-button is-active" : "method-select-button"}
                  onClick={() => onMethodChange(reading.method)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                  <strong>{reading.displayName}</strong>
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
            </header>

            <div className="topic-tabs" role="tablist" aria-label={activeReport.displayName + "の項目"}>
              {METHOD_TOPIC_TABS.map((tab) => {
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

              {activeTopicReport.id !== "evidence" && (
                <p className="method-conclusion">{topicConclusion(activeTopicReport)}</p>
              )}

              <div className="reading-tier reading-tier-free">
                {freeBlocks.map((block, blockIndex) => (
                  <ReadingContentBlock
                    key={block.id}
                    block={block}
                    hideFirstSectionTitle={blockIndex === 0 && activeTopicReport.id !== "evidence"}
                  />
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
                  </header>
                  {premiumBlocks.map((block) => (
                    <ReadingContentBlock key={block.id} block={block} />
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
