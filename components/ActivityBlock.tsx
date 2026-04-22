import { formatCurrency } from "@/lib/formatters";
import AffiliateCard from "./AffiliateCard";

export default function ActivityBlock({ period, block, currency, activePin, onActivityClick }: {
  period: string;
  block: any;
  currency: string;
  activePin: string | null;
  onActivityClick: (activity: any) => void;
}) {
  if (!block) return null;
  const dotClass = `activity-block__dot activity-block__dot--${period.toLowerCase()}`;

  return (
    <div className="activity-block">
      <div className="activity-block__header">
        <span className={dotClass} />
        <span className="activity-block__label">{period}</span>
        {block.time_range && <span className="activity-block__time">{block.time_range}</span>}
      </div>
      {(block.activities || []).map((activity: any, idx: number) => (
        <ActivityItem
          key={idx}
          activity={activity}
          currency={currency}
          isActive={activePin === activity.name}
          onClick={() => onActivityClick(activity)}
        />
      ))}
    </div>
  );
}

function ActivityItem({ activity, currency, isActive, onClick }: {
  activity: any;
  currency: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const {
    name, description, why_youll_love_this, approx_cost_per_person,
    distance_from_accommodation, travel_time_from_accommodation,
    indoor_alternative, signature_dish,
  } = activity;

  return (
    <div className={`activity-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="activity-item__header">
        <span className="activity-item__name">{name}</span>
        {approx_cost_per_person != null && approx_cost_per_person > 0 && (
          <span className="activity-item__cost">{formatCurrency(approx_cost_per_person, currency)}/person</span>
        )}
        {approx_cost_per_person === 0 && (
          <span className="activity-item__cost" style={{ color: "var(--color-green-mid)" }}>Free</span>
        )}
      </div>
      {description && <p className="activity-item__desc">{description}</p>}
      {why_youll_love_this && <p className="activity-item__love">✦ {why_youll_love_this}</p>}
      {signature_dish && <div className="signature-dish">🍽️ Order: <strong>{signature_dish}</strong></div>}
      <div className="activity-item__logistics">
        {distance_from_accommodation && <span className="logistics-tag">📍 {distance_from_accommodation}</span>}
        {travel_time_from_accommodation && <span className="logistics-tag">🚶 {travel_time_from_accommodation}</span>}
      </div>
      {indoor_alternative && (
        <div className="indoor-alt">☔ <strong>Rain alternative:</strong> {indoor_alternative}</div>
      )}
      <AffiliateCard activity={activity} />
    </div>
  );
}
