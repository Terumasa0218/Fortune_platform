import type { Place } from "@/lib/geo/types";

type PlaceSearchResponse = {
  places?: Place[];
  message?: string;
};

export async function searchPlaces(query: string, prefecture?: string): Promise<Place[]> {
  const params = new URLSearchParams({ q: query.trim() });
  if (prefecture) params.set("prefecture", prefecture);
  const response = await fetch(`/api/places?${params.toString()}`);
  const data = (await response.json()) as PlaceSearchResponse;

  if (!response.ok) {
    throw new Error(data.message ?? `Place search failed: ${response.status}`);
  }

  return data.places ?? [];
}
