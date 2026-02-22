"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDailyFortune, saveDailyFortune } from "@/lib/firebase/daily";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTodayJST } from "@/lib/time/today";

const SIGNS = [
  "おひつじ",
  "おうし",
  "ふたご",
  "かに",
  "しし",
  "おとめ",
  "てんびん",
  "さそり",
  "いて",
  "やぎ",
  "みずがめ",
  "うお",
];

const MESSAGES = [
  "今日は新しい出会いが訪れそうです。積極的に動いてみて。",
  "慎重に行動すると良い結果が生まれる日です。",
  "創造力が高まっています。アイデアをメモしておきましょう。",
  "人間関係に温かみが増す日。大切な人に連絡を。",
  "金運が上昇中。思い切った決断が吉と出るかも。",
  "体調管理を優先して。無理は禁物な一日です。",
  "過去の努力が実を結ぶ予感。自分を信じて進もう。",
  "直感を大切に。ひらめきが重要なヒントになります。",
  "コミュニケーションの日。言葉を丁寧に選んで。",
  "変化を恐れないで。新しい流れに乗ると吉。",
  "内省の時間を大切に。自分の本音と向き合おう。",
  "周囲への感謝を忘れずに。支えてくれる人が近くにいます。",
];

function buildMessage(date: string, signIndex: number): string {
  const dateSum = date
    .replaceAll("-", "")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);

  return MESSAGES[(dateSum + signIndex) % MESSAGES.length];
}

export default function HoroscopePage() {
  const router = useRouter();
  const { uid, loading } = useAuth();
  const today = useMemo(() => getTodayJST(), []);
  const [existingMessage, setExistingMessage] = useState<string | null>(null);
  const [selectedSignIndex, setSelectedSignIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;

    setIsLoading(true);
    getDailyFortune(uid, today)
      .then((fortune) => setExistingMessage(fortune?.horoscope ?? null))
      .finally(() => setIsLoading(false));
  }, [uid, today]);

  const message = buildMessage(today, selectedSignIndex);

  const handleSubmit = async () => {
    if (!uid || isSaving) return;

    setIsSaving(true);
    await saveDailyFortune(uid, today, { horoscope: message });
    router.push("/daily");
  };

  if (loading || isLoading || !uid) {
    return <main className="min-h-screen bg-indigo-950 text-white flex items-center justify-center">読み込み中...</main>;
  }

  if (existingMessage) {
    return (
      <main className="min-h-screen bg-indigo-950 text-white px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white/10 p-6">
          <h1 className="text-2xl font-bold">⭐ 今日の星座占い</h1>
          <p className="mt-4 leading-relaxed">{existingMessage}</p>
          <p className="mt-6 text-sm text-white/70">今日はすでに占っています。</p>
          <Link href="/daily" className="mt-6 inline-block rounded-lg bg-indigo-500 px-4 py-2 hover:bg-indigo-400">
            デイリーページに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-indigo-950 text-white px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white/10 p-6">
        <h1 className="text-2xl font-bold">⭐ 今日の星座占い</h1>
        <label className="mt-6 block text-sm">星座を選択</label>
        <select
          className="mt-2 w-full rounded-lg bg-indigo-900 px-3 py-2"
          value={selectedSignIndex}
          onChange={(e) => setSelectedSignIndex(Number(e.target.value))}
        >
          {SIGNS.map((sign, index) => (
            <option key={sign} value={index}>
              {sign}
            </option>
          ))}
        </select>

        <div className="mt-6 rounded-lg bg-white/10 p-4">
          <p className="text-sm text-white/70">今日のメッセージ</p>
          <p className="mt-2 leading-relaxed">{message}</p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="mt-6 rounded-lg bg-indigo-500 px-4 py-2 hover:bg-indigo-400 disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "この結果で保存する"}
        </button>
      </div>
    </main>
  );
}
