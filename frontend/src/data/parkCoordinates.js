// Fallback center coordinates for known Zimbabwe parks.
// The API returns `center_point: { lat, lng }`, but databases seeded before
// the backfill return `center_point: null`. This map keeps park zoom working
// in both cases. Keys must match park names in the backend seed data.
export const PARK_COORDINATES = {
  'Hwange National Park': { lat: -18.56, lng: 26.49 },
  'Gonarezhou National Park': { lat: -21.73, lng: 31.55 },
  'Mana Pools National Park': { lat: -15.75, lng: 29.38 },
  'Matobo National Park': { lat: -20.55, lng: 28.51 },
  'Victoria Falls National Park': { lat: -17.93, lng: 25.85 },
  'Chizarira National Park': { lat: -17.93, lng: 27.87 },
  'Matusadona National Park': { lat: -16.92, lng: 28.47 },
  Kariba: { lat: -16.52, lng: 28.85 },
  'Gwayi-Shangani Conservancy': { lat: -18.18, lng: 27.4 },
  'Chivero (Meikles) Recreational Park': { lat: -17.88, lng: 30.55 },
};

export const DEFAULT_CENTER = [29.5, -19.0]; // [lng, lat] as OpenLayers expects

// Resolve a park's center to { lat, lng } or null.
// Prefers the API's center_point, falls back to the hardcoded table by name.
export const getParkCenter = (area) => {
  if (area?.center_point?.lat != null && area?.center_point?.lng != null) {
    return { lat: Number(area.center_point.lat), lng: Number(area.center_point.lng) };
  }
  if (area?.center_lat != null && area?.center_lng != null) {
    return { lat: Number(area.center_lat), lng: Number(area.center_lng) };
  }
  if (area?.name && PARK_COORDINATES[area.name]) {
    return PARK_COORDINATES[area.name];
  }
  return null;
};
