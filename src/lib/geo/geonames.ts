import type { Place } from '@/lib/geo/types';

// `.env.local` に以下を設定してください:
// NEXT_PUBLIC_GEONAMES_USERNAME=your_username
// GeoNames の無料アカウント登録: http://www.geonames.org/login
const GEONAMES_SEARCH_ENDPOINT = 'http://api.geonames.org/searchJSON';
const GEONAMES_TIMEZONE_ENDPOINT = 'http://api.geonames.org/timezoneJSON';

type GeoNamesSearchItem = {
  name?: string;
  lat?: string;
  lng?: string;
  countryCode?: string;
  countryName?: string;
  adminName1?: string;
};

type GeoNamesSearchResponse = {
  geonames?: GeoNamesSearchItem[];
  status?: {
    message?: string;
  };
};

type GeoNamesTimezoneResponse = {
  timezoneId?: string;
  status?: {
    message?: string;
  };
};

function formatPlaceName(item: GeoNamesSearchItem): string {
  const segments = [item.name, item.adminName1, item.countryName || item.countryCode]
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));

  return segments.join(', ');
}

async function resolveTimezone(lat: string, lng: string, username: string): Promise<string> {
  const params = new URLSearchParams({ lat, lng, username });
  const response = await fetch(`${GEONAMES_TIMEZONE_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`GeoNames timezone API error: ${response.status}`);
  }

  const data: GeoNamesTimezoneResponse = await response.json();

  if (data.status?.message) {
    throw new Error(`GeoNames timezone API error: ${data.status.message}`);
  }

  return data.timezoneId ?? 'UTC';
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;

  if (!username) {
    throw new Error('NEXT_PUBLIC_GEONAMES_USERNAME is not set');
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    maxRows: '10',
    username,
  });

  const response = await fetch(`${GEONAMES_SEARCH_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`GeoNames search API error: ${response.status}`);
  }

  const data: GeoNamesSearchResponse = await response.json();

  if (data.status?.message) {
    throw new Error(`GeoNames search API error: ${data.status.message}`);
  }

  const items = data.geonames ?? [];

  const places: Place[] = [];

  for (const item of items) {
    if (!item.name || !item.lat || !item.lng || !item.countryCode) {
      continue;
    }

    const timezone = await resolveTimezone(item.lat, item.lng, username);

    places.push({
      name: formatPlaceName(item),
      latitude: Number.parseFloat(item.lat),
      longitude: Number.parseFloat(item.lng),
      timezone,
      countryCode: item.countryCode,
      adminName: item.adminName1,
    });
  }

  return places;
}
