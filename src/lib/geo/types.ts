export type Place = {
  name: string; // 表示名（"Tokyo, Tokyo, Japan"）
  latitude: number; // 緯度
  longitude: number; // 経度
  timezone: string; // IANA timezone ("Asia/Tokyo")
  countryCode: string; // ISO 3166-1 alpha-2 ("JP")
  adminName?: string; // 都道府県名（"Tokyo"）
};
