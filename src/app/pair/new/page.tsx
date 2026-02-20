"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { subscribePersons, type Person } from "@/lib/firebase/persons";
import { addPair, type PairPayload } from "@/lib/firebase/pairs";
import { useAuth } from "@/lib/hooks/useAuth";
import { calculateMbtiCompatibility } from "@/lib/mbti/compatibility";
import type { MbtiCompatibility, MbtiType } from "@/lib/mbti/types";

const MBTI_TYPES: MbtiType[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

const isMbtiType = (value?: string): value is MbtiType => {
  return Boolean(value && MBTI_TYPES.includes(value as MbtiType));
};

const scoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const scoreBar = (label: string, score: number) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm text-gray-200">
      <span>{label}</span>
      <span>{score}点</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/15">
      <div className={`h-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

export default function NewPairPage() {
  const { uid, loading: authLoading, error: authError } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [personAId, setPersonAId] = useState<string>("");
  const [personBId, setPersonBId] = useState<string>("");
  const [result, setResult] = useState<MbtiCompatibility | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authErrorMessage = useMemo(() => {
    if (!authError) return null;
    return authError instanceof Error ? authError.message : String(authError);
  }, [authError]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribePersons(uid, setPersons);
    return unsubscribe;
  }, [uid]);

  const personA = persons.find((person) => person.id === personAId);
  const personB = persons.find((person) => person.id === personBId);

  const resetForm = () => {
    setPersonAId("");
    setPersonBId("");
    setResult(null);
    setSaved(false);
  };

  const handleCalculate = () => {
    if (!personAId || !personBId) {
      alert("Person A / Person B を選択してください");
      return;
    }

    if (personAId === personBId) {
      alert("Person A と Person B は別の人物を選択してください");
      return;
    }

    if (!isMbtiType(personA?.mbti) || !isMbtiType(personB?.mbti)) {
      alert("両方のPersonにMBTIが設定されている必要があります");
      return;
    }

    const compatibility = calculateMbtiCompatibility(personA.mbti, personB.mbti);

    setResult(compatibility);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!uid || !result || !personAId || !personBId) return;

    const payload: PairPayload = {
      uid,
      personAId,
      personBId,
      compatibility: { mbti: result },
      aggregatedScore: result.score,
    };

    setSubmitting(true);

    try {
      await addPair(uid, payload);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save pair", error);
      alert("保存に失敗しました。時間をおいて再試行してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">相性診断</h1>
          <Link href="/" className="text-sm text-purple-200 underline">
            ホームに戻る
          </Link>
        </div>

        {authLoading && <p className="text-sm text-gray-200">認証状態を確認中...</p>}
        {authErrorMessage && <p className="text-sm text-red-300">auth error: {authErrorMessage}</p>}

        {!authLoading && persons.length === 0 ? (
          <div className="space-y-4 rounded-lg border border-white/20 bg-white/5 p-5">
            <p className="text-lg font-semibold">まだPersonが作成されていません</p>
            <Link
              href="/person/new"
              className="inline-flex rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500"
            >
              Person を作成する
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {!result ? (
              <div className="space-y-4">
                <label className="space-y-1 block">
                  <span className="text-sm text-gray-200">Person A</span>
                  <select
                    value={personAId}
                    onChange={(event) => setPersonAId(event.target.value)}
                    className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
                  >
                    <option value="">選択してください</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} {person.mbti ? `(${person.mbti})` : "(MBTI未設定)"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-sm text-gray-200">Person B</span>
                  <select
                    value={personBId}
                    onChange={(event) => setPersonBId(event.target.value)}
                    className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
                  >
                    <option value="">選択してください</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} {person.mbti ? `(${person.mbti})` : "(MBTI未設定)"}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleCalculate}
                  className="rounded-md bg-pink-600 px-4 py-2 font-semibold hover:bg-pink-500"
                >
                  相性を診断する
                </button>
              </div>
            ) : (
              <div className="space-y-5 rounded-xl border border-white/15 bg-white/5 p-5">
                <h2 className="text-xl font-bold">
                  {personA?.name ?? "Person A"} と {personB?.name ?? "Person B"} の相性
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>総合スコア</span>
                    <span>{result.score}点</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-white/15">
                    <div
                      className={`h-full ${scoreColor(result.score)}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {scoreBar("会話の相性", result.axes.communication)}
                  {scoreBar("衝突の少なさ", result.axes.conflict)}
                  {scoreBar("安定性", result.axes.stability)}
                  {scoreBar("成長促進", result.axes.growth)}
                </div>

                <p className="text-gray-100">{result.summary}</p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saved || submitting}
                    className="rounded-md bg-purple-600 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-purple-900"
                  >
                    {saved ? "保存済み" : submitting ? "保存中..." : "結果を保存"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-white/40 px-4 py-2 font-semibold hover:bg-white/10"
                  >
                    もう一度診断
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
