"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getDailyFortune,
  saveDailyFortune,
  type OmikujiResult,
} from "@/lib/firebase/daily";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTodayJST } from "@/lib/time/today";

const OMIKUJI_TABLE: { result: OmikujiResult; weight: number }[] = [
  { result: "大吉", weight: 10 },
  { result: "中吉", weight: 15 },
  { result: "小吉", weight: 20 },
  { result: "吉", weight: 25 },
  { result: "末吉", weight: 15 },
  { result: "凶", weight: 10 },
  { result: "大凶", weight: 5 },
];

function drawOmikuji(): OmikujiResult {
  const total = OMIKUJI_TABLE.reduce((sum, row) => sum + row.weight, 0);
  let rand = Math.random() * total;

  for (const row of OMIKUJI_TABLE) {
    rand -= row.weight;
    if (rand <= 0) {
      return row.result;
    }
  }

  return OMIKUJI_TABLE[OMIKUJI_TABLE.length - 1].result;
}

function getResultColor(result: OmikujiResult): string {
  if (result === "大吉") return "bg-yellow-400 text-yellow-900";
  if (result === "凶" || result === "大凶") return "bg-gray-200 text-gray-700";
  return "bg-green-100 text-green-900";
}

export default function OmikujiPage() {
  const { uid, loading } = useAuth();
  const today = useMemo(() => getTodayJST(), []);
  const [existingResult, setExistingResult] = useState<OmikujiResult | null>(null);
  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);

      try {
        const fortune = await getDailyFortune(uid, today);
        if (cancelled) return;
        const todayResult = fortune?.omikuji ?? null;
        setExistingResult(todayResult);
        setResult(todayResult);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, today]);

  const handleDraw = () => {
    if (!uid || isShaking || result) return;

    setIsShaking(true);
    window.setTimeout(async () => {
      const next = drawOmikuji();
      setResult(next);
      setIsShaking(false);
      await saveDailyFortune(uid, today, { omikuji: next });
    }, 1500);
  };

  if (loading || isLoading || !uid) {
    return <main className="min-h-screen bg-purple-950 text-white flex items-center justify-center">読み込み中...</main>;
  }

  return (
    <main className="min-h-screen bg-purple-950 text-white px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white/10 p-6 text-center">
        <h1 className="text-2xl font-bold">🎋 おみくじ</h1>

        {isShaking && <p className="mt-6 animate-pulse">🎋 おみくじ箱を振っています…</p>}

        {result && (
          <div className={`mt-6 rounded-xl p-6 ${getResultColor(result)}`}>
            <p className="text-sm">今日の結果</p>
            <p className="mt-2 text-3xl font-bold">{result}</p>
          </div>
        )}

        {!result && !isShaking && (
          <button
            type="button"
            onClick={handleDraw}
            className="mt-8 rounded-lg bg-purple-500 px-4 py-2 hover:bg-purple-400"
          >
            おみくじを引く
          </button>
        )}

        {(existingResult || result) && (
          <Link href="/daily" className="mt-8 inline-block rounded-lg bg-gray-700 px-4 py-2 hover:bg-gray-600">
            デイリーページに戻る
          </Link>
        )}
      </div>
    </main>
  );
}
