"use client";

import { useAuth } from "../lib/hooks/useAuth";

import { db } from "../lib/firebase/client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const { uid, loading, error } = useAuth();
const writeTest = async () => {
  if (!uid) return;
  await setDoc(doc(db, "debug", uid), {
    uid,
    ok: true,
    createdAt: serverTimestamp(),
  });
  alert("wrote to firestore!");
};

  const errorMessage =
    error ? (error instanceof Error ? error.message : String(error)) : null;

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
<button
  onClick={writeTest}
  disabled={!uid}
  style={{ marginTop: 12, padding: "8px 12px" }}
>
  Firestore write test
</button>

        {errorMessage && (
          <p style={{ color: "red" }}>auth error: {errorMessage}</p>
        )}

        {!loading && !errorMessage && <p>uid: {uid ?? "(not signed in yet)"}</p>}
      </div>
    </main>
  );
}
