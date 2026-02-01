"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureAnonAuth } from "@/lib/firebase/auth";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    ensureAnonAuth().catch((error) => {
      if (isMounted) {
        console.error("Anonymous auth failed:", error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (isMounted) {
        setUser(nextUser);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const uid = useMemo(() => user?.uid ?? null, [user]);

  return { user, uid, isLoading };
};
