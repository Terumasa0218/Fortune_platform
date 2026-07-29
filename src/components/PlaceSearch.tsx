"use client";

import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { searchPlaces } from "@/lib/geo/geonames";
import type { Place } from "@/lib/geo/types";

type PlaceSearchProps = {
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place | null) => void;
};

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

export function PlaceSearch({ selectedPlace, onPlaceSelect }: PlaceSearchProps) {
  const listId = useId();
  const [prefecture, setPrefecture] = useState("");
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!prefecture || trimmedQuery.length < 2 || selectedPlace) {
      setPlaces([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchPlaces(trimmedQuery, prefecture);
        if (!controller.signal.aborted) setPlaces(results);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setPlaces([]);
          setError("場所を検索できませんでした");
        }
        console.error(caught);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [prefecture, query, selectedPlace]);

  if (selectedPlace) {
    return (
      <div className="place-selected">
        <MapPin aria-hidden="true" size={18} />
        <span>{selectedPlace.name}</span>
        <button
          type="button"
          className="icon-button"
          onClick={() => {
            onPlaceSelect(null);
            setQuery("");
          }}
          aria-label="出生地を変更"
          title="出生地を変更"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="place-search">
      <select
        className="place-prefecture-select"
        value={prefecture}
        onChange={(event) => {
          setPrefecture(event.target.value);
          setQuery("");
          setPlaces([]);
          setError(null);
          onPlaceSelect(null);
        }}
        aria-label="出生した都道府県"
      >
        <option value="">都道府県を選択</option>
        {PREFECTURES.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>

      <div className="place-city-search">
        <Search className="place-search-icon" aria-hidden="true" size={19} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={prefecture ? "市区町村を入力" : "先に都道府県を選択"}
          autoComplete="off"
          role="combobox"
          aria-expanded={places.length > 0}
          aria-controls={listId}
          disabled={!prefecture}
        />
        {loading && <LoaderCircle className="place-search-loader" aria-label="検索中" size={18} />}
      </div>

      {error && <p className="field-error place-search-message">{error}</p>}

      {places.length > 0 && !loading && (
        <ul id={listId} className="place-results" role="listbox">
          {places.map((place) => (
            <li
              key={`${place.name}-${place.latitude}-${place.longitude}`}
              role="option"
              aria-selected="false"
            >
              <button
                type="button"
                onClick={() => {
                  onPlaceSelect(place);
                  setPlaces([]);
                  setError(null);
                }}
              >
                <MapPin aria-hidden="true" size={17} />
                <span>{place.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
