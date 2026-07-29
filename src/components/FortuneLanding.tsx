import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarRange,
  Check,
  Coins,
  Compass,
  Grid3X3,
  Heart,
  Hash,
  Layers3,
  Orbit,
  Sparkles,
} from "lucide-react";

const DOMAINS = [
  {
    title: "才能",
    description: "生まれ持った強みと、力を発揮しやすい場面",
    icon: Sparkles,
    tone: "talent",
  },
  {
    title: "恋愛",
    description: "恋の進め方、結婚観、合う相手とすれ違いやすい相手",
    icon: Heart,
    tone: "love",
  },
  {
    title: "仕事",
    description: "向く働き方、仕事上の長所と弱点、運気の流れ",
    icon: BriefcaseBusiness,
    tone: "career",
  },
  {
    title: "金運",
    description: "お金を得る方法、守り方、注意したい時期",
    icon: Coins,
    tone: "money",
  },
] as const;

const METHODS = [
  {
    number: "01",
    title: "四柱推命",
    short: "まず見るなら",
    description: "生まれ持った性質、才能、仕事の適性、人生の長い流れを読みます。",
    strength: "才能・仕事・長期運",
    requirement: "生年月日・出生時刻",
    icon: Layers3,
    tone: "bazi",
  },
  {
    number: "02",
    title: "西洋占星術",
    short: "心と関係性",
    description: "天体の位置から、考え方、感情、恋愛、人との関わり方を読みます。",
    strength: "恋愛・性格・時期",
    requirement: "生年月日・出生時刻・出生地",
    icon: Orbit,
    tone: "western",
  },
  {
    number: "03",
    title: "紫微斗数",
    short: "人生を細かく",
    description: "十二の領域と星の配置から、人生の得意分野や転機を細かく読みます。",
    strength: "人生設計・仕事・人間関係",
    requirement: "生年月日・出生時刻",
    icon: Grid3X3,
    tone: "ziwei",
  },
  {
    number: "04",
    title: "数秘術",
    short: "手軽に本質を",
    description: "生年月日の数字から、行動の傾向、得意な役割、人生の周期を読みます。",
    strength: "才能・役割・周期",
    requirement: "生年月日のみ",
    icon: Hash,
    tone: "numerology",
  },
  {
    number: "05",
    title: "九星気学",
    short: "今の流れを",
    description: "九つの星と暦から、性質に加えて年ごと・月ごとの流れを読みます。",
    strength: "運気・行動時期・方位",
    requirement: "生年月日のみ",
    icon: Compass,
    tone: "kyusei",
  },
  {
    number: "06",
    title: "古典マヤ暦",
    short: "周期と役割",
    description: "古典暦の日付と周期から、生まれた日の位置づけと象徴を読みます。",
    strength: "周期・役割・価値観",
    requirement: "生年月日のみ",
    icon: CalendarRange,
    tone: "maya",
  },
] as const;

export function FortuneLanding() {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-inner">
          <p className="section-kicker">SIX METHODS, ONE BIRTH PROFILE</p>
          <h1 id="landing-title">6つの占術で、自分を深く知る</h1>
          <p className="landing-hero-lead">
            生年月日などを一度入力するだけ。才能、恋愛、仕事、金運を、
            世界の異なる占術からそれぞれ読み解きます。
          </p>
          <Link className="landing-primary-action" href="/fortune/new">
            無料で占いを始める
            <ArrowRight aria-hidden="true" size={20} />
          </Link>
          <p className="landing-guidance">
            <Check aria-hidden="true" size={16} />
            占術を選ぶ必要はありません。6つをまとめて計算し、結果の見方も案内します。
          </p>
        </div>

        <div className="landing-method-strip" aria-label="利用できる6つの占術">
          {METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.title}>
                <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                <span>{method.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-section landing-domains-section" aria-labelledby="domains-title">
        <div className="landing-section-heading">
          <p className="section-kicker">WHAT YOU CAN READ</p>
          <h2 id="domains-title">知りたいことから読めます</h2>
          <p>同じ命盤でも、知りたい内容に合わせて見方を切り替えます。</p>
        </div>
        <div className="landing-domain-grid">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <article key={domain.title} data-tone={domain.tone}>
                <div className="landing-domain-icon">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <h3>{domain.title}</h3>
                <p>{domain.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-flow" aria-labelledby="flow-title">
        <div className="landing-flow-inner">
          <div className="landing-section-heading">
            <p className="section-kicker">HOW IT WORKS</p>
            <h2 id="flow-title">迷わず読める、3つの段階</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>出生情報を入力</strong>
                <p>生年月日は必須。時刻と出生地が分かると、より細かく計算できます。</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>6つの占術を一度に計算</strong>
                <p>異なる占術を混ぜず、それぞれの決まりに沿って独立した結果を出します。</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>結果を見てから選ぶ</strong>
                <p>知りたい分野から読み始め、占術ごとの違いも自由に見比べられます。</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-section landing-methods-section" aria-labelledby="methods-title">
        <div className="landing-section-heading landing-methods-heading">
          <div>
            <p className="section-kicker">SIX METHODS</p>
            <h2 id="methods-title">6つの占術には、違う得意分野があります</h2>
          </div>
          <p>
            最初から一つに決めなくても大丈夫です。まず結果を出し、気になる占術から読めます。
          </p>
        </div>

        <div className="landing-method-grid">
          {METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <article key={method.title} data-tone={method.tone}>
                <header>
                  <span>{method.number}</span>
                  <Icon aria-hidden="true" size={24} strokeWidth={1.7} />
                </header>
                <p className="landing-method-short">{method.short}</p>
                <h3>{method.title}</h3>
                <p className="landing-method-description">{method.description}</p>
                <dl>
                  <div>
                    <dt>得意</dt>
                    <dd>{method.strength}</dd>
                  </div>
                  <div>
                    <dt>入力</dt>
                    <dd>{method.requirement}</dd>
                  </div>
                </dl>
                <Link href={`/methods/${method.tone}`} aria-label={`${method.title}の詳しい説明を見る`}>
                  詳しい仕組み
                  <BookOpenText aria-hidden="true" size={17} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-final-action" aria-labelledby="final-action-title">
        <div>
          <p className="section-kicker">START READING</p>
          <h2 id="final-action-title">まずは、今の自分を知るところから</h2>
          <p>登録なしで試せます。入力内容はこの画面では保存しません。</p>
        </div>
        <Link className="landing-primary-action" href="/fortune/new">
          無料で占いを始める
          <ArrowRight aria-hidden="true" size={20} />
        </Link>
      </section>
    </main>
  );
}
