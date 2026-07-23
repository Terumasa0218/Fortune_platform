"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { calculateFortunePreview } from "@/app/fortune/preview-actions";
import type { MultiFortuneResult } from "@/lib/engines";
import type { FortuneDomain } from "@/lib/engines/types";
import type { Place } from "@/lib/geo/types";
import { FortuneResults } from "@/components/FortuneResults";
import { PlaceSearch } from "@/components/PlaceSearch";

type Gender = "male" | "female" | "other" | "";

const GENDER_OPTIONS = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
  { value: "", label: "未回答" },
] as const satisfies ReadonlyArray<{ value: Gender; label: string }>;

export function FortuneReadingApp() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [place, setPlace] = useState<Place | null>(null);
  const [result, setResult] = useState<MultiFortuneResult | null>(null);
  const [activeDomain, setActiveDomain] = useState<FortuneDomain>("talent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const precisionCount = Number(Boolean(birthTime)) + Number(Boolean(place)) + Number(Boolean(gender));
  const precisionLabel = precisionCount >= 3 ? "高精度" : precisionCount >= 1 ? "詳細" : "基本";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!birthDate) {
      setError("生年月日を入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const nextResult = await calculateFortunePreview({
        birthDate,
        ...(birthTime ? { birthTime } : {}),
        ...(gender ? { gender } : {}),
        ...(place
          ? {
              birthPlace: place.name,
              latitude: place.latitude,
              longitude: place.longitude,
              timezone: place.timezone,
            }
          : { timezone: "Asia/Tokyo" }),
        confidence: {
          time: birthTime ? "exact" : "unknown",
          place: place ? "city" : "unknown",
        },
      });
      setResult(nextResult);
      setActiveDomain("talent");
    } catch (caught) {
      console.error(caught);
      setError("鑑定結果を作成できませんでした。もう一度お試しください");
    } finally {
      setSubmitting(false);
    }
  };

  const resetReading = () => {
    setResult(null);
    setError(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <main className="reading-page">
      <section className="reading-intro" aria-labelledby="reading-title">
        <div className="reading-intro-copy">
          <p className="section-kicker">SIX METHODS, ONE READING</p>
          <h1 id="reading-title">生年月日から、あなたの輪郭を読む</h1>
          <p className="reading-lead">四柱推命、西洋占星術、紫微斗数、数秘術、九星気学、古典マヤ暦。</p>
          <div className="reading-domains" aria-label="鑑定できる分野">
            <span>才能</span>
            <span>恋愛</span>
            <span>仕事</span>
            <span>金運</span>
          </div>
        </div>

        <form className="birth-form" onSubmit={handleSubmit} noValidate>
          <header className="form-heading">
            <div>
              <p className="section-kicker">BIRTH DATA</p>
              <h2>出生情報</h2>
            </div>
            <div className="precision-status" aria-label={`現在の入力精度: ${precisionLabel}`}>
              <span>{precisionLabel}</span>
              <div aria-hidden="true">
                {[0, 1, 2].map((step) => (
                  <i key={step} className={step < precisionCount ? "is-filled" : ""} />
                ))}
              </div>
            </div>
          </header>

          <div className="form-section required-section">
            <div className="field-heading">
              <CalendarDays aria-hidden="true" size={20} />
              <label htmlFor="birth-date">生年月日</label>
              <span className="required-label">必須</span>
            </div>
            <input
              id="birth-date"
              className="form-control date-control"
              type="date"
              value={birthDate}
              max={new Date().toISOString().slice(0, 10)}
              onInput={(event) => {
                setBirthDate(event.currentTarget.value);
                setError(null);
              }}
              required
            />
          </div>

          <div className="form-section">
            <div className="field-heading">
              <UserRound aria-hidden="true" size={20} />
              <span id="gender-label">性別</span>
              <span className="optional-label">精度向上</span>
            </div>
            <div className="segmented-control" role="group" aria-labelledby="gender-label">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={gender === option.value ? "is-selected" : ""}
                  onClick={() => setGender(option.value)}
                >
                  {gender === option.value && <Check aria-hidden="true" size={15} />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="precision-fields">
            <div className="form-section">
              <div className="field-heading">
                <Clock3 aria-hidden="true" size={20} />
                <label htmlFor="birth-time">出生時刻</label>
                <span className="optional-label">任意</span>
              </div>
              <input
                id="birth-time"
                className="form-control"
                type="time"
                value={birthTime}
                onInput={(event) => setBirthTime(event.currentTarget.value)}
              />
              <p className="field-note">母子手帳などで分かる場合のみ</p>
            </div>

            <div className="form-section">
              <div className="field-heading">
                <MapPin aria-hidden="true" size={20} />
                <span>出生地</span>
                <span className="optional-label">任意</span>
              </div>
              <PlaceSearch selectedPlace={place} onPlaceSelect={setPlace} />
              <p className="field-note">生まれた市区町村</p>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              <AlertCircle aria-hidden="true" size={18} />
              {error}
            </p>
          )}

          <button className="primary-reading-button" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spin" aria-hidden="true" size={21} />
                6つの命盤を計算中
              </>
            ) : (
              <>
                <Sparkles aria-hidden="true" size={21} />
                6つの占術で鑑定する
                <ArrowRight aria-hidden="true" size={21} />
              </>
            )}
          </button>

          <p className="privacy-note">
            <LockKeyhole aria-hidden="true" size={15} />
            この画面では入力内容を保存しません
          </p>
        </form>
      </section>

      <div ref={resultsRef}>
        {result && (
          <FortuneResults
            result={result}
            activeDomain={activeDomain}
            onDomainChange={setActiveDomain}
            onReset={resetReading}
          />
        )}
      </div>
    </main>
  );
}
