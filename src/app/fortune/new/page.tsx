"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calcAndSaveFortune } from "@/app/fortune/actions";
import type { WesternReading } from "@/lib/astro/types";
import { listPersons, type Person } from "@/lib/firebase/persons";
import { useAuth } from "@/lib/hooks/useAuth";

type Phase = "select" | "loading" | "result";

export default function NewFortunePage() {
  const { uid, loading: authLoading } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [western, setWestern] = useState<WesternReading | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("✨ 天体の配置を読み取っています…");

  const loadPersons = useCallback(async () => {
    if (!uid) return;
    const personList = await listPersons(uid);
    setPersons(personList);
  }, [uid]);

  useEffect(() => {
    void loadPersons();
  }, [loadPersons]);

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => {
      setLoadingMessage("🌌 星々のメッセージを解読しています…");
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleSelectPerson = async (person: Person) => {
    if (!uid) return;
    setSelectedPerson(person);
    setPhase("loading");
    setLoadingMessage("✨ 天体の配置を読み取っています…");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));
      const result = await calcAndSaveFortune({
        uid,
        personId: person.id,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.latitude,
        longitude: person.longitude,
      });
      setWestern(result.western);
      setPhase("result");
    } catch (error) {
      console.error("fortune calc failed", error);
      alert("占い結果の作成に失敗しました。時間をおいて再試行してください。");
      setPhase("select");
    }
  };

  const signLine = useMemo(() => {
    if (!western) return "";
    return `☀️ ${western.sunSign}座 / 🌙 ${western.moonSign}座${western.ascendant ? ` / ASC ${western.ascendant}座` : ""}`;
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
            <p>{loadingMessage}</p>
            {selectedPerson && <p className="text-sm text-purple-100 mt-2">対象: {selectedPerson.name}</p>}
          </section>
        )}

        {phase === "result" && western && (
          <section>
            <h2 className="text-xl font-semibold mb-2">STEP 3: 結果</h2>
            <p className="mb-4 text-purple-100">{signLine}</p>

            <div className="bg-white/10 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">🌟 性格</h3>
              <p>{western.personality}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">💫 才能</h3>
              <p>{western.talent}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">🔮 運命</h3>
              <p>{western.destiny}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">💕 恋愛傾向</h3>
              <p>{western.loveStyle}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhase("select");
                  setWestern(null);
                  setSelectedPerson(null);
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
