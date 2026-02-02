"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";

import { db } from "../lib/firebase/client";
import {
  addDoc,
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
  type Timestamp,
} from "firebase/firestore";

type FortuneItem = {
  id: string;
  type: string;
  result: string;
  createdAt: Timestamp | null;
};

const formatTimestamp = (value: Timestamp | null) => {
  if (!value) return "...";
  return value.toDate().toLocaleString();
};

export default function Home() {
  const { uid, user, loading, error } = useAuth();
  const [fortuneHistory, setFortuneHistory] = useState<FortuneItem[]>([]);
  const [saving, setSaving] = useState(false);
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

        const basePayload = {
          provider,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          isAnonymous: user.isAnonymous,
          updatedAt: serverTimestamp(),
        };

        if (!existing.exists()) {
          await setDoc(
            docRef,
            {
              uid: user.uid,
              ...basePayload,
              createdAt: serverTimestamp(),
            },
            { merge: false },
          );
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
    if (!uid) {
      setFortuneHistory([]);
      return;
    }

    const fortuneRef = collection(db, "users", uid, "fortunes");
    const fortuneQuery = query(
      fortuneRef,
      orderBy("createdAt", "desc"),
      limit(10),
    );
    const unsubscribe = onSnapshot(
      fortuneQuery,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => {
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

  const handleFortune = useCallback(async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const fortunesRef = collection(db, "users", uid, "fortunes");
      await addDoc(fortunesRef, {
        type: "daily",
        result: "今日の運勢: 大吉",
        createdAt: serverTimestamp(),
        version: 1,
      });
      setFirestoreError(null);
    } catch (err) {
      console.error("Failed to save fortune", err);
      setFirestoreError(
        err instanceof Error ? err.message : "Failed to save fortune",
      );
    } finally {
      setSaving(false);
    }
  }, [uid]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Fortune_platform</h1>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        {loading && <p>auth: loading...</p>}

        {errorMessage && (
          <p style={{ color: "red" }}>auth error: {errorMessage}</p>
        )}

        {firestoreError && (
          <p style={{ color: "red" }}>firestore error: {firestoreError}</p>
        )}

        {!loading && !errorMessage && <p>uid: {uid ?? "(not signed in yet)"}</p>}

        <button
          onClick={handleFortune}
          disabled={!uid || saving}
          style={{ marginTop: 12, padding: "8px 12px" }}
        >
          {saving ? "保存中..." : "占う"}
        </button>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>直近の履歴</h2>
        {fortuneHistory.length === 0 ? (
          <p style={{ marginTop: 8 }}>まだ履歴がありません。</p>
        ) : (
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            {fortuneHistory.map((fortune) => (
              <li key={fortune.id} style={{ marginBottom: 8 }}>
                <div>type: {fortune.type}</div>
                <div>created: {formatTimestamp(fortune.createdAt)}</div>
                <div>result: {fortune.result}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
