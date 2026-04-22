"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateRange, tripDurationLabel } from "@/lib/formatters";

export default function SavedPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/saved")
      .then(r => r.json())
      .then(setItineraries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!window.confirm("Delete this itinerary?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
      setItineraries(prev => prev.filter(it => it.id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="saved-page">
      <div className="saved-page__header">
        <h1 className="saved-page__title">Saved Itineraries</h1>
        <Link href="/" className="btn btn-primary">Plan a New Trip ✈️</Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && <div className="empty-state"><div className="empty-state__icon">⏳</div><p>Loading…</p></div>}

      {!loading && itineraries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🗺️</div>
          <h2 className="empty-state__title">No saved itineraries yet</h2>
          <p>Generate your first trip plan to see it saved here.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>Plan a Trip</Link>
        </div>
      )}

      <div className="saved-grid">
        {itineraries.map(it => (
          <div key={it.id} className="saved-card" onClick={() => router.push(`/itinerary/${it.id}`)} style={{ cursor: "pointer" }}>
            {it.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="saved-card__thumb" src={it.hero_image_url} alt={it.city} />
            ) : (
              <div className="saved-card__thumb-placeholder">🌍</div>
            )}
            <div className="saved-card__body">
              <div className="saved-card__city">{it.city}</div>
              <div className="saved-card__dates">{formatDateRange(it.start_date, it.end_date)} · {tripDurationLabel(it.start_date, it.end_date)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                {it.group_size} {it.group_size === 1 ? "traveller" : "travellers"} · {it.currency} {it.budget?.toLocaleString()}
              </div>
              <div className="saved-card__chips">
                <span className="saved-card__chip">{it.pace}</span>
                {(it.vibe || []).slice(0, 3).map((v: string) => <span key={v} className="saved-card__chip">{v}</span>)}
              </div>
            </div>
            <div className="saved-card__footer">
              <button className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "0.35rem 0.875rem" }} onClick={e => { e.stopPropagation(); router.push(`/itinerary/${it.id}`); }}>View</button>
              <button className="btn btn-danger" style={{ fontSize: "0.8rem", padding: "0.35rem 0.875rem" }} onClick={e => handleDelete(e, it.id)} disabled={deletingId === it.id}>
                {deletingId === it.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
