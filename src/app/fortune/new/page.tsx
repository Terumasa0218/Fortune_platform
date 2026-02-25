"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calcAndSaveFortune } from "@/app/fortune/actions";
import type { BaziReading } from "@/lib/astro/bazi-types";
import type { VedicReading } from "@/lib/astro/vedic-types";
import type { WesternReading } from "@/lib/astro/western-types";
import { listPersons, type Person } from "@/lib/firebase/persons";
import { useAuth } from "@/lib/hooks/useAuth";

type Phase = "select" | "loading" | "result";

export default function NewFortunePage() {
  const { uid, loading: authLoading } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [western, setWestern] = useState<WesternReading | null>(null);
  const [vedic, setVedic] = useState<VedicReading | null>(null);
  const [bazi, setBazi] = useState<BaziReading | null>(null);

  const loadPersons = useCallback(async () => {
    if (!uid) return;
    const personList = await listPersons(uid);
    setPersons(personList);
  }, [uid]);

  useEffect(() => {
    void loadPersons();
  }, [loadPersons]);

  const handleSelectPerson = async (person: Person) => {
    if (!uid) return;
    setSelectedPerson(person);
    setPhase("loading");

    try {
      const result = await calcAndSaveFortune({
        uid,
        personId: person.id,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
      });
      setWestern(result.western);
      setVedic(result.vedic);
      setBazi(result.bazi);
      setPhase("result");
    } catch (error) {
      console.error("fortune calc failed", error);
      alert("占い結果の作成に失敗しました。時間をおいて再試行してください。");
      setPhase("select");
    }
  };

  const signLine = useMemo(() => {
    if (!western) return "";
    return `☀️ ${western.sunSign}座 / 🌙 ${western.moonSign}座`;
  }, [western]);

  return (
    <main className="bg-gradient-to-b from-purple-900 to-indigo-900 min-h-screen text-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">西洋占星術リーディング</h1>

        {authLoading && <p>認証情報を確認しています...</p>}

        {!authLoading && phase === "select" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">STEP 1: Personを選択</h2>
            {persons.length === 0 ? (
              <div className="bg-white/10 rounded-2xl p-6">
                <p className="mb-4">まだPersonが登録されていません。</p>
                <Link href="/person/new" className="underline">
                  + 新しい人を追加
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {persons.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => void handleSelectPerson(person)}
                    className="w-full text-left bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition"
                  >
                    <p className="text-lg font-bold">{person.name}</p>
                    <p className="text-sm text-purple-100">生年月日: {person.birthDate}</p>
                  </button>
                ))}
                <Link href="/person/new" className="inline-block underline mt-2">
                  + 新しい人を追加
                </Link>
              </div>
            )}
          </section>
        )}

        {phase === "loading" && (
          <section className="bg-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">STEP 2: 占い中</h2>
            <p>✨ 天体の配置を読み取っています…</p>
            {selectedPerson && <p className="text-sm text-purple-100 mt-2">対象: {selectedPerson.name}</p>}
          </section>
        )}

        {phase === "result" && western && vedic && bazi && (
          <section>
            <h2 className="text-xl font-semibold mb-2">STEP 3: 結果表示</h2>
            <p className="mb-4 text-purple-100">{signLine}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold mb-2">🔭 西洋占星術</h3>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">🌟 性格</h4>
                  <p className="whitespace-pre-line">{western.personality}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">💫 才能</h4>
                  <p>{western.talent}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">🔮 運命</h4>
                  <p>{western.destiny}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">💕 恋愛傾向</h4>
                  <p>{western.loveStyle}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">🪐 インド占星術</h3>
                <p className="mb-4 text-purple-100">
                  ☀️ 太陽ラーシ: {vedic.sunRashi}座 / 🌙 月ラーシ: {vedic.moonRashi}座
                  <br />
                  ⭐ 月のナクシャトラ: {vedic.moonNakshatra}
                </p>

                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">🌟 性格（ヴェーダ）</h4>
                  <p className="whitespace-pre-line">{vedic.personality}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">💫 才能（ヴェーダ）</h4>
                  <p className="whitespace-pre-line">{vedic.talent}</p>
                </div>

                <h3 className="text-lg font-bold mb-2">🀄 四柱推命</h3>
                <p className="mb-4 text-purple-100 whitespace-pre-line">
                  年柱: {bazi.yearPillar.stem}
                  {bazi.yearPillar.branch} / 月柱: {bazi.monthPillar.stem}
                  {bazi.monthPillar.branch} / 日柱: {bazi.dayPillar.stem}
                  {bazi.dayPillar.branch}
                  {bazi.timePillar
                    ? ` / 時柱: ${bazi.timePillar.stem}${bazi.timePillar.branch}`
                    : ""}
                  {"\n"}
                  五行バランス: 木[{bazi.elementBalance.木}] 火[{bazi.elementBalance.火}] 土[
                  {bazi.elementBalance.土}] 金[{bazi.elementBalance.金}] 水[{bazi.elementBalance.水}]
                  {"\n"}
                  主要五行: {bazi.dominantElement}
                </p>

                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">🌟 性格（四柱）</h4>
                  <p className="whitespace-pre-line">{bazi.personality}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-4">
                  <h4 className="text-lg font-bold mb-2">💫 才能（四柱）</h4>
                  <p className="whitespace-pre-line">{bazi.talent}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhase("select");
                  setWestern(null);
                  setSelectedPerson(null);
                  setVedic(null);
                  setBazi(null);
                }}
                className="bg-white/20 rounded-lg px-4 py-2"
              >
                もう一度占う
              </button>
              <Link href="/fortune/history" className="bg-white/20 rounded-lg px-4 py-2 inline-flex items-center">
                過去の占いを見る
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
