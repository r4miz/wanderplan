interface Venue {
  name: string;
  category: string;
  distance_m: number;
  address: string;
}

async function fetchCategory(
  lat: number,
  lon: number,
  categoryId: string,
  key: string
): Promise<Venue[]> {
  try {
    const params = new URLSearchParams({
      ll: `${lat},${lon}`,
      categories: categoryId,
      radius: "3000",
      limit: "15",
      sort: "RATING",
      fields: "name,categories,distance,location",
    });
    const resp = await fetch(`https://api.foursquare.com/v3/places/search?${params}`, {
      headers: { Authorization: key, Accept: "application/json" },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).map((place: any) => ({
      name: place.name || "",
      category: place.categories?.[0]?.name || "",
      distance_m: place.distance || 0,
      address: place.location?.formatted_address || place.location?.address || "",
    }));
  } catch {
    return [];
  }
}

export async function getNearbyVenues(lat: number, lon: number) {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) return { restaurants: [], attractions: [] };

  const [restaurants, attractions] = await Promise.all([
    fetchCategory(lat, lon, "13065", key),
    fetchCategory(lat, lon, "16000", key),
  ]);
  return { restaurants, attractions };
}

export function formatVenuesForPrompt(venues: { restaurants: Venue[]; attractions: Venue[] }): string {
  const lines: string[] = [];
  if (venues.restaurants.length) {
    lines.push("Nearby restaurants:");
    venues.restaurants.slice(0, 8).forEach(v => {
      lines.push(`  - ${v.name} (${v.category}) ${v.distance_m}m away`);
    });
  }
  if (venues.attractions.length) {
    lines.push("Nearby attractions & landmarks:");
    venues.attractions.slice(0, 8).forEach(v => {
      lines.push(`  - ${v.name} (${v.category}) ${v.distance_m}m away`);
    });
  }
  return lines.join("\n") || "No venue data available.";
}
