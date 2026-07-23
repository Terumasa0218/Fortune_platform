import { NextRequest, NextResponse } from "next/server";

type OpenMeteoPlace = {
  name?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoPlace[];
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ places: [] });
  }

  const params = new URLSearchParams({
    name: query,
    count: "8",
    language: "ja",
    format: "json",
  });
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json({ message: "Place search failed." }, { status: 502 });
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const places = (data.results ?? []).flatMap((item) => {
    if (
      !item.name ||
      item.latitude == null ||
      item.longitude == null ||
      !item.country_code ||
      !item.timezone
    ) {
      return [];
    }

    return [{
      name: [item.name, item.admin1, item.country].filter(Boolean).join(", "),
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      countryCode: item.country_code,
      adminName: item.admin1,
    }];
  });

  return NextResponse.json({ places });
}
