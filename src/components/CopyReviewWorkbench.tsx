"use client";

import { Check, Clipboard, Flag, PencilLine, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CopyReviewRecord } from "@/lib/readings/copy-review";

type ReviewDecision = "approved" | "needs-work";

type CopyReviewWorkbenchProps = {
  records: CopyReviewRecord[];
};

const STORAGE_KEY = "fortune-platform-copy-review-v1";

const TOPIC_LABELS = {
  talent: "才能",
  love: "恋愛",
  career: "仕事",
  money: "金運",
  evidence: "鑑定根拠",
} as const;

function decisionLabel(decision?: ReviewDecision): string {
  if (decision === "approved") return "OK";
  if (decision === "needs-work") return "要修正";
  return "未確認";
}

export function CopyReviewWorkbench({ records }: CopyReviewWorkbenchProps) {
  const [sampleId, setSampleId] = useState("tajimi-2004-male");
  const [method, setMethod] = useState("all");
  const [topic, setTopic] = useState("talent");
  const [tier, setTier] = useState("free");
  const [warningFilter, setWarningFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setDecisions(JSON.parse(stored) as Record<string, ReviewDecision>);
      } catch {
        // A broken local value should not make the review page unusable.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const samples = useMemo(
    () => [...new Map(records.map((record) => [record.sampleId, record.sampleLabel])).entries()],
    [records],
  );
  const methods = useMemo(
    () => [...new Map(records.map((record) => [record.method, record.methodName])).entries()],
    [records],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      if (sampleId !== "all" && record.sampleId !== sampleId) return false;
      if (method !== "all" && record.method !== method) return false;
      if (topic !== "all" && record.topic !== topic) return false;
      if (tier !== "all" && record.tier !== tier) return false;
      if (warningFilter === "warning" && record.warnings.length === 0) return false;
      if (warningFilter === "approved" && decisions[record.id] !== "approved") return false;
      if (warningFilter === "needs-work" && decisions[record.id] !== "needs-work") return false;
      if (warningFilter === "unreviewed" && decisions[record.id]) return false;
      if (
        normalizedQuery &&
        ![record.blockTitle, ...record.body].join(" ").toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [decisions, method, query, records, sampleId, tier, topic, warningFilter]);

  const totals = useMemo(
    () => ({
      all: records.length,
      warnings: records.filter((record) => record.warnings.length > 0).length,
      approved: Object.values(decisions).filter((value) => value === "approved").length,
      needsWork: Object.values(decisions).filter((value) => value === "needs-work").length,
    }),
    [decisions, records],
  );

  const saveDecision = (id: string, decision: ReviewDecision) => {
    const next = { ...decisions, [id]: decision };
    setDecisions(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearDecisions = () => {
    setDecisions({});
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const copyRecord = async (record: CopyReviewRecord) => {
    await navigator.clipboard.writeText([record.blockTitle, ...record.body].join("\n\n"));
    setCopiedId(record.id);
    window.setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <main className="copy-review-page">
      <header className="copy-review-header">
        <div>
          <p className="section-kicker">DEVELOPER COPY REVIEW</p>
          <h1>鑑定文の確認</h1>
          <p>代表例を使って、文章量・難しい言葉・無料と有料の分け方を確認します。</p>
        </div>
        <div className="copy-review-header-actions">
          <Link href="/dev/copy-editor">
            <PencilLine aria-hidden="true" size={17} />
            文章を編集
          </Link>
          <button className="copy-review-reset" type="button" onClick={clearDecisions}>
            <RotateCcw aria-hidden="true" size={17} />
            確認状態を消去
          </button>
        </div>
      </header>

      <section className="copy-review-metrics" aria-label="確認状況">
        <div><span>全文</span><strong>{totals.all}</strong></div>
        <div><span>自動警告あり</span><strong>{totals.warnings}</strong></div>
        <div><span>OK</span><strong>{totals.approved}</strong></div>
        <div><span>要修正</span><strong>{totals.needsWork}</strong></div>
      </section>

      <section className="copy-review-toolbar" aria-label="文章を絞り込む">
        <label>
          <span>代表例</span>
          <select value={sampleId} onChange={(event) => setSampleId(event.target.value)}>
            <option value="all">すべて</option>
            {samples.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>占術</span>
          <select value={method} onChange={(event) => setMethod(event.target.value)}>
            <option value="all">すべて</option>
            {methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>分野</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="all">すべて</option>
            {Object.entries(TOPIC_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>公開範囲</span>
          <select value={tier} onChange={(event) => setTier(event.target.value)}>
            <option value="all">すべて</option>
            <option value="free">無料</option>
            <option value="premium">有料</option>
          </select>
        </label>
        <label>
          <span>状態</span>
          <select value={warningFilter} onChange={(event) => setWarningFilter(event.target.value)}>
            <option value="all">すべて</option>
            <option value="warning">自動警告あり</option>
            <option value="unreviewed">未確認</option>
            <option value="approved">OK</option>
            <option value="needs-work">要修正</option>
          </select>
        </label>
        <label className="copy-review-search">
          <span>文章検索</span>
          <div>
            <Search aria-hidden="true" size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="言葉を検索" />
          </div>
        </label>
      </section>

      <div className="copy-review-count">{filtered.length}件を表示</div>

      <section className="copy-review-list" aria-live="polite">
        {filtered.map((record) => {
          const decision = decisions[record.id];
          return (
            <article className="copy-review-item" key={record.id}>
              <header>
                <div className="copy-review-tags">
                  <span>{record.sampleLabel}</span>
                  <span>{record.methodName}</span>
                  <span>{record.topicTitle}</span>
                  <span className={record.tier === "free" ? "is-free" : "is-premium"}>
                    {record.tier === "free" ? "無料" : "有料"}
                  </span>
                  <span>{record.characterCount}字</span>
                </div>
                <button
                  className="copy-review-icon-button"
                  type="button"
                  onClick={() => copyRecord(record)}
                  title="文章をコピー"
                  aria-label={record.blockTitle + "をコピー"}
                >
                  {copiedId === record.id ? <Check aria-hidden="true" size={18} /> : <Clipboard aria-hidden="true" size={18} />}
                </button>
              </header>

              <div className="copy-review-copy">
                <h2>{record.blockTitle}</h2>
                {record.body.map((line, index) => <p key={`${record.id}-${index}`}>{line}</p>)}
              </div>

              {record.warnings.length > 0 && (
                <div className="copy-review-warnings">
                  {record.warnings.map((warning) => (
                    <div key={`${record.id}-${warning.kind}-${warning.label}`}>
                      <strong>{warning.label}</strong>
                      <span>{warning.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              <footer>
                <small>{record.methodVersion} · {decisionLabel(decision)}</small>
                <div>
                  <button
                    type="button"
                    className={decision === "approved" ? "is-selected is-approved" : ""}
                    onClick={() => saveDecision(record.id, "approved")}
                  >
                    <Check aria-hidden="true" size={16} />
                    OK
                  </button>
                  <button
                    type="button"
                    className={decision === "needs-work" ? "is-selected is-needs-work" : ""}
                    onClick={() => saveDecision(record.id, "needs-work")}
                  >
                    <Flag aria-hidden="true" size={16} />
                    要修正
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="copy-review-empty">条件に合う文章はありません。</div>
        )}
      </section>
    </main>
  );
}
