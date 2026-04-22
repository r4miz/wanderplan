import { weatherIconUrl, rainLabel } from "@/lib/formatters";

interface Weather {
  condition?: string;
  icon?: string;
  temp_min?: number;
  temp_max?: number;
  rain_probability?: number;
}

function weatherEmoji(icon = "") {
  if (icon.startsWith("01")) return "☀️";
  if (icon.startsWith("02") || icon.startsWith("03")) return "⛅";
  if (icon.startsWith("04")) return "☁️";
  if (icon.startsWith("09") || icon.startsWith("10")) return "🌧️";
  if (icon.startsWith("11")) return "⛈️";
  if (icon.startsWith("13")) return "❄️";
  return "🌤️";
}

export default function WeatherBadge({ weather }: { weather?: Weather }) {
  if (!weather?.condition) return null;
  const isRainy = (weather.rain_probability || 0) >= 0.4;

  return (
    <div className="weather-badge">
      <span className="weather-badge__icon">
        {weather.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={weatherIconUrl(weather.icon)} alt={weather.condition} width={24} height={24} style={{ verticalAlign: "middle" }} />
        ) : (
          weatherEmoji(weather.icon)
        )}
      </span>
      <span>{weather.condition}</span>
      {weather.temp_min != null && (
        <span>{weather.temp_min}–{weather.temp_max}°C</span>
      )}
      {isRainy && (
        <span className="weather-badge__rain">☔ {rainLabel(weather.rain_probability!)}</span>
      )}
    </div>
  );
}
