"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ItineraryForm from "@/components/ItineraryForm";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: any) {
    setLoading(true);
    setError(null);
    router.push("/loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      sessionStorage.setItem(`itinerary_${data.id}`, JSON.stringify(data));
      router.push(`/itinerary/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      router.push("/");
    }
  }

  return (
    <div className="hero">
      <div className="hero__bg" />
      <div className="hero__bg-pattern" />
      <div className="hero__content">
        <div className="hero__text">
          <span className="hero__eyebrow">AI-Powered Travel Planning</span>
          <h1 className="hero__title">
            You booked the place.<br />
            <em>We&apos;ll plan everything else.</em>
          </h1>
          <p className="hero__subtitle">
            Enter your Airbnb or hotel address and we&apos;ll build a complete, personalized day-by-day itinerary around it — food, attractions, hidden gems, and everything in between.
          </p>
          <div className="hero__stats">
            <div><div className="hero__stat-value">AI</div><div className="hero__stat-label">Powered</div></div>
            <div><div className="hero__stat-value">100+</div><div className="hero__stat-label">Destinations</div></div>
            <div><div className="hero__stat-value">Free</div><div className="hero__stat-label">5/day</div></div>
          </div>
        </div>
        <div>
          <ItineraryForm onSubmit={handleSubmit} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
