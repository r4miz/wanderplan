"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DayCard from "@/components/DayCard";
import MapSidebar from "@/components/MapSidebar";
import AdPlaceholder from "@/components/AdPlaceholder";
import { formatDateRange, tripDurationLabel } from "@/lib/formatters";

export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Try sessionStorage first (just generated)
      const cached = sessionStorage.getItem(`itinerary_${id}`);
      if (cached) {
        const data = JSON.parse(cached);
        setRecord(data);
        if (data.share_slug) setShareUrl(`${window.location.origin}/share/${data.share_slug}`);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/itinerary/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setRecord(data);
        if (data.share_slug) setShareUrl(`${window.location.origin}/share/${data.share_slug}`);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleShare() {
    try {
      const res = await fetch(`/api/share/${id}`, { method: "POST" });
      const result = await res.json();
      const url = `${window.location.origin}/share/${result.slug}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch (e: any) {
      alert("Could not create share link: " + e.message);
    }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✈️</div>
        <p>Loading itinerary…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div className="error-banner">{error}</div>
      <button className="btn btn-secondary" onClick={() => router.push("/")}>Plan a New Trip</button>
    </div>
  );

  if (!record) return null;

  const itinerary = record.itinerary || record.itinerary_json;
  const currency = record.currency || "USD";

  return (
    <div>
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
              {(record.dietary || []).map((d: string) => <span key={d} className="summary-pill">{d}</span>)}
            </div>
            <div className="itinerary-actions">
              <button className="btn btn-ghost" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }} onClick={handleShare}>
                {shareCopied ? "✓ Copied!" : "Share"}
              </button>
              <Link href="/saved" className="btn btn-ghost" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Saved Trips</Link>
              <Link href="/" className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>New Trip</Link>
            </div>
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
