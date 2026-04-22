const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export interface GeoResult {
  lat: number;
  lon: number;
  city: string;
  country: string;
  display_name: string;
}

export async function geocodeAddress(address: string): Promise<GeoResult> {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  const resp = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": "Wanderplan/1.0 (contact: ramizhanna15@gmail.com)" },
  });

  if (!resp.ok) throw new Error("Geocoding service unavailable");

  const results = await resp.json();
  if (!results.length) throw new Error(`Could not find address: "${address}". Please try a more specific address.`);

  const result = results[0];
  const addr = result.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.county || addr.state || "Unknown City";

  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    city,
    country: addr.country || "",
    display_name: result.display_name || address,
  };
}
