"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { addFortune } from "@/lib/firebase/db";
import { MAJOR_ARCANA, drawRandomCard, type TarotCard } from "@/data/tarot";

export default function TarotPage() {
  const { uid } = useAuth();
  const [phase, setPhase] = useState<"select" | "reveal" | "result">("select");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [drawnResult, setDrawnResult] = useState<{
    card: TarotCard;
    isReversed: boolean;
  } | null>(null);
  const savedRef = useRef<boolean>(false);

  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(() => {
        const result = drawRandomCard();
        setDrawnResult(result);
        setPhase("result");
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "result" && drawnResult && uid && !savedRef.current) {
      savedRef.current = true;
      const meaningText = drawnResult.isReversed
        ? drawnResult.card.reversed
        : drawnResult.card.upright;

      addFortune(uid, {
        type: "tarot",
        result: `${drawnResult.card.name}（${drawnResult.isReversed ? "逆位置" : "正位置"}）— ${meaningText}`,
        version: 1,
      }).catch(console.error);
    }
  }, [phase, drawnResult, uid]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 text-white">
      <div className="flex flex-col items-center justify-center px-4 py-8 min-h-screen">
        {phase === "select" && (
          <div className="w-full max-w-5xl">
            <h1 className="text-3xl font-bold text-center">タロット — 1枚引き</h1>
            <p className="mt-3 text-center text-lg text-gray-300">
              心を落ち着けて、1枚選んでください
            </p>

            <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {MAJOR_ARCANA.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  aria-label={`${index + 1}枚目のカードを選ぶ`}
                  className="aspect-[2/3] h-32 cursor-pointer rounded-lg bg-gradient-to-br from-purple-900 to-indigo-800 text-4xl text-white/30 transition-transform duration-200 hover:scale-105 hover:shadow-xl"
                  onClick={() => {
                    setSelectedIndex(index);
                    setPhase("reveal");
                  }}
                >
                  ✦
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "reveal" && selectedIndex !== null && (
          <div className="flex flex-col items-center">
            <div className="card-flip flex h-72 w-48 items-center justify-center rounded-xl bg-gradient-to-br from-purple-900 to-indigo-800 text-6xl text-white/30 shadow-2xl sm:h-96 sm:w-64">
              ✦
            </div>
          </div>
        )}

        {phase === "result" && drawnResult && (
          <div className="flex max-w-2xl flex-col items-center text-center">
            <p className="text-8xl">{drawnResult.card.emoji}</p>
            <h2 className="mt-4 text-3xl font-bold">{drawnResult.card.name}</h2>
            <p className="mt-2 text-xl text-gray-300">
              {drawnResult.isReversed ? "逆位置" : "正位置"}
            </p>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-100">
              {drawnResult.isReversed
                ? drawnResult.card.reversed
                : drawnResult.card.upright}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                className="rounded-lg bg-purple-600 px-6 py-3 hover:bg-purple-700"
                onClick={() => {
                  setPhase("select");
                  setSelectedIndex(null);
                  setDrawnResult(null);
                  savedRef.current = false;
                }}
              >
                もう一度引く
              </button>
              <Link
                href="/"
                className="rounded-lg bg-gray-600 px-6 py-3 hover:bg-gray-700"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card-flip {
          animation: flipCard 0.8s ease-in-out forwards;
        }

        @keyframes flipCard {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
      `}</style>
    </main>
  );
}
