"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDailyFortune, type DailyFortune } from "@/lib/firebase/daily";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTodayJST } from "@/lib/time/today";

export default function DailyPage() {
  const { uid, loading } = useAuth();
  const today = useMemo(() => getTodayJST(), []);
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      return;
    }

    setIsLoading(true);
    getDailyFortune(uid, today)
      .then((data) => setFortune(data))
      .finally(() => setIsLoading(false));
  }, [uid, today]);

  const tarotDone = Boolean(fortune?.tarot);
  const horoscopeDone = Boolean(fortune?.horoscope);
  const omikujiDone = Boolean(fortune?.omikuji);
  const completedAll = tarotDone && horoscopeDone && omikujiDone;

  if (loading || isLoading || !uid) {
    return (
      <main className="bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen text-white flex items-center justify-center">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen text-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-center">デイリー占い</h1>
        <p className="mt-2 text-center text-white/80">{today}</p>

        {completedAll && (
          <p className="mt-6 text-center text-xl font-semibold text-yellow-300">
            今日の占いコンプリート！🎉
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DailyCard
            title="🃏 タロット"
            href="/tarot"
            done={tarotDone}
            summary={fortune?.tarot?.name}
          />
          <DailyCard
            title="⭐ 星座占い"
            href="/daily/horoscope"
            done={horoscopeDone}
            summary={fortune?.horoscope}
          />
          <DailyCard
            title="🎋 おみくじ"
            href="/daily/omikuji"
            done={omikujiDone}
            summary={fortune?.omikuji}
          />
        </div>

        <div className="mt-10 text-center">
          <Link href="/daily/history" className="underline text-white/90 hover:text-white">
            過去の占い履歴を見る
          </Link>
        </div>
      </div>
    </main>
  );
}

function DailyCard({
  title,
  href,
  done,
  summary,
}: {
  title: string;
  href: string;
  done: boolean;
  summary?: string;
}) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {summary ? <p className="text-center text-sm text-white/90">{summary}</p> : <p className="text-white/60">未実施</p>}
      {done ? (
        <button
          type="button"
          className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white/80 cursor-not-allowed"
          disabled
        >
          今日は済み
        </button>
      ) : (
        <Link href={href} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm hover:bg-indigo-400">
          占う
        </Link>
      )}
    </div>
  );
}
