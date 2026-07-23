"use client";

import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { searchPlaces } from "@/lib/geo/geonames";
import type { Place } from "@/lib/geo/types";

type PlaceSearchProps = {
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place | null) => void;
};

export function PlaceSearch({ selectedPlace, onPlaceSelect }: PlaceSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2 || selectedPlace) {
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
        const results = await searchPlaces(trimmedQuery);
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
  }, [query, selectedPlace]);

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
      <Search className="place-search-icon" aria-hidden="true" size={19} />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="市区町村を入力"
        autoComplete="off"
        role="combobox"
        aria-expanded={places.length > 0}
        aria-controls={listId}
      />
      {loading && <LoaderCircle className="place-search-loader" aria-label="検索中" size={18} />}

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
