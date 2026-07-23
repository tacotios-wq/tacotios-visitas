import type { Restaurant } from "@/types";

export interface LatLng {
  lat: number;
  lng: number;
}

export const CITY_CENTERS: Record<string, LatLng> = {
  CDMX: { lat: 19.4326, lng: -99.1332 },
  GDL: { lat: 20.6597, lng: -103.3496 },
  MTY: { lat: 25.6866, lng: -100.3161 },
  Mazatlan: { lat: 23.2494, lng: -106.4111 },
  Ensenada: { lat: 31.8667, lng: -116.5964 },
  Oaxaca: { lat: 17.0669, lng: -96.7203 },
  Puebla: { lat: 19.0414, lng: -98.2063 },
  Napoles: { lat: 40.8518, lng: 14.2681 },
};

const ZONE_COORDS: Record<string, LatLng> = {
  "CDMX|Centro": { lat: 19.4326, lng: -99.1332 },
  "CDMX|Centro Historico": { lat: 19.4345, lng: -99.1392 },
  "CDMX|Roma Norte": { lat: 19.4168, lng: -99.1597 },
  "CDMX|Roma": { lat: 19.4140, lng: -99.1660 },
  "CDMX|Condesa": { lat: 19.4117, lng: -99.1731 },
  "CDMX|Polanco": { lat: 19.4333, lng: -99.1921 },
  "CDMX|Lomas de Chapultepec": { lat: 19.4268, lng: -99.2069 },
  "CDMX|San Miguel Chapultepec": { lat: 19.4168, lng: -99.1950 },
  "CDMX|San Rafael": { lat: 19.4424, lng: -99.1590 },
  "CDMX|Cuauhtemoc": { lat: 19.4260, lng: -99.1596 },
  "CDMX|Anzures": { lat: 19.4289, lng: -99.1754 },
  "CDMX|Napoles": { lat: 19.3959, lng: -99.1737 },
  "CDMX|Narvarte": { lat: 19.3891, lng: -99.1590 },
  "CDMX|Narvarte Poniente": { lat: 19.3929, lng: -99.1700 },
  "CDMX|Pedregal": { lat: 19.3158, lng: -99.1991 },
  "CDMX|Reforma Social": { lat: 19.4334, lng: -99.2122 },
  "CDMX|Xochimilco": { lat: 19.2570, lng: -99.1043 },
  "CDMX|Coyoacan": { lat: 19.3467, lng: -99.1617 },
  "CDMX|Tlalpan": { lat: 19.2966, lng: -99.1681 },
  "CDMX|Azcapotzalco": { lat: 19.4869, lng: -99.1866 },
  "Mazatlan|Centro": { lat: 23.2061, lng: -106.4207 },
  "Mazatlan|Centro Historico": { lat: 23.2056, lng: -106.4221 },
  "Mazatlan|Villa Union": { lat: 23.1919, lng: -106.2381 },
  "Mazatlan|Col. Olimpica": { lat: 23.2378, lng: -106.4100 },
  "Mazatlan|Col. Montuosa": { lat: 23.2350, lng: -106.4080 },
  "Mazatlan|Isla de la Piedra": { lat: 23.1737, lng: -106.3869 },
  "Mazatlan|El Rosario": { lat: 22.9954, lng: -105.8519 },
  "Ensenada|Ensenada": { lat: 31.8667, lng: -116.5964 },
  "Ensenada|Valle de Guadalupe": { lat: 32.0789, lng: -116.5913 },
  "Oaxaca|Centro": { lat: 17.0669, lng: -96.7203 },
  "Oaxaca|Reforma": { lat: 17.0785, lng: -96.7263 },
  "Oaxaca|Teotitlan del Valle": { lat: 17.0336, lng: -96.5142 },
  "Puebla|Centro": { lat: 19.0414, lng: -98.2063 },
  "Puebla|Cholula": { lat: 19.0634, lng: -98.3085 },
  "GDL|Centro": { lat: 20.6767, lng: -103.3475 },
  "GDL|Zapopan": { lat: 20.7207, lng: -103.3884 },
  "GDL|San Juan de Dios": { lat: 20.6773, lng: -103.3402 },
  "GDL|Oblatos": { lat: 20.6833, lng: -103.3083 },
  "MTY|Centro": { lat: 25.6714, lng: -100.3089 },
  "MTY|San Pedro": { lat: 25.6565, lng: -100.4022 },
  "MTY|Mitras": { lat: 25.7049, lng: -100.3539 },
  "Napoles|Centro Storico": { lat: 40.8516, lng: 14.2576 },
  "Napoles|Forcella": { lat: 40.8517, lng: 14.2614 },
  "Napoles|Quartieri Spagnoli": { lat: 40.8420, lng: 14.2480 },
  "Napoles|Stazione Centrale": { lat: 40.8530, lng: 14.2725 },
  "Napoles|Chiaia": { lat: 40.8331, lng: 14.2356 },
  "Napoles|Mergellina": { lat: 40.8307, lng: 14.2229 },
  "Napoles|Foria": { lat: 40.8537, lng: 14.2592 },
  "Napoles|Materdei": { lat: 40.8580, lng: 14.2440 },
  "Napoles|Soccavo": { lat: 40.8473, lng: 14.1982 },
  "Napoles|Pompeya": { lat: 40.7497, lng: 14.4869 },
  "Napoles|Vomero": { lat: 40.8430, lng: 14.2273 },
  "Napoles|Rione Sanita": { lat: 40.8585, lng: 14.2486 },
  "Napoles|Vasto": { lat: 40.8550, lng: 14.2700 },
  "Napoles|Caiazzo": { lat: 41.1819, lng: 14.3611 },
  "Napoles|Caserta": { lat: 41.0723, lng: 14.3315 },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function deterministicJitter(seed: string): { dLat: number; dLng: number } {
  const h = Math.abs(hashString(seed));
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.012;
  const dLng = (((h >> 10) % 1000) / 1000 - 0.5) * 0.012;
  return { dLat, dLng };
}

export function getRestaurantCoords(r: Restaurant): LatLng {
  const zoneKey = `${r.city}|${r.zone}`;
  const base = ZONE_COORDS[zoneKey] ?? CITY_CENTERS[r.city] ?? CITY_CENTERS.CDMX;
  const { dLat, dLng } = deterministicJitter(r.slug);
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}

export const MEXICO_ROUTE_CITIES: { city: string; label: string; order: number }[] = [
  { city: "CDMX", label: "Ciudad de Mexico", order: 1 },
  { city: "Puebla", label: "Puebla", order: 2 },
  { city: "Oaxaca", label: "Oaxaca", order: 3 },
  { city: "GDL", label: "Guadalajara", order: 4 },
  { city: "Mazatlan", label: "Mazatlan", order: 5 },
  { city: "MTY", label: "Monterrey", order: 6 },
  { city: "Ensenada", label: "Ensenada", order: 7 },
];

export function getRouteCoordinates(): [number, number][] {
  return MEXICO_ROUTE_CITIES.map((c) => {
    const center = CITY_CENTERS[c.city];
    return [center.lng, center.lat] as [number, number];
  });
}

export const MEXICO_BOUNDS: [[number, number], [number, number]] = [
  [-117.5, 16.0],
  [-95.0, 32.8],
];

export const INITIAL_VIEW = {
  longitude: -102.5,
  latitude: 23.6,
  zoom: 4.3,
};
