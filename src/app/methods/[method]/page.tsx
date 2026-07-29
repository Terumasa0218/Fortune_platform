import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Database,
  Info,
} from "lucide-react";

const METHOD_DETAILS = {
  bazi: {
    name: "四柱推命",
    lead: "生まれた年・月・日・時を四つの柱にして、その人の土台と時間の流れを読みます。",
    reads: ["生まれ持った性質と才能", "仕事で力を発揮しやすい形", "恋愛や人間関係の傾向", "長期的な運気の変化"],
    calculates: ["年柱・月柱・日柱・時柱", "五行の偏りと強さ", "通変星・十二運・蔵干", "大運・流年などの時間軸"],
    input: "生年月日を使います。出生時刻と出生地が分かると、時柱をより正確に計算できます。",
    note: "節入り時刻と出生地による時刻補正を扱うため、一般的な干支だけの診断より計算項目が多い占術です。",
  },
  western: {
    name: "西洋占星術",
    lead: "生まれた瞬間の天体配置から、考え方、感情、行動、人との関わり方を読みます。",
    reads: ["考え方と感情の動き", "恋愛・結婚・対人関係", "仕事上の適性と社会での見え方", "現在から今後の運気"],
    calculates: ["太陽・月・10天体の位置", "ASC・MCと12ハウス", "天体同士のアスペクト", "現在の天体との関係"],
    input: "生年月日に加え、出生時刻と出生地があるとASCやハウスまで計算できます。",
    note: "このサイトではトロピカル方式とプラシーダス・ハウスを採用します。太陽星座だけで判断しません。",
  },
  ziwei: {
    name: "紫微斗数",
    lead: "命盤を十二の領域に分け、配置された星から人生の各分野を細かく読みます。",
    reads: ["性格の中心と内面", "仕事・財運・人間関係", "恋愛・結婚と家庭", "年代ごとの転機"],
    calculates: ["命宮を含む十二宮", "十四主星と補助星", "星の組み合わせと四化", "大限・流年などの時間軸"],
    input: "生年月日と出生時刻を使います。出生時刻が不明な場合、表示できない項目があります。",
    note: "出生時刻によって命宮や星の配置が大きく変わるため、時刻の有無を結果画面で明示します。",
  },
  numerology: {
    name: "数秘術",
    lead: "生年月日を数字に置き換え、繰り返し表れる行動傾向や人生の周期を読みます。",
    reads: ["基本的な行動傾向", "得意な役割と才能", "人生で向き合いやすい課題", "年ごとのテーマ"],
    calculates: ["ライフパスナンバー", "バースデーナンバー", "ピナクルとチャレンジ", "個人年・個人月"],
    input: "生年月日だけで計算できます。現在の鑑定では姓名を使う数は扱いません。",
    note: "出生時刻が分からなくても結果を出せるため、最も手軽に確認しやすい占術の一つです。",
  },
  kyusei: {
    name: "九星気学",
    lead: "生年月日と暦から九つの星を求め、その人の性質と時期ごとの流れを読みます。",
    reads: ["基本的な性質と行動傾向", "仕事や人間関係での動き方", "年運・月運", "動きやすい時期と慎重な時期"],
    calculates: ["本命星と月命星", "年盤・月盤の配置", "九星同士の関係", "周期による運気の変化"],
    input: "生年月日だけで計算できます。節分前後は暦上の年が変わる点も確認します。",
    note: "方位だけの占いではありません。このサイトでは、性質と運気の流れを中心に扱います。",
  },
  maya: {
    name: "古典マヤ暦",
    lead: "生年月日を古典マヤ暦の日付へ変換し、その日が持つ周期上の位置と象徴を読みます。",
    reads: ["生まれた日の象徴", "周期の中で担いやすい役割", "価値観と行動の特徴", "日付同士の関係"],
    calculates: ["長期暦の日付", "ツォルキンの組み合わせ", "ハアブ暦上の位置", "暦の周期と対応関係"],
    input: "生年月日だけで計算できます。出生時刻と出生地は使用しません。",
    note: "このサイトでは古典マヤ暦を扱い、現代に作られた別体系のKIN診断とは区別します。",
  },
} as const;

type MethodKey = keyof typeof METHOD_DETAILS;

export function generateStaticParams() {
  return Object.keys(METHOD_DETAILS).map((method) => ({ method }));
}

export default async function MethodPage({ params }: { params: Promise<{ method: string }> }) {
  const { method } = await params;
  if (!(method in METHOD_DETAILS)) notFound();
  const detail = METHOD_DETAILS[method as MethodKey];

  return (
    <main className="method-guide-page">
      <div className="method-guide-shell">
        <Link className="method-guide-back" href="/#methods-title">
          <ArrowLeft aria-hidden="true" size={17} />
          6つの占術へ戻る
        </Link>

        <header className="method-guide-header">
          <p className="section-kicker">METHOD GUIDE</p>
          <h1>{detail.name}</h1>
          <p>{detail.lead}</p>
        </header>

        <div className="method-guide-columns">
          <section>
            <header>
              <BookOpenText aria-hidden="true" size={21} />
              <h2>この占術で分かること</h2>
            </header>
            <ul>
              {detail.reads.map((item) => (
                <li key={item}>
                  <CheckCircle2 aria-hidden="true" size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <header>
              <Database aria-hidden="true" size={21} />
              <h2>計算しているもの</h2>
            </header>
            <ul>
              {detail.calculates.map((item) => (
                <li key={item}>
                  <CheckCircle2 aria-hidden="true" size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="method-guide-notes">
          <div>
            <span>必要な情報</span>
            <p>{detail.input}</p>
          </div>
          <div>
            <span>
              <Info aria-hidden="true" size={16} />
              このサイトでの扱い
            </span>
            <p>{detail.note}</p>
          </div>
        </section>

        <div className="method-guide-action">
          <div>
            <strong>{detail.name}の結果を実際に見る</strong>
            <p>6つの占術をまとめて計算したあと、この占術を選択できます。</p>
          </div>
          <Link className="landing-primary-action" href="/fortune/new">
            無料で占いを始める
            <ArrowRight aria-hidden="true" size={20} />
          </Link>
        </div>
      </div>
    </main>
  );
}
