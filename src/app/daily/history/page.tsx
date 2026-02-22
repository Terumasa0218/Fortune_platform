"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listDailyFortunes, type DailyFortune } from "@/lib/firebase/daily";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTodayJST } from "@/lib/time/today";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);

  if (!year || !month || !day) {
    return dateStr;
  }

  return `${year}年${month}月${day}日`;
}

export default function DailyHistoryPage() {
  const { uid, loading } = useAuth();
  const today = useMemo(() => getTodayJST(), []);
  const [history, setHistory] = useState<DailyFortune[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      return;
    }

    setIsLoading(true);
    listDailyFortunes(uid)
      .then((items) => setHistory(items))
      .finally(() => setIsLoading(false));
  }, [uid]);

  if (loading || isLoading || !uid) {
    return (
      <main className="bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <p>📜 占い履歴を読み込み中…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen text-white pb-10">
      <div className="mx-auto max-w-3xl">
        <div className="px-4 pt-6">
          <Link href="/daily" className="text-sm text-white/90 hover:text-white underline">
            ← デイリー占いに戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center py-6">📜 占い履歴</h1>

        {history.length === 0 ? (
          <section className="mx-4 mt-12 rounded-2xl bg-white/10 p-8 text-center">
            <p className="text-white/90">まだ占い履歴がありません</p>
            <Link
              href="/daily"
              className="mt-5 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm hover:bg-indigo-400"
            >
              デイリー占いをはじめる
            </Link>
          </section>
        ) : (
          <section>
            {history.map((item) => {
              const isToday = item.date === today;
              const isComplete = Boolean(item.tarot && item.horoscope && item.omikuji);

              return (
                <article key={item.id} className="bg-white/10 rounded-2xl p-5 mb-4 mx-4">
                  <div className="text-sm font-bold text-indigo-200 mb-3 flex items-center flex-wrap">
                    <span>📅 {formatDate(item.date)}</span>
                    {isToday && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full ml-2">
                        今日
                      </span>
                    )}
                    {isComplete && (
                      <span className="bg-purple-400 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                        ✨ コンプリート
                      </span>
                    )}
                  </div>

                  {item.tarot && (
                    <p className="flex items-start gap-2 text-sm mb-2">
                      <span>🃏</span>
                      <span>
                        タロット: {item.tarot.name}（{item.tarot.reversed ? "逆位置" : "正位置"}）
                      </span>
                    </p>
                  )}

                  {item.horoscope && (
                    <p className="flex items-start gap-2 text-sm mb-2">
                      <span>⭐</span>
                      <span>星座占い: {item.horoscope}</span>
                    </p>
                  )}

                  {item.omikuji && (
                    <p className="flex items-start gap-2 text-sm mb-2">
                      <span>🎋</span>
                      <span>おみくじ: {item.omikuji}</span>
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
