'use client';

import { useEffect, useState } from 'react';
import { searchPlaces } from '@/lib/geo/geonames';
import type { Place } from '@/lib/geo/types';

type PlaceSearchProps = {
  onPlaceSelect: (place: Place) => void;
};

export function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setPlaces([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchPlaces(trimmedQuery);
        if (!isCancelled) {
          setPlaces(results);
        }
      } catch (err) {
        if (!isCancelled) {
          setPlaces([]);
          setError('検索に失敗しました。時間を置いて再試行してください。');
        }
        console.error(err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="出生地を検索（例: Tokyo）"
        className="w-full rounded-lg border px-4 py-2"
      />

      {loading && (
        <div className="absolute top-full mt-1 w-full rounded-lg border bg-white p-2">
          検索中...
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-red-200 bg-red-50 p-2 text-red-600">
          {error}
        </div>
      )}

      {places.length > 0 && !loading && (
        <ul className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
          {places.map((place) => (
            <li
              key={`${place.name}-${place.latitude}-${place.longitude}`}
              onClick={() => {
                onPlaceSelect(place);
                setQuery('');
                setPlaces([]);
                setError(null);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            >
              {place.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
