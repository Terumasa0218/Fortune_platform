"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  Coins,
  Heart,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { MultiFortuneResult } from "@/lib/engines";
import type { FortuneDomain } from "@/lib/engines/types";

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

type FortuneResultsProps = {
  result: MultiFortuneResult;
  activeDomain: FortuneDomain;
  onDomainChange: (domain: FortuneDomain) => void;
  onReset: () => void;
};

function confidenceLabel(score: number): string {
  if (score >= 0.75) return "高精度";
  if (score >= 0.45) return "標準";
  return "参考";
}

export function FortuneResults({
  result,
  activeDomain,
  onDomainChange,
  onReset,
}: FortuneResultsProps) {
  const activeLabel = DOMAIN_TABS.find((tab) => tab.id === activeDomain)?.label ?? "才能";

  return (
    <section className="reading-results" aria-labelledby="reading-results-title">
      <header className="results-heading">
        <div>
          <p className="section-kicker">READING</p>
          <h2 id="reading-results-title">あなたの鑑定結果</h2>
          <p>{result.targetDate}時点の6占術を、分野ごとに読み解きます。</p>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={18} />
          入力を変える
        </button>
      </header>

      <div className="domain-tabs" role="tablist" aria-label="鑑定分野">
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
              onClick={() => onDomainChange(tab.id)}
            >
              <Icon aria-hidden="true" size={19} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="method-readings" role="tabpanel" aria-label={`${activeLabel}の鑑定結果`}>
        {result.results.map((method, index) => {
          const domain = method.domains.find((item) => item.domain === activeDomain);
          if (!domain) return null;

          return (
            <details key={method.method} className="method-reading" open={index === 0}>
              <summary>
                <span className="method-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="method-title">
                  <strong>{method.displayName}</strong>
                  <small>{domain.overview}</small>
                </span>
                <span className={`confidence confidence-${method.confidence.level}`}>
                  {confidenceLabel(method.confidence.score)}
                </span>
                <ChevronDown className="summary-chevron" aria-hidden="true" size={20} />
              </summary>

              <div className="method-content">
                {domain.topics.map((topic, topicIndex) => (
                  <article className="result-topic" key={`${topic.topic ?? topic.title}-${topicIndex}`}>
                    <h3>{topic.title}</h3>
                    <p>{topic.summary}</p>
                    {topic.advice[0] && (
                      <p className="result-advice">
                        <span>行動のヒント</span>
                        {topic.advice[0]}
                      </p>
                    )}
                  </article>
                ))}

                <details className="calculation-notes">
                  <summary>精度と計算方式</summary>
                  <ul>
                    {method.confidence.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
