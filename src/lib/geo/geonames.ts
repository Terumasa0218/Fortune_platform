import type { Place } from "@/lib/geo/types";

type PlaceSearchResponse = {
  places?: Place[];
  message?: string;
};

export async function searchPlaces(query: string): Promise<Place[]> {
  const response = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
  const data = (await response.json()) as PlaceSearchResponse;

  if (!response.ok) {
    throw new Error(data.message ?? `Place search failed: ${response.status}`);
  }

  return data.places ?? [];
}
