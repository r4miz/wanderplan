"use client";
import { useState } from "react";

const VIBE_OPTIONS = ["Chill", "Adventurous", "Foodie", "Cultural", "Nightlife", "Family-Friendly", "Nature"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free"];
const PACE_OPTIONS = ["Relaxed", "Balanced", "Packed"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "MXN", "BRL", "INR", "SGD"];

const DEFAULT_FORM = {
  address: "",
  start_date: "",
  end_date: "",
  budget: "",
  currency: "USD",
  group_size: 2,
  vibe: [] as string[],
  pace: "Balanced",
  dietary: [] as string[],
  must_see: "",
  hidden_gems_slider: 50,
};

export default function ItineraryForm({ onSubmit, loading, error }: {
  onSubmit: (data: typeof DEFAULT_FORM) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleChip(field: "vibe" | "dietary", value: string) {
    setForm(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      };
    });
  }

  return (
    <div className="form-card">
      <h2 className="form-card__title">Plan Your Trip</h2>
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
        <div className="form-group">
          <label className="form-label">Accommodation Address</label>
          <input className="form-input" type="text" placeholder="e.g. 12 Rue de Rivoli, Paris, France" value={form.address} onChange={e => set("address", e.target.value)} required />
        </div>

        <div className="form-row form-group">
          <div>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} required />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Total Budget</label>
          <div className="budget-row">
            <select className="form-select" value={form.currency} onChange={e => set("currency", e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="form-input" type="number" min="1" placeholder="e.g. 2000" value={form.budget} onChange={e => set("budget", e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Group Size</label>
          <input className="form-input" type="number" min="1" max="25" value={form.group_size} onChange={e => set("group_size", parseInt(e.target.value, 10) || 1)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Trip Vibe (pick all that apply)</label>
          <div className="chip-group">
            {VIBE_OPTIONS.map(v => (
              <button key={v} type="button" className={`chip ${form.vibe.includes(v) ? "chip--selected" : ""}`} onClick={() => toggleChip("vibe", v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Pace</label>
          <div className="pace-toggle">
            {PACE_OPTIONS.map(p => (
              <button key={p} type="button" className={`pace-option ${form.pace === p ? "pace-option--selected" : ""}`} onClick={() => set("pace", p)}>{p}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dietary Restrictions (optional)</label>
          <div className="chip-group">
            {DIETARY_OPTIONS.map(d => (
              <button key={d} type="button" className={`chip ${form.dietary.includes(d) ? "chip--selected" : ""}`} onClick={() => toggleChip("dietary", d)}>{d}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Must-See / Must-Do (optional)</label>
          <textarea className="form-textarea" rows={2} placeholder="e.g. Sagrada Família, authentic paella, sunset at the beach" value={form.must_see} onChange={e => set("must_see", e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">
            Discovery Style — {form.hidden_gems_slider <= 30 ? "Tourist Classics" : form.hidden_gems_slider >= 70 ? "Hidden Gems" : "Mixed"}
          </label>
          <div className="slider-wrapper">
            <input className="form-slider" type="range" min="0" max="100" step="10" value={form.hidden_gems_slider} onChange={e => set("hidden_gems_slider", parseInt(e.target.value, 10))} />
            <div className="slider-labels"><span>Tourist Classics</span><span>Hidden Gems</span></div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
          {loading ? "Generating…" : "Generate My Itinerary ✈️"}
        </button>
      </form>
    </div>
  );
}
