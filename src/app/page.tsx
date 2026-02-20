"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";

import { db } from "../lib/firebase/client";
import { type FortuneDoc } from "../lib/firebase/db";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const formatTimestamp = (value: Timestamp | null) => {
  if (!value) return "...";
  return value.toDate().toLocaleString();
};

const formatFortuneType = (type: string) => {
  if (type === "tarot") return "タロット占い";
  if (type === "daily") return "デイリー占い";
  return type;
};

export default function Home() {
  const { uid, user, loading, error } = useAuth();
  const [fortuneHistory, setFortuneHistory] = useState<FortuneDoc[]>([]);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    return error ? (error instanceof Error ? error.message : String(error)) : null;
  }, [error]);

  useEffect(() => {
    if (!user?.uid) return;

    const upsertUser = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const existing = await getDoc(docRef);
        const provider = user.isAnonymous
          ? "anonymous"
          : user.providerData[0]?.providerId ?? "unknown";
        const displayName = user.displayName;
        const photoURL = user.photoURL;
        const basePayload = {
          provider,
          updatedAt: serverTimestamp(),
          ...(typeof displayName === "string" ? { displayName } : {}),
          ...(typeof photoURL === "string" ? { photoURL } : {}),
        };

        if (!existing.exists()) {
          await setDoc(docRef, {
            uid: user.uid,
            ...basePayload,
            createdAt: serverTimestamp(),
          });
          setFirestoreError(null);
          return;
        }

        await updateDoc(docRef, basePayload);
        setFirestoreError(null);
      } catch (err) {
        console.error("Failed to initialize user document", err);
        setFirestoreError(
          err instanceof Error ? err.message : "Failed to initialize user",
        );
      }
    };

    void upsertUser();
  }, [user]);

  useEffect(() => {
    if (!uid) return;

    const fortuneRef = collection(db, "users", uid, "fortunes");
    const fortuneQuery = query(
      fortuneRef,
      orderBy("createdAt", "desc"),
      limit(10),
    );
    const unsubscribe = onSnapshot(
      fortuneQuery,
      (snapshot) => {
        const next: FortuneDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: String(data.type ?? ""),
            result: String(data.result ?? ""),
            createdAt: (data.createdAt as Timestamp | null) ?? null,
          };
        });
        setFortuneHistory(next);
      },
      (err) => {
        console.error("Failed to fetch fortune history", err);
        setFirestoreError(
          err instanceof Error ? err.message : "Failed to fetch fortunes",
        );
      },
    );

    return () => unsubscribe();
  }, [uid]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 text-white">
      <div className="flex flex-col items-center px-4 py-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Fortune Platform</h1>
          <p className="text-gray-300">あなたの占いハブ</p>
        </header>

        <section className="w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <Link
              href="/tarot"
              className="aspect-[3/2] rounded-xl p-6 bg-gradient-to-br from-purple-900 to-indigo-800 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="text-4xl">🔮</div>
                <div>
                  <h2 className="text-2xl font-bold">タロット占い</h2>
                  <p className="text-sm text-gray-300">大アルカナ22枚から1枚引き</p>
                </div>
              </div>
            </Link>

            <Link
              href="/pair/new"
              className="aspect-[3/2] rounded-xl p-6 bg-gradient-to-br from-pink-900 to-purple-800 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="text-4xl">💕</div>
                <div>
                  <h2 className="text-2xl font-bold">相性診断</h2>
                  <p className="text-sm text-gray-300">MBTI相性をチェック</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="w-full max-w-2xl">
          <h2 className="text-xl font-bold">直近の占い履歴</h2>

          <div className="mt-4 rounded-lg border border-white/20 bg-black/20 p-4 space-y-2">
            {loading && <p>auth: loading...</p>}

            {errorMessage && <p className="text-red-400">auth error: {errorMessage}</p>}

            {firestoreError && (
              <p className="text-red-400">firestore error: {firestoreError}</p>
            )}

            {(!uid || fortuneHistory.length === 0) ? (
              <p className="mt-2 text-gray-300">まだ履歴がありません。</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {fortuneHistory.map((fortune) => (
                  <li key={fortune.id} className="rounded-md bg-white/5 p-3">
                    <div>type: {formatFortuneType(fortune.type)}</div>
                    <div>created: {formatTimestamp(fortune.createdAt)}</div>
                    <div>result: {fortune.result}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!loading && !errorMessage && (
            <p className="text-xs text-gray-500 mt-8">uid: {uid ?? "(not signed in yet)"}</p>
          )}
        </section>
      </div>
    </main>
  );
}
