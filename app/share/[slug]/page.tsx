"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DayCard from "@/components/DayCard";
import MapSidebar from "@/components/MapSidebar";
import AdPlaceholder from "@/components/AdPlaceholder";
import { formatDateRange, tripDurationLabel } from "@/lib/formatters";

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePin, setActivePin] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${slug}`)
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setRecord(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✈️</div>
        <p>Loading shared itinerary…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
      <div className="empty-state">
        <div className="empty-state__icon">🔗</div>
        <h2 className="empty-state__title">Itinerary not found</h2>
        <p>This share link may have expired or been removed.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>Plan Your Own Trip</Link>
      </div>
    </div>
  );

  if (!record) return null;

  const itinerary = record.itinerary_json || record.itinerary;
  const currency = record.currency || "USD";

  return (
    <div>
      <div className="share-banner">
        Someone shared this itinerary with you! <strong>Want your own?</strong>{" "}
        <Link href="/" style={{ color: "var(--color-sand)", textDecoration: "underline" }}>Plan a free trip →</Link>
      </div>

      <div className="destination-hero">
        {record.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="destination-hero__img" src={record.hero_image_url} alt={record.city} />
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(135deg, var(--color-green), var(--color-green-mid))" }} />
        )}
        <div className="destination-hero__overlay" />
        <div className="destination-hero__content">
          <h1 className="destination-hero__city">{record.city}</h1>
          <p className="destination-hero__meta">
            {formatDateRange(record.start_date, record.end_date)} · {tripDurationLabel(record.start_date, record.end_date)} · {record.group_size} {record.group_size === 1 ? "traveller" : "travellers"}
          </p>
        </div>
        {record.hero_image_credit && (
          <span className="destination-hero__credit">Photo: {record.hero_image_credit} / Unsplash</span>
        )}
      </div>

      <div className="itinerary-page">
        <div className="itinerary-main">
          <div className="itinerary-summary">
            <div className="summary-pills">
              <span className="summary-pill summary-pill--highlight">{record.pace}</span>
              {(record.vibe || []).map((v: string) => <span key={v} className="summary-pill">{v}</span>)}
            </div>
            <Link href="/" className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Plan My Own Trip ✈️</Link>
          </div>

          {itinerary?.destination_summary && (
            <div style={{ padding: "1.5rem 2rem 0", maxWidth: "720px" }}>
              <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
                {itinerary.destination_summary}
              </p>
            </div>
          )}

          <div className="days-container">
            {(itinerary?.days || []).map((day: any) => (
              <DayCard key={day.date} day={day} currency={currency} activePin={activePin} onActivityClick={a => setActivePin(a.name)} />
            ))}
          </div>

          <div style={{ padding: "0 2rem 3rem" }}>
            <AdPlaceholder variant="footer" />
          </div>
        </div>

        <div className="itinerary-sidebar">
          <MapSidebar itinerary={itinerary} accommodationLat={record.lat} accommodationLon={record.lon} activePin={activePin} />
        </div>
      </div>
    </div>
  );
}
