"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { calculateFortunePreview } from "@/app/fortune/preview-actions";
import type {
  FortuneMethod,
  MultiFortuneResult,
  ReadingTopicId,
} from "@/lib/engines";
import type { Place } from "@/lib/geo/types";
import { FortuneResults } from "@/components/FortuneResults";
import { PlaceSearch } from "@/components/PlaceSearch";
import { buildMethodReading } from "@/lib/readings/buildMethodReading";
import type { BaziTalentCmsSnapshot } from "@/lib/readings/copy-cms";
import { BAZI_TALENT_CMS_STORAGE_KEY } from "@/lib/readings/copy-cms";

type Gender = "male" | "female" | "other" | "";

const GENDER_OPTIONS = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
  { value: "", label: "未回答" },
] as const satisfies ReadonlyArray<{ value: Gender; label: string }>;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, index) => CURRENT_YEAR - index);
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

function padNumber(value: string | number) {
  return String(value).padStart(2, "0");
}

export function FortuneReadingApp() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [place, setPlace] = useState<Place | null>(null);
  const [result, setResult] = useState<MultiFortuneResult | null>(null);
  const [activeMethod, setActiveMethod] = useState<FortuneMethod>("bazi");
  const [activeTopic, setActiveTopic] = useState<ReadingTopicId>("talent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const today = useMemo(() => new Date(), []);
  const maximumMonth = birthYear === String(today.getFullYear()) ? today.getMonth() + 1 : 12;
  const daysInSelectedMonth = birthYear && birthMonth
    ? new Date(Number(birthYear), Number(birthMonth), 0).getDate()
    : 31;
  const maximumDay = birthYear === String(today.getFullYear()) && birthMonth === String(today.getMonth() + 1)
    ? Math.min(daysInSelectedMonth, today.getDate())
    : daysInSelectedMonth;
  const birthDate = birthYear && birthMonth && birthDay
    ? `${birthYear}-${padNumber(birthMonth)}-${padNumber(birthDay)}`
    : "";
  const birthTime = birthHour && birthMinute
    ? `${padNumber(birthHour)}:${padNumber(birthMinute)}`
    : "";
  const inputCount = Number(Boolean(birthTime)) + Number(Boolean(place)) + Number(Boolean(gender));
  const inputLabel = inputCount >= 3 ? "入力済み" : inputCount >= 1 ? "追加情報あり" : "基本情報";

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
      const storedCopy = window.localStorage.getItem(BAZI_TALENT_CMS_STORAGE_KEY);
      let publishedPack: BaziTalentCmsSnapshot["published"] | null = null;
      let publishedTone: BaziTalentCmsSnapshot["publishedTone"] = "standard";
      if (storedCopy) {
        try {
          const snapshot = JSON.parse(storedCopy) as BaziTalentCmsSnapshot;
          publishedPack = snapshot.published;
          publishedTone = snapshot.publishedTone ?? "standard";
        } catch {
          window.localStorage.removeItem(BAZI_TALENT_CMS_STORAGE_KEY);
        }
      }
      try {
        const { loadPublishedBaziTalentCopy } = await import("@/lib/firebase/reading-copy");
        const cloudCopy = await loadPublishedBaziTalentCopy();
        if (cloudCopy) {
          publishedPack = cloudCopy.pack;
          publishedTone = cloudCopy.tone;
        }
      } catch {
        // The bundled copy remains available when Firebase is not configured locally.
      }
      if (publishedPack) {
        nextResult.readings = nextResult.results.map((engineResult) =>
          buildMethodReading(engineResult, {
            baziTalentPack: publishedPack,
            tone: publishedTone,
          }),
        );
      }
      setResult(nextResult);
      setActiveMethod("bazi");
      setActiveTopic("talent");
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
          <Link className="reading-about-link" href="/">
            <BookOpenText aria-hidden="true" size={17} />
            このサイトで占えることを見る
          </Link>
        </div>

        <form className="birth-form" onSubmit={handleSubmit} noValidate>
          <header className="form-heading">
            <div>
              <p className="section-kicker">BIRTH DATA</p>
              <h2>出生情報</h2>
            </div>
            <div className="precision-status" aria-label={`現在の入力状況: ${inputLabel}`}>
              <span>{inputLabel}</span>
              <div aria-hidden="true">
                {[0, 1, 2].map((step) => (
                  <i key={step} className={step < inputCount ? "is-filled" : ""} />
                ))}
              </div>
            </div>
          </header>

          <div className="form-section required-section">
            <div className="field-heading">
              <CalendarDays aria-hidden="true" size={20} />
              <span id="birth-date-label">生年月日</span>
              <span className="required-label">必須</span>
            </div>
            <div className="birth-date-fields" role="group" aria-labelledby="birth-date-label">
              <label>
                <select
                  value={birthYear}
                  onChange={(event) => {
                    setBirthYear(event.target.value);
                    setBirthMonth("");
                    setBirthDay("");
                    setError(null);
                  }}
                  aria-label="生まれた年"
                  required
                >
                  <option value="">年を選択</option>
                  {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}年</option>)}
                </select>
              </label>
              <label>
                <select
                  value={birthMonth}
                  onChange={(event) => {
                    setBirthMonth(event.target.value);
                    setBirthDay("");
                    setError(null);
                  }}
                  aria-label="生まれた月"
                  disabled={!birthYear}
                  required
                >
                  <option value="">月を選択</option>
                  {Array.from({ length: maximumMonth }, (_, index) => index + 1).map((month) => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              </label>
              <label>
                <select
                  value={birthDay}
                  onChange={(event) => {
                    setBirthDay(event.target.value);
                    setError(null);
                  }}
                  aria-label="生まれた日"
                  disabled={!birthMonth}
                  required
                >
                  <option value="">日を選択</option>
                  {Array.from({ length: maximumDay }, (_, index) => index + 1).map((day) => (
                    <option key={day} value={day}>{day}日</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="field-heading">
              <UserRound aria-hidden="true" size={20} />
              <span id="gender-label">性別</span>
              <span className="optional-label">任意</span>
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
                <span id="birth-time-label">出生時刻</span>
                <span className="optional-label">任意</span>
              </div>
              <div className="birth-time-fields" role="group" aria-labelledby="birth-time-label">
                <label>
                  <select
                    value={birthHour}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBirthHour(value);
                      setBirthMinute(value ? birthMinute || "0" : "");
                    }}
                    aria-label="出生時刻の時"
                  >
                    <option value="">時を選択</option>
                    {HOUR_OPTIONS.map((hour) => <option key={hour} value={hour}>{hour}時</option>)}
                  </select>
                </label>
                <label>
                  <select
                    value={birthMinute}
                    onChange={(event) => setBirthMinute(event.target.value)}
                    aria-label="出生時刻の分"
                    disabled={!birthHour}
                  >
                    <option value="">分を選択</option>
                    {MINUTE_OPTIONS.map((minute) => (
                      <option key={minute} value={minute}>{padNumber(minute)}分</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="field-note">分からない場合は空欄のまま進めます</p>
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
            activeMethod={activeMethod}
            activeTopic={activeTopic}
            onMethodChange={setActiveMethod}
            onTopicChange={setActiveTopic}
            onReset={resetReading}
          />
        )}
      </div>
    </main>
  );
}
