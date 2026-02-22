import Image from "next/image";
import Link from "next/link";
import { access } from "node:fs/promises";
import { join } from "node:path";

const sectionBaseClass =
  "min-h-64 px-6 py-12 flex flex-col items-center justify-center text-center";
const titleClass = "text-3xl font-bold text-white mb-2";
const subtitleClass = "text-white/80 mb-6";
const buttonClass =
  "bg-white text-gray-800 font-semibold px-6 py-3 rounded-full shadow hover:shadow-md transition";
const buttonGroupClass = "flex flex-wrap gap-4 justify-center";

export default async function Home() {
  let hasHeroImage = false;

  try {
    await access(join(process.cwd(), "public", "images", "hero.jpg"));
    hasHeroImage = true;
  } catch {
    hasHeroImage = false;
  }

  return (
    <main className="w-full">
      <section
        className={`${sectionBaseClass} bg-red-800 ${hasHeroImage ? "relative overflow-hidden" : ""}`}
      >
        {hasHeroImage && (
          <Image
            src="/images/hero.jpg"
            alt="ヒーロー画像"
            fill
            className="object-cover z-[-1]"
            priority
          />
        )}
        <h1 className={titleClass}>占いの広場</h1>
        <p className={subtitleClass}>あなたの運命を見つけましょう</p>
      </section>

      {/* AD SLOT 1 */}
      <div className="h-20 bg-gray-100" />

      <section className={`${sectionBaseClass} bg-yellow-400`}>
        <h2 className={titleClass}>デイリー占い</h2>
        <p className={subtitleClass}>本日のあなたの運命は…?</p>
        <div className={buttonGroupClass}>
          <Link href="/tarot" className={buttonClass}>
            タロット
          </Link>
          <Link href="/daily/horoscope" className={buttonClass}>
            星座占い
          </Link>
          <Link href="/daily/omikuji" className={buttonClass}>
            おみくじ
          </Link>
        </div>
      </section>

      {/* AD SLOT 2 */}
      <div className="h-20 bg-gray-100" />

      <section className={`${sectionBaseClass} bg-orange-500`}>
        <h2 className={titleClass}>運命・性格・才能を占う</h2>
        <p className={subtitleClass}>西洋・インド・四柱・紫微で占う</p>
        <div className={buttonGroupClass}>
          <Link href="/fortune/new" className={buttonClass}>
            占う
          </Link>
          <Link href="/fortune/history" className={buttonClass}>
            過去を振り返る
          </Link>
        </div>
      </section>

      {/* AD SLOT 3 */}
      <div className="h-20 bg-gray-100" />

      <section className={`${sectionBaseClass} bg-orange-600`}>
        <h2 className={titleClass}>相性占い</h2>
        <p className={subtitleClass}>気になるあの人との相性は…?</p>
        <div className={buttonGroupClass}>
          <Link href="/pair/new" className={buttonClass}>
            相性診断
          </Link>
        </div>
      </section>
    </main>
  );
}
