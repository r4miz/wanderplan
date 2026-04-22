import WeatherBadge from "./WeatherBadge";
import ActivityBlock from "./ActivityBlock";
import { formatCurrency, formatDayDate } from "@/lib/formatters";

export default function DayCard({ day, currency, activePin, onActivityClick }: {
  day: any;
  currency: string;
  activePin: string | null;
  onActivityClick: (activity: any) => void;
}) {
  const { date, day_number, theme, weather_note, weather, daily_budget, morning, afternoon, evening, spontaneous_hour, iconic_food_moment } = day;

  return (
    <div className="day-card" id={`day-${day_number}`}>
      <div className="day-card__header">
        <div>
          <div className="day-card__number">Day {day_number}</div>
          <div className="day-card__theme">{theme}</div>
        </div>
        <div className="day-card__date">{formatDayDate(date)}</div>
      </div>

      <div className="day-card__body">
        <div className="day-card__meta">
          <WeatherBadge weather={weather} />
          {daily_budget && (
            <div className="budget-strip">
              {daily_budget.food > 0 && <div className="budget-item"><span className="budget-item__amount">{formatCurrency(daily_budget.food, currency)}</span><span className="budget-item__label">Food</span></div>}
              {daily_budget.activities > 0 && <div className="budget-item"><span className="budget-item__amount">{formatCurrency(daily_budget.activities, currency)}</span><span className="budget-item__label">Activities</span></div>}
              {daily_budget.transport > 0 && <div className="budget-item"><span className="budget-item__amount">{formatCurrency(daily_budget.transport, currency)}</span><span className="budget-item__label">Transport</span></div>}
              <div className="budget-item"><span className="budget-item__amount" style={{ color: "var(--color-green-mid)" }}>{formatCurrency(daily_budget.total, currency)}</span><span className="budget-item__label">Total</span></div>
            </div>
          )}
        </div>

        {weather_note && <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", padding: "0.5rem 0", fontStyle: "italic" }}>{weather_note}</p>}

        <ActivityBlock period="Morning" block={morning} currency={currency} activePin={activePin} onActivityClick={onActivityClick} />
        <ActivityBlock period="Afternoon" block={afternoon} currency={currency} activePin={activePin} onActivityClick={onActivityClick} />
        <ActivityBlock period="Evening" block={evening} currency={currency} activePin={activePin} onActivityClick={onActivityClick} />

        {spontaneous_hour && (
          <div className="spontaneous-block">
            <div className="spontaneous-block__label">🗺️ Spontaneous Hour</div>
            <div className="spontaneous-block__neighborhood">{spontaneous_hour.neighborhood}</div>
            <div className="spontaneous-block__suggestion">{spontaneous_hour.suggestion}</div>
          </div>
        )}

        {iconic_food_moment && (
          <div className="food-moment">
            <div className="food-moment__label">🍴 Iconic Local Food Moment</div>
            <div className="food-moment__name">{iconic_food_moment.name}</div>
            <div className="food-moment__dish">Order: {iconic_food_moment.dish}</div>
            <div className="food-moment__why">{iconic_food_moment.why}</div>
          </div>
        )}
      </div>
    </div>
  );
}
