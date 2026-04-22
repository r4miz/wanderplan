export interface HeroPhoto {
  url: string;
  credit_name: string;
  credit_link: string;
}

export async function getDestinationHero(city: string, country: string): Promise<HeroPhoto | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  try {
    const params = new URLSearchParams({
      query: `${city} ${country} travel`.trim(),
      per_page: "5",
      orientation: "landscape",
      order_by: "relevant",
    });
    const resp = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      credit_name: photo.user.name,
      credit_link: `${photo.user.links.html}?utm_source=wanderplan&utm_medium=referral`,
    };
  } catch {
    return null;
  }
}
