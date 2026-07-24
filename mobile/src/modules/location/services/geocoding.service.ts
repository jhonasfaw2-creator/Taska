const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface GeocodingSuggestion {
  placeId: number;
  displayName: string;
  latitude: number;
  longitude: number;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodingResult> {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Taska-App/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    latitude: data.lat || latitude,
    longitude: data.lon || longitude,
    displayName: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  };
}

export async function searchAddresses(
  query: string,
  limit = 5,
): Promise<GeocodingSuggestion[]> {
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Taska-App/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = await response.json();

  return data.map((item: any) => ({
    placeId: Number(item.place_id),
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
}
