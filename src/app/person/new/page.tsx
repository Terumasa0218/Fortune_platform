"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { PlaceSearch } from "@/components/PlaceSearch";
import { useAuth } from "@/lib/hooks/useAuth";
import { addPerson, type PersonPayload } from "@/lib/firebase/persons";
import type { Place } from "@/lib/geo/types";
import { LOVE_TYPES } from "@/lib/mbti/types";

const mbtiOptions = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export default function NewPersonPage() {
  const { uid, loading: authLoading, error: authError } = useAuth();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [mbti, setMbti] = useState("");
  const [enneagram, setEnneagram] = useState("");
  const [loveType, setLoveType] = useState("");
  const [confidenceTime, setConfidenceTime] = useState<"unknown" | "approximate" | "exact">("unknown");
  const [confidencePlace, setConfidencePlace] = useState<"unknown" | "city" | "exact">("unknown");
  const [place, setPlace] = useState<Place | null>(null);
  const [birthPlaceText, setBirthPlaceText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedPersonId, setSavedPersonId] = useState<string | null>(null);

  const authErrorMessage = useMemo(() => {
    if (!authError) return null;
    return authError instanceof Error ? authError.message : String(authError);
  }, [authError]);

  const handlePlaceSelect = (nextPlace: Place) => {
    setPlace(nextPlace);
    setBirthPlaceText(nextPlace.name);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uid) {
      setSubmitError("ログイン状態を確認できません。時間を置いて再試行してください。");
      return;
    }

    if (!name.trim() || !birthDate) {
      setSubmitError("名前と生年月日は必須です。");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSavedPersonId(null);

    const payload: PersonPayload = {
      uid,
      name: name.trim(),
      ...(gender ? { gender } : {}),
      birthDate,
      ...(birthTime ? { birthTime } : {}),
      ...(birthPlaceText.trim() ? { birthPlace: birthPlaceText.trim() } : {}),
      ...(place?.latitude != null ? { latitude: place.latitude } : {}),
      ...(place?.longitude != null ? { longitude: place.longitude } : {}),
      ...(place?.timezone ? { timezone: place.timezone } : {}),
      ...(mbti ? { mbti } : {}),
      ...(enneagram ? { enneagram: Number(enneagram) } : {}),
      ...(loveType ? { loveType } : {}),
      confidence: {
        time: confidenceTime,
        place: confidencePlace,
      },
    };

    try {
      const personId = await addPerson(uid, payload);
      setSavedPersonId(personId);
      setName("");
      setBirthDate("");
      setBirthTime("");
      setGender("");
      setMbti("");
      setEnneagram("");
      setLoveType("");
      setConfidenceTime("unknown");
      setConfidencePlace("unknown");
      setPlace(null);
      setBirthPlaceText("");
    } catch (error) {
      console.error("Failed to add person", error);
      setSubmitError(error instanceof Error ? error.message : "保存に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Personプロフィール作成</h1>
          <Link href="/" className="text-sm text-purple-200 underline">
            ホームへ戻る
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm text-gray-200">名前 *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
                placeholder="例: 太郎"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">生年月日 *</span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">出生時間</span>
              <input
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">性別</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as "male" | "female" | "other" | "")}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="">未選択</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">MBTI</span>
              <select
                value={mbti}
                onChange={(event) => setMbti(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="">未選択</option>
                {mbtiOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">エニアグラム</span>
              <select
                value={enneagram}
                onChange={(event) => setEnneagram(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="">未選択</option>
                {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={String(value)}>
                    タイプ {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">ラブタイプ</span>
              <select
                value={loveType}
                onChange={(event) => setLoveType(event.target.value)}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="">未選択</option>
                {LOVE_TYPES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-gray-200">出生地検索</span>
            <PlaceSearch onPlaceSelect={handlePlaceSelect} />
            <input
              value={birthPlaceText}
              onChange={(event) => setBirthPlaceText(event.target.value)}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              placeholder="出生地（手入力可）"
            />
            {place && (
              <p className="text-xs text-gray-300">
                選択: {place.name} / lat {place.latitude} / lon {place.longitude}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-200">出生時間の確度</span>
              <select
                value={confidenceTime}
                onChange={(event) => setConfidenceTime(event.target.value as "unknown" | "approximate" | "exact")}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="unknown">unknown</option>
                <option value="approximate">approximate</option>
                <option value="exact">exact</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-gray-200">出生地の確度</span>
              <select
                value={confidencePlace}
                onChange={(event) => setConfidencePlace(event.target.value as "unknown" | "city" | "exact")}
                className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2"
              >
                <option value="unknown">unknown</option>
                <option value="city">city</option>
                <option value="exact">exact</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full rounded-md bg-purple-600 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "保存中..." : "Personを作成"}
          </button>
        </form>

        {authErrorMessage && (
          <p className="mt-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
            auth error: {authErrorMessage}
          </p>
        )}

        {submitError && (
          <p className="mt-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
            save error: {submitError}
          </p>
        )}

        {savedPersonId && (
          <p className="mt-4 rounded-md bg-emerald-500/20 p-3 text-sm text-emerald-200">
            保存完了: {savedPersonId}
          </p>
        )}
      </div>
    </main>
  );
}
