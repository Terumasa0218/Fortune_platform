"use client";

import { Cloud, Download, History, RotateCcw, Save, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildBaziTalentFreeCopy,
  type BaziTalentCopyPack,
  type BaziTalentDayMasterCopy,
  type BaziTalentTenGodCopy,
  type ReadingTone,
} from "@/lib/readings/bazi-talent-copy";
import {
  BAZI_TALENT_CMS_STORAGE_KEY,
  type BaziTalentCmsSnapshot,
} from "@/lib/readings/copy-cms";

type CopyEditorWorkbenchProps = {
  initialPack: BaziTalentCopyPack;
};

function initialSnapshot(pack: BaziTalentCopyPack): BaziTalentCmsSnapshot {
  return {
    draft: clonePack(pack),
    published: clonePack(pack),
    draftTone: "standard",
    publishedTone: "standard",
    revision: 1,
    updatedAt: null,
    publishedAt: null,
    history: [],
  };
}

const DAY_MASTER_LABELS: Record<string, string> = {
  甲: "甲（大樹）",
  乙: "乙（草花）",
  丙: "丙（太陽）",
  丁: "丁（灯火）",
  戊: "戊（山）",
  己: "己（田畑）",
  庚: "庚（鋼）",
  辛: "辛（宝石）",
  壬: "壬（大海）",
  癸: "癸（雨露）",
};

const DAY_FIELDS: Array<{
  key: keyof BaziTalentDayMasterCopy;
  label: string;
  multiline?: boolean;
}> = [
  { key: "primaryHeading", label: "傾向1の見出し" },
  { key: "primaryBody", label: "傾向1の本文", multiline: true },
  { key: "secondaryHeading", label: "傾向3の見出し" },
  { key: "secondaryBody", label: "傾向3の本文", multiline: true },
  { key: "scene", label: "活きやすい場面" },
  { key: "growth", label: "才能を伸ばす鍵", multiline: true },
];

const GOD_FIELDS: Array<{
  key: keyof BaziTalentTenGodCopy;
  label: string;
  multiline?: boolean;
}> = [
  { key: "heading", label: "傾向2の見出し" },
  { key: "body", label: "傾向2の本文", multiline: true },
  { key: "scene", label: "活きやすい場面" },
];

const TONE_LABELS: Record<ReadingTone, string> = {
  standard: "すっきり",
  warm: "寄り添い",
  playful: "軽いユーモア",
};

function clonePack(pack: BaziTalentCopyPack): BaziTalentCopyPack {
  return JSON.parse(JSON.stringify(pack)) as BaziTalentCopyPack;
}

export function CopyEditorWorkbench({ initialPack }: CopyEditorWorkbenchProps) {
  const [snapshot, setSnapshot] = useState(() => initialSnapshot(initialPack));
  const [dayMaster, setDayMaster] = useState("丁");
  const [tenGod, setTenGod] = useState("印綬");
  const [tone, setTone] = useState<ReadingTone>("standard");
  const [notice, setNotice] = useState("");
  const [storageMode, setStorageMode] = useState<"local" | "cloud">("local");
  const [connecting, setConnecting] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const pack = snapshot.draft;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(BAZI_TALENT_CMS_STORAGE_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as BaziTalentCmsSnapshot | BaziTalentCopyPack;
        setSnapshot("draft" in parsed
          ? {
              ...parsed,
              draftTone: parsed.draftTone ?? "standard",
              publishedTone: parsed.publishedTone ?? "standard",
              history: parsed.history.map((revision) => ({
                ...revision,
                tone: revision.tone ?? "standard",
              })),
            }
          : { ...initialSnapshot(initialPack), draft: parsed });
      } catch {
        window.localStorage.removeItem(BAZI_TALENT_CMS_STORAGE_KEY);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialPack]);

  const dayCopy = useMemo(() => {
    const entry = pack.dayMasters[dayMaster];
    return { ...entry.standard, ...(tone === "standard" ? {} : entry[tone]) };
  }, [dayMaster, pack, tone]);

  const godCopy = useMemo(() => {
    const entry = pack.tenGods[tenGod];
    return { ...entry.standard, ...(tone === "standard" ? {} : entry[tone]) };
  }, [pack, tenGod, tone]);

  const preview = useMemo(
    () => buildBaziTalentFreeCopy(
      {
        key: "bazi-talent-free-v1",
        variables: { dayMaster, dominantGods: [tenGod] },
      },
      tone,
      pack,
    ),
    [dayMaster, pack, tenGod, tone],
  );

  const updateDayField = (field: keyof BaziTalentDayMasterCopy, value: string) => {
    setSnapshot((current) => {
      const next = clonePack(current.draft);
      const entry = next.dayMasters[dayMaster];
      if (tone === "standard") entry.standard[field] = value;
      else if (tone === "warm") entry.warm = { ...entry.warm, [field]: value };
      else entry.playful = { ...entry.playful, [field]: value };
      return { ...current, draft: next };
    });
  };

  const updateGodField = (field: keyof BaziTalentTenGodCopy, value: string) => {
    setSnapshot((current) => {
      const next = clonePack(current.draft);
      const entry = next.tenGods[tenGod];
      if (tone === "standard") entry.standard[field] = value;
      else if (tone === "warm") entry.warm = { ...entry.warm, [field]: value };
      else entry.playful = { ...entry.playful, [field]: value };
      return { ...current, draft: next };
    });
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1600);
  };

  const saveDraft = async () => {
    const next = { ...snapshot, draftTone: tone, updatedAt: new Date().toISOString() };
    try {
      if (storageMode === "cloud") {
        const { saveBaziTalentDraft } = await import("@/lib/firebase/reading-copy");
        await saveBaziTalentDraft(next);
      }
      setSnapshot(next);
      window.localStorage.setItem(BAZI_TALENT_CMS_STORAGE_KEY, JSON.stringify(next));
      showNotice(storageMode === "cloud" ? "クラウドに下書きを保存しました" : "この端末に下書きを保存しました");
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "下書きを保存できませんでした");
    }
  };

  const publish = async () => {
    const publishedAt = new Date().toISOString();
    const revision = snapshot.revision + 1;
    const next: BaziTalentCmsSnapshot = {
      ...snapshot,
      published: clonePack(pack),
      draftTone: tone,
      publishedTone: tone,
      revision,
      updatedAt: publishedAt,
      publishedAt,
      history: [
        {
          revision: snapshot.revision,
          publishedAt: snapshot.publishedAt ?? publishedAt,
          pack: clonePack(snapshot.published),
          tone: snapshot.publishedTone,
        },
        ...snapshot.history,
      ].slice(0, 20),
    };
    try {
      if (storageMode === "cloud") {
        const { publishBaziTalentCopy } = await import("@/lib/firebase/reading-copy");
        await publishBaziTalentCopy(next);
      }
      setSnapshot(next);
      window.localStorage.setItem(BAZI_TALENT_CMS_STORAGE_KEY, JSON.stringify(next));
      showNotice(`第${revision}版を公開しました`);
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "公開できませんでした");
    }
  };

  const connectCloud = async () => {
    setConnecting(true);
    try {
      const {
        loadBaziTalentCmsSnapshot,
        signInCopyCmsAdmin,
      } = await import("@/lib/firebase/reading-copy");
      const user = await signInCopyCmsAdmin();
      const cloudSnapshot = await loadBaziTalentCmsSnapshot(snapshot);
      setSnapshot(cloudSnapshot);
      setStorageMode("cloud");
      setAdminEmail(user.email);
      window.localStorage.setItem(BAZI_TALENT_CMS_STORAGE_KEY, JSON.stringify(cloudSnapshot));
      showNotice("クラウドの管理画面へ接続しました");
    } catch (caught) {
      showNotice(caught instanceof Error ? caught.message : "クラウドへ接続できませんでした");
    } finally {
      setConnecting(false);
    }
  };

  const restoreRevision = (revision: BaziTalentCmsSnapshot["history"][number]) => {
    setSnapshot((current) => ({
      ...current,
      draft: clonePack(revision.pack),
      draftTone: revision.tone,
    }));
    setTone(revision.tone);
    showNotice(`第${revision.revision}版を下書きへ戻しました`);
  };

  const resetSelected = () => {
    setSnapshot((current) => {
      const next = clonePack(current.draft);
      if (tone === "standard") {
        next.dayMasters[dayMaster].standard = clonePack(initialPack).dayMasters[dayMaster].standard;
        next.tenGods[tenGod].standard = clonePack(initialPack).tenGods[tenGod].standard;
      } else if (tone === "warm") {
        next.dayMasters[dayMaster].warm = clonePack(initialPack).dayMasters[dayMaster].warm;
        next.tenGods[tenGod].warm = clonePack(initialPack).tenGods[tenGod].warm;
      } else {
        next.dayMasters[dayMaster].playful = clonePack(initialPack).dayMasters[dayMaster].playful;
        next.tenGods[tenGod].playful = clonePack(initialPack).tenGods[tenGod].playful;
      }
      return { ...current, draft: next };
    });
    showNotice("選択中の文章を元に戻しました");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(pack, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bazi-talent.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showNotice("バックアップを保存しました");
  };

  return (
    <main className="copy-editor-page">
      <header className="copy-editor-header">
        <div>
          <p className="section-kicker">DEVELOPER COPY EDITOR</p>
          <h1>四柱推命・才能の文章編集</h1>
          <p>計算結果は変えず、読者へ見せる文章と文体だけを編集します。</p>
        </div>
        <nav aria-label="開発者向け文章ツール">
          <Link href="/dev/copy-review">全文を確認</Link>
          <button type="button" onClick={connectCloud} disabled={connecting || storageMode === "cloud"}>
            <Cloud aria-hidden="true" size={16} />
            {storageMode === "cloud" ? "クラウド接続中" : connecting ? "接続中" : "クラウドへ接続"}
          </button>
        </nav>
      </header>

      <section className="copy-editor-status" aria-label="公開状態">
        <div>
          <span className={storageMode === "cloud" ? "is-published" : "is-local"}>
            {storageMode === "cloud" ? "クラウド公開" : "端末内プレビュー"}
          </span>
          <strong>四柱推命 / 才能 / 無料枠</strong>
          <small>公開文体: {TONE_LABELS[snapshot.publishedTone]}</small>
          {adminEmail && <small>{adminEmail}</small>}
        </div>
        <div>
          <History aria-hidden="true" size={16} />
          <span>第{snapshot.revision}版</span>
          <span>{snapshot.publishedAt ? new Date(snapshot.publishedAt).toLocaleString("ja-JP") : "初期文章"}</span>
        </div>
        {snapshot.history.length > 0 && (
          <details>
            <summary>過去の版</summary>
            <div>
              {snapshot.history.map((revision) => (
                <button
                  key={`${revision.revision}-${revision.publishedAt}`}
                  type="button"
                  onClick={() => restoreRevision(revision)}
                >
                  第{revision.revision}版を下書きへ戻す
                </button>
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="copy-editor-toolbar" aria-label="編集する文章を選ぶ">
        <label>
          <span>基本の性質</span>
          <select value={dayMaster} onChange={(event) => setDayMaster(event.target.value)}>
            {Object.keys(pack.dayMasters).map((value) => (
              <option key={value} value={value}>{DAY_MASTER_LABELS[value] ?? value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>強く出る性質</span>
          <select value={tenGod} onChange={(event) => setTenGod(event.target.value)}>
            {Object.keys(pack.tenGods).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>文体</legend>
          <div className="copy-editor-segmented">
            <button
              type="button"
              className={tone === "standard" ? "is-active" : ""}
              onClick={() => setTone("standard")}
            >すっきり</button>
            <button
              type="button"
              className={tone === "warm" ? "is-active" : ""}
              onClick={() => setTone("warm")}
            >寄り添い</button>
            <button
              type="button"
              className={tone === "playful" ? "is-active" : ""}
              onClick={() => setTone("playful")}
            >軽いユーモア</button>
          </div>
        </fieldset>
      </section>

      <div className="copy-editor-layout">
        <section className="copy-editor-form" aria-label="文章入力">
          <div className="copy-editor-group">
            <header>
              <h2>{DAY_MASTER_LABELS[dayMaster] ?? dayMaster}から作る文章</h2>
              <span>傾向1・3</span>
            </header>
            {DAY_FIELDS.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                {field.multiline ? (
                  <textarea
                    rows={4}
                    value={dayCopy[field.key]}
                    onChange={(event) => updateDayField(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    value={dayCopy[field.key]}
                    onChange={(event) => updateDayField(field.key, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="copy-editor-group">
            <header>
              <h2>{tenGod}から作る文章</h2>
              <span>傾向2</span>
            </header>
            {GOD_FIELDS.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                {field.multiline ? (
                  <textarea
                    rows={4}
                    value={godCopy[field.key]}
                    onChange={(event) => updateGodField(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    value={godCopy[field.key]}
                    onChange={(event) => updateGodField(field.key, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <aside className="copy-editor-preview" aria-label="文章プレビュー">
          <div className="copy-editor-preview-heading">
            <div>
              <span>LIVE PREVIEW</span>
              <h2>無料枠での見え方</h2>
            </div>
            <small>{TONE_LABELS[tone]}</small>
          </div>
          {preview && (
            <article>
              <h3>{preview.title}</h3>
              {preview.sections.map((section, index) => (
                <section key={`${section.title}-${index}`}>
                  {section.title && <h4>{section.title}</h4>}
                  {section.body.map((line, lineIndex) => (
                    <p key={`${section.title}-${lineIndex}`}>{line}</p>
                  ))}
                </section>
              ))}
            </article>
          )}
        </aside>
      </div>

      <footer className="copy-editor-actions">
        <div aria-live="polite">{notice}</div>
        <div>
          <button type="button" onClick={resetSelected}>
            <RotateCcw aria-hidden="true" size={17} />選択中を戻す
          </button>
          <button type="button" onClick={downloadJson}>
            <Download aria-hidden="true" size={17} />バックアップ保存
          </button>
          <button type="button" onClick={saveDraft}>
            <Save aria-hidden="true" size={17} />下書きを保存
          </button>
          <button type="button" className="is-primary" onClick={publish}>
            <Send aria-hidden="true" size={17} />公開する
          </button>
        </div>
      </footer>
    </main>
  );
}
