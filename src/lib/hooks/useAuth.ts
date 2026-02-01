"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureAnonAuth } from "@/lib/firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      try {
        await ensureAnonAuth();

        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    })();

    return () => unsub();
  }, []);

  return { uid: user?.uid ?? null, user, loading, error };
}
