"use client";

import { useAuthState } from "@/lib/hooks/useAuth";

export default function Home() {
  const { uid, isLoading } = useAuthState();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="flex w-full max-w-3xl flex-col items-start gap-6 rounded-3xl bg-white px-10 py-12 shadow-sm dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight">
          Firebase Anonymous Auth
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          {isLoading ? "Loading auth state..." : `uid: ${uid ?? "未ログイン"}`}
        </p>
      </main>
    </div>
  );
}
