export interface DayWeather {
  condition: string;
  temp_min: number;
  temp_max: number;
  rain_probability: number;
  icon: string;
}

export async function getWeatherForecast(
  lat: number,
  lon: number
): Promise<Record<string, DayWeather>> {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) return {};

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      appid: key,
      units: "metric",
      cnt: "40",
    });
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`);
    if (!resp.ok) return {};
    const data = await resp.json();

    const daily: Record<string, { temps: number[]; rain_probs: number[]; conditions: string[]; icons: string[] }> = {};

    for (const item of data.list || []) {
      const day = item.dt_txt.slice(0, 10);
      if (!daily[day]) daily[day] = { temps: [], rain_probs: [], conditions: [], icons: [] };
      daily[day].temps.push(item.main.temp);
      daily[day].rain_probs.push(item.pop || 0);
      const w = (item.weather || [{}])[0];
      daily[day].conditions.push((w.description || "").replace(/\b\w/g, (c: string) => c.toUpperCase()));
      daily[day].icons.push(w.icon || "01d");
    }

    const summaries: Record<string, DayWeather> = {};
    for (const [day, d] of Object.entries(daily)) {
      summaries[day] = {
        condition: mostCommon(d.conditions),
        temp_min: Math.round(Math.min(...d.temps)),
        temp_max: Math.round(Math.max(...d.temps)),
        rain_probability: Math.round(Math.max(...d.rain_probs) * 100) / 100,
        icon: mostCommon(d.icons),
      };
    }
    return summaries;
  } catch {
    return {};
  }
}

function mostCommon<T>(arr: T[]): T {
  return arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop()!;
}

export function formatWeatherForPrompt(weatherByDay: Record<string, DayWeather>): string {
  if (!Object.keys(weatherByDay).length) return "Weather data unavailable.";
  return Object.entries(weatherByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, w]) => {
      const rainNote = w.rain_probability > 0.3 ? `, ${Math.round(w.rain_probability * 100)}% rain chance` : "";
      return `  ${day}: ${w.condition}, ${w.temp_min}–${w.temp_max}°C${rainNote}`;
    })
    .join("\n");
}
